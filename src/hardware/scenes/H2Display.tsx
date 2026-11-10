import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BottomShade, ChapterTag, Fade, Fingerprint, Lines, Plate, Screen, Spec, t, Vignette } from "../Cine";
import { clamp, SMOOTH, sp } from "../../shared/motion";
import { H } from "../hwTheme";
import type { Pt } from "../homography";

// 벽걸이 보드(1408×768) 화면 사변형
const QUAD: [Pt, Pt, Pt, Pt] = [
  [345, 120],
  [1085, 170],
  [1085, 598],
  [345, 632],
];
const AG_AT = 84; // AG 코팅 라벨 — 반사가 사라지는 순간
const FP_AT = 112; // 지문이 찍히기 시작
const AF_AT = 156; // AF 마감 라벨 — 지문이 지워지는 순간
const PRINTS = [
  { x: 420, y: 300, r: -20, s: 150 },
  { x: 760, y: 180, r: 15, s: 130 },
  { x: 1060, y: 420, r: -8, s: 160 },
  { x: 600, y: 560, r: 30, s: 120 },
  { x: 1280, y: 240, r: -25, s: 140 },
  { x: 900, y: 640, r: 10, s: 135 },
];

// 02 — 디스플레이: 형광등 반사가 지나가다 AG 코팅과 함께 사라지고, 지문이 찍혔다가 AF 마감과 함께 닦인다.
export const H2Display: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glareOff = interpolate(frame, [AG_AT, AG_AT + 14], [1, 0], clamp);
  const glareX = interpolate(frame, [0, AG_AT + 14], [-300, 1500], clamp);
  const wipe = sp(frame - AF_AT, fps, SMOOTH, 26); // 0→1 왼쪽에서 닦임
  const wipeX = wipe * 1750;

  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <Plate src="hw/display-wall.jpg" w={1408} h={768} zoom={[1.0, 1.06]} focus={[0.5, 0.45]} offset={[300, -70]} over={230} grade="contrast(1.06) saturate(0.95)">
        <Screen quad={QUAD}>
          <Img src={staticFile("hw/ui-board-class.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, objectFit: "cover" }} />
          {/* 형광등 반사 — 길쭉한 흰 띠 두 개가 사선으로 지나간다 */}
          <div style={{ position: "absolute", inset: 0, opacity: glareOff, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: glareX, top: -200, width: 420, height: 1400, transform: "rotate(22deg)", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.62) 48%, rgba(255,255,255,0) 100%)", filter: "blur(26px)" }} />
            <div style={{ position: "absolute", left: glareX + 520, top: -200, width: 180, height: 1400, transform: "rotate(22deg)", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)", filter: "blur(18px)" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.12)" }} />
          </div>
          {/* 지문 */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${wipeX}px)` }}>
            {PRINTS.map((p, i) => {
              const o = interpolate(frame - FP_AT - i * 5, [0, 4], [0, 0.6], clamp);
              return <Fingerprint key={i} size={p.s} rotate={p.r} opacity={o} style={{ left: p.x, top: p.y }} />;
            })}
          </div>
          {/* 닦이는 경계의 하이라이트 */}
          {wipe > 0.01 && wipe < 0.99 && <div style={{ position: "absolute", top: 0, bottom: 0, left: wipeX - 40, width: 80, background: "linear-gradient(90deg, rgba(110,231,183,0) 0%, rgba(110,231,183,0.35) 50%, rgba(110,231,183,0) 100%)", filter: "blur(6px)" }} />}
        </Screen>
      </Plate>
      <Vignette strength={0.55} />
      <BottomShade height={560} opacity={0.9} />

      {/* 화면 옆 스펙 라벨 — 왼쪽 빈 벽 */}
      <div style={{ position: "absolute", left: 150, top: 200, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
        <Spec value="AG 코팅" label="빛 반사 억제" delay={AG_AT} />
        <Spec value="AF 마감" label="지문 방지" delay={AF_AT} />
        <Spec value="4K UHD" label="3840×2160" delay={AF_AT + 22} />
        <Spec value="178°" label="광시야각" delay={AF_AT + 30} />
        <Spec value="90%" label="투과율 · 풀 라미네이션" delay={AF_AT + 38} />
      </div>
      {/* 반사·지문 상태 캡션 */}
      <Fade delay={16} out={AG_AT + 6} style={{ position: "absolute", left: 150, top: 120 }}>
        <div style={{ ...t(20, 700, H.dim, { letterSpacing: "0.2em" }) }}>일반 패널 — 형광등 · 창가 빛 반사</div>
      </Fade>
      <Fade delay={FP_AT} out={AF_AT + 4} style={{ position: "absolute", left: 150, top: 120 }}>
        <div style={{ ...t(20, 700, H.dim, { letterSpacing: "0.2em" }) }}>50명이 만지는 화면 — 지문</div>
      </Fade>

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "flex-end", paddingBottom: 120 }}>
        <ChapterTag n="02" en="DISPLAY" delay={10} />
        <Lines lines={["창가 자리든, 맨 뒷자리든."]} delay={20} size={84} style={{ marginTop: 20 }} />
        <Fade delay={42} y={14} style={{ marginTop: 20 }}>
          <div style={t(30, 400, H.muted, { maxWidth: 1080, lineHeight: 1.5, wordBreak: "keep-all" })}>
            빛 반사를 억제하는 AG 코팅, 지문이 남지 않는 AF 마감. <span style={{ color: H.text, fontWeight: 600 }}>어느 자리에서도 판서가 선명합니다.</span>
          </div>
        </Fade>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
