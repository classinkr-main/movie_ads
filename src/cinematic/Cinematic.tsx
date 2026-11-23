import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FAMILY, SERIF_FONT } from "./fonts";
import { Bloom, FilmGrain, Flare, Flash, Letterbox, LightLeak, Pillarbox, Vignette, WhipBlur, cl, shake } from "./fx";
import { End } from "./shots/Finale";
import { Tomorrow, TomorrowAi } from "./shots/Future";
import { Open } from "./shots/Open";
import { ProofEdb, ProofRecord } from "./shots/Proofs";
import { Reveal } from "./shots/Reveal";
import { BAR_H, H, K, PILLAR_W, T, W, rgba } from "./theme";

// Classin 시네마틱 커머셜 — 어제 · 오늘 · 내일의 수업 (20s · 600f · 30fps · 120BPM)
//
//  0   어제  분필 칠판. 옛 필름(4:3 · 세피아 · 스크래치) — "어제의 수업은, 지워지면 사라졌습니다."   (마디 1–2)
//  120 오늘  임팩트 · 와이드로 열림 · Classin Board — "오늘의 수업은, 남습니다."                     (마디 3–4)
//  240 오늘  자동 녹화 / 300 EDB 교안                                                               (마디 5–6)
//  360 내일  보드 속 홀로그램 공간 — "내일의 수업은, AI가 돕습니다." / 420 AI 강의 평가             (마디 7–8)
//  480 엔드  임팩트 · 로고 · CTA                                                                    (마디 9–10)

const HITS: Array<[number, number]> = [
  [T.reveal, 11],
  [T.record, 3.5],
  [T.edb, 3.5],
  [T.next, 7],
  [T.ai, 3.5],
  [T.end, 14],
];

const WHIP = 540;
type Dir = -1 | 0 | 1;

