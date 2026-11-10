import React, { useLayoutEffect, useRef, useState } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { POP, SETTLE, pop, useBoil } from "./Ink";
import { roughEllipse, rs, scribble, spline } from "./sketch";
import { GAEGU, JUA, P } from "./theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 손글씨 텍스트 — 글자마다 살짝 다른 기울기로 톡톡 찍히고, 가만히 있을 때도 미세하게 끓는다 */
export const Hand: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  font?: string;
  color?: string;
  weight?: number;
  seed?: string;
  wobble?: number;
  style?: React.CSSProperties;
  spacing?: string;
}> = ({ text, delay = 0, stagger = 1.6, size, font = JUA, color = P.ink, weight = 400, seed = "h", wobble = 1, style, spacing = "-0.02em" }) => {
  const frame = useCurrentFrame();
  const boil = useBoil(5, 3);
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing: spacing, lineHeight: 1.15, ...style }}>
      {Array.from(text).map((ch, i) => {
        const f = frame - delay - i * stagger;
        const s = pop(f, POP);
        const o = interpolate(f, [0, 2], [0, 1], CLAMP);
        const rest = rs(`${seed}r${i}`) * 2.6 * wobble + rs(`${seed}b${i}:${boil}`) * 0.7 * wobble;
        const ry = rs(`${seed}y${i}`) * size * 0.03 * wobble + rs(`${seed}by${i}:${boil}`) * 0.8 * wobble;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${(1 - s) * size * 0.4 + ry}px) rotate(${rest + (1 - s) * rs(`${seed}in${i}`) * 16}deg) scale(${0.35 + 0.65 * s})`,
              transformOrigin: "50% 85%",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** 메모용 작은 손글씨(Gaegu) — 한 덩어리로 스르륵 올라온다 */
export const Note: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  rotate?: number;
  style?: React.CSSProperties;
  font?: string;
}> = ({ children, delay = 0, size = 34, color = P.ink2, weight = 700, rotate = 0, style, font = GAEGU }) => {
  const frame = useCurrentFrame();
  const s = pop(frame - delay, SETTLE);
  const o = interpolate(frame - delay, [0, 5], [0, 1], CLAMP);
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: "-0.04em",
        wordSpacing: "-0.12em",
        lineHeight: 1.25,
        opacity: o,
        transform: `translateY(${(1 - s) * 16}px) rotate(${rotate}deg)`,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 실제 글자 크기를 재서 그 위에 px 단위로 낙서를 올린다(늘어난 SVG는 선 굵기가 뭉개지므로) */
const useSize = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
  });
  return [ref, size] as const;
};

/** 형광 마커 — 글자 뒤로 연두 마커가 지그재그로 지나간다 */
export const Mark: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; color?: string; seed?: string; style?: React.CSSProperties; opacity?: number }> = ({
  children,
  delay = 0,
  duration = 12,
  color = P.lime,
  seed = "mk",
  style,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const boil = useBoil(6, 3);
  const [ref, size] = useSize();
  const p = interpolate(frame - delay, [0, duration], [0, 1], CLAMP);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block", ...style }}>
      {size && p > 0.001 && (
        <svg width={size.w} height={size.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", zIndex: 0 }}>
          <path
            d={scribble(size.h * 0.08 + size.w * 0.04, size.h * 0.4, size.w * 0.92 - size.h * 0.16, size.h * 0.36, `${seed}:${boil}`, { gap: size.h * 0.2, angle: -1.2, rough: 0.9, over: 0 })}
            fill="none"
            stroke={color}
            strokeWidth={size.h * 0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
            pathLength={p < 0.999 ? 1 : undefined}
            strokeDasharray={p < 0.999 ? "1 1" : undefined}
            strokeDashoffset={p < 0.999 ? 1 - p : undefined}
          />
        </svg>
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

/** 손으로 그은 밑줄 */
export const Under: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; color?: string; seed?: string; w?: number; double?: boolean }> = ({
  children,
  delay = 0,
  duration = 10,
  color = P.limeDeep,
  seed = "ul",
  w = 7,
  double = false,
}) => {
  const frame = useCurrentFrame();
  const boil = useBoil(5, 3);
  const [ref, size] = useSize();
  const p = interpolate(frame - delay, [0, duration], [0, 1], CLAMP);
  const line = (k: string, y: number, W: number) =>
    spline(
      [
        [-4, y + rs(`${seed}${k}a:${boil}`) * 3],
        [W * 0.33, y - 5 + rs(`${seed}${k}b:${boil}`) * 3],
        [W * 0.68, y + 3 + rs(`${seed}${k}c:${boil}`) * 3],
        [W + 4, y - 3 + rs(`${seed}${k}d:${boil}`) * 3],
      ],
      false,
    );
  const p1 = Math.min(1, p * (double ? 1.7 : 1));
  const p2 = Math.max(0, Math.min(1, (p - 0.45) * 1.9));
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      {size && p > 0.001 && (
        <svg width={size.w} height={size.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={line("1", size.h * 0.98, size.w)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p1} />
          {double && p2 > 0.001 && <path d={line("2", size.h * 0.98 + w * 1.9, size.w)} fill="none" stroke={color} strokeWidth={w * 0.8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p2} />}
        </svg>
      )}
    </span>
  );
};

/** 손으로 돌린 동그라미로 단어를 감싼다 */
export const Circled: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; color?: string; seed?: string; w?: number; padX?: number; padY?: number }> = ({
  children,
  delay = 0,
  duration = 12,
  color = P.limeDeep,
  seed = "cir",
  w = 6,
  padX = 0.16,
  padY = 0.08,
}) => {
  const frame = useCurrentFrame();
  const boil = useBoil(5, 3);
  const [ref, size] = useSize();
  const p = interpolate(frame - delay, [0, duration], [0, 1], CLAMP);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {size && p > 0.001 && (
        <svg width={size.w} height={size.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path
            d={roughEllipse(size.w / 2, size.h * 0.52, size.w / 2 + size.h * padX, size.h * (0.5 + padY), `${seed}:${boil}`, { overlap: 0.16, rough: 1.4, n: 14 })}
            fill="none"
            stroke={color}
            strokeWidth={w}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
          />
        </svg>
      )}
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
