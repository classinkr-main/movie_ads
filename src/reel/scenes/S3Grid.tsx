import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { HeroShot } from "../HeroShot";
import { Mono, TexImg, Timecode } from "../fx";
import { MaskLine } from "../type";
import { HERO_CLOCK, R, T } from "../theme";

/*
 * S3 연결 그리드 (글로벌 608–812f · 3.4s)
 *   0–92    15개 타일(전국 학원·쇼룸 사진 + 수업 영상)이 흩어진 위치에서 3D로 날아와 5×3 그리드로 정렬(멀리 있을수록 흐린 피사계 심도)
 *   50–     타일 사이 틈으로 빛 신호가 흐르는 회로선, 교차점 노드
 *   58–110  민트 신호가 좌→우로 타일을 통과하며 유리 광택이 스친다(“하나의 흐름”)
 *   60–148  "칠판 · 카메라 · 교안 · 녹화 · LMS · 데이터 / 하나의 흐름으로." (가운데만 어둡게 — 가장자리 타일은 보인다)
 *   136–204 중앙 타일(히어로 칠판 샷)로 줌스루 — 그 사이 칠판이 켜지고 예문이 쓰인다. 마지막 프레임이 S4 첫 프레임과 같은 화면이 된다
 * 타일 디테일: 지역 라벨(사진창고 폴더 기준 시·구 단위), 번호, 영상 타일 REC 타임코드, 유리 테두리·글레어, 하단 그라데이션.
 */
type Tile = { k: "photo" | "video" | "hero"; src?: string; tag?: string };
const TILES: Tile[] = [
  { k: "photo", src: "showroom-wide", tag: "서울 목동 · 쇼룸" },
  { k: "photo", src: "academy-room", tag: "서울 목동 · 수학학원" },
  { k: "video", src: "students", tag: "Classin 수업 영상" },
  { k: "photo", src: "academy-hall2", tag: "경기 부천 · 학원" },
  { k: "photo", src: "showroom-wall", tag: "서울 목동 · 쇼룸" },
  { k: "photo", src: "academy-ai", tag: "부산 · 워크숍" },
  { k: "video", src: "tablet", tag: "Classin 수업 영상" },
  { k: "hero", tag: "Classin Board" },
  { k: "photo", src: "academy-green", tag: "부산 · 수학학원" },
  { k: "photo", src: "academy-talk", tag: "부산 · 수학학원" },
  { k: "photo", src: "showroom-class", tag: "서울 목동 · 쇼룸" },
  { k: "photo", src: "academy-english", tag: "서울 · 영어학원" },
  { k: "video", src: "phone", tag: "Classin 수업 영상" },
  { k: "photo", src: "academy-classin", tag: "경기 평택 · 학원" },
  { k: "photo", src: "academy-lecture", tag: "울산 · 영어학원" },
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

// 타일 사이 틈의 회로선 — 가로 2줄, 세로 4줄(그리드 밖으로 조금 더 뻗는다)
const H_LINES = [TH + GAP / 2, 2 * TH + 1.5 * GAP];
const V_LINES = [0, 1, 2, 3].map((c) => TW + GAP / 2 + c * (TW + GAP));
const EXT = 70;

const Circuit: React.FC<{ f: number; opacity: number }> = ({ f, opacity }) => {
  if (opacity <= 0) return null;
  const lines = [
    ...H_LINES.map((y, i) => ({ x1: -EXT, y1: y, x2: GRID_W + EXT, y2: y, sp: 9 + i * 2.5, ph: i * 400 })),
    ...V_LINES.map((x, i) => ({ x1: x, y1: -EXT, x2: x, y2: GRID_H + EXT, sp: 5 + (i % 2) * 2, ph: 120 + i * 170 })),
  ];
  return (
    <svg width={GRID_W} height={GRID_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity, pointerEvents: "none" }}>
      {lines.map((l, i) => {
        const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
        const off = -((f * l.sp + l.ph) % (len + 90));
        return (
          <g key={i}>
            <line {...l} stroke={`rgba(${R.accentRgb},0.2)`} strokeWidth={1.4} />
            <line {...l} stroke={R.accent} strokeWidth={2.6} strokeLinecap="round" strokeDasharray={`90 ${len}`} strokeDashoffset={off} style={{ filter: `drop-shadow(0 0 6px rgba(${R.accentRgb},0.9))` }} />
          </g>
        );
      })}
      {H_LINES.flatMap((y) =>
        V_LINES.map((x) => {
          const blink = 0.45 + 0.55 * Math.abs(Math.sin(f / 14 + x * 0.01 + y * 0.02));
          return <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} fill={R.accent} opacity={blink} style={{ filter: `drop-shadow(0 0 8px rgba(${R.accentRgb},1))` }} />;
        }),
      )}
    </svg>
  );
};

