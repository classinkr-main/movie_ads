import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { C } from "../lib/theme";
import { HAND, SEG } from "./fonts";
import { PinIcon, clampX, easeIn, easeOut, ramp } from "./fx";

const SHADOW = "0 4px 18px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)";

// 공통 퇴장: to 직전 len 프레임 동안 살짝 작아지며 사라진다
const outro = (frame: number, to: number, len = 6) => interpolate(frame, [to - len, to], [1, 0], { ...clampX, easing: easeIn });

/* ---------- 단어 단위 팝 (스프링 + 블러 인) ---------- */
export const PopWords: React.FC<{
  text: string;
  at: number;
  to: number;
  stagger?: number;
  size: number;
  weight?: number;
  color?: string;
  highlight?: number[]; // 하이라이트할 단어 인덱스
  hlColor?: string;
  hlTextColor?: string;
  letterSpacing?: string;
  style?: React.CSSProperties;
  exit?: "fade" | "glitch" | "none";
  t?: number; // 씬 로컬 프레임 (없으면 컴포지션 프레임)
}> = ({ text, at, to, stagger = 3, size, weight = 900, color = "#fff", highlight = [], hlColor = C.lime, hlTextColor = C.ink, letterSpacing = "-0.045em", style, exit = "fade", t }) => {
  const cf = useCurrentFrame();
  const frame = t ?? cf;
  const { fps } = useVideoConfig();
  if (frame < at - 1 || frame > to + 1) return null;
  const words = text.split(" ");
  const o = exit === "none" ? 1 : outro(frame, to);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.26}px`, opacity: o, transform: `scale(${0.96 + 0.04 * o})`, ...style }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - at - i * stagger, fps, config: { damping: 13, stiffness: 210, mass: 0.7 } });
        const lin = ramp(frame, at + i * stagger, at + i * stagger + 6);
        const hl = highlight.includes(i);
        const hlP = ramp(frame, at + i * stagger + 3, at + i * stagger + 11, 0, 1, easeOut);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", transform: `translateY(${(1 - s) * size * 0.45}px) scale(${0.7 + 0.3 * s})`, opacity: lin, filter: `blur(${(1 - lin) * 10}px)` }}>
            {hl && (
              <span style={{ position: "absolute", left: -size * 0.1, right: -size * 0.1, top: "14%", bottom: "6%", background: hlColor, borderRadius: size * 0.12, transformOrigin: "0 50%", transform: `scaleX(${hlP}) skewX(-6deg)` }} />
            )}
            <span style={{ position: "relative", fontFamily: FONT_FAMILY, fontWeight: weight, fontSize: size, lineHeight: 1.08, letterSpacing, color: hl ? hlTextColor : color, textShadow: hl ? "none" : SHADOW, whiteSpace: "pre" }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/* ---------- 손글씨 캡션 (왼쪽부터 써지는 리빌 + 밑줄 낙서) ---------- */
export const HandWrite: React.FC<{
  text: string;
  at: number;
  to: number;
  x?: number; // 중심 x(px)
  y: number; // 중심 y(px)
  size?: number;
  rotate?: number;
  color?: string;
  dur?: number;
  underline?: boolean;
  shadow?: boolean;
}> = ({ text, at, to, x = 540, y, size = 118, rotate = -4, color = "#fff", dur = 9, underline = true, shadow = true }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > to + 1) return null;
  const reveal = ramp(frame, at, at + dur, 0, 1, easeOut);
  const o = outro(frame, to, 5);
  const pop = 0.9 + 0.1 * ramp(frame, at, at + 7, 0, 1, Easing2);
  const ul = ramp(frame, at + dur - 2, at + dur + 6, 0, 1, easeOut);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${pop})`, opacity: o }}>
      <div style={{ clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% -5%)`, fontFamily: HAND, fontSize: size, color, lineHeight: 1, whiteSpace: "nowrap", WebkitTextStroke: `${(size * 0.022).toFixed(1)}px ${color}`, textShadow: shadow ? "0 4px 18px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.8)" : "none" }}>{text}</div>
      {underline && (
        <svg width="100%" height={size * 0.3} viewBox="0 0 300 30" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: size * 0.92, overflow: "visible" }}>
          <path d="M4 18 C 70 6, 140 26, 210 12 S 290 14, 296 10" fill="none" stroke={C.lime} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
        </svg>
      )}
    </div>
  );
};
const Easing2 = (t: number) => 1 - Math.pow(1 - t, 3);

/* ---------- 위치/맥락 칩 ---------- */
export const Chip: React.FC<{ text: string; at: number; to: number; y?: number; x?: number; icon?: "pin" | "dot" | "none"; size?: number; dark?: boolean }> = ({ text, at, to, y = 292, x = 60, icon = "pin", size = 44, dark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > to + 1) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 240, mass: 0.6 } });
  const o = outro(frame, to, 5) * ramp(frame, at, at + 4);
  const textW = ramp(frame, at + 1, at + 7, 0, 1, easeOut);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - s) * -40}px)`, opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: `${size * 0.36}px ${size * 0.7}px ${size * 0.36}px ${size * 0.5}px`, borderRadius: 999, background: dark ? "rgba(17,17,16,0.72)" : "rgba(255,255,255,0.94)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
        {icon === "pin" && <div style={{ transform: `scale(${s})` }}><PinIcon size={size * 0.78} /></div>}
        {icon === "dot" && <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, background: C.limeDeep, transform: `scale(${s})` }} />}
        <div style={{ clipPath: `inset(0 ${(1 - textW) * 100}% 0 0)`, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: size, letterSpacing: "-0.03em", color: dark ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{text}</div>
      </div>
    </div>
  );
};

