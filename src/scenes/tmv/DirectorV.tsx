import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, UiCard } from "../../components/Feature";
import { ClipReveal, RollingNumber, SketchCircle } from "../../components/Flourish";
import { Chip, Rise, Sticker } from "../../components/Ui";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { tx } from "../tm/TmLayout";
import { TmvLayout } from "./TmvLayout";

// 02 — 원장님은 편해집니다: 카드가 왼쪽에 놓이고 오른쪽에서 열린다. 확인한 수업 36/36 · 면담 준비 2시간 → 10분(손그림 동그라미) · 우리 학원 기준 프리셋 전환 · 이번 주 알림. (수치는 예시)
const PRESETS = [
  { name: "입시 수학", w: [35, 15, 20, 30] },
  { name: "초등 영어", w: [20, 30, 35, 15] },
];
const AREAS = ["수업 전달", "수업 분위기", "수업 상호작용", "언어 표현"];
const SWITCH_AT = 108;

const Tile: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
  <Rise delay={delay} distance={16}>
    <div style={{ background: C.ivory, borderRadius: 18, padding: "16px 18px", height: 118, boxSizing: "border-box", position: "relative" }}>{children}</div>
  </Rise>
);

export const DirectorV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mix = sp(frame - SWITCH_AT, fps, SMOOTH, 22);
  const weights = PRESETS[0].w.map((a, i) => a + (PRESETS[1].w[i] - a) * mix);
  const strike = sp(frame - 50, fps, SMOOTH, 16);

  return (
    <TmvLayout
      step={1}
      side="left"
      variant="ivory2"
      lines={["원장님은,", "편해집니다"]}
      sub={
        <>
          참관하지 않아도 모든 수업이 보이고, 면담 준비는 리포트 한 장이면 됩니다. <span style={{ color: C.ink, fontWeight: 700 }}>평가 기준은 우리 학원이 정합니다.</span>
        </>
      }
      bullets={["전 수업 리포트", "면담 준비 10분", "우리 학원 기준"]}
    >
      <ClipReveal delay={7} from="right" radius={36} duration={26}>
        <UiCard width={900} padding={28}>
          <CardHeader
            title="원장님 대시보드 · 이번 주"
            right={
              <Chip delay={14} size={14} bg={C.ivory2} color={C.gray}>
                10.27 – 10.31
              </Chip>
            }
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 18 }}>
            <Tile delay={20}>
              <div style={tx(13, 700, C.gray300, { letterSpacing: "0.1em" })}>확인한 수업</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <RollingNumber to={36} delay={26} duration={40} size={44} color={C.forest} />
                <span style={tx(20, 700, C.gray)}>/ 36회</span>
              </div>
              <div style={{ ...tx(14, 600, C.gray), marginTop: 4 }}>리포트로 전부 확인</div>
              <div style={{ position: "absolute", right: -8, top: -16 }}>
                <Sticker delay={66} size={14} rotate={-8}>
                  참관 0회
                </Sticker>
              </div>
            </Tile>
            <Tile delay={28}>
              <div style={tx(13, 700, C.gray300, { letterSpacing: "0.1em" })}>면담 준비 시간</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                <span style={{ position: "relative", ...tx(30, 800, C.gray300) }}>
                  2시간
                  <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${strike * 100}%`, background: C.forest, borderRadius: 2 }} />
                </span>
                <span style={{ ...tx(22, 700, C.gray), opacity: strike }}>→</span>
                <span style={{ display: "inline-block", opacity: strike, transform: `translateY(${(1 - strike) * 10}px)` }}>
                  <SketchCircle delay={72} duration={16} color={C.limeDeep} stroke={4}>
                    <span style={{ ...tx(44, 900, C.forest), letterSpacing: "-0.04em" }}>10분</span>
                  </SketchCircle>
                </span>
              </div>
              <div style={{ ...tx(14, 600, C.gray), marginTop: 4 }}>리포트 한 장으로 준비</div>
            </Tile>
            <Tile delay={36}>
              <div style={tx(13, 700, C.gray300, { letterSpacing: "0.1em" })}>이번 주 할 일</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                <span style={{ ...tx(44, 900, C.ink), letterSpacing: "-0.04em" }}>3</span>
                <span style={tx(18, 700, C.gray)}>건</span>
              </div>
              <div style={{ ...tx(14, 600, C.gray), marginTop: 4 }}>면담 1 · 칭찬 2</div>
            </Tile>
          </div>

          {/* 우리 학원 기준 */}
          <Rise delay={46} distance={16} style={{ marginTop: 14 }}>
            <div style={{ background: C.ivory, borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={tx(13, 700, C.gray300, { letterSpacing: "0.1em" })}>우리 학원 기준 · 영역 가중치</div>
                  <div style={{ ...tx(17, 800, C.ink), marginTop: 3 }}>같은 11개 항목, 비중은 우리 학원이 정합니다</div>
                </div>
                <div style={{ position: "relative", display: "flex", background: C.ivory2, borderRadius: 999, padding: 4 }}>
                  <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)", borderRadius: 999, background: C.lime, transform: `translateX(${mix * 100}%)` }} />
                  {PRESETS.map((p, i) => (
                    <span key={p.name} style={{ position: "relative", ...tx(14, 800, C.ink), padding: "5px 16px", opacity: (i === 0 ? 1 - mix : mix) * 0.6 + 0.4 }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
                {AREAS.map((a, i) => {
                  const grow = sp(frame - (58 + i * 5), fps, SMOOTH, 24);
                  return (
                    <div key={a}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={tx(14, 700, C.gray)}>{a}</span>
                        <span style={tx(17, 800, C.forest, { fontVariantNumeric: "tabular-nums" })}>{Math.round(weights[i] * grow)}%</span>
                      </div>
                      <div style={{ marginTop: 6, height: 8, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(weights[i] / 40) * 100 * grow}%`, background: `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Rise>

          {/* 이번 주 알림 */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { d: 78, mark: "▲", tone: C.limeDeep, who: "김하늘 선생님", text: "4주 연속 상승 — 칭찬 포인트가 생겼어요", chip: "칭찬", bg: C.lime, color: C.ink },
              { d: 88, mark: "●", tone: C.forest, who: "정유진 선생님", text: "상호작용 하락 추세 — 강점 먼저, 개선점 하나로 면담 준비됨", chip: "면담 추천", bg: C.white, color: C.limeInk },
            ].map((r) => {
              const s = sp(frame - r.d, fps, SMOOTH, 18);
              return (
                <div key={r.who} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1.5px solid ${C.hairline}`, borderRadius: 14, padding: "10px 14px", opacity: interpolate(frame - r.d, [0, 6], [0, 1], clamp), transform: `translateX(${(1 - s) * 24}px)` }}>
                  <span style={{ ...tx(14, 900, r.tone), width: 16 }}>{r.mark}</span>
                  <span style={{ ...tx(16, 800, C.ink), whiteSpace: "nowrap" }}>{r.who}</span>
                  <span style={{ ...tx(15, 500, C.gray), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{r.text}</span>
                  <Chip delay={r.d + 6} size={12} bg={r.bg} color={r.color} style={r.chip === "면담 추천" ? { border: `1.5px solid ${C.lime}` } : undefined}>
                    {r.chip}
                  </Chip>
                </div>
              );
            })}
          </div>
        </UiCard>
      </ClipReveal>
    </TmvLayout>
  );
};