/** 샷 래퍼 — 휩 팬(가로 이동 + 방향성 블러) 또는 줌 스루(확대 + 블러)로 들어오고 나간다 */
const Shot: React.FC<{ id: string; from: number; to: number; inDir?: Dir; outDir?: Dir; inZoom?: boolean; outZoom?: boolean; children: React.ReactNode }> = ({ id, from, to, inDir = 0, outDir = 0, inZoom, outZoom, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  let x = 0;
  let blur = 0;
  let scale = 1;
  let soft = 0;
  let bright = 1;
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
  if (inZoom) {
    const t = interpolate(frame, [from, from + 10], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
    scale *= 0.6 + t * 0.4;
    soft = Math.max(soft, (1 - t) * 16);
    bright = Math.max(bright, 1 + (1 - t) * 0.22);
  }
  if (outZoom) {
    const t = interpolate(frame, [to - 7, to], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
    scale *= 1 + t * 1.15;
    soft = Math.max(soft, t * 18);
    bright = Math.max(bright, 1 + t * 0.35);
  }
  const transform = `${x ? `translateX(${x.toFixed(1)}px) ` : ""}${scale !== 1 ? `scale(${scale.toFixed(4)})` : ""}`.trim();
  return (
    <Sequence from={from} durationInFrames={to - from}>
      <WhipBlur id={`whip-${id}`} amount={blur} style={{ transform: transform || undefined }}>
        <AbsoluteFill style={{ filter: soft > 0.3 ? `blur(${soft.toFixed(1)}px) brightness(${bright.toFixed(2)})` : undefined }}>{children}</AbsoluteFill>
      </WhipBlur>
    </Sequence>
  );
};

/** 시대 표시 — 어제 · 오늘 · 내일 */
const ERAS = ["어제", "오늘", "내일"];
const EraBar: React.FC<{ y: number }> = ({ y }) => {
  const frame = useCurrentFrame();
  const era = frame < T.reveal ? 0 : frame < T.next ? 1 : 2;
  const old = era === 0;
  const vis = interpolate(frame, [22, 32, T.end - 8, T.end - 1], [0, 1, 1, 0], cl);
  if (vis <= 0.01) return null;
  const accent = old ? K.cream : era === 1 ? K.mint : K.holo;
  // 시대가 바뀌는 순간 라벨이 한 번 튄다
  const since = frame - (era === 1 ? T.reveal : era === 2 ? T.next : 0);
  const pulse = era === 0 ? 0 : Math.max(0, 1 - since / 14);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: vis }}>
      {ERAS.map((label, i) => {
        const active = i === era;
        const passed = i < era;
        return (
          <React.Fragment key={label}>
            {i > 0 && <div style={{ width: 86, height: 1.5, background: i <= era ? rgba(accent, 0.8) : rgba(K.white, 0.22) }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 9, transform: active ? `scale(${1 + pulse * 0.28})` : undefined }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: active ? accent : "transparent", border: `1.5px solid ${active || passed ? accent : rgba(K.white, 0.4)}`, boxShadow: active ? `0 0 14px ${accent}` : undefined }} />
              <span style={{ fontFamily: old ? SERIF_FONT : FONT_FAMILY, fontSize: 25, fontWeight: old ? 800 : active ? 800 : 600, letterSpacing: "0.04em", color: active ? (old ? K.cream : K.white) : passed ? rgba(accent, 0.75) : rgba(K.white, 0.42), textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const WHIPS: Array<[number, 1 | -1]> = [
  [T.record, 1],
  [T.edb, -1],
  [T.ai, 1],
];

export const Cinematic: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const frame = useCurrentFrame();

  // 화면비 — 어제는 4:3, 임팩트에서 2.39:1 로 열리고, 엔드카드에서 풀 프레임
  const pillars = interpolate(frame, [T.reveal, T.reveal + 10], [PILLAR_W, 0], { ...cl, easing: Easing.out(Easing.exp) });
  const bars = frame < T.end ? interpolate(frame, [T.reveal, T.reveal + 10], [0, BAR_H], { ...cl, easing: Easing.out(Easing.exp) }) : interpolate(frame, [T.end, T.end + 18], [BAR_H, 0], { ...cl, easing: Easing.out(Easing.cubic) });

  // 임팩트 1 — 보드가 드러나는 순간의 플레어
  const hit1 = interpolate(frame, [T.reveal - 1, T.reveal, T.reveal + 6, T.reveal + 26], [0, 1.3, 0.55, 0], cl);
  const hit1x = interpolate(frame, [T.reveal, T.reveal + 26], [W * 0.5, W * 0.46], { ...cl, easing: Easing.out(Easing.exp) });
  // 보드 윗변에 남는 작은 글린트
  const glint = interpolate(frame, [T.reveal + 30, T.reveal + 50, T.record - 10, T.record - 3], [0, 0.34, 0.3, 0], cl) * (1 + Math.sin(frame / 7) * 0.08);
  // 내일로 넘어가는 줌 스루
  const dive = interpolate(frame, [T.next - 6, T.next, T.next + 5, T.next + 22], [0, 1.25, 0.6, 0], cl);
  // 임팩트 2 — 로고
  const hit2 = interpolate(frame, [T.end - 1, T.end, T.end + 9, T.end + 40, T.total - 16, T.total - 2], [0, 1.4, 0.8, 0.3, 0.24, 0], cl) * (1 + Math.sin(frame / 9) * 0.06);
  // 블룸 — 내일은 조금 더 빛나고, 엔드카드는 글자를 또렷하게
  const bloom = interpolate(frame, [T.reveal, T.reveal + 6, T.next - 4, T.next + 6, T.end, T.end + 20], [0.3, 0.36, 0.36, 0.42, 0.42, 0.2], cl);
  // 그레인 — 어제는 거칠게, 오늘·내일은 곱게
  const grain = interpolate(frame, [T.reveal - 1, T.reveal + 6], [0.62, 0.26], cl);
  const fadeOut = interpolate(frame, [T.total - 13, T.total - 1], [0, 1], cl);

  return (
    <AbsoluteFill style={{ background: K.stage, fontFamily: FONT_FAMILY }}>
      <AbsoluteFill style={{ transform: shake(frame, HITS) }}>
        <Shot id="open" from={T.open} to={T.reveal}>
          <Open />
        </Shot>
        <Shot id="reveal" from={T.reveal} to={T.record} outDir={1}>
          <Reveal />
        </Shot>
        <Shot id="record" from={T.record} to={T.edb} inDir={1} outDir={-1}>
          <ProofRecord />
        </Shot>
        <Shot id="edb" from={T.edb} to={T.next} inDir={-1} outZoom>
          <ProofEdb />
        </Shot>
        <Shot id="next" from={T.next} to={T.ai} inZoom outDir={1}>
          <Tomorrow />
        </Shot>
        <Shot id="ai" from={T.ai} to={T.end} inDir={1}>
          <TomorrowAi />
        </Shot>
        <Shot id="end" from={T.end} to={T.total}>
          <End />
        </Shot>
      </AbsoluteFill>

      {/* ── 렌즈·필름 레이어 ── */}
      <Bloom amount={bloom} radius={20} />
      <Flare x={hit1x} y={H * 0.47} power={hit1} length={2300} />
      <Flare x={interpolate(frame, [T.reveal + 30, T.record], [1060, 1010])} y={interpolate(frame, [T.reveal + 30, T.record], [250, 256])} power={glint} length={900} core={0.3} ghosts={false} />
      {WHIPS.map(([c, dir]) => {
        const pw = interpolate(frame, [c - 5, c, c + 8], [0, 0.8, 0], cl);
        return <Flare key={c} x={W / 2 + dir * (frame - c) * 70} y={H * 0.5} power={pw} length={2600} core={0.5} ghosts={false} color={c >= T.next ? K.holo : K.mint} />;
      })}
      <Flare x={W / 2} y={H / 2} power={dive} length={2400} core={1.2} color={K.holo} />
      <Flare x={W / 2} y={253} power={hit2} length={2200} core={0.8} />
      {WHIPS.map(([c, dir]) => (
        <LightLeak key={c} at={c} dir={dir} strength={0.5} color={c >= T.next ? K.holo : K.mint} />
      ))}
      <Flash at={T.reveal} strength={0.5} dur={7} />
      <Flash at={T.next - 1} strength={0.28} dur={6} color={K.ice} />
      <Flash at={T.end} strength={0.46} dur={5} />
      <Vignette strength={0.62} />
      <FilmGrain opacity={grain} />
      <EraBar y={bars + (frame < T.reveal ? 52 : 30)} />
      <Letterbox h={bars} />
      <Pillarbox w={pillars} />
      {fadeOut > 0 && <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />}

      {audio && <Audio src={staticFile("audio/cinematic-score.m4a")} />}
    </AbsoluteFill>
  );
};
