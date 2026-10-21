import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { C } from "../lib/theme";
import { SERIF, SERIF_CN } from "./fonts";
import { PlaneIcon, clampX, easeIn, easeInOut, easeOut, ramp } from "./fx";
import map from "./mapdots.json";
import { PopWords } from "./type";

const MAP_TOP = 400;

/* ======================================================================
   ROUTE — 한국 → 광저우 도트 맵 (local 0~60)
   ====================================================================== */
const [SX, SY] = map.seoul as [number, number];
const [GX, GY] = map.guangzhou as [number, number];
const CTRL: [number, number] = [(SX + GX) / 2 + 300, (SY + GY) / 2 - 60];
const bez = (u: number): [number, number] => {
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return [a * SX + b * CTRL[0] + c * GX, a * SY + b * CTRL[1] + c * GY];
};
const bezTan = (u: number) => {
  const dx = 2 * (1 - u) * (CTRL[0] - SX) + 2 * u * (GX - CTRL[0]);
  const dy = 2 * (1 - u) * (CTRL[1] - SY) + 2 * u * (GY - CTRL[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export const RouteMap: React.FC<{ local: number }> = ({ local: t }) => {
  const { fps } = useVideoConfig();
  // 카메라: 서울 클로즈업 → 전체 → 광저우 → 핀 속으로 줌 스루
  const route = interpolate(t, [8, 40], [0, 1], { ...clampX, easing: easeInOut });
  const [px, py] = bez(route);
  const z = interpolate(t, [0, 12, 30, 44, 51, 60], [1.75, 1.18, 1.05, 1.4, 1.65, 9], { ...clampX, easing: easeInOut });
  const focus = interpolate(t, [0, 10, 40, 60], [0, 0.15, 1, 1], { ...clampX, easing: easeInOut });
  const cx = SX + (GX - SX) * focus + (CTRL[0] - (SX + GX) / 2) * 0.35 * Math.sin(Math.PI * focus);
  const cy = SY + (GY - SY) * focus;
  const tx = 540 - cx * z;
  const ty = 560 - cy * z;
  const blur = interpolate(t, [52, 60], [0, 14], clampX);
  const gzPop = spring({ frame: t - 38, fps, config: { damping: 11, stiffness: 200, mass: 0.7 } });
  const seoulPop = spring({ frame: t - 1, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
  const labelIn = ramp(t, 40, 48);
  const headIn = ramp(t, 2, 12);
  const pulse = (start: number, period = 18) => {
    const k = ((t - start) % period) / period;
    return t < start ? 0 : k;
  };
  const dash = 1 - route;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0C5C43 0%, #063A2A 60%, #041F17 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: MAP_TOP, width: map.w, height: map.h, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
        <svg width={map.w} height={map.h} style={{ position: "absolute", overflow: "visible" }}>
          {map.dots.map(([x, y], i) => {
            const d = Math.hypot(x - SX, y - SY);
            const appear = ramp(t, d / 90 - 2, d / 90 + 4);
            if (appear <= 0) return null;
            const near = Math.max(0, 1 - Math.hypot(x - px, y - py) / 140);
            return <circle key={i} cx={x} cy={y} r={4 * (0.6 + 0.4 * appear) + near * 2.2} fill={near > 0.05 ? C.lime : "#8FD3A6"} opacity={(0.42 + near * 0.5) * appear} />;
          })}
          {/* 항로 */}
          <path d={`M ${SX} ${SY} Q ${CTRL[0]} ${CTRL[1]} ${GX} ${GY}`} fill="none" stroke={C.lime} strokeWidth={5 / Math.max(z, 1) + 1.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={dash} style={{ filter: "drop-shadow(0 0 6px rgba(200,240,90,0.9))" }} />
          {/* 핀 링 */}
          {[0, 6].map((o) => (
            <circle key={`s${o}`} cx={SX} cy={SY} r={8 + pulse(2 + o) * 46} fill="none" stroke="#fff" strokeWidth={2.5} opacity={(1 - pulse(2 + o)) * 0.7 * seoulPop} />
          ))}
          {[0, 6].map((o) => (
            <circle key={`g${o}`} cx={GX} cy={GY} r={10 + pulse(40 + o) * 56} fill="none" stroke={C.lime} strokeWidth={3} opacity={(1 - pulse(40 + o)) * 0.85 * Math.min(gzPop, 1)} />
          ))}
          <circle cx={SX} cy={SY} r={11 * seoulPop} fill="#fff" />
          <circle cx={GX} cy={GY} r={14 * gzPop} fill={C.lime} stroke="#fff" strokeWidth={4 * Math.min(gzPop, 1)} />
        </svg>
        {/* 비행기 */}
        {route > 0.01 && route < 0.995 && (
          <div style={{ position: "absolute", left: px, top: py, transform: `translate(-50%,-50%) rotate(${bezTan(route) + 90}deg) scale(${1 / Math.max(z * 0.8, 1)})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
            <PlaneIcon size={70} />
          </div>
        )}
        {/* 라벨 */}
        <div style={{ position: "absolute", left: SX + 26, top: SY - 30, transform: `scale(${1 / z})`, transformOrigin: "0 50%", opacity: seoulPop }}>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 46, letterSpacing: "0.04em", color: "#fff" }}>KOREA</div>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>출발</div>
        </div>
        <div style={{ position: "absolute", left: GX - 300, top: GY + 30, width: 600, transform: `scale(${1 / z})`, transformOrigin: "50% 0", opacity: labelIn, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF_CN, fontWeight: 900, fontSize: 96, lineHeight: 1.1, color: C.lime, textShadow: "0 0 18px rgba(200,240,90,0.45)" }}>广州</div>
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 54, letterSpacing: "0.06em", color: "#fff" }}>GUANGZHOU</div>
        </div>
      </div>
      {/* 헤드 텍스트 */}
      <div style={{ position: "absolute", top: 268, left: 0, right: 0, textAlign: "center", opacity: headIn * interpolate(t, [50, 56], [1, 0], clampX) }}>
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 44, letterSpacing: "0.12em", color: C.lime }}>2026. 01. 22</div>
        <div style={{ marginTop: 14, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, letterSpacing: "0.42em", color: "rgba(255,255,255,0.8)" }}>KOREA → GUANGZHOU</div>
      </div>
      <div style={{ position: "absolute", top: 1500, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(t, [50, 56], [1, 0], clampX) }}>
        <PopWords text="3일간의 교육 탐방" at={14} to={200} size={68} weight={800} highlight={[1]} t={t} />
      </div>
    </AbsoluteFill>
  );
};

/* ======================================================================
   TITLE — 공항 현수막 위 타이틀 (local 0~60)
   ====================================================================== */
export const TitleOverlay: React.FC<{ local: number }> = ({ local: t }) => {
  const { fps } = useVideoConfig();
  const out = interpolate(t, [52, 60], [1, 0], { ...clampX, easing: easeIn });
  const big = spring({ frame: t - 6, fps, config: { damping: 11, stiffness: 170, mass: 0.8 } });
  const cn = spring({ frame: t - 13, fps, config: { damping: 12, stiffness: 160, mass: 0.8 } });
  const label = ramp(t, 2, 12);
  const sub = ramp(t, 20, 30);
  // 현수막(실제 행사명)이 보이는 하단을 가리지 않도록 타이틀은 상단 1/3에 둔다
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.6) 26%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.35) 100%)" }} />
      <div style={{ position: "absolute", top: 262, left: 0, right: 0, textAlign: "center", clipPath: `inset(0 ${(1 - label) * 50}% 0 ${(1 - label) * 50}%)` }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 62, color: "#fff", letterSpacing: "0.01em" }}>Global Education Insight</div>
        <div style={{ marginTop: 6, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 26, letterSpacing: "0.5em", color: C.lime }}>2026 · KOREA DELEGATION</div>
      </div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 24 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 236, lineHeight: 1, letterSpacing: "-0.06em", color: "#fff", transform: `translateY(${(1 - big) * 70}px) scale(${0.6 + 0.4 * big})`, opacity: Math.min(1, big * 1.4), textShadow: "0 10px 40px rgba(0,0,0,0.55)" }}>광저우</div>
        <div style={{ fontFamily: SERIF_CN, fontWeight: 900, fontSize: 146, lineHeight: 1.12, color: C.lime, transform: `translateY(${(1 - cn) * 50}px) rotate(${(1 - cn) * 10}deg)`, opacity: Math.min(1, cn * 1.4), textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>广州</div>
      </div>
      <div style={{ position: "absolute", top: 696, left: 0, right: 0, textAlign: "center", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 40, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.92)", textShadow: "0 3px 14px rgba(0,0,0,0.6)" }}>한국 교육 리더 방문단 · 3일의 기록</span>
      </div>
    </AbsoluteFill>
  );
};

/* ======================================================================
   MESSAGE — 광저우에서 만난 수업의 미래, (local 0~60)
   ====================================================================== */
export const MessageOverlay: React.FC<{ local: number }> = ({ local: t }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,31,23,0.12) 0%, rgba(4,31,23,0.42) 38%, rgba(4,31,23,0.5) 58%, rgba(4,31,23,0.18) 100%)", opacity: ramp(t, 0, 6) }} />
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <PopWords text="광저우에서 만난" at={4} to={400} size={88} weight={800} stagger={4} t={t} />
      <PopWords text="수업의 미래," at={16} to={400} size={170} weight={900} stagger={5} highlight={[1]} t={t} />
    </div>
  </AbsoluteFill>
);

/* ======================================================================
   END CARD — 이제, 우리 학원에서. + Classin (local 0~90, -10부터 원형 리빌)
   ====================================================================== */
export const EndCard: React.FC<{ local: number }> = ({ local: t }) => {
  const { fps } = useVideoConfig();
  const logo = spring({ frame: t - 14, fps, config: { damping: 10, stiffness: 150, mass: 0.9 } });
  const hit = t >= 60 ? spring({ frame: t - 60, fps, config: { damping: 8, stiffness: 260, mass: 0.5 } }) : 0;
  const bump = t >= 60 ? 1 + 0.07 * Math.sin(Math.min(hit, 1) * Math.PI) : 1;
  const btn = spring({ frame: t - 26, fps, config: { damping: 13, stiffness: 200, mass: 0.7 } });
  const glowX = 50 + Math.sin(t / 14) * 8;
  const ring = (i: number) => {
    const period = 26;
    const f = t - 36 - i * (period / 2);
    if (f < 0) return null;
    const k = (f % period) / period;
    return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 700, height: 128, borderRadius: 999, border: `4px solid ${C.limeDeep}`, opacity: (1 - k) * 0.55, transform: `translate(-50%,-50%) scale(${1 + k * 0.18}, ${1 + k * 0.7})` }} />;
  };
  const burst = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.2;
      const p = ramp(t, 16, 30, 0, 1, easeOut);
      const r0 = 250 + 40 * p;
      const r1 = r0 + 70 * (1 - p) + 20;
      return (
        <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={C.limeDeep} strokeWidth={6} strokeLinecap="round" opacity={(1 - p) * 0.9} />
      );
    });
  const sparkle = Array.from({ length: 14 }, (_, i) => {
    if (t < 60) return null;
    const k = ramp(t, 60, 80, 0, 1, easeOut);
    const a = random(`sp${i}`) * Math.PI * 2;
    const r = 220 + random(`sr${i}`) * 260 * k;
    return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={(1 - k) * (5 + random(`ss${i}`) * 7)} fill={i % 3 ? C.lime : C.limeDeep} />;
  });
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(8,71,52,0.13) 2.2px, transparent 2.6px)", backgroundSize: "36px 36px", backgroundPosition: `${t * 0.4}px ${t * 0.2}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 34% at ${glowX}% 44%, rgba(200,240,90,0.55) 0%, rgba(200,240,90,0) 70%)` }} />
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <PopWords text="이제, 우리 학원에서." at={2} to={400} size={98} weight={900} color={C.ink} stagger={4} highlight={[1, 2]} hlTextColor={C.forest} t={t} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 800, transform: "translate(-50%,-50%)" }}>
        <svg width={0} height={0} style={{ position: "absolute", left: "50%", top: "50%", overflow: "visible" }}>
          <g>{burst(18)}</g>
          <g>{sparkle}</g>
        </svg>
        <div style={{ transform: `scale(${(0.5 + 0.5 * logo) * bump})`, opacity: Math.min(1, logo * 1.5) }}>
          <Img src={staticFile("brand/classin-logo-stacked.png")} style={{ width: 540, display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1062, left: 0, right: 0, textAlign: "center", opacity: ramp(t, 22, 30), transform: `translateY(${(1 - ramp(t, 22, 32)) * 18}px)` }}>
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 56, letterSpacing: "0.02em", color: C.forest }}>수업 시스템 OS</span>
      </div>
      <div style={{ position: "absolute", left: 540, top: 1268, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * btn})`, opacity: Math.min(1, btn * 1.4) }}>
        {[0, 1].map(ring)}
        <div style={{ position: "relative", width: 700, height: 128, borderRadius: 999, background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, boxShadow: "0 18px 40px rgba(8,71,52,0.35)" }}>
          <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 52, letterSpacing: "-0.02em", color: "#fff" }}>지금 문의하기</span>
          <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 52, color: C.lime, transform: `translateX(${Math.max(0, Math.sin(t / 4)) * 8}px)` }}>→</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1378, left: 0, right: 0, textAlign: "center", opacity: ramp(t, 32, 40) }}>
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 46, letterSpacing: "0.01em", color: C.ink }}>classin.co.kr</span>
      </div>
      <div style={{ position: "absolute", top: 1500, left: 0, right: 0, textAlign: "center", opacity: ramp(t, 40, 50) * 0.9 }}>
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 28, letterSpacing: "0.04em", color: C.gray }}>2026 글로벌 교육 인사이트 · 광저우</span>
      </div>
    </AbsoluteFill>
  );
};

