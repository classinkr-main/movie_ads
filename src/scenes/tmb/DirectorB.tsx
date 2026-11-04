import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeaderDark, ChipDark, GlassDark, Reveal, td } from "../../components/Dark";
import { ClipReveal, RollingNumber } from "../../components/Flourish";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { D } from "../../lib/themeDark";
import { TmbLayout } from "./TmbLayout";

// 02 — 원장은 편해집니다: 이번 주 전 수업 확인 · 면담 준비 2시간 → 10분 · 우리 학원 기준(프리셋) · 이번 주 알림. (수치는 예시)
const PRESETS = [
  { name: "입시 수학", w: [35, 15, 20, 30] },
  { name: "초등 영어", w: [20, 30, 35, 15] },
];
const AREAS = ["수업 전달", "수업 분위기", "수업 상호작용", "언어 표현"];
const SWITCH_AT = 112;

export const DirectorB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mix = sp(frame - SWITCH_AT, fps, SMOOTH, 22);
  const weights = PRESETS[0].w.map((a, i) => a + (PRESETS[1].w[i] - a) * mix);
  const strike = sp(frame - 54, fps, SMOOTH, 16);

  return (
    <TmbLayout
      step={1}
      title={
        <>
          원장은,
          <br />
          편해집니다
        </>
      }
      sub={
        <>
          참관하지 않아도 모든 수업이 보이고, 면담 준비는 리포트 한 장이면 됩니다. <span style={{ color: D.ink, fontWeight: 700 }}>평가 기준은 우리 학원이 정합니다.</span>
        </>
      }
      bullets={["전 수업 리포트", "면담 준비 10분", "우리 학원 기준"]}
    >
      <ClipReveal delay={7} radius={32} duration={26}>
        <GlassDark width={930} padding={28}>
          <CardHeaderDark
            title="원장 대시보드 · 이번 주"
            right={
              <ChipDark delay={16} tone="mute" size={14}>
                10.27 – 10.31
              </ChipDark>
            }
          />

          {/* 핵심 지표 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 18 }}>
            <Reveal delay={22} distance={16}>
              <div style={{ background: D.glass, border: `1px solid ${D.line}`, borderRadius: 18, padding: "16px 18px", height: 118, boxSizing: "border-box" }}>
                <div style={td(13, 700, D.faint, { letterSpacing: "0.1em" })}>확인한 수업</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                  <RollingNumber to={36} delay={28} duration={40} size={44} color={D.lime} />
                  <span style={td(20, 700, D.mute)}>/ 36회</span>
                </div>
                <div style={{ ...td(14, 600, D.mute), marginTop: 4 }}>참관 0회, 리포트로 전부</div>
              </div>
            </Reveal>
            <Reveal delay={30} distance={16}>
              <div style={{ background: D.glass, border: `1px solid ${D.line}`, borderRadius: 18, padding: "16px 18px", height: 118, boxSizing: "border-box" }}>
                <div style={td(13, 700, D.faint, { letterSpacing: "0.1em" })}>면담 준비 시간</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                  <span style={{ position: "relative", ...td(30, 800, D.faint) }}>
                    2시간
                    <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${strike * 100}%`, background: D.lime, borderRadius: 2 }} />
                  </span>
                  <span style={{ ...td(22, 700, D.mute), opacity: strike }}>→</span>
                  <span style={{ ...td(44, 900, D.lime), letterSpacing: "-0.04em", opacity: strike, transform: `translateY(${(1 - strike) * 10}px)`, display: "inline-block" }}>10분</span>
                </div>
                <div style={{ ...td(14, 600, D.mute), marginTop: 4 }}>리포트 한 장으로 준비</div>
              </div>
            </Reveal>
            <Reveal delay={38} distance={16}>
              <div style={{ background: D.glass, border: `1px solid ${D.line}`, borderRadius: 18, padding: "16px 18px", height: 118, boxSizing: "border-box" }}>
                <div style={td(13, 700, D.faint, { letterSpacing: "0.1em" })}>이번 주 할 일</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                  <span style={{ ...td(44, 900, D.ink), letterSpacing: "-0.04em" }}>3</span>
                  <span style={td(18, 700, D.mute)}>건</span>
                </div>
                <div style={{ ...td(14, 600, D.mute), marginTop: 4 }}>면담 1 · 칭찬 2</div>
              </div>
            </Reveal>
          </div>

          {/* 우리 학원 기준 */}
          <Reveal delay={48} distance={16} style={{ marginTop: 14 }}>
            <div style={{ background: D.glass, border: `1px solid ${D.line}`, borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={td(13, 700, D.faint, { letterSpacing: "0.1em" })}>우리 학원 기준 · 영역 가중치</div>
                  <div style={{ ...td(17, 800, D.ink), marginTop: 3 }}>같은 11개 항목, 비중은 우리 학원이 정합니다</div>
                </div>
                <div style={{ position: "relative", display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: 999, padding: 4, border: `1px solid ${D.line}` }}>
                  <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)", borderRadius: 999, background: D.lime, transform: `translateX(${mix * 100}%)` }} />
                  {PRESETS.map((p, i) => (
                    <span key={p.name} style={{ position: "relative", ...td(14, 800, i === 0 ? (mix < 0.5 ? "#0A1A14" : D.mute) : mix >= 0.5 ? "#0A1A14" : D.mute), padding: "5px 16px" }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
                {AREAS.map((a, i) => {
                  const grow = sp(frame - (60 + i * 5), fps, SMOOTH, 24);
                  return (
                    <div key={a}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={td(14, 700, D.mute)}>{a}</span>
                        <span style={td(17, 800, D.lime, { fontVariantNumeric: "tabular-nums" })}>{Math.round(weights[i] * grow)}%</span>
                      </div>
                      <div style={{ marginTop: 6, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(weights[i] / 40) * 100 * grow}%`, background: `linear-gradient(90deg, ${D.limeDeep}, ${D.lime})`, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* 이번 주 알림 */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { d: 80, mark: "▲", tone: D.lime, who: "김하늘 선생님", text: "4주 연속 상승 — 칭찬 포인트가 생겼어요", chip: "칭찬" },
              { d: 90, mark: "●", tone: D.ink, who: "정유진 선생님", text: "상호작용 하락 추세 — 강점 먼저, 개선점 하나로 면담 준비됨", chip: "면담 추천" },
            ].map((r) => {
              const s = sp(frame - r.d, fps, SMOOTH, 18);
              return (
                <div key={r.who} style={{ display: "flex", alignItems: "center", gap: 12, background: D.glass, border: `1px solid ${D.line}`, borderRadius: 14, padding: "10px 14px", opacity: interpolate(frame - r.d, [0, 6], [0, 1], clamp), transform: `translateX(${(1 - s) * 24}px)` }}>
                  <span style={{ ...td(14, 900, r.tone), width: 16 }}>{r.mark}</span>
                  <span style={{ ...td(16, 800, D.ink), whiteSpace: "nowrap" }}>{r.who}</span>
                  <span style={{ ...td(15, 500, D.mute), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{r.text}</span>
                  <ChipDark delay={r.d + 6} tone={r.chip === "칭찬" ? "solid" : "ghost"} size={12}>
                    {r.chip}
                  </ChipDark>
                </div>
              );
            })}
          </div>
        </GlassDark>
      </ClipReveal>
    </TmbLayout>
  );
};
