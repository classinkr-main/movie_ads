import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, UiCard } from "../../../shared/brand/Card";
import { ClipReveal, RollingNumber } from "../../../shared/brand/Flourish";
import { Chip, Pop } from "../../../shared/brand/Ui";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";
import { TmLayout, tx } from "./TmLayout";

// 01 — 모든 수업을 AI가 같은 기준으로 평가한다.
// 12개 수업 녹화 타일 위로 스캐너가 천천히 내려가며, 지나간 타일마다 점수가 찍힌다. (강사·점수 모두 예시)
const LESSONS = [
  { name: "이서윤", cls: "중2 국어 A반", len: "45:00", score: 88 },
  { name: "박준호", cls: "고1 수학", len: "50:00", score: 91 },
  { name: "김하늘", cls: "초6 영어", len: "40:00", score: 76 },
  { name: "최민재", cls: "중3 과학", len: "45:00", score: 83 },
  { name: "정유진", cls: "중1 영어", len: "40:00", score: 79 },
  { name: "한도현", cls: "고2 수학", len: "60:00", score: 90 },
  { name: "오세라", cls: "초5 수학", len: "40:00", score: 85 },
  { name: "윤지호", cls: "중2 사회", len: "45:00", score: 72 },
  { name: "강나래", cls: "고3 국어", len: "50:00", score: 94 },
  { name: "서민석", cls: "중3 수학", len: "45:00", score: 81 },
  { name: "임채원", cls: "초4 영어", len: "40:00", score: 87 },
  { name: "노아영", cls: "고1 영어", len: "50:00", score: 78 },
];
const AREAS = [
  { label: "수업 전달", v: 87 },
  { label: "수업 분위기", v: 84 },
  { label: "수업 상호작용", v: 80 },
  { label: "언어 표현", v: 88 },
];
const COLS = 4;
const GAP = 12;
const CARD_W = 940;
const PAD = 30;
const INNER = CARD_W - PAD * 2;
const TILE_W = (INNER - GAP * (COLS - 1)) / COLS;
const WIN_H = 96;
const TILE_H = WIN_H + 50;
const ROWS = LESSONS.length / COLS;
const GRID_H = ROWS * TILE_H + (ROWS - 1) * GAP;
const SCAN_START = 26;
const SCAN_END = 98;
const DONE_AT = 102;
const STRIP_AT = 112;

