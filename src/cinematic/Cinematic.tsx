import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FAMILY } from "./fonts";
import { Bloom, FilmGrain, Flare, Flash, Letterbox, LightLeak, Vignette, WhipBlur, cl, shake } from "./fx";
import { End, Scale } from "./shots/Finale";
import { Open } from "./shots/Open";
import { ProofAi, ProofEdb, ProofRecord } from "./shots/Proofs";
import { Reveal } from "./shots/Reveal";
import { BAR_H, H, K, T, W } from "./theme";

// Classin 시네마틱 커머셜 — "칠판은 지워져도, 수업은 남습니다" (20s · 600f · 30fps · 120BPM)
//
//  0   S1 Open     판서 매크로 → 지우개                       (마디 1–2)
//  120 S2 Reveal   임팩트 · 풀백 · 헤드라인                    (마디 3–4)
//  240 S3 Proofs   01 자동 녹화 / 02 AI 강의 평가 / 03 EDB 교안 (마디 5–7)
//  420 S4 Scale    글로벌 스케일                               (마디 8)
//  480 S5 End      임팩트 · 로고 · CTA                         (마디 9–10)

const HITS: Array<[number, number]> = [
  [T.reveal, 11],
  [T.p1, 3.5],
  [T.p2, 3.5],
  [T.p3, 3.5],
  [T.scale, 3.5],
  [T.end, 14],
];

const WHIP = 540;
type Dir = -1 | 0 | 1;

/** 샷 래퍼 — 들어올 때/나갈 때 휩 팬(가로 이동 + 방향성 블러) */
const Shot: React.FC<{ id: string; from: number; to: number; inDir?: Dir; outDir?: Dir; children: React.ReactNode }> = ({ id, from, to, inDir = 0, outDir = 0, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  let x = 0;
  let blur = 0;
  if (inDir) {
    const t = interpolate(frame, [from, from + 7], [0, 1], cl);
    x += inDir * Math.pow(1 - t, 3) * WHIP;
    blur = Math.max(blur, Math.pow(1 - t, 1.6) * 70);
  }
  if (outDir) {
    const t = interpolate(frame, [to - 5, to], [0, 1], cl);
    x -= outDir * t * t * t * WHIP;
    blur = Math.max(blur, t * t * 70);
  }
  return (
    <Sequence from={from} durationInFrames={to - from}>
      <WhipBlur id={`whip-${id}`} amount={blur} style={{ transform: x ? `translateX(${x.toFixed(1)}px)` : undefined }}>
        {children}
      </WhipBlur>
    </Sequence>
  );
};

const CUTS: Array<[number, 1 | -1]> = [
  [T.p1, 1],
  [T.p2, -1],
  [T.p3, 1],
  [T.scale, -1],
];

export const Cinematic: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const frame = useCurrentFrame();

  // 임팩트 1 — 보드가 드러나는 순간의 플레어
  const hit1 = interpolate(frame, [T.reveal - 2, T.reveal, T.reveal + 6, T.reveal + 26], [0, 1.3, 0.55, 0], cl);
  const hit1x = interpolate(frame, [T.reveal, T.reveal + 26], [W * 0.5, W * 0.46], { ...cl, easing: Easing.out(Easing.exp) });
  // 보드 윗변에 남는 작은 글린트
  const glint = interpolate(frame, [T.reveal + 30, T.reveal + 50, T.p1 - 10, T.p1 - 3], [0, 0.34, 0.3, 0], cl) * (1 + Math.sin(frame / 7) * 0.08);
  // 밝은 UI·엔드카드에서는 블룸을 줄여 글자를 또렷하게
  const bloom = interpolate(frame, [T.p2 - 4, T.p2 + 4, T.p3 - 4, T.p3 + 4, T.end, T.end + 20], [0.36, 0.22, 0.22, 0.36, 0.36, 0.2], cl);
  // 임팩트 2 — 로고
  const hit2 = interpolate(frame, [T.end - 1, T.end, T.end + 9, T.end + 40, T.total - 16, T.total - 2], [0, 1.4, 0.8, 0.3, 0.24, 0], cl) * (1 + Math.sin(frame / 9) * 0.06);
  // 레터박스 — 엔드카드에서 열린다
  const bars = interpolate(frame, [T.end, T.end + 18], [BAR_H, 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const fadeOut = interpolate(frame, [T.total - 13, T.total - 1], [0, 1], cl);

  return (
    <AbsoluteFill style={{ background: K.stage, fontFamily: FONT_FAMILY }}>
      <AbsoluteFill style={{ transform: shake(frame, HITS) }}>
        <Shot id="open" from={T.open} to={T.reveal}>
          <Open />
        </Shot>
        <Shot id="reveal" from={T.reveal} to={T.p1} outDir={1}>
          <Reveal />
        </Shot>
        <Shot id="p1" from={T.p1} to={T.p2} inDir={1} outDir={-1}>
          <ProofRecord />
        </Shot>
        <Shot id="p2" from={T.p2} to={T.p3} inDir={-1} outDir={1}>
          <ProofAi />
        </Shot>
        <Shot id="p3" from={T.p3} to={T.scale} inDir={1} outDir={-1}>
          <ProofEdb />
        </Shot>
        <Shot id="scale" from={T.scale} to={T.end} inDir={-1}>
          <Scale />
        </Shot>
        <Shot id="end" from={T.end} to={T.total}>
          <End />
        </Shot>
      </AbsoluteFill>

      {/* ── 렌즈·필름 레이어 ── */}
      <Bloom amount={bloom} radius={20} />
      <Flare x={hit1x} y={H * 0.47} power={hit1} length={2300} />
      <Flare x={interpolate(frame, [T.reveal + 30, T.p1], [1060, 1010])} y={interpolate(frame, [T.reveal + 30, T.p1], [250, 256])} power={glint} length={900} core={0.3} ghosts={false} />
      {CUTS.map(([c, dir]) => {
        const pw = interpolate(frame, [c - 5, c, c + 8], [0, 0.8, 0], cl);
        return <Flare key={c} x={W / 2 + dir * (frame - c) * 70} y={H * 0.5} power={pw} length={2600} core={0.5} ghosts={false} />;
      })}
      <Flare x={W / 2} y={253} power={hit2} length={2200} core={0.8} />
      {CUTS.map(([c, dir]) => (
        <LightLeak key={c} at={c} dir={dir} strength={0.5} />
      ))}
      <Flash at={T.reveal} strength={0.5} dur={7} />
      <Flash at={T.end} strength={0.6} dur={6} />
      <Vignette strength={0.62} />
      <FilmGrain opacity={0.3} />
      <Letterbox h={bars} />
      {fadeOut > 0 && <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />}

      {audio && <Audio src={staticFile("audio/cinematic-score.m4a")} />}
    </AbsoluteFill>
  );
};
