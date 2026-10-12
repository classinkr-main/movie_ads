import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { Burst, GlassCard, RollingNumber } from "../components/Flourish";
import { MaskText } from "../components/Kinetic";
import { Chip, Eyebrow, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const TAGS: Array<{ label: string; at: number }> = [
  { label: "발화", at: 24 },
  { label: "상호작용", at: 38 },
  { label: "수업 분위기", at: 52 },
  { label: "언어 표현", at: 66 },
];
const SCAN_START = 14;
const SCAN_END = 76;

// S4 — 분석: 파형을 AI 스캐너가 읽고, 4개 축 태그를 남기며 리포트를 만든다.
export const Analysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardW = 1560;
  const waveW = cardW - 2 * 48;
  const waveH = 190;
  const bars = 80;
  const gap = 6;
  const barW = (waveW - gap * (bars - 1)) / bars;
  const scanT = interpolate(frame, [SCAN_START, SCAN_END], [0, 1], clamp);
  const scanX = scanT * waveW;
  const scanOpacity = interpolate(frame, [SCAN_START - 2, SCAN_START + 4, SCAN_END - 4, SCAN_END + 4], [0, 1, 1, 0], clamp);
  const pct = Math.round(scanT * 100);
  const done = frame >= SCAN_END + 2;
  const reportS = sp(frame - 80, fps, PUNCH);

  return (
    <IvoryStage>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 84 }}>
        <Rise delay={0} distance={16}>
          <Eyebrow size={22}>How it works</Eyebrow>
        </Rise>
        <div style={{ marginTop: 14, fontFamily: FONT_FAMILY, fontSize: 76, fontWeight: 800, color: C.ink, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
          <MaskText delay={3}>
            <span>
              녹화가 끝나면, <span style={{ color: C.forest }}>AI가 수업을 다각도로 읽습니다</span>
            </span>
          </MaskText>
        </div>
      </AbsoluteFill>

      {/* 분석 카드 */}
      <div style={{ position: "absolute", left: (1920 - cardW) / 2, top: 300 }}>
        <Pop delay={6} from={0.92} y={40}>
          <GlassCard padding={48} radius={40} style={{ width: cardW, position: "relative", overflow: "visible" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, background: C.limeDeep, opacity: frame % 20 < 12 ? 1 : 0.3 }} />
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>실시간 수업 녹화 · 60:00</span>
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 600, color: C.gray300 }}>화면 · 음성 · 판서</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {done ? (
                  <Chip delay={SCAN_END + 2} size={22} bg={C.lime} color={C.ink}>
                    ✓ 리포트 생성 완료
                  </Chip>
                ) : (
                  <>
                    <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700, color: C.limeInk, letterSpacing: "0.08em" }}>AI 분석 중</span>
                    <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 900, color: C.forest, fontVariantNumeric: "tabular-nums", width: 86, textAlign: "right" }}>{pct}%</span>
                  </>
                )}
              </div>
            </div>

            {/* 태그 레일 */}
            <div style={{ position: "relative", height: 84, marginTop: 26 }}>
              {TAGS.map((t) => {
                const x = ((t.at - SCAN_START) / (SCAN_END - SCAN_START)) * waveW;
                const lead = sp(frame - t.at, fps, SMOOTH, 12);
                return (
                  <div key={t.label} style={{ position: "absolute", left: Math.min(Math.max(x, 80), waveW - 80), top: 0, transform: "translateX(-50%)" }}>
                    <Chip delay={t.at} size={24} bg={C.lime} color={C.ink} shadow>
                      {t.label}
                    </Chip>
                    <div style={{ position: "absolute", left: "50%", top: "100%", width: 2, height: 36 * lead, background: C.limeDeep }} />
                  </div>
                );
              })}
            </div>

            {/* 파형 */}
            <div style={{ position: "relative", height: waveH, marginTop: 6 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap }}>
                {Array.from({ length: bars }).map((_, i) => {
                  const amp = 0.25 + 0.75 * random(`a${i}`);
                  const wobble = 0.55 + 0.45 * Math.sin(frame * 0.3 + i * 0.5) * Math.cos(frame * 0.12 + i * 0.23);
                  const env = sp(frame - 8 - i * 0.35, fps, SMOOTH, 18);
                  const h = Math.max(env > 0.02 ? 6 : 0, waveH * amp * wobble * env);
                  const bx = i * (barW + gap) + barW / 2;
                  const passed = scanT > 0 && bx <= scanX;
                  return <div key={i} style={{ width: barW, height: h, borderRadius: barW, background: passed ? C.limeDeep : C.ivory2, boxShadow: passed ? "0 0 12px rgba(139,201,38,0.35)" : "none" }} />;
                })}
              </div>
              {/* 스캐너 */}
              <div style={{ position: "absolute", left: scanX, top: -30, width: 3, height: waveH + 60, background: C.forest, boxShadow: `0 0 24px ${C.lime}, 0 0 60px ${C.lime}`, opacity: scanOpacity, transform: "translateX(-50%)" }} />
            </div>

            {/* 진행 바 */}
            <div style={{ marginTop: 28, height: 12, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${scanT * 100}%`, background: `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
            </div>

            {/* 완료 리포트 카드 */}
            <div style={{ position: "absolute", right: -60, bottom: -70, transform: `translateY(${(1 - reportS) * 80}px) rotate(${(1 - reportS) * 12 - 4}deg) scale(${0.6 + 0.4 * reportS})`, opacity: reportS }}>
              <GlassCard padding={26} radius={26} style={{ width: 330, boxShadow: "0 40px 90px rgba(28,27,23,0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: C.ink }}>강의 리포트</div>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 900, color: C.white, background: C.forest, borderRadius: 999, padding: "4px 18px" }}>88</div>
                </div>
                {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
                  <div key={i} style={{ marginTop: 12, height: 10, width: `${w * 100 * Math.min(1, Math.max(0, (frame - 84 - i * 4) / 10))}%`, borderRadius: 999, background: i === 0 ? C.lime : C.ivory2 }} />
                ))}
              </GlassCard>
              <Burst delay={84} size={420} color={C.limeDeep} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            </div>
          </GlassCard>
        </Pop>
      </div>

      <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <Chip delay={86} size={22} outline color={C.limeInk}>
          실시간 수업 녹화에서 자동 생성
        </Chip>
        <Chip delay={90} size={22} outline color={C.limeInk}>
          별도 업로드 · 설정 없음
        </Chip>
      </div>
    </IvoryStage>
  );
};
