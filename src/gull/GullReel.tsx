import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Canvas, PaperFinish, Rostrum } from "./Paper";
import { MarkerWipe } from "./parts";
import { roughEllipse } from "./sketch";
import { S0Open } from "./scenes/S0Open";
import { S1Keep } from "./scenes/S1Keep";
import { S2Eval } from "./scenes/S2Eval";
import { S3Data } from "./scenes/S3Data";
import { S4Scale } from "./scenes/S4Scale";
import { S5Cta } from "./scenes/S5Cta";
import { G_DURATION, P, SCENES } from "./theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// 씬 시작 프레임
export const AT = {
  open: 0,
  keep: SCENES.open,
  evalu: SCENES.open + SCENES.keep,
  data: SCENES.open + SCENES.keep + SCENES.evalu,
  scale: SCENES.open + SCENES.keep + SCENES.evalu + SCENES.data,
  cta: SCENES.open + SCENES.keep + SCENES.evalu + SCENES.data + SCENES.scale,
} as const;

const WIPE = 12; // 덮이는 데 12f, 걷히는 데 12f

/** 마커 스와이프 전환 — cut 프레임에서 화면이 완전히 덮인다 */
const Wipe: React.FC<{ cut: number; color?: string; color2?: string; reverse?: boolean; seed: string }> = ({ cut, color, color2, reverse, seed }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [cut - WIPE, cut, cut + WIPE], [0, 1, 2], CLAMP);
  if (t <= 0 || t >= 2) return null;
  const eased = t <= 1 ? Easing.inOut(Easing.cubic)(t) : 1 + Easing.inOut(Easing.cubic)(t - 1);
  return (
    <AbsoluteFill>
      <Canvas>
        <MarkerWipe t={eased} color={color} color2={color2} reverse={reverse} seed={seed} />
      </Canvas>
    </AbsoluteFill>
  );
};

const FLIP = 20;
const IRIS = 18;

/** 손그림 아이리스 — 한 점에서 동그랗게 열리며 다음 장면이 드러난다 */
const IrisIn: React.FC<{ dur: number; cx: number; cy: number; children: React.ReactNode }> = ({ dur, cx, cy, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  if (t >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = 96 + t * 2300;
  const boil = Math.floor(frame / 3) % 3;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
      <Canvas>
        <path d={roughEllipse(cx, cy, r, r, `iris:${boil}`, { overlap: 0.05, rough: 1.2, n: 18 })} fill="none" stroke={P.noteDeep} strokeWidth={26} opacity={1 - t} />
        <path d={roughEllipse(cx, cy, r, r, `iris2:${boil}`, { overlap: 0.05, rough: 1.2, n: 18 })} fill="none" stroke={P.ink} strokeWidth={6} opacity={1 - t * 0.6} />
      </Canvas>
    </AbsoluteFill>
  );
};

/** 스케치북 장 넘김 — 위쪽 스프링을 축으로 종이가 들려 올라간다 */
const PageFlip: React.FC<{ at: number; dur: number; children: React.ReactNode }> = ({ at, dur, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + dur], [0, 1], { ...CLAMP, easing: Easing.in(Easing.quad) });
  if (t <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const angle = t * 104;
  return (
    <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 0%" }}>
      {/* 아래 장에 떨어지는 그림자 */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(42,40,35,${0.26 * (1 - t)}) 0%, rgba(42,40,35,0) ${30 + t * 60}%)` }} />
      <AbsoluteFill style={{ transformOrigin: "50% 0%", transform: `rotateX(${angle}deg)`, backfaceVisibility: "hidden", boxShadow: "0 30px 60px rgba(42,40,35,0.25)", filter: `brightness(${1 - t * 0.18})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const GullReel: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    <Rostrum>
      <Sequence from={AT.open} durationInFrames={SCENES.open}>
        <S0Open />
      </Sequence>
      <Sequence from={AT.data} durationInFrames={SCENES.data + IRIS}>
        <S3Data />
      </Sequence>
      {/* +1 → 지구: 해가 있던 자리에서 동그랗게 열린다 */}
      <Sequence from={AT.scale} durationInFrames={SCENES.scale}>
        <IrisIn dur={IRIS} cx={1700} cy={806}>
          <S4Scale />
        </IrisIn>
      </Sequence>
      <Sequence from={AT.cta} durationInFrames={SCENES.cta}>
        <S5Cta />
      </Sequence>
      <Sequence from={AT.evalu} durationInFrames={SCENES.evalu}>
        <S2Eval />
      </Sequence>
      {/* 01 → 02: 스케치북 장을 위로 넘긴다(앞 장이 위에 있어야 하므로 뒤에 그린다) */}
      <Sequence from={AT.keep} durationInFrames={SCENES.keep + FLIP}>
        <PageFlip at={SCENES.keep} dur={FLIP}>
          <S1Keep />
        </PageFlip>
      </Sequence>
      <Wipe cut={AT.keep} seed="w1" />
      <Wipe cut={AT.data} seed="w2" reverse color={P.sea} color2={P.brand} />
      <Wipe cut={AT.cta} seed="w3" />
    </Rostrum>
    <PaperFinish />
    {/* BGM·효과음 — scripts/make-audio.mjs 로 합성한다(npm run audio) */}
    <Audio src={staticFile("audio/gull-reel.m4a")} />
  </AbsoluteFill>
);

export const GULL_TOTAL = G_DURATION;
