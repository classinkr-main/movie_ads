import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

// 형광펜 스트로크 — 글자 뒤에서 왼쪽→오른쪽으로 칠해진다.
export const Highlighter: React.FC<{
  delay?: number;
  children: React.ReactNode;
  color?: string;
  duration?: number;
  inset?: number; // 글자 높이 대비 밴드 여유(%)
  style?: React.CSSProperties;
}> = ({ delay = 0, children, color = C.lime, duration = 14, inset = 18, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - delay, fps, SMOOTH, duration);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: "-3%", top: `${inset * 0.4}%`, width: "106%", height: `${100 - inset * 0.6}%`, zIndex: 0 }}
      >
        <path
          d="M2,58 C 20,50 40,66 60,56 S 90,50 98,58"
          stroke={color}
          strokeWidth={62}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray="1 2"
          strokeDashoffset={1 - p}
          opacity={p < 0.02 ? 0 : 0.95}
        />
      </svg>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

// 손그림 타원 — 단어를 둥글게 감싼다.
export const SketchCircle: React.FC<{ delay?: number; children: React.ReactNode; color?: string; duration?: number; stroke?: number }> = ({
  delay = 0,
  children,
  color = C.limeDeep,
  duration = 16,
  stroke = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - delay, fps, SMOOTH, duration);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: "-10%", top: "-18%", width: "120%", height: "136%", overflow: "visible" }}>
        <path
          d="M50,8 C 86,6 98,30 96,52 C 94,80 70,94 44,93 C 14,92 2,70 4,48 C 6,24 26,10 56,10 C 70,10 82,14 90,22"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// 글자 단위 스태거 — 회전·블러·튀어오름
