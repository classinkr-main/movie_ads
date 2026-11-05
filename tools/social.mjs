// 인스타그램 광고용 비율판 — 16:9 마스터를 자르지 않고 폭에 맞춰 줄인 뒤, 위아래를 브랜드 연두로 채운다(내용 동일·비율만 변경).
//   node tools/social.mjs                                   → out/classin-showreel-v5-30s-{1x1,4x5,9x16}.mp4
//   node tools/social.mjs out/classin-showreel-v5.mp4       → 22초판도 같은 규칙으로
// 9:16은 릴스·스토리 광고의 위·아래 UI(프로필·캡션·CTA·오른쪽 아이콘)를 피하도록 화면을 가운데보다 조금 위에 놓는다.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.resolve(root, process.argv[2] ?? "out/classin-showreel-v5-30s.mp4");
if (!existsSync(input)) throw new Error(`no master video: ${input}`);

const W = 1080;
const VH = 608; // 1080 × 9/16 = 607.5 → 짝수로
const BG = "0xE2F4B9"; // src/lib/theme.ts C.lime
const FPS = 30; // 메타 광고 권장(최대 30fps) — 60fps 마스터에서 한 프레임씩 건너뛴다
const FORMATS = [
  { tag: "1x1", h: 1080 }, // 피드 정사각
  { tag: "4x5", h: 1350 }, // 피드 세로
  { tag: "9x16", h: 1920, top: 420 }, // 릴스·스토리 — 화면 위끝 21.9%, 아래끝 53.5%
];

for (const f of FORMATS) {
  const top = f.top ?? Math.round((f.h - VH) / 4) * 2; // 가운데(짝수 픽셀)
  const out = input.replace(/\.mp4$/, `-${f.tag}.mp4`);
  // 색 변환을 RGB에서 한 번에 처리해 여백 연두가 영상 속 연두와 같은 값으로 남게 한다(BT.709 · TV 범위)
  const vf = [
    `fps=${FPS}`,
    `scale=${W}:${VH}:flags=lanczos:in_color_matrix=bt709:in_range=tv`,
    "format=rgb24",
    `pad=${W}:${f.h}:0:${top}:color=${BG}`,
    "scale=out_color_matrix=bt709:out_range=tv",
    "format=yuv420p",
    "setsar=1",
  ].join(",");
  const args = [
    "-y", "-v", "error", "-i", input, "-vf", vf,
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level:v", "4.1",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
    "-c:a", "copy", "-movflags", "+faststart", out,
  ];
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${f.tag}`);
  console.log(`${f.tag}: ${W}x${f.h} · ${FPS}fps · 화면 y ${top}–${top + VH} → ${path.relative(root, out)}`);
}
