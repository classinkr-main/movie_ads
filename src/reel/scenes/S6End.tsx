import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { Dust, LightSweep, Mono } from "../fx";
import { MaskLine } from "../type";
import { R } from "../theme";

/*
 * S6 엔드 카드 (글로벌 1266–1440f · 2.9s)
 * 민트 링 아이리스로 열리고, Classin 마크가 스프링으로 내려앉은 뒤 워드마크·태그라인·CTA가 순서대로 선다.
 * CTA 문구는 사이트 정본(lib/classin-positioning.ts primaryCtas[0])을 그대로 쓴다.
 * 시네마틱: 뒤로 학원·쇼룸 사진이 깊게 흐려진 채 흐르고(보케 월), 로고 착지에 아나모픽 플레어(BrandReel)가 겹친다.
 */

// 보케 월 — 아주 흐린 학원·쇼룸 사진 두 줄이 반대 방향으로 천천히 흐른다
const HAZE = [
  ["academy-teacher", "showroom-presenter", "academy-blue", "showroom-board", "academy-room2"],
  ["showroom-tablet", "board-written", "academy-hall", "showroom-wide", "academy-classin"],
];
const PhotoHaze: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.2, filter: "blur(16px) saturate(0.7)", maskImage: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 30%, #000 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 30%, #000 75%)" }}>
      {HAZE.map((row, r) => (
        <div key={r} style={{ position: "absolute", top: 40 + r * 520, left: (r ? -260 : -60) + f * (r ? 0.9 : -0.9), display: "flex", gap: 30 }}>
          {row.map((src) => (
            <Img key={src} src={staticFile(`reel/photos/${src}.jpg`)} style={{ width: 640, height: 480, objectFit: "cover", borderRadius: 30 }} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
export const S6End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const RMAX = Math.hypot(width, height) / 2 + 60;
  const iris = interpolate(f, [0, 24], [0, 1], { ...clamp, easing: easeOutExpo });
  const r = iris * RMAX;
  const ring = interpolate(f, [12, 24], [1, 0], clamp);

  const mark = sp(f - 8, fps, { damping: 14, stiffness: 140, mass: 0.9 });
  const word = interpolate(f, [30, 54], [0, 1], { ...clamp, easing: easeOutExpo });
  const cta = sp(f - 68, fps, { damping: 15, stiffness: 190, mass: 0.7 });
  const glow = 0.55 + Math.sin(f / 18) * 0.08;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: iris < 1 ? `circle(${r}px at 50% 50%)` : undefined }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 62% at 50% 42%, #0D4532 0%, #06231A 42%, ${R.night} 100%)` }} />
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${R.hair} 1px, transparent 1px), linear-gradient(90deg, ${R.hair} 1px, transparent 1px)`,
            backgroundSize: "96px 96px",
            backgroundPosition: `0 ${f * 0.3}px`,
            opacity: 0.25,
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, #000 0%, transparent 100%)",
          }}
        />
        <PhotoHaze />
        <Dust count={34} seed="end" opacity={0.55} />
        {/* 마크 뒤 글로우 */}
        <div style={{ position: "absolute", left: "50%", top: 300, width: 900, height: 520, marginLeft: -450, marginTop: -260, borderRadius: "50%", background: `radial-gradient(ellipse at center, rgba(${R.accentRgb},${glow * 0.45}) 0%, rgba(${R.accentRgb},0) 65%)`, opacity: mark }} />

        <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT_FAMILY, color: R.white }}>
          <div style={{ marginTop: 160, transform: `translateY(${(1 - mark) * -70}px) scale(${0.7 + 0.3 * mark}) rotate(${(1 - mark) * -10}deg)`, opacity: Math.min(1, mark * 1.6) }}>
            <Img src={staticFile("brand/classin-mark.png")} style={{ height: 172, width: "auto", display: "block", filter: "drop-shadow(0 12px 40px rgba(0,168,107,0.45))" }} />
          </div>
          <div style={{ marginTop: 34, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`, transform: `translateX(${(1 - word) * -30}px)` }}>
            <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 128, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          </div>
          <MaskLine at={46} dur={28} style={{ marginTop: 34 }}>
            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.92)" }}>
              좋은 수업을, <span style={{ color: R.accent }}>학원의 시스템으로</span>
            </div>
          </MaskLine>
          <MaskLine at={56} dur={26} style={{ marginTop: 14 }}>
            <Mono size={24} color={R.mute}>수업 시스템 OS</Mono>
          </MaskLine>
          <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 28, transform: `scale(${0.6 + 0.4 * cta})`, opacity: Math.min(1, cta * 1.5) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 16, background: R.accent, color: R.accentInk, borderRadius: 999, padding: "22px 44px", fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", boxShadow: `0 18px 50px rgba(${R.accentRgb},0.28)` }}>
              목동 쇼룸에서 실제 수업 흐름 보기
              <span style={{ fontSize: 34, transform: `translateX(${Math.sin(f / 9) * 4}px)` }}>→</span>
            </span>
            <span style={{ fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.01em" }}>classin.co.kr</span>
          </div>
        </AbsoluteFill>
        <LightSweep from={84} dur={56} width={12} opacity={0.22} angle={18} />
      </AbsoluteFill>
      {ring > 0 && iris < 1 && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: r * 2 + 40, height: r * 2 + 40, borderRadius: 999, border: `20px solid ${R.accent}`, transform: "translate(-50%,-50%)", opacity: ring, boxSizing: "border-box" }} />
      )}
    </AbsoluteFill>
  );
};