/* ---------- 번역 자막 박스 ---------- */
export const Subtitle: React.FC<{ label: string; text: string; at: number; to: number; y: number }> = ({ label, text, at, to, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > to + 1) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 220, mass: 0.6 } });
  const o = outro(frame, to, 5) * ramp(frame, at, at + 4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ padding: "22px 34px 24px", borderRadius: 26, background: "rgba(17,17,16,0.78)", boxShadow: "0 14px 40px rgba(0,0,0,0.35)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 24, letterSpacing: "0.18em", color: C.lime, marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 52, letterSpacing: "-0.03em", color: "#fff", whiteSpace: "nowrap" }}>{text}</div>
      </div>
    </div>
  );
};

/* ---------- 필름 카메라 날짜 각인 ---------- */
export const DateStamp: React.FC<{ date: string; day: string; from: number; to: number }> = ({ date, day, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const o = ramp(frame, from, from + 6) * interpolate(frame, [to - 4, to], [1, 0], clampX);
  const flicker = 0.88 + 0.12 * Math.abs(Math.sin(frame * 1.7));
  return (
    <div style={{ position: "absolute", left: 66, top: 1488, opacity: o * flicker }}>
      <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26, letterSpacing: "0.2em", color: "rgba(255,255,255,0.9)", textShadow: SHADOW, marginBottom: 8 }}>{day}</div>
      <div style={{ fontFamily: SEG, fontWeight: 700, fontSize: 40, letterSpacing: "0.08em", color: "#FFA23A", textShadow: "0 0 10px rgba(255,140,40,0.85), 0 0 2px rgba(255,190,90,0.9)" }}>{date}</div>
    </div>
  );
};

/* ---------- DAY 와이프 밴드 (전환 오버레이) ---------- */
export const DayBand: React.FC<{ cut: number; day: string; date: string; dow: string }> = ({ cut, day, date, dow }) => {
  const frame = useCurrentFrame();
  const t = frame - cut;
  if (t < -8 || t > 12) return null;
  // 대각선 밴드가 오른쪽에서 들어와 컷 순간 화면을 덮고 왼쪽으로 빠진다
  const p = interpolate(t, [-8, 0, 3, 12], [0, 0.5, 0.56, 1], { ...clampX });
  const x = interpolate(p, [0, 1], [130, -130]);
  const textIn = ramp(t, -6, 1, 0, 1, easeOut);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ transform: `translateX(${x}%) skewX(-14deg) scaleX(1.25)`, background: `linear-gradient(90deg, ${C.lime} 0%, ${C.lime} 7%, ${C.forest} 7%, ${C.forest} 93%, ${C.lime} 93%)` }} />
      <AbsoluteFill style={{ transform: `translateX(${x * 0.86}%)`, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: textIn, transform: `scale(${0.9 + 0.1 * textIn})` }}>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 230, lineHeight: 0.9, letterSpacing: "-0.06em", color: "#fff" }}>{day}</div>
          <div style={{ marginTop: 22, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 72, letterSpacing: "0.04em", color: C.lime }}>{date}</div>
          <div style={{ marginTop: 14, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 34, letterSpacing: "0.4em", color: "rgba(255,255,255,0.75)" }}>{dow}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
