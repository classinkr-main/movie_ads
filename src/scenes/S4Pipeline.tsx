import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkStage } from "../components/Backgrounds";
import { MaskText } from "../components/Kinetic";
import { Chip, Eyebrow, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const FLY = ["발화", "상호작용", "분위기", "언어"];

const IconRec: React.FC<{ size: number; frame: number }> = ({ size, frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="19" stroke={C.mint} strokeWidth="2.5" opacity={0.9} />
      <circle cx="24" cy="24" r={9 + pulse * 2} fill={C.mint} />
      <circle cx="24" cy="24" r={13 + pulse * 6} stroke={C.mint} strokeWidth="1.5" opacity={0.5 - pulse * 0.4} />
    </svg>
  );
};

const IconSpark: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${frame * 1.2}deg)` }}>
    <path d="M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z" fill={C.mint} />
    <circle cx="24" cy="24" r="21" stroke={C.mint} strokeWidth="1.5" strokeDasharray="6 8" opacity={0.6} />
  </svg>
);

const IconReport: React.FC<{ size: number; frame: number; start: number }> = ({ size, frame, start }) => {
  const lines = [0, 1, 2, 3];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M11 6h18l10 10v26a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke={C.mint} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M29 6v10h10" stroke={C.mint} strokeWidth="2.5" strokeLinejoin="round" />
      {lines.map((l) => {
        const w = interpolate(frame, [start + l * 4, start + l * 4 + 8], [0, [18, 14, 20, 10][l]], clamp);
        return <line key={l} x1="16" y1={24 + l * 5.5} x2={16 + w} y2={24 + l * 5.5} stroke={C.mint} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
};

// S4 — 파이프라인: 실시간 수업 녹화 → AI 분석 → 강의 리포트
export const S4Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait, width, height } = useLayout();

  const cardW = (isPortrait ? 760 : 440) * u;
  const cardH = (isPortrait ? 250 : 330) * u;
  const gap = (isPortrait ? 110 : 150) * u;
  const n = 3;
  const totalMain = n * (isPortrait ? cardH : cardW) + (n - 1) * gap;
  const originMain = isPortrait ? (height - totalMain) / 2 + 160 * u : (width - totalMain) / 2;
  const crossCenter = isPortrait ? width / 2 : height / 2 + 70 * u;

  const centers = Array.from({ length: n }).map((_, i) => {
    const main = originMain + i * ((isPortrait ? cardH : cardW) + gap) + (isPortrait ? cardH : cardW) / 2;
    return isPortrait ? { x: crossCenter, y: main } : { x: main, y: crossCenter };
  });

  const nodes = [
    { title: "실시간 수업 녹화", sub: "화면 · 음성 · 판서", icon: <IconRec size={96 * u} frame={frame} /> },
    { title: "AI 분석", sub: "발화 · 상호작용 · 분위기 · 언어", icon: <IconSpark size={96 * u} frame={frame} /> },
    { title: "강의 리포트", sub: "점수 · 주요 이슈 · 개선 포인트", icon: <IconReport size={96 * u} frame={frame} start={44} /> },
  ];

  const connector = (i: number) => {
    const a = centers[i];
    const b = centers[i + 1];
    const start = 14 + i * 20;
    const grow = sp(frame - start, fps, SMOOTH, 14);
    const half = (isPortrait ? cardH : cardW) / 2;
    const len = gap - 24 * u;
    const dotT = ((frame - start) / 22) % 1;
    const dotVisible = frame > start + 6;
    const style: React.CSSProperties = isPortrait
      ? { left: a.x, top: a.y + half + 12 * u, width: 4 * u, height: len * grow, transform: "translateX(-50%)" }
      : { left: a.x + half + 12 * u, top: a.y, height: 4 * u, width: len * grow, transform: "translateY(-50%)" };
    const dotStyle: React.CSSProperties = isPortrait
      ? { left: a.x, top: a.y + half + 12 * u + len * dotT, transform: "translate(-50%,-50%)" }
      : { left: a.x + half + 12 * u + len * dotT, top: a.y, transform: "translate(-50%,-50%)" };
    void b;
    return (
      <React.Fragment key={i}>
        <div style={{ position: "absolute", background: "rgba(255,255,255,0.35)", borderRadius: 999, ...style }} />
        {dotVisible && grow > 0.9 && (
          <div style={{ position: "absolute", width: 14 * u, height: 14 * u, borderRadius: 999, background: C.mint, boxShadow: `0 0 ${18 * u}px ${C.mint}`, ...dotStyle }} />
        )}
      </React.Fragment>
    );
  };

  return (
    <DarkStage>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: (isPortrait ? 200 : 96) * u }}>
        <Rise delay={0} distance={20}>
          <Eyebrow size={24 * u}>How it works</Eyebrow>
        </Rise>
        <div style={{ marginTop: 16 * u, fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 64 : 84) * u, fontWeight: 800, color: C.page, letterSpacing: "-0.04em", lineHeight: 1.2, textAlign: "center", padding: `0 ${60 * u}px` }}>
          <MaskText delay={3}>
            <span>녹화가 끝나면, 리포트가 쌓입니다</span>
          </MaskText>
        </div>
      </AbsoluteFill>

      {/* 커넥터 */}
      {connector(0)}
      {connector(1)}

      {/* 노드 카드 */}
      {nodes.map((nd, i) => {
        const c = centers[i];
        return (
          <div key={nd.title} style={{ position: "absolute", left: c.x - cardW / 2, top: c.y - cardH / 2, width: cardW, height: cardH }}>
            <Pop delay={6 + i * 10} from={0.6} y={50}>
              <div
                style={{
                  width: cardW,
                  height: cardH,
                  borderRadius: 34 * u,
                  background: "rgba(255,255,255,0.065)",
                  border: `1.5px solid rgba(255,255,255,0.18)`,
                  boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.3)`,
                  display: "flex",
                  flexDirection: isPortrait ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isPortrait ? 36 * u : 22 * u,
                  padding: 32 * u,
                  position: "relative",
                }}
              >
                {nd.icon}
                <div style={{ textAlign: isPortrait ? "left" : "center" }}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 40 * u, fontWeight: 700, color: C.page, letterSpacing: "-0.03em" }}>{nd.title}</div>
                  <div style={{ marginTop: 8 * u, fontFamily: FONT_FAMILY, fontSize: 24 * u, fontWeight: 500, color: C.surface100, opacity: 0.75 }}>{nd.sub}</div>
                </div>
                {i === 2 && (
                  <div style={{ position: "absolute", top: -22 * u, right: -22 * u }}>
                    <Pop delay={60} from={0.2} config={PUNCH}>
                      <div style={{ fontFamily: FONT_FAMILY, fontSize: 40 * u, fontWeight: 900, color: C.page, background: C.brand, borderRadius: 999, padding: `${10 * u}px ${26 * u}px`, boxShadow: `0 ${12 * u}px ${40 * u}px rgba(0,0,0,0.35)` }}>
                        88
                      </div>
                    </Pop>
                  </div>
                )}
              </div>
            </Pop>
          </div>
        );
      })}

      {/* 녹화 → 분석으로 날아가는 분석 축 칩 */}
      {FLY.map((label, i) => {
        const start = 24 + i * 5;
        const t = interpolate(frame, [start, start + 16], [0, 1], clamp);
        if (frame < start || frame > start + 16) return null;
        const a = centers[0];
        const b = centers[1];
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * (isPortrait ? 0 : 140 * u) + (isPortrait ? 0 : -cardH * 0.1);
        const sx = isPortrait ? x + Math.sin(Math.PI * t) * 260 * u : x;
        const scale = 0.7 + 0.5 * Math.sin(Math.PI * t);
        const opacity = interpolate(t, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);
        return (
          <div key={label} style={{ position: "absolute", left: sx, top: y, transform: `translate(-50%,-50%) scale(${scale})`, opacity }}>
            <Chip size={24 * u} bg={C.page} color={C.forest}>
              {label}
            </Chip>
          </div>
        );
      })}

      {/* 리포트 확인 위치 */}
      <div style={{ position: "absolute", bottom: (isPortrait ? 200 : 86) * u, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 * u, flexWrap: "wrap", padding: `0 ${60 * u}px` }}>
        <Chip delay={50} size={24 * u} outline color={C.mint}>
          관리자 대시보드 → 교사 개발
        </Chip>
        <Chip delay={55} size={24 * u} outline color={C.mint}>
          클래스인 앱 → 수업 다시보기
        </Chip>
      </div>
    </DarkStage>
  );
};