export const S3Grid: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(f, [0, 14], [0, 1], clamp);
  const flat = interpolate(f, [0, 92], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoomP = interpolate(f, [136, 204], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.18, 1) });
  const hold = interpolate(f, [60, 136], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const drift = 1 + 0.035 * hold * (1 - zoomP);
  const scale = (0.84 + 0.16 * flat) * drift * Math.pow(ZOOM, zoomP);
  const textOut = interpolate(f, [132, 148], [1, 0], clamp);
  const scrim = interpolate(f, [56, 74, 132, 148], [0, 1, 1, 0], clamp);
  const circuit = interpolate(f, [50, 76], [0, 1], clamp) * interpolate(zoomP, [0, 0.3], [1, 0], clamp);
  const detail = interpolate(zoomP, [0, 0.25], [1, 0], clamp); // 줌인이 시작되면 라벨이 먼저 빠진다
  const heroF = f + T.grid.from - HERO_CLOCK;

  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${R.deep} 0%, ${R.night} 75%)` }} />
      <TexImg file="chalk.png" opacity={0.12} blend="screen" />
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
          <Circuit f={f} opacity={circuit} />
          {TILES.map((t, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const dist = Math.hypot(col - 2, (row - 1) * 1.6);
            const k = t.k === "hero" ? 1 : sp(f - 2 - dist * 7, fps, { damping: 22, stiffness: 100, mass: 1 });
            const sx = (rnd(i, 1) - 0.5) * 1400;
            const sy = (rnd(i, 2) - 0.5) * 900;
            const sz = -600 - rnd(i, 3) * 900;
            const sr = (rnd(i, 4) - 0.5) * 50;
            const pulseT = f - 58 - col * 10;
            const pulse = interpolate(pulseT, [0, 10, 28], [0, 1, 0], clamp);
            const shine = interpolate(pulseT, [0, 30], [0, 1], clamp);
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
                  filter: k < 0.97 ? `blur(${(1 - k) * 12}px)` : undefined,
                  boxShadow: `0 0 0 ${2 + pulse * 2}px rgba(${R.accentRgb},${0.08 + pulse * 0.9}), 0 0 ${pulse * 40}px rgba(${R.accentRgb},${pulse * 0.6}), 0 18px 40px rgba(0,0,0,0.45)`,
                }}
              >
                {t.k === "photo" && <Img src={staticFile(`reel/photos/${t.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85) contrast(1.06) brightness(0.88)" }} />}
                {t.k === "video" && <OffthreadVideo src={staticFile(`reel/video/${t.src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) brightness(0.9)" }} />}
                {t.k === "hero" && (
                  <div style={{ width: 1920, height: 1080, transform: `scale(${TW / 1920})`, transformOrigin: "0 0" }}>
                    <HeroShot f={heroF} />
                  </div>
                )}
                {t.k !== "hero" && <div style={{ position: "absolute", inset: 0, background: R.forest, mixBlendMode: "soft-light", opacity: 0.45 }} />}
                {/* 디테일 레이어 — 하단 그라데이션 · 유리 글레어 · 광택 스윕 · 라벨 · 번호 · REC */}
                <div style={{ position: "absolute", inset: 0, opacity: detail }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(3,11,8,0.72) 0%, rgba(3,11,8,0) 48%)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 30%)" }} />
                  {shine > 0 && shine < 1 && (
                    <div style={{ position: "absolute", top: "-50%", bottom: "-50%", left: `${-50 + shine * 190}%`, width: "26%", transform: "rotate(20deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.34), rgba(255,255,255,0))", mixBlendMode: "screen" }} />
                  )}
                  <div style={{ position: "absolute", left: 12, bottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: R.accent, boxShadow: `0 0 8px rgba(${R.accentRgb},0.9)` }} />
                    <Mono size={12.5} color="rgba(255,255,255,0.92)">{t.tag}</Mono>
                  </div>
                  <div style={{ position: "absolute", right: 12, top: 9 }}>
                    <Mono size={11} color="rgba(255,255,255,0.55)">{String(i + 1).padStart(2, "0")}</Mono>
                  </div>
                  {t.k === "video" && (
                    <div style={{ position: "absolute", left: 12, top: 9, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, background: "#FF4D3D", opacity: Math.floor(f / 20) % 2 ? 0.4 : 1 }} />
                      <Timecode size={11} offset={i * 977} color="rgba(255,255,255,0.85)" />
                    </div>
                  )}
                </div>
                <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)", pointerEvents: "none", opacity: detail }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* 카피 — 가운데만 어둡게 눌러 가장자리 타일의 디테일은 살린다 */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 46% 44% at 50% 50%, rgba(3,11,8,0.9) 0%, rgba(3,11,8,0.62) 55%, rgba(3,11,8,0.18) 100%)`, opacity: scrim }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: textOut }}>
        <div style={{ textAlign: "center", fontFamily: FONT_FAMILY, color: R.white }}>
          <MaskLine at={60} dur={28}>
            <Mono size={26} color={R.accent}>칠판 · 카메라 · 교안 · 녹화 · LMS · 데이터</Mono>
          </MaskLine>
          <MaskLine at={66} dur={32} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.05, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
              하나의 <span style={{ color: R.accent }}>흐름</span>으로.
            </div>
          </MaskLine>
          <div style={{ marginTop: 22, opacity: interpolate(f, [86, 106], [0, 1], { ...clamp, easing: easeOutExpo }) }}>
            <span style={{ fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em", textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>따로 놀던 수업 도구를 한 흐름으로 묶습니다</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
