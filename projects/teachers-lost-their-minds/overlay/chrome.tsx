import React from "react";
import { AbsoluteFill } from "remotion";
import { B, BEATS, Beat } from "../story/beats";
import { C, FONT } from "../lib/theme";
import { clamp, E, ring, tw } from "../lib/motion";

// 자막 대신 큰 글자(Slam)로 처리하는 구절. 같은 문장을 자막과 화면 글자로 두 번 보여 주지 않기 위한 목록입니다.
export const SLAM_PHRASES: Record<string, number[]> = {
  b01: [1],
  b06: [0],
  b11: [1],
  b21: [1],
  b23: [0, 1],
  b35: [0],
};

const splitMarks = (text: string, marks: string[]) => {
  const out: Array<{ t: string; m: boolean }> = [];
  let rest = text;
  while (rest.length) {
    let best = -1;
    let bestMark = "";
    for (const m of marks) {
      const i = rest.indexOf(m);
      if (i >= 0 && (best < 0 || i < best)) {
        best = i;
        bestMark = m;
      }
    }
    if (best < 0) {
      out.push({ t: rest, m: false });
      break;
    }
    if (best > 0) out.push({ t: rest.slice(0, best), m: false });
    out.push({ t: bestMark, m: true });
    rest = rest.slice(best + bestMark.length);
  }
  return out;
};

const beatAt = (f: number): Beat | null => BEATS.find((b) => f >= b.start && f < b.end) ?? null;