export const Chars: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  rotate?: number;
  rise?: number;
  config?: { damping: number; stiffness: number; mass: number };
}> = ({ text, delay = 0, stagger = 2, style, rotate = 10, rise = 60, config = PUNCH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {Array.from(text).map((ch, i) => {
        const f = frame - delay - i * stagger;
        const s = sp(f, fps, config);
        const o = interpolate(f, [0, 4], [0, 1], clamp);
        const b = interpolate(f, [0, 6], [8, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px) rotate(${interpolate(s, [0, 1], [rotate, 0])}deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
              transformOrigin: "50% 100%",
              filter: b > 0.3 ? `blur(${b}px)` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// 롤링 숫자(오도미터)
export const Odometer: React.FC<{
  value: number; // 현재 표시값(정수)
  digits?: number;
  size: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ value, digits, size, color = C.ink, weight = 900, style }) => {
  const str = String(Math.max(0, Math.round(value))).padStart(digits ?? 1, "0");
  const lh = 1.05;
  return (
    <span style={{ display: "inline-flex", fontFamily: FONT_FAMILY, fontSize: size, fontWeight: weight, color, lineHeight: lh, letterSpacing: "-0.05em", ...style }}>
      {str.split("").map((d, i) => {
        const n = Number(d);
        // 이전 값과의 차이만큼 굴러가게: value의 소수부를 써서 부드럽게 보간
        return (
          <span key={i} style={{ display: "inline-block", height: size * lh, overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ display: "block", transform: `translateY(${-n * size * lh}px)`, transition: "none" }}>
              {Array.from({ length: 10 }).map((_, k) => (
                <span key={k} style={{ display: "block", height: size * lh }}>
                  {k}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// 부드러운 오도미터 — 스프링 진행값(0~1)으로 from→to 사이를 굴린다.
export const RollingNumber: React.FC<{ from?: number; to: number; delay?: number; duration?: number; size: number; color?: string; weight?: number; digits?: number; style?: React.CSSProperties }> = ({
  from = 0,
  to,
  delay = 0,
  duration = 40,
  size,
  color = C.ink,
  weight = 900,
  digits,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - delay, fps, SMOOTH, duration);
  const v = from + (to - from) * p;
  const str = String(Math.floor(v)).padStart(digits ?? 1, "0");
  const frac = v - Math.floor(v);
  const lh = 1.05;
  return (
    <span style={{ display: "inline-flex", fontFamily: FONT_FAMILY, fontSize: size, fontWeight: weight, color, lineHeight: lh, letterSpacing: "-0.05em", ...style }}>
      {str.split("").map((d, i) => {
        const isLast = i === str.length - 1;
        const n = Number(d) + (isLast ? frac : 0);
        return (
          <span key={i} style={{ display: "inline-block", height: size * lh, overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ display: "block", transform: `translateY(${-n * size * lh}px)` }}>
              {Array.from({ length: 11 }).map((_, k) => (
                <span key={k} style={{ display: "block", height: size * lh }}>
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// 방사형 버스트 — 리빌 순간 퍼지는 선들
export const Burst: React.FC<{ delay?: number; color?: string; size: number; lines?: number; duration?: number; style?: React.CSSProperties }> = ({
  delay = 0,
  color = C.limeDeep,
  size,
  lines = 14,
  duration = 18,
  style,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  if (f < 0 || f > duration) return null;
  const t = f / duration;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", pointerEvents: "none", ...style }}>
      {Array.from({ length: lines }).map((_, i) => {
        const a = (i / lines) * Math.PI * 2 + random(`b${i}`) * 0.3;
        const r0 = interpolate(t, [0, 1], [8, 46]);
        const r1 = interpolate(t, [0, 1], [14, 48]);
        const len = (1 - t) * (6 + random(`l${i}`) * 8);
        return (
          <line
            key={i}
            x1={Math.cos(a) * r0}
            y1={Math.sin(a) * r0}
            x2={Math.cos(a) * (r1 + len)}
            y2={Math.sin(a) * (r1 + len)}
            stroke={color}
            strokeWidth={1.6 * (1 - t) + 0.4}
            strokeLinecap="round"
            opacity={1 - t}
          />
        );
      })}
    </svg>
  );
};

// 떠다니는 연두 점 — 배경 생동감
export const Dots: React.FC<{ count?: number; color?: string; opacity?: number; speed?: number; seed?: string }> = ({
  count = 18,
  color = C.lime,
  opacity = 0.7,
  speed = 1,
  seed = "d",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`${seed}x${i}`) * width;
        const y0 = random(`${seed}y${i}`) * height;
        const r = 4 + random(`${seed}r${i}`) * 10;
        const y = ((y0 - frame * speed * (0.4 + random(`${seed}v${i}`))) % (height + 60) + height + 60) % (height + 60) - 30;
        const sway = Math.sin(frame / 30 + i) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + sway,
              top: y,
              width: r,
              height: r,
              borderRadius: 999,
              background: color,
              opacity: opacity * (0.4 + 0.6 * random(`${seed}o${i}`)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 유리 카드 — 흰 표면 + 헤어라인 + 부드러운 그림자, 선택적 3D 틸트
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  tilt?: number; // 최대 기울기(deg)
  radius?: number;
  padding?: number;
}> = ({ children, style, tilt = 0, radius = 32, padding = 36 }) => {
  const frame = useCurrentFrame();
  const rx = tilt ? Math.sin(frame / 40) * tilt : 0;
  const ry = tilt ? Math.cos(frame / 55) * tilt : 0;
  return (
    <div
      style={{
        background: C.white,
        border: `1.5px solid ${C.hairline}`,
        borderRadius: radius,
        boxShadow: "0 30px 80px rgba(28,27,23,0.10), 0 2px 6px rgba(28,27,23,0.04)",
        padding,
        transform: tilt ? `perspective(1600px) rotateX(${rx}deg) rotateY(${ry}deg)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 배경용 거대 아웃라인 워드 — 천천히 흐른다
export const GhostWord: React.FC<{ text: string; size: number; speed?: number; color?: string; top?: number | string; opacity?: number }> = ({
  text,
  size,
  speed = 1.2,
  color = C.limeDeep,
  top = "60%",
  opacity = 0.14,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, overflow: "hidden", pointerEvents: "none", opacity }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: size,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          color: "transparent",
          WebkitTextStroke: `2px ${color}`,
          transform: `translateX(${-((frame * speed) % (size * 4))}px)`,
        }}
      >
        {`${text}   ${text}   ${text}   ${text}`}
      </div>
    </div>
  );
};
