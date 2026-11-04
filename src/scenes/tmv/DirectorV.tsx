import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, UiCard } from "../../components/Feature";
import { ClipReveal, RollingNumber, SketchCircle, Sparkline } from "../../components/Flourish";
import { Chip, Rise, Sticker } from "../../components/Ui";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { tx } from "../tm/TmLayout";
import { TmvLayout } from "./TmvLayout";

// 02 — 원장님은 편해집니다: 카드가 왼쪽에 놓이고 오른쪽에서 열린다.
// 핵심 지표 3개(확인한 수업 36/36 · 면담 준비 2시간 → 10분 · 할 일) → 우리 학원 기준 프리셋(슬림) → A편 대시보드를 섞은 강사 랭킹 표(평균 · 4주 추이 · 변화 · 상태). (모두 예시)
const PRESETS = [
  { name: "입시 수학", w: [35, 15, 20, 30] },
  { name: "초등 영어", w: [20, 30, 35, 15] },
];
const AREAS = ["수업 전달", "수업 분위기", "수업 상호작용", "언어 표현"];
type Status = "stable" | "growing" | "talk";
const RANKS: Array<{ name: string; cls: string; lessons: number; avg: number; trend: number[]; delta: number; status: Status }> = [
  { name: "박준호", cls: "고1 수학", lessons: 20, avg: 91, trend: [90, 91, 90, 91], delta: 1, status: "stable" },
  { name: "이서윤", cls: "중2 국어", lessons: 16, avg: 88, trend: [84, 85, 87, 88], delta: 3, status: "stable" },
  { name: "정유진", cls: "중1 영어", lessons: 18, avg: 79, trend: [82, 81, 80, 79], delta: -3, status: "talk" },
  { name: "김하늘", cls: "초6 영어", lessons: 12, avg: 76, trend: [70, 72, 75, 76], delta: 6, status: "growing" },
];
const STATUS: Record<Status, { label: string; bg: string; color: string; border?: string }> = {
  stable: { label: "안정", bg: C.ivory2, color: C.gray },
  growing: { label: "성장 중", bg: C.lime, color: C.ink },
  talk: { label: "면담 추천", bg: C.white, color: C.limeInk, border: C.lime },
};
const TABLE_AT = 56;
const SELECT_AT = 104;
const SWITCH_AT = 124;
const ROW_H = 50;

const Tile: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
  <Rise delay={delay} distance={16}>
    <div style={{ background: C.ivory, borderRadius: 18, padding: "14px 18px", height: 106, boxSizing: "border-box", position: "relative" }}>{children}</div>
  </Rise>
);