export const EvalAll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scanT = interpolate(frame, [SCAN_START, SCAN_END], [0, 1], clamp);
  const scanY = scanT * GRID_H;
  const scanning = frame >= SCAN_START - 4 && frame < DONE_AT;
  // 타일 i가 스캔선을 통과하는 글로벌 프레임 — 프레임마다 독립 렌더되므로 상태 대신 계산으로 구한다.
  const doneAtOf = (i: number) => {
    const row = Math.floor(i / COLS);
    const cy = row * (TILE_H + GAP) + WIN_H / 2;
    return SCAN_START + (cy / GRID_H) * (SCAN_END - SCAN_START);
  };
  const doneCount = LESSONS.filter((_, i) => frame >= doneAtOf(i)).length;

  return (
    <TmLayout
      step={0}
      title={
        <>
          모든 수업을,
          <br />
          AI가 같은 기준으로
        </>
      }
      sub="녹화된 수업마다 4개 영역 11개 항목을 진단해 점수와 리포트를 만듭니다. 참관하지 않아도, 강사별 수업 품질이 같은 잣대로 보입니다."
      bullets={["4개 영역 · 11개 항목", "수업마다 자동 리포트", "강점 · 개선 포인트"]}
    >
      <ClipReveal delay={10} radius={36} duration={26}>
        <UiCard width={CARD_W} padding={PAD}>
          <CardHeader
            title="이번 주 수업 녹화 · AI 강의 평가"
            right={
              <div style={{ position: "relative", height: 36, minWidth: 180, display: "flex", justifyContent: "flex-end" }}>
                {scanning && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, ...tx(16, 800, C.limeInk), background: C.limeSoft, borderRadius: 999, padding: "6px 16px", opacity: interpolate(frame, [SCAN_START - 4, SCAN_START, DONE_AT - 4, DONE_AT], [0, 1, 1, 0], clamp) }}>
                    <span style={{ display: "flex", gap: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: C.limeDeep, opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame / 5 + i * 1.1)) }} />
                      ))}
                    </span>
                    AI 분석 중 · {doneCount} / {LESSONS.length}
                  </div>
                )}
                {frame >= DONE_AT && (
                  <Chip delay={DONE_AT} size={16} bg={C.lime} color={C.ink}>
                    ✓ 분석 완료 12 / 12
                  </Chip>
                )}
              </div>
            }
          />
          <div style={{ ...tx(16, 600, C.gray), marginTop: 12 }}>10.27 – 10.31 · 수업 녹화 12회 · 강사 12명 · 온라인·대면 수업 모두</div>

          {/* 녹화 타일 그리드 + 스캐너 */}
          <div style={{ position: "relative", marginTop: 14, height: GRID_H }}>
            {LESSONS.map((l, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              const d = 14 + i * 2.5;
              const s = sp(frame - d, fps, SMOOTH, 18);
              const o = interpolate(frame - d, [0, 6], [0, 1], clamp);
              const doneAt = doneAtOf(i);
              const done = frame >= doneAt;
              const low = l.score < 80;
              const bars = [0, 1, 2, 3].map((k) => Math.max(0.3, Math.min(1, l.score / 100 + (random(`b${i}${k}`) - 0.5) * 0.3)));
              return (
                <div key={l.name} style={{ position: "absolute", left: col * (TILE_W + GAP), top: row * (TILE_H + GAP), width: TILE_W, height: TILE_H, opacity: o, transform: `translateY(${(1 - s) * 18}px)` }}>
                  <div style={{ position: "relative", height: WIN_H, borderRadius: 16, background: done ? (low ? C.limeSoft : "rgba(200,240,90,0.55)") : C.ivory2, border: `1.5px solid ${done ? C.lime : C.hairline}`, boxSizing: "border-box", padding: "12px 14px", overflow: "visible" }}>
                    {/* 녹화 중 표시 */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: done ? C.forest : C.gray300 }} />
                        <span style={tx(11, 800, done ? C.forest : C.gray300, { letterSpacing: "0.1em" })}>REC</span>
                      </span>
                      <span style={tx(11, 700, done ? C.forest : C.gray300, { fontVariantNumeric: "tabular-nums" })}>{l.len}</span>
                    </div>
                    {/* 뿌연 줄 → 4개 영역 미니 막대 */}
                    {!done ? (
                      <>
                        <div style={{ marginTop: 14, height: 7, width: "72%", borderRadius: 999, background: "rgba(28,27,23,0.08)" }} />
                        <div style={{ marginTop: 7, height: 7, width: "50%", borderRadius: 999, background: "rgba(28,27,23,0.08)" }} />
                      </>
                    ) : (
                      <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", alignItems: "flex-end", gap: 5, height: 34 }}>
                        {bars.map((b, k) => {
                          const h = sp(frame - doneAt - k * 2, fps, SMOOTH, 14);
                          return <span key={k} style={{ width: 12, height: Math.max(3, 34 * b * h), borderRadius: 3, background: k === 2 && low ? C.limeDeep : C.forest, opacity: 0.85 }} />;
                        })}
                      </div>
                    )}
                    {/* 점수 배지 */}
                    {done && (
                      <div style={{ position: "absolute", right: 10, bottom: 8 }}>
                        <Pop delay={doneAt} from={0.3} config={{ damping: 11, stiffness: 200, mass: 0.7 }}>
                          <div style={{ ...tx(30, 900, low ? C.limeInk : C.forest), letterSpacing: "-0.04em", lineHeight: 1 }}>{l.score}</div>
                        </Pop>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 9, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={tx(15, 800, C.ink)}>{l.name}</span>
                    <span style={tx(13, 600, C.gray)}>{l.cls}</span>
                  </div>
                </div>
              );
            })}

            {/* 스캐너 */}
            <div
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                top: scanY - 70,
                height: 70,
                background: `linear-gradient(180deg, rgba(200,240,90,0) 0%, rgba(200,240,90,0.35) 100%)`,
                opacity: interpolate(frame, [SCAN_START - 2, SCAN_START + 4, SCAN_END - 4, SCAN_END + 3], [0, 1, 1, 0], clamp),
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "absolute", left: -6, right: -6, top: scanY - 2, height: 3, background: C.forest, boxShadow: `0 0 22px ${C.lime}, 0 0 6px ${C.limeDeep}`, opacity: interpolate(frame, [SCAN_START - 2, SCAN_START + 4, SCAN_END - 4, SCAN_END + 3], [0, 1, 1, 0], clamp), pointerEvents: "none" }} />
          </div>

          {/* 4개 영역 평균 스트립 */}
          <div style={{ marginTop: 16 }}>
            <ClipReveal delay={STRIP_AT} radius={18} duration={24}>
              <div style={{ background: C.ivory, borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={tx(12, 800, C.limeInk, { letterSpacing: "0.12em" })}>4개 영역 · 11개 항목</div>
                  <div style={{ ...tx(16, 800, C.ink), marginTop: 2 }}>이번 주 평균</div>
                </div>
                {AREAS.map((a, i) => {
                  const d = STRIP_AT + 8 + i * 5;
                  const fill = sp(frame - d, fps, SMOOTH, 28) * (a.v / 100);
                  return (
                    <div key={a.label} style={{ flex: 1, opacity: interpolate(frame - d, [0, 6], [0, 1], clamp) }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={tx(14, 700, C.gray)}>{a.label}</span>
                        <RollingNumber to={a.v} delay={d} duration={28} size={20} color={a.v < 82 ? C.limeInk : C.forest} />
                      </div>
                      <div style={{ marginTop: 5, height: 7, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${fill * 100}%`, background: a.v < 82 ? C.limeDeep : `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ClipReveal>
          </div>
        </UiCard>
      </ClipReveal>
    </TmLayout>
  );
};
