import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust, cl } from "../fx";
import { FONT, FadeIn } from "../type";
import { H, K, W, rgba } from "../theme";

// 엔드카드 (480–600f) — 임팩트. 레터박스가 열리고 지평선 위로 로고 · 태그라인 · CTA.

/** 행성의 가장자리처럼 빛나는 지평선 */
export const Horizon: React.FC<{ y: number; glow?: number; rise?: number }> = ({ y, glow = 1, rise = 0 }) => {
  const R = 3000;
  const top = y - rise;
  return (
    <AbsoluteFill style={{ background: K.black }}>
      {/* 대기 산란 */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 46% at 50% ${((top + 60) / H) * 100}%, ${rgba(K.green, 0.5 * glow)} 0%, ${rgba(K.forest, 0.3 * glow)} 36%, transparent 72%)` }} />
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(ellipse 34% 12% at 50% ${(top / H) * 100}%, ${rgba(K.mint, 0.55 * glow)} 0%, transparent 100%)` }} />
      {/* 행성 본체 */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - R,
          top,
          width: R * 2,
          height: R * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 0%, #0d221b 0%, #050b09 3.2%, ${K.black} 9%)`,
          boxShadow: `0 -2px 0 0 ${rgba(K.mintHot, 0.95 * glow)}, 0 -6px 18px 0 ${rgba(K.mint, 0.85 * glow)}, 0 -22px 80px 4px ${rgba(K.mint, 0.42 * glow)}, 0 -60px 200px 20px ${rgba(K.green, 0.4 * glow)}`,
        }}
      />
    </AbsoluteFill>
  );
};

const STATS = ["160+ 서비스 국가", "6만+ 교육기관", "5,000만+ 교사 · 학습자", "3,000만+ 월간 수업"];

/** 로고 심볼 — 원본 그린 위로 스페큘러가 한 번 지나간다 */
const Mark: React.FC<{ height: number; sweep: number }> = ({ height, sweep }) => {
  const w = (height * 674) / 244;
  const src = staticFile("brand/classin-mark.png");
  return (
    <div style={{ position: "relative", width: w, height }}>
      <Img src={src} style={{ width: w, height, display: "block", filter: `brightness(1.12) saturate(1.08) drop-shadow(0 0 34px ${rgba(K.mint, 0.5)})` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: "100% 100%",
          maskImage: `url(${src})`,
          maskSize: "100% 100%",
          background: `linear-gradient(105deg, transparent ${sweep * 140 - 40}%, rgba(255,255,255,0.95) ${sweep * 140 - 20}%, transparent ${sweep * 140}%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

export const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 1, fps, config: { damping: 18, stiffness: 150, mass: 0.9 } });
  const blur = interpolate(f, [0, 10], [26, 0], cl);
  const sweep = interpolate(f, [8, 30], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const word = interpolate(f, [8, 26], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const cta = spring({ frame: f - 48, fps, config: { damping: 20, stiffness: 170, mass: 0.8 } });
  const drift = 1 + f * 0.00035;
  const nudge = Math.max(0, Math.sin((f - 60) / 6)) * 7;
  return (
    <AbsoluteFill>
      <Horizon y={744} rise={interpolate(f, [0, 120], [0, 26])} glow={interpolate(f, [0, 8, 120], [1.6, 1.15, 1.05], cl)} />
      <Dust count={90} seed="en" wind={0.3} rise={-0.22} opacity={0.9} near={0.14} />
      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: "50% 42%" }}>
        {/* 로고 */}
        <div style={{ position: "absolute", left: 0, top: 178, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ opacity: Math.min(1, pop * 2.2), transform: `scale(${1.5 - pop * 0.5})`, filter: blur > 0.4 ? `blur(${blur}px)` : undefined }}>
            <Mark height={150} sweep={sweep} />
          </div>
          <div style={{ marginTop: 34, opacity: word, transform: `translateY(${(1 - word) * 16}px)`, letterSpacing: 0 }}>
            <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 96, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          </div>
        </div>

        {/* 태그라인 */}
        <FadeIn at={24} y={14} dur={16} style={{ position: "absolute", left: 0, top: 520, width: W, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 50, fontWeight: 600, color: K.white, letterSpacing: "-0.03em" }}>
            칠판은 지워져도, <span style={{ color: K.mint }}>수업은 남습니다.</span>
          </div>
        </FadeIn>
        <FadeIn at={32} y={8} dur={14} style={{ position: "absolute", left: 0, top: 602, width: W, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 27, fontWeight: 500, color: K.dim, letterSpacing: "0.08em" }}>학원 전자칠판 · 수업 녹화 · AI 강의 평가</div>
        </FadeIn>

        {/* 글로벌 수치 — 파인 프린트 */}
        <FadeIn at={60} y={6} dur={16} style={{ position: "absolute", left: 0, top: 976, width: W, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 23, fontWeight: 500, color: K.dim, letterSpacing: "0.01em" }}>
            {STATS.join("  ·  ")}
            <span style={{ color: K.faint, marginLeft: 18 }}>EEO 공식 기준 · 전 세계 누적</span>
          </div>
        </FadeIn>

        {/* CTA — 매트 플랫 버튼 */}
        <div style={{ position: "absolute", left: 0, top: 838, width: W, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 22}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, height: 72, padding: "0 30px 0 32px", borderRadius: 12, background: K.mint, color: K.forest, fontFamily: FONT, fontSize: 31, fontWeight: 800, letterSpacing: "-0.02em", boxShadow: "0 14px 34px rgba(0,0,0,0.45)" }}>
            도입 문의
            <svg width={30} height={18} viewBox="0 0 30 18" style={{ transform: `translateX(${nudge}px)` }}>
              <path d="M1 9 H27 M20 2 L27 9 L20 16" stroke={K.forest} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ width: 1, height: 38, background: rgba(K.white, 0.28) }} />
          <div style={{ fontFamily: FONT, fontSize: 33, fontWeight: 600, color: K.white, letterSpacing: "0.01em" }}>classin.co.kr/contact</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
