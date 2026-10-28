import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_FAMILY, MONO, SERIF, SERIF_EN } from "../lib/fonts";
import { clamp } from "../lib/motion";
import { C } from "../lib/theme";
import { BlurIn, Camera, Float3D, Hud, K, NightStage, timecode, Words } from "./Cinema";
import { DrawIcon } from "./Icons";
import { SCENE_FROM } from "./timeline";

// 릴스·쇼츠 UI가 덮는 영역을 피한 안전 구역(1080×1920 기준)
export const SAFE = { top: 200, bottom: 1540, side: 64 } as const;

export const HIGHLIGHTS = [
  { n: "01", id: "eval", en: "Lesson Evaluation", icon: "analyze" },
  { n: "02", id: "grade", en: "Homework Grading", icon: "grade" },
  { n: "03", id: "caption", en: "Live Translation", icon: "translate" },
] as const;

export const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

export const serif = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: SERIF,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.03em",
  ...extra,
});

export const mono = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "0.04em",
  fontVariantNumeric: "tabular-nums",
  ...extra,
});

// 하이라이트 씬 공통 — 어두운 스튜디오, 카메라 풀백, 세리프 타이틀, 배경의 거대 타이포, 3D 카드
export const CineFeature: React.FC<{
  index: number;
  lineA: string;
  lineB: string;
  sub: string;
  titleAt: number; // 로컬 프레임
  cardAt: number;
  sheenAt?: number;
  backdrop?: React.ReactNode;
  beamX?: number;
  rest?: { rx: number; ry: number };
  children: React.ReactNode;
}> = ({ index, lineA, lineB, sub, titleAt, cardAt, sheenAt, backdrop, beamX = 72, rest, children }) => {
  const frame = useCurrentFrame();
  const h = HIGHLIGHTS[index];
  const global = SCENE_FROM[h.id] + frame;
  const hudIn = interpolate(frame - titleAt + 10, [0, 10], [0, 1], clamp);
  return (
    <NightStage beamX={beamX} seed={h.id}>
      <Camera
        keys={[
          { f: 0, s: 1.16, y: 70 },
          { f: titleAt + 34, s: 1.0, y: 0 },
          { f: titleAt + 160, s: 1.04, y: -10 },
        ]}
        origin="50% 30%"
      >
        {backdrop}
        <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: SAFE.top + 86 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: SERIF_EN, fontStyle: "italic", fontSize: 50, color: C.lime, lineHeight: 1, letterSpacing: "-0.01em" }}>
            <DrawIcon kind={h.icon} delay={titleAt - 8} size={64} color={K.paper} accent={C.lime} bg={K.night3} stroke={2.6} />
            <BlurIn delay={titleAt - 4} track={[0.2, 0]}>
              {h.en}
            </BlurIn>
          </div>
          <div style={{ marginTop: 26, ...serif(122, 500, K.paper, { lineHeight: 1.12, wordBreak: "keep-all" }) }}>
            <BlurIn delay={titleAt} duration={22}>
              {lineA}
            </BlurIn>
            <br />
            <BlurIn delay={titleAt + 6} duration={22} style={{ color: C.lime, fontWeight: 700 }}>
              {lineB}
            </BlurIn>
          </div>
          <div style={{ marginTop: 26, ...t(34, 500, K.paperDim, { letterSpacing: "-0.015em" }) }}>
            <Words text={sub} delay={titleAt + 14} stagger={2} duration={16} track={[0.04, -0.015]} />
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.side - 4, right: SAFE.side - 4, top: 812, display: "flex", justifyContent: "center" }}>
          <Float3D delay={cardAt} sheenAt={sheenAt} rest={rest}>
            {children}
          </Float3D>
        </div>
      </Camera>
      <Hud
        top={SAFE.top}
        side={SAFE.side}
        opacity={hudIn}
        left={
          <>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#FF5A4E", opacity: frame % 30 < 18 ? 1 : 0.25 }} />
            <span>SC.{h.n} / 03</span>
          </>
        }
        right={<span>{timecode(global)}</span>}
      />
    </NightStage>
  );
};

// 카드 셸 — 어두운 무대 위에서 빛을 받는 종이 카드(연두 림 라이트)
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; padding?: number; width?: number }> = ({ children, style, padding = 40, width = 952 }) => (
  <div
    style={{
      width,
      background: "#FBFAF5",
      borderRadius: 44,
      boxShadow: `0 0 0 1.5px ${K.rim}, 0 70px 140px rgba(0,0,0,0.55), 0 0 110px rgba(200,240,90,0.16)`,
      padding,
      boxSizing: "border-box",
      position: "relative",
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardTop: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 22, borderBottom: `1.5px solid ${C.hairline}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: 999, background: i === 0 ? C.lime : C.ivory2 }} />
        ))}
      </div>
      <span style={t(32, 800, C.ink)}>{title}</span>
    </div>
    {right}
  </div>
);

export const ExampleTag: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <span style={mono(19, 600, dark ? K.paperDim : C.gray, { background: dark ? "rgba(255,255,255,0.1)" : C.ivory2, borderRadius: 8, padding: "6px 12px", letterSpacing: "0.08em" })}>예시 화면</span>
);

// 배경의 거대 이탤릭 세리프 — 초점 밖에서 들어와 천천히 흐른다(스케일 대비용)
export const GiantType: React.FC<{ text: string; at: number; size?: number; top: number; left?: number; color?: string; opacity?: number }> = ({ text, at, size = 760, top, left = -40, color = C.lime, opacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 24], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: left - Math.max(0, frame - at) * 0.6,
        fontFamily: SERIF_EN,
        fontStyle: "italic",
        fontSize: size,
        lineHeight: 0.8,
        whiteSpace: "nowrap",
        color,
        opacity: opacity * p,
        filter: `blur(${(1 - p) * 30 + 1.5}px)`,
        transform: `scale(${1.15 - p * 0.15})`,
        transformOrigin: "0 50%",
        pointerEvents: "none",
        letterSpacing: "-0.04em",
      }}
    >
      {text}
    </div>
  );
};
