// 녹음한 내레이션의 자막(SRT)으로 영상 타이밍을 맞춥니다.
//
//   npm run mental:sync -- path/to/narration.srt [--offset 0.5]
//
// SRT 는 Vrew·캡컷·프리미어 등 아무 도구의 자동 자막이면 됩니다. 자막이 어떻게 끊겨 있든 상관없습니다 —
// 글자 순서로 대본과 맞춘 뒤, 비트·구절 경계의 시각을 보간해 story/timing.ts 의 BEAT_SECONDS / PHRASE_STARTS 를 채웁니다.
// --offset: 영상에서 첫 대사가 시작할 시각(초). 기본값은 녹음 파일의 첫 자막 시각 그대로.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BEATS } from "../story/beats.ts";

const args = process.argv.slice(2);
const srtPath = args.find((a) => !a.startsWith("--"));
if (!srtPath) {
  console.error("사용법: npm run mental:sync -- <narration.srt> [--offset 초]");
  process.exit(1);
}
const offArg = args.indexOf("--offset");
const offset = offArg >= 0 ? Number(args[offArg + 1]) : null;

const HANGUL = /[가-힣]/;
const norm = (s: string) => [...s].filter((c) => HANGUL.test(c));

// ── SRT 파싱 → 글자마다 시각을 부여(자막 구간 안에서 균등 배분)
const toSec = (t: string) => {
  const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) throw new Error(`시간 형식을 읽을 수 없습니다: ${t}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0").slice(0, 3)) / 1000;
};
type Ch = { c: string; t: number; tEnd: number };
const heard: Ch[] = [];
for (const block of readFileSync(srtPath, "utf-8").replace(/\r/g, "").split(/\n\s*\n/)) {
  const lines = block.split("\n").filter((l) => l.trim());
  const ti = lines.findIndex((l) => l.includes("-->"));
  if (ti < 0) continue;
  const [a, b] = lines[ti].split("-->");
  const start = toSec(a);
  const end = toSec(b);
  const chars = norm(lines.slice(ti + 1).join(" "));
  chars.forEach((c, i) => heard.push({ c, t: start + ((end - start) * i) / chars.length, tEnd: start + ((end - start) * (i + 1)) / chars.length }));
}
if (heard.length < 50) throw new Error("자막에서 한글을 거의 찾지 못했습니다. SRT 파일이 맞는지 확인해 주세요.");

// ── 대본 글자열(구절 경계 표시)
type Mark = { beat: number; phrase: number; index: number };
const script: string[] = [];
const marks: Mark[] = [];
BEATS.forEach((b, bi) =>
  b.ph.forEach((p, pi) => {
    marks.push({ beat: bi, phrase: pi, index: script.length });
    script.push(...norm(p.text));
  }),
);

// ── 글자 정렬(LCS). 자동 자막의 오인식·누락을 견딥니다.
const n = script.length;
const m = heard.length;
const W = m + 1;
const dp = new Uint16Array((n + 1) * W);
for (let i = n - 1; i >= 0; i--) {
  for (let j = m - 1; j >= 0; j--) {
    dp[i * W + j] = script[i] === heard[j].c ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
  }
}
const timeAt: Array<number | null> = new Array(n).fill(null);
const endAt: Array<number | null> = new Array(n).fill(null);
let i = 0;
let j = 0;
let matched = 0;
while (i < n && j < m) {
  if (script[i] === heard[j].c) {
    timeAt[i] = heard[j].t;
    endAt[i] = heard[j].tEnd;
    matched++;
    i++;
    j++;
  } else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
  else j++;
}
const ratio = matched / n;
console.log(`대본 ${n}자 중 ${matched}자 일치 (${(ratio * 100).toFixed(1)}%)`);
if (ratio < 0.7) throw new Error("대본과 자막이 70% 미만으로 일치합니다. 다른 녹음이거나 자막 품질이 너무 낮습니다.");

// 맞지 않은 글자는 앞뒤 일치 글자 사이를 선형 보간
const known = timeAt.map((t, k) => (t === null ? -1 : k)).filter((k) => k >= 0);
const at = (k: number): number => {
  if (timeAt[k] !== null) return timeAt[k] as number;
  const prev = [...known].reverse().find((x) => x < k);
  const next = known.find((x) => x > k);
  if (prev === undefined) return timeAt[next as number] as number;
  if (next === undefined) return endAt[prev] as number;
  const a = timeAt[prev] as number;
  const b = timeAt[next] as number;
  return a + ((b - a) * (k - prev)) / (next - prev);
};

const first = at(0);
const shift = offset === null ? 0 : offset - first;
const phraseTime = marks.map((mk) => at(mk.index) + shift);
const lastEnd = (endAt[known[known.length - 1]] as number) + shift;

// ── timing.ts 다시 쓰기
const beatStart = BEATS.map((_, bi) => phraseTime[marks.findIndex((mk) => mk.beat === bi && mk.phrase === 0)]);
const r = (x: number) => Math.round(x * 1000) / 1000;
const beatSeconds: Record<string, number> = {};
const phraseStarts: Record<string, number[]> = {};
BEATS.forEach((b, bi) => {
  const next = bi < BEATS.length - 1 ? beatStart[bi + 1] : lastEnd + 0.3;
  beatSeconds[b.id] = r(Math.max(0.4, next - beatStart[bi]));
  phraseStarts[b.id] = marks.filter((mk) => mk.beat === bi).map((mk) => r(Math.max(0, phraseTime[marks.indexOf(mk)] - beatStart[bi])));
});

const timingPath = join(dirname(fileURLToPath(import.meta.url)), "..", "story", "timing.ts");
let src = readFileSync(timingPath, "utf-8");
const put = (name: string, type: string, value: unknown) => {
  const re = new RegExp(`export const ${name}: ${type.replace(/[[\]<>.,]/g, "\\$&")} = [^;]*;`);
  if (!re.test(src)) throw new Error(`timing.ts 에서 ${name} 선언을 찾지 못했습니다.`);
  src = src.replace(re, `export const ${name}: ${type} = ${JSON.stringify(value, null, 2)};`);
};
src = src.replace(/export const LEAD_IN = [^;]*;/, `export const LEAD_IN = ${r(beatStart[0])};`);
put("BEAT_SECONDS", "Partial<Record<string, number>>", beatSeconds);
put("PHRASE_STARTS", "Partial<Record<string, number[]>>", phraseStarts);
writeFileSync(timingPath, src, "utf-8");
console.log(`timing.ts 갱신: 첫 대사 ${r(beatStart[0])}s, 마지막 대사 끝 ${r(lastEnd)}s`);
console.log("이제 `npm run mental:timeline` 으로 대본 시트를 다시 뽑고, `npm run mental:render` 로 다시 렌더하세요.");
