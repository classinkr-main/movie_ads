import { FPS } from "../lib/theme";
import type { Segment, ShortSpec } from "./types";

// 구간 길이는 프레임 단위로 고정한다. scripts/cut-clips.py의 frames()와 같은 규칙이라
// 잘라 붙인 클립과 화면 전환(크롭) 시점이 프레임 단위로 맞는다
export const segmentFrames = (s: Segment) => Math.floor((s.to - s.from) * FPS + 0.5);

// 잘라 붙인 클립 위에서의 구간 시작(초)
export const segmentOffsets = (segments: Segment[]): number[] => {
  const out: number[] = [];
  let acc = 0;
  for (const s of segments) {
    out.push(acc / FPS);
    acc += segmentFrames(s);
  }
  return out;
};

export const clipFrames = (segments: Segment[]) => segments.reduce((sum, s) => sum + segmentFrames(s), 0);

// 원본 기준 시각 → 클립 기준 시각. 어느 구간에도 없으면 null
export const toClipTime = (segments: Segment[], t: number): number | null => {
  const offsets = segmentOffsets(segments);
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const len = segmentFrames(s) / FPS;
    if (t >= s.from - 0.05 && t <= s.to + 0.05) return offsets[i] + Math.min(Math.max(t - s.from, 0), len);
  }
  return null;
};

export type TimedCue = ShortSpec["cues"][number] & { at: number; until: number }; // 클립 기준 초

// 다음 자막까지 이만큼(초) 이하로 비면 앞 자막을 붙잡아 깜빡임을 없앤다
const HOLD_GAP = 1.2;

export const timedCues = (spec: ShortSpec): TimedCue[] => {
  const cues = spec.cues.map((c) => {
    const at = toClipTime(spec.segments, c.start);
    const until = toClipTime(spec.segments, c.end);
    if (at === null || until === null || until <= at) {
      throw new Error(`[${spec.id}] 자막이 구간 밖에 있습니다: ${c.start}–${c.end} ${c.ko}`);
    }
    return { ...c, at, until };
  });
  for (let i = 0; i < cues.length - 1; i++) {
    const gap = cues[i + 1].at - cues[i].until;
    if (gap > 0 && gap <= HOLD_GAP) cues[i].until = cues[i + 1].at;
  }
  return cues;
};

// 클립 기준 시각이 속한 구간 번호
export const segmentAt = (segments: Segment[], clipT: number): number => {
  const offsets = segmentOffsets(segments);
  for (let i = segments.length - 1; i >= 0; i--) if (clipT >= offsets[i] - 1e-6) return i;
  return 0;
};
