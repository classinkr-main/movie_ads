import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { HeroShot } from "../HeroShot";
import { Mono } from "../fx";
import { MaskLine } from "../type";
import { HERO_CLOCK, R, T } from "../theme";

/*
 * S3 연결 그리드 (글로벌 528–720f · 3.2s)
 *   0–70    15개 타일(학원·쇼룸 사진 + 스톡 영상)이 흩어진 위치에서 3D로 날아와 5×3 그리드로 정렬
 *   46–100  연두 신호가 좌→우로 타일을 통과(“하나의 흐름”)
 *   54–124  "칠판 · 카메라 · 교안 · 녹화 · LMS · 데이터 / 하나의 흐름으로."
 *   120–192 중앙 타일(히어로 칠판 샷)로 줌스루 — 마지막 프레임이 S4 첫 프레임과 같은 화면이 된다
 */
type Tile = { k: "photo" | "video" | "hero"; src?: string };
const TILES: Tile[] = [
  { k: "photo", src: "showroom-wide" },
  { k: "photo", src: "academy-room" },
  { k: "video", src: "students" },
  { k: "photo", src: "academy-hall2" },
  { k: "photo", src: "showroom-wall" },
  { k: "photo", src: "academy-ai" },
  { k: "video", src: "tablet" },
  { k: "hero" },
  { k: "photo", src: "academy-green" },
  { k: "photo", src: "academy-talk" },
  { k: "photo", src: "showroom-class" },
  { k: "photo", src: "academy-english" },
  { k: "video", src: "phone" },
  { k: "photo", src: "academy-classin" },
  { k: "photo", src: "academy-lecture" },
];
const COLS = 5;
const TW = 360;
const TH = 202.5;
const GAP = 16;
const GRID_W = COLS * TW + (COLS - 1) * GAP;
const GRID_H = 3 * TH + 2 * GAP;
const ZOOM = 1920 / TW;

// 결정론적 의사난수(타일별 흩어진 시작 위치)
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const S3Grid: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(f, [0, 12], [0, 1], clamp);
  const flat = interpolate(f, [0, 78], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoomP = interpolate(f, [118, 192], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.18, 1) });
  const hold = interpolate(f, [56, 118], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const drift = 1 + 0.035 * hold * (1 - zoomP);
  const scale = (0.84 + 0.16 * flat) * drift * Math.pow(ZOOM, zoomP);
  const textOut = interpolate(f, [112, 126], [1, 0], clamp);
  const scrim = interpolate(f, [50, 64, 112, 126], [0, 0.62, 0.62, 0], clamp);
  const heroF = f + T.grid.from - HERO_CLOCK;

  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${R.deep} 0%, ${R.night} 75%)` }} />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div
          style={{
            position: "absolute",
            left: 960 - GRID_W / 2,
            top: 540 - GRID_H / 2,
            width: GRID_W,
            height: GRID_H,
            transformOrigin: `${GRID_W / 2}px ${GRID_H / 2}px`,
            transform: `scale(${scale}) rotateX(${(1 - flat) * 24}deg) rotateZ(${(1 - flat) * -9}deg)`,
          }}
        >
          {TILES.map((t, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const dist = Math.hypot(col - 2, (row - 1) * 1.6);
            const k = t.k === "hero" ? 1 : sp(f - 2 - dist * 6, fps, { damping: 20, stiffness: 120, mass: 1 });
            const sx = (rnd(i, 1) - 0.5) * 1400;
            const sy = (rnd(i, 2) - 0.5) * 900;
            const sz = -600 - rnd(i, 3) * 900;
            const sr = (rnd(i, 4) - 0.5) * 50;
            const pulse = interpolate(f - 46 - col * 9, [0, 8, 22], [0, 1, 0], clamp);
            const radius = 12 * (1 - zoomP);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: col * (TW + GAP),
                  top: row * (TH + GAP),
                  width: TW,
                  height: TH,
                  borderRadius: radius,
                  overflow: "hidden",
                  background: R.night2,
                  opacity: t.k === "hero" ? 1 : Math.min(1, k * 1.6),
                  transform: `translate3d(${(1 - k) * sx}px, ${(1 - k) * sy}px, ${(1 - k) * sz}px) rotate(${(1 - k) * sr}deg)`,
                  boxShadow: `0 0 0 ${2 + pulse * 2}px rgba(200,240,90,${0.08 + pulse * 0.9}), 0 0 ${pulse * 40}px rgba(200,240,90,${pulse * 0.6})`,
                }}
              >
                {t.k === "photo" && <Img src={staticFile(`reel/photos/${t.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85) contrast(1.06) brightness(0.86)" }} />}
                {t.k === "video" && <OffthreadVideo src={staticFile(`reel/video/${t.src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) brightness(0.9)" }} />}
                {t.k === "hero" && (
                  <div style={{ width: 1920, height: 1080, transform: `scale(${TW / 1920})`, transformOrigin: "0 0" }}>
                    <HeroShot f={heroF} />
                  </div>
                )}
                {t.k !== "hero" && <div style={{ position: "absolute", inset: 0, background: R.forest, mixBlendMode: "soft-light", opacity: 0.5 }} />}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* 카피 */}
      <AbsoluteFill style={{ background: R.night, opacity: scrim }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: textOut }}>
        <div style={{ textAlign: "center", fontFamily: FONT_FAMILY, color: R.white }}>
          <MaskLine at={54} dur={22}>
            <Mono size={26} color={R.lime}>칠판 · 카메라 · 교안 · 녹화 · LMS · 데이터</Mono>
          </MaskLine>
          <MaskLine at={60} dur={26} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.05 }}>
              하나의 <span style={{ color: R.lime }}>흐름</span>으로.
            </div>
          </MaskLine>
          <div style={{ marginTop: 22, opacity: interpolate(f, [74, 92], [0, 1], { ...clamp, easing: easeOutExpo }) }}>
            <span style={{ fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.02em" }}>따로 놀던 수업 도구를 한 흐름으로 묶습니다</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
