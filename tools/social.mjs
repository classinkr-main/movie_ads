// 인스타그램 광고용 비율판 — 16:9 마스터를 자르지 않고 폭 1080에 맞춰 줄여 세로 가운데에 놓는다(장면·소리·프레임레이트 그대로).
//   node tools/social.mjs                               → out/classin-showreel-v5-30s-{1x1,4x5}.mp4 + -9x16-{a,b,c}.mp4(타이틀 시안별)
//   node tools/social.mjs out/classin-showreel-v5.mp4   → 22초판도 같은 규칙으로
//   node tools/social.mjs --titles b                    → 9:16 타이틀 시안을 골라서(src/data/social-titles.json의 id, 쉼표로 여러 개)
//   node tools/social.mjs --fps 30                      → 30fps를 요구하는 매체용(파일명에 -30fps, 마스터 60fps에서 한 프레임씩 건너뜀)
// 1:1·4:5는 위아래를 브랜드 연두로만 채운다. 9:16은 위아래 여백에 타이틀을 넣은 프레임(src/SocialFrame.tsx)을
// Remotion으로 PNG로 뽑아 바탕에 깔고 그 위에 영상을 얹는다. 영상 안에 같은 문구가 나오는 동안에는 그 요소를 뺀 프레임으로
// 0.25초에 걸쳐 넘어간다(시점은 마스터 길이에 맞는 큐 시트의 장면 경계에서 읽는다).
// 프레임레이트: 메타 광고 가이드는 '고정 프레임레이트'만 요구하고, 마케팅 API 사양은 24–60fps를 받는다 → 기본 60fps.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLES = JSON.parse(readFileSync(path.join(root, "src/data/social-titles.json"), "utf8"));
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { fps: { type: "string", default: "60" }, titles: { type: "string", default: TITLES.drafts.join(",") } },
});
const input = path.resolve(root, positionals[0] ?? "out/classin-showreel-v5-30s.mp4");
if (!existsSync(input)) throw new Error(`no master video: ${input}`);
const FPS = Number(values.fps);
if (!(FPS >= 24 && FPS <= 60)) throw new Error(`--fps must be 24–60, got ${values.fps}`);
const titleIds = values.titles.split(",").map((s) => s.trim()).filter(Boolean);
for (const id of titleIds) if (!TITLES.titles[id]) throw new Error(`unknown title "${id}" — see src/data/social-titles.json`);

const W = 1080;
const VH = 608; // 1080 × 9/16 = 607.5 → 짝수로
const BG = "0xE2F4B9"; // src/lib/theme.ts C.lime
const XF = 0.25; // 9:16 프레임이 다음 상태로 넘어가는 크로스페이드(초)
const LEAD = 1 / FPS; // xfade는 offset 프레임을 아직 이전 상태로 내므로 한 프레임 앞당겨 장면 전환 프레임부터 섞이게 한다
const FORMATS = [
  { tag: "1x1", h: 1080 }, // 피드 정사각
  { tag: "4x5", h: 1350 }, // 피드 세로
  { tag: "9x16", h: 1920, frame: "SocialFrame916" }, // 릴스·스토리 — 위아래 타이틀(시안마다 한 파일)
];
const centered = (h) => Math.round((h - VH) / 4) * 2; // 세로 가운데(짝수 픽셀)
const suffix = FPS === 60 ? "" : `-${FPS}fps`;

// 마스터 프레임 수와 길이가 같은 큐 시트를 고른다(22초판 cues.json · 30초판 cues-30s.json)
const cueSheet = () => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", input], { encoding: "utf8" });
  const frames = Number(r.stdout.trim());
  const sheets = ["cues.json", "cues-30s.json"].map((f) => JSON.parse(readFileSync(path.join(root, "src/data", f), "utf8")));
  const cues = sheets.find((c) => c.durationInFrames === frames);
  if (!cues) throw new Error(`no cue sheet with ${frames} frames for ${input}`);
  return cues;
};

// 9:16 프레임 상태 — 영상이 같은 문구를 보여 주는 장면에서는 프레임 쪽 요소를 뺀다
//   시스템 장면: 영상 제목이 "수업 자동 녹화 · 학습 관리 솔루션" → 아래 솔루션 문구
//   엔드 카드: 영상이 로고 · 솔루션 문구 · 쇼룸 CTA → 아래 블록
//   타이틀이 피날레 문장과 같으면(hideIn: finale) 피날레부터 타이틀도
const frameStates = (cues, title) => {
  const sec = (f) => f / cues.fps;
  const S = cues.scenes;
  const fromFinale = (title.hideIn ?? []).includes("finale") ? ["title"] : [];
  return [
    { at: 0, hide: [] },
    { at: sec(S.system[0]), hide: ["tagline"] },
    { at: sec(S.system[1]), hide: [] },
    ...(fromFinale.length ? [{ at: sec(S.finale[0]), hide: fromFinale }] : []),
    { at: sec(S.end[0]), hide: [...fromFinale, "tagline", "cta"] },
  ];
};