export const DirectorV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mix = sp(frame - SWITCH_AT, fps, SMOOTH, 22);
  const weights = PRESETS[0].w.map((a, i) => a + (PRESETS[1].w[i] - a) * mix);
  const strike = sp(frame - 50, fps, SMOOTH, 16);
  const sel = sp(frame - SELECT_AT, fps, SMOOTH, 14);

  return (
    <TmvLayout
      step={1}
      side="left"
      variant="ivory2"
      lines={["원장님은,", "편해집니다"]}
      sub={
        <>
          참관하지 않아도 모든 수업이 보이고, 강사별 수업 품질이 같은 기준으로 한눈에 들어옵니다. <span style={{ color: C.ink, fontWeight: 700 }}>면담 준비는 리포트 한 장이면 됩니다.</span>
        </>
      }
      bullets={["전 수업 리포트", "강사별 추이 · 랭킹", "면담 준비 10분"]}
    >
      <ClipReveal delay={7} from="right" radius={36} duration={26}>
        <UiCard width={900} padding={26}>
          <CardHeader
            title="원장님 대시보드 · 이번 주"
            right={
              <Chip delay={14} size={14} bg={C.ivory2} color={C.gray}>
                10.27 – 10.31
              </Chip>
            }
          />

          {/* 핵심 지표 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
            <Tile delay={20}>
              <div style={tx(12, 700, C.gray300, { letterSpacing: "0.1em" })}>확인한 수업</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <RollingNumber to={36} delay={26} duration={40} size={40} color={C.forest} />
                <span style={tx(18, 700, C.gray)}>/ 36회</span>
              </div>
              <div style={{ ...tx(13, 600, C.gray), marginTop: 2 }}>리포트로 전부 확인</div>
              <div style={{ position: "absolute", right: -8, top: -16 }}>
                <Sticker delay={66} size={13} rotate={-8}>
                  참관 0회
                </Sticker>
              </div>
            </Tile>
            <Tile delay={28}>
              <div style={tx(12, 700, C.gray300, { letterSpacing: "0.1em" })}>면담 준비 시간</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <span style={{ position: "relative", ...tx(26, 800, C.gray300) }}>
                  2시간
                  <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${strike * 100}%`, background: C.forest, borderRadius: 2 }} />
                </span>
                <span style={{ ...tx(20, 700, C.gray), opacity: strike }}>→</span>
                <span style={{ display: "inline-block", opacity: strike, transform: `translateY(${(1 - strike) * 10}px)` }}>
                  <SketchCircle delay={72} duration={16} color={C.limeDeep} stroke={4}>
                    <span style={{ ...tx(40, 900, C.forest), letterSpacing: "-0.04em" }}>10분</span>
                  </SketchCircle>
                </span>
              </div>
              <div style={{ ...tx(13, 600, C.gray), marginTop: 2 }}>리포트 한 장으로 준비</div>
            </Tile>
            <Tile delay={36}>
              <div style={tx(12, 700, C.gray300, { letterSpacing: "0.1em" })}>이번 주 할 일</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ ...tx(40, 900, C.ink), letterSpacing: "-0.04em" }}>3</span>
                <span style={tx(16, 700, C.gray)}>건</span>
              </div>
              <div style={{ ...tx(13, 600, C.gray), marginTop: 2 }}>면담 1 · 칭찬 2</div>
            </Tile>
          </div>

          {/* 우리 학원 기준 — 슬림 한 줄 */}
          <Rise delay={46} distance={14} style={{ marginTop: 12 }}>
            <div style={{ background: C.ivory, borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={tx(11, 700, C.gray300, { letterSpacing: "0.1em" })}>우리 학원 기준</div>
                <div style={{ position: "relative", display: "flex", background: C.ivory2, borderRadius: 999, padding: 3, marginTop: 4 }}>
                  <div style={{ position: "absolute", top: 3, bottom: 3, left: 3, width: "calc(50% - 3px)", borderRadius: 999, background: C.lime, transform: `translateX(${mix * 100}%)` }} />
                  {PRESETS.map((p, i) => (
                    <span key={p.name} style={{ position: "relative", ...tx(12, 800, C.ink), padding: "3px 12px", opacity: (i === 0 ? 1 - mix : mix) * 0.6 + 0.4 }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {AREAS.map((a, i) => {
                  const grow = sp(frame - (54 + i * 4), fps, SMOOTH, 22);
                  return (
                    <div key={a}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={tx(12, 700, C.gray)}>{a}</span>
                        <span style={tx(14, 800, C.forest, { fontVariantNumeric: "tabular-nums" })}>{Math.round(weights[i] * grow)}%</span>
                      </div>
                      <div style={{ marginTop: 4, height: 6, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(weights[i] / 40) * 100 * grow}%`, background: `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Rise>

          {/* 강사 랭킹 — A편 대시보드의 느낌 */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "34px 190px 54px 70px 130px 70px 1fr", alignItems: "center", padding: "6px 10px 6px", borderBottom: `1.5px solid ${C.hairline}`, opacity: interpolate(frame - TABLE_AT, [0, 8], [0, 1], clamp) }}>
              {["#", "강사 · 이번 주 평균", "수업", "평균", "4주 추이", "변화", "상태"].map((h) => (
                <span key={h} style={tx(11, 800, C.gray300, { letterSpacing: "0.08em" })}>
                  {h}
                </span>
              ))}
            </div>
            {RANKS.map((t, i) => {
              const d = TABLE_AT + 6 + i * 8;
              const s = sp(frame - d, fps, SMOOTH, 18);
              const o = interpolate(frame - d, [0, 6], [0, 1], clamp);
              const st = STATUS[t.status];
              const isSel = t.status === "talk";
              const lineColor = t.delta > 0 ? C.limeDeep : t.delta < 0 ? C.limeInk : C.gray300;
              const low = t.avg < 80;
              return (
                <div
                  key={t.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 190px 54px 70px 130px 70px 1fr",
                    alignItems: "center",
                    height: ROW_H,
                    padding: "0 10px",
                    borderRadius: 12,
                    background: isSel ? `rgba(234,247,192,${sel})` : "transparent",
                    boxShadow: isSel && sel > 0.1 ? `inset 4px 0 0 ${C.limeDeep}` : undefined,
                    borderBottom: i < RANKS.length - 1 ? `1px solid ${C.hairline}` : "none",
                    opacity: o,
                    transform: `translateX(${(1 - s) * -18}px)`,
                  }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: i === 0 ? C.lime : C.ivory2, display: "grid", placeItems: "center", ...tx(12, 900, i === 0 ? C.ink : C.gray) }}>{i + 1}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={tx(15, 800, C.ink)}>{t.name} 선생님</span>
                    <span style={tx(12, 600, C.gray)}>{t.cls}</span>
                  </div>
                  <span style={tx(13, 600, C.gray, { fontVariantNumeric: "tabular-nums" })}>{t.lessons}회</span>
                  <RollingNumber to={t.avg} delay={d + 4} duration={30} size={22} color={low ? C.limeInk : C.forest} />
                  <Sparkline values={t.trend} delay={d + 6} width={104} height={26} color={lineColor} duration={26} />
                  <span style={tx(14, 800, lineColor, { fontVariantNumeric: "tabular-nums" })}>{t.delta > 0 ? `▲ ${t.delta}` : t.delta < 0 ? `▼ ${-t.delta}` : "—"}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    {isSel && frame >= SELECT_AT + 8 && (
                      <Chip delay={SELECT_AT + 8} size={11} bg={C.forest} color={C.white}>
                        면담 노트 준비됨
                      </Chip>
                    )}
                    <Chip delay={d + 14} size={12} bg={st.bg} color={st.color} style={st.border ? { border: `1.5px solid ${st.border}`, padding: "3px 10px" } : undefined}>
                      {st.label}
                    </Chip>
                  </div>
                </div>
              );
            })}
          </div>
        </UiCard>
      </ClipReveal>
    </TmvLayout>
  );
};