/** 구절 단위 자막. 구절이 바뀔 때마다 라벨이 새로 찍힙니다. */
export const Caption: React.FC<{ f: number; w: number; h: number; u: number; tall: boolean }> = ({ f, w, h, u, tall }) => {
  const beat = beatAt(f);
  if (!beat) return null;
  let idx = -1;
  for (let i = 0; i < beat.ph.length; i++) if (f >= beat.ph[i].start) idx = i;
  if (idx < 0) return null;
  if (SLAM_PHRASES[beat.id]?.includes(idx)) return null;
  const ph = beat.ph[idx];
  const t = f - ph.start;
  const inn = tw(f, ph.start, 5, E.out5);
  const fs = (tall ? 54 : 60) * u;
  const solved = beat.act === "solution" || beat.act === "result";
  const hl = solved ? C.lime : "#FFE14D";
  const parts = splitMarks(ph.text, beat.mark);
  const tilt = (idx % 2 ? 0.5 : -0.5) * (1 - inn * 0.3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: w / 2,
          top: h * (tall ? 0.8 : 0.868),
          transform: `translate(-50%, -50%) translateY(${(1 - inn) * 16 * u}px) scale(${0.9 + inn * 0.1}) rotate(${tilt}deg)`,
          opacity: clamp(t / 2.5),
          background: "#FFFFFF",
          border: `${4 * u}px solid ${C.ink}`,
          borderRadius: fs * 0.26,
          boxShadow: `${7 * u}px ${7 * u}px 0 ${C.ink}`,
          padding: `${fs * 0.2}px ${fs * 0.5}px ${fs * 0.24}px`,
          fontFamily: FONT.body,
          fontWeight: 900,
          fontSize: fs,
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
          color: C.ink,
          whiteSpace: tall ? "normal" : "nowrap",
          wordBreak: "keep-all",
          textAlign: "center",
          width: "max-content",
          maxWidth: w * 0.9,
        }}
      >
        {parts.map((p, i) =>
          p.m ? (
            <span key={i} style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  position: "absolute",
                  left: -fs * 0.08,
                  right: -fs * 0.08,
                  top: fs * 0.1,
                  bottom: fs * 0.02,
                  background: hl,
                  borderRadius: fs * 0.1,
                  transformOrigin: "left center",
                  transform: `scaleX(${tw(f, ph.start + 2, 7, E.out)}) rotate(-0.6deg)`,
                }}
              />
              <span style={{ position: "relative" }}>{p.t}</span>
            </span>
          ) : (
            <span key={i}>{p.t}</span>
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── "수업 끝나고 할 일" 메모 ──────────────────────────────────────────────────
// 1막에서 한 줄씩 늘고, 3막에서 한 줄씩 '자동'이 되고, 4막에서 통째로 날아갑니다.
const ITEMS = [
  { label: "촬영", add: B.b04.ph[1].start, auto: B.b25.ph[0].start },
  { label: "편집", add: B.b07.ph[1].start, skip: B.b25.ph[4].start },
  { label: "업로드", add: B.b09.ph[1].start, auto: B.b25.ph[1].start },
  { label: "시청 체크", add: B.b12.ph[1].start, auto: B.b25.ph[2].start },
  { label: "관리", add: B.b25.ph[3].start, auto: B.b25.ph[3].start + 5, late: true },
];

export const TodoNote: React.FC<{ f: number; w: number; h: number; u: number; tall: boolean }> = ({ f, u, tall }) => {
  const show = B.b04.ph[1].start - 8;
  const fly = B.b28.ph[2].start;
  if (f < show || f > fly + 30) return null;
  const inn = tw(f, show, 12, E.back);
  const s = (tall ? 0.92 : 1) * u;
  // 날아가기: 위로 살짝 뜬 뒤 오른쪽 위로 빠집니다.
  const k = clamp((f - fly) / 24);
  const flyX = E.in(k) * 520 * s;
  const flyY = -Math.sin(k * Math.PI) * 60 * s - E.in(k) * 520 * s;
  const flyR = E.in(k) * 38;
  // 줄이 늘 때마다, 그리고 "그대로였죠"에서 메모가 덜컹합니다.
  let jolt = 0;
  for (const it of ITEMS) jolt += ring(f, it.add, 5, 1.1, 0.2);
  jolt += ring(f, B.b14.ph[3].start, 7, 1.2, 0.16) + ring(f, B.b21.ph[1].start, 8, 1.2, 0.16);
  const solvedHead = f >= B.b25.ph[0].start;
  const fs = 30 * s;
  return (
    <div
      style={{
        position: "absolute",
        left: (tall ? 40 : 56) * u,
        top: (tall ? 150 : 52) * u,
        transformOrigin: "20% 0%",
        transform: `translate(${flyX}px, ${flyY}px) rotate(${-2.2 + jolt * 0.35 + flyR}deg) scale(${inn})`,
        opacity: 1 - tw(f, fly + 16, 10),
        width: 318 * s,
        background: "#FFFDF4",
        border: `${3.5 * s}px solid ${C.ink}`,
        borderRadius: 14 * s,
        boxShadow: `${7 * s}px ${7 * s}px 0 ${C.ink}`,
        fontFamily: FONT.body,
        color: C.ink,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: solvedHead ? C.forest : C.red,
          color: "#fff",
          fontWeight: 900,
          fontSize: fs * 0.86,
          letterSpacing: "-0.02em",
          padding: `${fs * 0.36}px ${fs * 0.6}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>수업 끝나고 할 일</span>
        <span style={{ fontFamily: FONT.slam, fontSize: fs * 1.05, lineHeight: 1 }}>{ITEMS.filter((it) => f >= it.add && !it.late && !(it.auto && f >= it.auto) && !(it.skip && f >= it.skip)).length}</span>
      </div>
      <div style={{ padding: `${fs * 0.3}px ${fs * 0.6}px ${fs * 0.42}px` }}>
        {ITEMS.map((it, i) => {
          if (f < it.add) return null;
          const p = tw(f, it.add, 9, E.back);
          const auto = it.auto !== undefined && f >= it.auto;
          const skip = it.skip !== undefined && f >= it.skip;
          const done = auto || skip;
          const dp = tw(f, (it.auto ?? it.skip ?? 0) as number, 8, E.back);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: fs * 0.42, height: fs * 1.62 * Math.min(1, p * 1.2), transform: `scale(${p})`, transformOrigin: "left center" }}>
              <div
                style={{
                  width: fs * 0.82,
                  height: fs * 0.82,
                  flex: "none",
                  borderRadius: fs * 0.2,
                  border: `${3 * s}px solid ${done ? C.brand : C.ink}`,
                  background: done ? C.brand : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: fs * 0.66,
                  lineHeight: 1,
                }}
              >
                {done && <span style={{ transform: `scale(${dp})` }}>✓</span>}
              </div>
              <div style={{ fontWeight: 800, fontSize: fs, letterSpacing: "-0.03em", position: "relative", opacity: skip ? 0.45 : 1 }}>
                {it.label}
                {skip && <span style={{ position: "absolute", left: -2 * s, right: -2 * s, top: "52%", height: 3.5 * s, background: C.ink, transformOrigin: "left", transform: `scaleX(${dp})` }} />}
              </div>
              {auto && (
                <div
                  style={{
                    marginLeft: "auto",
                    background: C.lime,
                    color: C.forest,
                    fontWeight: 900,
                    fontSize: fs * 0.66,
                    padding: `${fs * 0.12}px ${fs * 0.34}px`,
                    borderRadius: fs * 0.3,
                    transform: `scale(${dp}) rotate(-4deg)`,
                  }}
                >
                  자동
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ACTS: Array<{ id: string; label: string; from: number }> = [
  { id: "problem", label: "문제", from: BEATS[0].start },
  { id: "attempt", label: "첫 시도", from: B.b15.start },
  { id: "solution", label: "해결", from: B.b22.start },
  { id: "result", label: "결과", from: B.b28.start },
];

/** 오른쪽 위의 막 표시(문제 → 첫 시도 → 해결 → 결과) */
export const ActRail: React.FC<{ f: number; w: number; u: number; tall: boolean }> = ({ f, w, u, tall }) => {
  const show = B.b01.end - 4;
  if (f < show || f >= B.b35.start) return null;
  let cur = 0;
  ACTS.forEach((a, i) => {
    if (f >= a.from) cur = i;
  });
  const inn = tw(f, show, 10, E.out);
  const fs = 26 * u;
  const dark = false;
  return (
    <div
      style={{
        position: "absolute",
        right: (tall ? 40 : 56) * u,
        top: (tall ? 64 : 56) * u,
        display: "flex",
        alignItems: "center",
        gap: fs * 0.3,
        opacity: inn,
        transform: `translateY(${(1 - inn) * -14 * u}px)`,
        fontFamily: FONT.body,
        color: dark ? "#fff" : C.ink,
      }}
    >
      {ACTS.map((a, i) => {
        const on = i === cur;
        const past = i < cur;
        const p = on ? tw(f, a.from, 10, E.back) : 1;
        const solved = i >= 2;
        return (
          <React.Fragment key={a.id}>
            {i > 0 && <div style={{ width: fs * 0.7, height: 3 * u, background: C.ink, opacity: past || on ? 0.9 : 0.25 }} />}
            <div
              style={{
                fontWeight: 900,
                fontSize: fs,
                letterSpacing: "-0.02em",
                padding: `${fs * 0.24}px ${fs * 0.52}px`,
                borderRadius: fs * 0.7,
                background: on ? (solved ? C.forest : i === 1 ? C.cobalt : C.red) : "rgba(255,255,255,0.82)",
                color: on ? "#fff" : C.ink,
                border: `${3 * u}px solid ${C.ink}`,
                opacity: on ? 1 : past ? 0.72 : 0.36,
                transform: `scale(${on ? 0.9 + p * 0.1 : 0.86})`,
                whiteSpace: "nowrap",
              }}
            >
              {a.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Fill = AbsoluteFill;