// 타이틀 프레임(Remotion Still)을 상태마다 PNG로 — 영상 칸 위치와 시안 id를 inputProps로 넘겨 프레임과 인코딩이 같은 값을 쓴다
let serveUrl;
const renderFrames = async (id, h, titleId, states, tag) => {
  serveUrl ??= await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
  const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? null, chromiumOptions: { gl: "angle" } });
  const files = [];
  try {
    for (const [i, { hide }] of states.entries()) {
      const out = path.join(root, `out/social-frame-${tag}-${titleId}-${i}.png`);
      const inputProps = { videoTop: centered(h), videoHeight: VH, titleId, hide };
      const composition = await selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser });
      if (composition.width !== W || composition.height !== h) throw new Error(`${id} is ${composition.width}x${composition.height}, expected ${W}x${h}`);
      await renderStill({ serveUrl, composition, frame: 0, output: out, imageFormat: "png", inputProps, puppeteerInstance: browser, overwrite: true });
      files.push(out);
    }
  } finally {
    await browser.close({ silent: true });
  }
  return files;
};

// 영상 → RGB → YUV 변환. accurate_rnd·full_chroma_int가 없으면 swscale가 밝기를 약 2단계 낮춰 영상이 마스터보다 어두워진다.
// 마스터 맨 위·아래 줄은 일부 장면(흔들림·휩 직후 포함)에서 어둡게 렌더돼 있다(16:9에서는 화면 끝이라 안 보임). 여기서는 연두 여백과
// 맞닿아 실선으로 보이므로 위아래 4줄을 바로 안쪽 줄로 채운 뒤 줄인다.
const SWS = "accurate_rnd+full_chroma_int+full_chroma_inp";
const video = `fps=${FPS},fillborders=top=4:bottom=4:mode=smear,scale=${W}:${VH}:flags=lanczos+${SWS}:in_color_matrix=bt709:in_range=tv,format=rgb24`;
const toYuv = `scale=flags=${SWS}:out_color_matrix=bt709:out_range=tv,format=yuv420p,setsar=1`;
// 레벨 4.2 고정 — 1080×1920@60은 x264 기본(ref 5)이면 DPB가 넘쳐 레벨 5.0이 되므로, 레벨을 주면 x264가 ref를 4로 맞춘다.
// GOP는 2초 고정(장면 전환 키프레임 없음) — 마케팅 API 권장 '닫힌 GOP 2–5초', 세 비율이 같은 구조.
const encode = [
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level:v", "4.2",
  "-g", String(2 * FPS), "-sc_threshold", "0",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
  "-c:a", "copy", "-movflags", "+faststart",
];

const run = (args, out, line) => {
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...args, ...encode, out], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${path.basename(out)}`);
  console.log(`${line} → ${path.relative(root, out)}`);
};

for (const f of FORMATS) {
  const top = centered(f.h);
  const head = `${f.tag}: ${W}x${f.h} · ${FPS}fps · 영상 y ${top}–${top + VH}`;
  if (!f.frame) {
    const out = input.replace(/\.mp4$/, `-${f.tag}${suffix}.mp4`);
    run(["-i", input, "-vf", `${video},pad=${W}:${f.h}:0:${top}:color=${BG},${toYuv}`, "-map", "0:v", "-map", "0:a"], out, head);
    continue;
  }
  const cues = cueSheet();
  for (const titleId of titleIds) {
    // 상태 i의 PNG를 반복 입력으로 넣고, 다음 상태 시작에서 XF초 동안 크로스페이드한다(xfade 오프셋 = 절대 시각 − 1프레임)
    const title = TITLES.titles[titleId];
    const states = frameStates(cues, title);
    const pngs = await renderFrames(f.frame, f.h, titleId, states, f.tag);
    const n = states.length;
    const inputs = pngs.flatMap((p) => ["-loop", "1", "-framerate", String(FPS), "-i", p]);
    const graph = [
      ...states.map((s, i) => `[${i}:v]format=gbrp${i < n - 1 ? `,trim=end=${(states[i + 1].at - s.at + XF + 2 * LEAD).toFixed(4)}` : ""}[s${i}]`),
      ...states.slice(1).map((s, i) => `[${i ? `x${i}` : "s0"}][s${i + 1}]xfade=transition=fade:duration=${XF}:offset=${(s.at - LEAD).toFixed(4)}[${i + 1 === n - 1 ? "bg" : `x${i + 1}`}]`),
      `[${n}:v]${video}[v]`,
      `[bg][v]overlay=0:${top}:shortest=1:format=gbrp,${toYuv}[out]`,
    ].join(";");
    const out = input.replace(/\.mp4$/, `-${f.tag}-${titleId}${suffix}.mp4`);
    const note = ` · ${title.name} "${title.lines.join(" / ")}" · 상태 전환 ${states.slice(1).map((s) => `${s.at.toFixed(2)}s`).join(" · ")}`;
    run([...inputs, "-i", input, "-filter_complex", graph, "-map", "[out]", "-map", `${n}:a`], out, head + note);
  }
}
