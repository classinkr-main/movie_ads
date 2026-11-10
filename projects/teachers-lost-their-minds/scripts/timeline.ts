// 타이밍 표·더빙 대본·가이드 자막을 story/beats.ts 에서 뽑아냅니다.
//   npm run mental:timeline
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BEATS, FPS, TOTAL_FRAMES, syllables } from "../story/beats.ts";
import { SCENE_MAP, sec } from "../story/scene-map.ts";
import { PACE } from "../story/timing.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (rel: string, body: string) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body, "utf-8");
  console.log("wrote", rel);
};

const tc = (frames: number) => {
  const s = frames / FPS;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
};
const srtTime = (frames: number) => {
  const ms = Math.round((frames / FPS) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

// 1) 기계가 읽는 타임라인
out(
  "artifacts/timeline.json",
  JSON.stringify(
    {
      fps: FPS,
      total_frames: TOTAL_FRAMES,
      total_seconds: sec(TOTAL_FRAMES),
      pace_syllables_per_second: PACE,
      beats: BEATS.map((b) => ({
        id: b.id,
        act: b.act,
        text: b.text,
        syllables: syllables(b.text),
        start_frame: b.start,
        end_frame: b.end,
        start_seconds: sec(b.start),
        end_seconds: sec(b.end),
        speech_end_seconds: sec(b.speechEnd),
        phrases: b.ph.map((p) => ({ text: p.text, start_seconds: sec(p.start), end_seconds: sec(p.end) })),
      })),
      scenes: SCENE_MAP.map((s) => ({ ...s, start_seconds: sec(s.start), end_seconds: sec(s.end) })),
    },
    null,
    2,
  ) + "\n",
);

// 2) 더빙 대본(화면에 맞춰 읽는 용)
const actName = { problem: "1막 · 문제", attempt: "2막 · 첫 시도", solution: "3막 · 해결", result: "4막 · 결과" } as const;
let md = `# 더빙 대본 — 선생님들은 멘탈이 나가 버렸습니다\n\n`;
md += `- 길이 ${tc(TOTAL_FRAMES)} · ${FPS}fps · 기준 속도 초당 ${PACE}음절(밈 쇼츠 특유의 빠르고 건조한 낭독)\n`;
md += `- **시작** 열에 맞춰 문장을 시작하면 화면 동작과 맞습니다. 쉼표마다 화면 동작이 하나씩 걸려 있으니 쉼표에서 아주 짧게 끊어 주세요.\n`;
md += `- 다르게 읽고 싶다면 편하게 녹음한 뒤 \`npm run mental:sync -- 녹음.srt\` 로 영상을 목소리에 맞추면 됩니다(README 참고).\n`;
let lastAct = "";
for (const b of BEATS) {
  if (b.act !== lastAct) {
    md += `\n## ${actName[b.act]}\n\n| # | 시작 | 끝 | 대사 | 화면 |\n| --- | --- | --- | --- | --- |\n`;
    lastAct = b.act;
  }
  const scene = SCENE_MAP.find((s) => b.start >= s.start && b.start < s.end);
  md += `| ${b.id.slice(1)} | ${tc(b.start)} | ${tc(b.speechEnd)} | ${b.ph.map((p) => p.text).join(" / ")} | ${scene ? scene.name : ""} |\n`;
}
out("deliverables/dubbing-script.md", md);

// 3) 가이드 자막(SRT) — 구절 단위
let srt = "";
let n = 1;
for (const b of BEATS) {
  b.ph.forEach((p, i) => {
    const end = i < b.ph.length - 1 ? b.ph[i + 1].start : Math.min(b.end, b.speechEnd + 6);
    srt += `${n++}\n${srtTime(p.start)} --> ${srtTime(end)}\n${p.text}\n\n`;
  });
}
out("deliverables/narration-guide.srt", srt);
