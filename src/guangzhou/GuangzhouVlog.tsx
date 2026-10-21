import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../lib/theme";
import { DirBlur, Flash, Grain, LightLeak, RgbSplit, Vignette, clampX, easeIn, easeInOut, easeOut, ramp, shakeAt } from "./fx";
import { AirportShot, PhotoShot, PrintShot, VideoShot, shutterOpacity, videoSequenceFrom } from "./media";
import { EndCard, MessageOverlay, RouteMap, TitleOverlay } from "./scenes";
import { BEAT, HANDLE, SHOTS, Shot, TRANSITION, TransitionKind } from "./timeline";
import { Chip, DateStamp, DayBand, HandWrite, PopWords, Subtitle } from "./type";

/* ======================================================================
   전환 스타일 — 들어오는 컷(in)과 나가는 컷(out)을 프레임 단위로 계산한다
   ====================================================================== */
type LayerFx = { transform: string; filter: string; opacity: number; clipPath?: string; blurX: number; blurY: number; rgb: number; ring?: number };
const none = (): LayerFx => ({ transform: "", filter: "", opacity: 1, blurX: 0, blurY: 0, rgb: 0 });

const pushP = (t: number) => interpolate(t, [-4, 5], [0, 1], { ...clampX, easing: easeInOut }); // 휩 진행도(컷 = 0)
const pushV = (t: number) => {
  // 진행 속도 → 모션블러 세기
  const d = pushP(t + 0.5) - pushP(t - 0.5);
  return Math.min(1, d * 4.5);
};

const styleIn = (kind: TransitionKind, t: number): LayerFx => {
  const fx = none();
  switch (kind) {
    case "fadeBlack":
      // 첫 프레임부터 화면이 보이도록(피드 썸네일) 페이드 대신 밝기만 살짝 올라온다
      fx.filter = `brightness(${interpolate(t, [0, 4], [0.86, 1], clampX)})`;
      fx.transform = `scale(${interpolate(t, [0, 24], [1.1, 1], { ...clampX, easing: easeOut })})`;
      break;
    case "punch":
      fx.transform = `scale(${interpolate(t, [0, 7], [1.12, 1], { ...clampX, easing: easeOut })})`;
      fx.filter = `brightness(${interpolate(t, [0, 4], [1.35, 1], clampX)})`;
      break;
    case "whipLeft": {
      const p = pushP(t);
      fx.transform = `translateX(${(1 - p) * 100}%)`;
      fx.blurX = pushV(t) * 70;
      break;
    }
    case "whipUp": {
      const p = pushP(t);
      fx.transform = `translateY(${-(1 - p) * 100}%)`;
      fx.blurY = pushV(t) * 70;
      break;
    }
    case "zoomBlur":
      fx.transform = `scale(${interpolate(t, [0, 6], [1.3, 1], { ...clampX, easing: easeOut })})`;
      fx.filter = `blur(${interpolate(t, [0, 6], [14, 0], clampX)}px)`;
      break;
    case "impact":
      fx.transform = `scale(${interpolate(t, [0, 10], [1.12, 1], { ...clampX, easing: easeOut })})`;
      fx.rgb = interpolate(t, [0, 8], [18, 0], clampX);
      break;
    case "dayWipe":
      fx.transform = `scale(${interpolate(t, [0, 14], [1.1, 1], { ...clampX, easing: easeOut })})`;
      break;
    case "greenWipe": {
      const r = interpolate(t, [-10, 6], [0, 1180], { ...clampX, easing: easeInOut });
      fx.clipPath = `circle(${r}px at 50% 46%)`;
      fx.ring = r;
      break;
    }
    default:
      break;
  }
  return fx;
};

const styleOut = (kind: TransitionKind, t: number): LayerFx => {
  // t = 프레임 − 다음 컷 (컷 이전엔 음수)
  const fx = none();
  switch (kind) {
    case "whipLeft": {
      const p = pushP(t);
      fx.transform = `translateX(${-p * 100}%)`;
      fx.blurX = pushV(t) * 70;
      break;
    }
    case "whipUp": {
      const p = pushP(t);
      fx.transform = `translateY(${p * 100}%)`;
      fx.blurY = pushV(t) * 70;
      break;
    }
    case "zoomThrough":
      fx.transform = `scale(${interpolate(t, [-7, 0], [1, 1.9], { ...clampX, easing: easeIn })})`;
      fx.filter = `blur(${interpolate(t, [-7, 0], [0, 18], clampX)}px) brightness(${interpolate(t, [-7, 0], [1, 1.9], clampX)})`;
      break;
    case "zoomBlur":
      fx.transform = `scale(${interpolate(t, [-5, 0], [1, 1.35], { ...clampX, easing: easeIn })})`;
      fx.filter = `blur(${interpolate(t, [-5, 0], [0, 14], clampX)}px)`;
      break;
    case "dayWipe":
      fx.transform = `scale(${interpolate(t, [-8, 0], [1, 1.05], clampX)})`;
      break;
    case "greenWipe":
      fx.transform = `scale(${interpolate(t, [-10, 0], [1, 1.08], { ...clampX, easing: easeIn })})`;
      break;
    default:
      break;
  }
  return fx;
};

/* ======================================================================
   컷별 내용 + 컷 안에 붙는 캡션 (전환과 함께 움직인다)
   ====================================================================== */
const PRINT_STACK: Record<string, string[]> = { p_food2: ["p_food1"], p_lunch: ["p_dimsum"] };

const ShotContent: React.FC<{ shot: Shot; local: number }> = ({ shot, local }) => {
  if (shot.type === "video") {
    return (
      <Sequence from={videoSequenceFrom(shot)} durationInFrames={shot.dur + 2 * HANDLE} layout="none">
        <VideoShot shot={shot} local={local} />
      </Sequence>
    );
  }
  if (shot.id === "route") return <RouteMap local={local} />;
  if (shot.id === "end") return <EndCard local={local} />;
  if (shot.id === "p_airport") return <AirportShot local={local} dur={shot.dur} />;
  if (shot.type === "print") return <PrintShot shot={shot} local={local} stackUnder={PRINT_STACK[shot.id]} />;
  return <PhotoShot shot={shot} local={local} objectPosition={shot.id === "p_eeo" ? "40% 50%" : "50% 50%"} />;
};

const ShotDecor: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  switch (shot.id) {
    case "p_airport":
      return <TitleOverlay local={frame - shot.from} />;
    case "d1_bus":
      return <HandWrite text="광저우 도착!" at={216} to={241} y={1300} rotate={-5} />;
    case "d1_dinner":
      return <HandWrite text="환영 만찬" at={274} to={301} y={1310} rotate={-3} />;
    case "d1_redtower":
      return <Chip text="광저우 타워" at={334} to={361} />;
    case "d1_rainbow":
      return <HandWrite text="밤이 더 예쁜 광저우" at={364} to={392} y={1320} rotate={-4} size={96} />;
    case "d2_corridor":
      return <Chip text="현지 교육기관 탐방" at={438} to={466} icon="dot" />;
    case "d2_reveal":
      return <Subtitle label="현수막 번역" text="“한국 교육 교류단을 환영합니다”" at={470} to={508} y={1300} />;
    case "d2_hall":
      return <HandWrite text="강당이 꽉 찼다!" at={513} to={541} y={1310} rotate={-4} />;
    case "d2_studio":
      return <Chip text="온라인 강의 스튜디오" at={574} to={601} icon="dot" />;
    case "d2_cheer":
      return <HandWrite text="분위기 최고!" at={604} to={631} y={1330} rotate={-6} />;
    case "p_eeo":
      return <Chip text="Classin을 만든 EEO" at={648} to={661} icon="dot" />;
    case "d3_tea":
      return <HandWrite text="차 한 잔의 여유" at={707} to={721} y={1320} rotate={-4} dur={6} />;
    case "msg_class":
      return <MessageOverlay local={frame - shot.from} />;
    default:
      return null;
  }
};

const ShotStack: React.FC = () => {
  const frame = useCurrentFrame();
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((shot, j) => {
    const next = SHOTS[j + 1];
    const trIn = TRANSITION[shot.in];
    const trNext = next ? TRANSITION[next.in] : undefined;
    const visFrom = shot.from - trIn.incomingBefore;
    const visTo = shot.from + shot.dur + (trNext ? trNext.outgoingAfter : 0);
    if (frame < visFrom || frame >= visTo) return;
    const local = frame - shot.from;
    const a = styleIn(shot.in, local);
    const b = next && frame >= next.from - (trNext?.pre ?? 0) ? styleOut(next.in, frame - next.from) : none();
    const transform = [a.transform, b.transform].filter(Boolean).join(" ");
    const filter = [a.filter, b.filter].filter(Boolean).join(" ");
    const blurX = a.blurX + b.blurX;
    const blurY = a.blurY + b.blurY;
    layers.push(
      <AbsoluteFill key={shot.id} style={{ opacity: a.opacity * b.opacity, clipPath: a.clipPath, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform, filter: filter || undefined }}>
          <DirBlur id={`mb-${shot.id}`} x={blurX} y={blurY} style={{ transform: blurX + blurY > 0.3 ? "scale(1.06)" : undefined }}>
            <RgbSplit id={`rgb-${shot.id}`} amount={a.rgb}>
              <ShotContent shot={shot} local={local} />
              <ShotDecor shot={shot} />
            </RgbSplit>
          </DirBlur>
        </AbsoluteFill>
        {a.ring !== undefined && a.ring < 1170 && (
          <div style={{ position: "absolute", left: 540, top: 0.46 * 1920, width: a.ring * 2, height: a.ring * 2, borderRadius: 9999, border: `26px solid ${C.lime}`, transform: "translate(-50%,-50%)", boxSizing: "border-box" }} />
        )}
      </AbsoluteFill>,
    );
  });
  return <>{layers}</>;
};

/* ======================================================================
   전역 캡션 (컷을 가로지르는 문구)
   ====================================================================== */
const HookText: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 62) return null;
  // 퇴장: 휩 직전 글리치 — 가로 슬라이스가 엇갈리며 사라진다
  const g = ramp(frame, 54, 60, 0, 1, easeIn);
  const slices = [0, 1, 2, 3, 4];
  const block = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <PopWords text="중국 교실은" at={5} to={400} size={108} weight={800} />
      <PopWords text="지금 어디까지" at={18} to={400} size={108} weight={800} />
      <PopWords text="왔을까?" at={34} to={400} size={186} weight={900} highlight={[0]} stagger={0} />
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 40% at 50% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 70%)", opacity: ramp(frame, 0, 8) * (1 - g) }} />
      {slices.map((i) => {
        const top = 640 + i * 120;
        const dx = g > 0 ? (Math.sin(i * 7.1 + frame) * 90 + (i % 2 ? 1 : -1) * 40) * g : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, clipPath: `inset(${top}px 0 ${1920 - top - 120}px 0)`, transform: `translateX(${dx}px)`, opacity: 1 - g * 0.9 }}>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: -40 }}>
              <RgbSplit id={`hook-rgb-${i}`} amount={g * 14}>
                <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>{block}</AbsoluteFill>
              </RgbSplit>
            </AbsoluteFill>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const GlobalCaptions: React.FC = () => (
  <>
    <HookText />
    <HandWrite text="그래서, 직접 보고 왔습니다" at={66} to={88} y={1330} size={92} rotate={-5} />
    <Chip text="Classin 스마트 교실" at={663} to={704} icon="dot" />
  </>
);

/* ======================================================================
   전환 오버레이 (플래시·셔터·라이트릭·DAY 밴드) + 브랜드 버그 + 날짜 각인
   ====================================================================== */
const TransitionOverlays: React.FC = () => {
  const frame = useCurrentFrame();
  let white = 0;
  let black = 0;
  for (const s of SHOTS) {
    const t = frame - s.from;
    if (s.in === "impact") white = Math.max(white, interpolate(t, [0, 1, 8], [0.95, 0.9, 0], clampX) * (t >= 0 ? 1 : 0));
    if (s.in === "zoomThrough") white = Math.max(white, interpolate(t, [-5, 0, 7], [0, 0.85, 0], clampX));
    if (s.in === "shutter" && t >= 0 && t < 6) {
      const so = shutterOpacity(t);
      white = Math.max(white, so.white);
      black = Math.max(black, so.black);
    }
  }
  // 마지막 히트
  white = Math.max(white, interpolate(frame, [870, 871, 878], [0.4, 0.35, 0], clampX) * (frame >= 870 ? 1 : 0));
  return (
    <>
      <LightLeak start={146} len={30} from="right" />
      <LightLeak start={386} len={26} from="left" hue="lime" />
      <LightLeak start={626} len={26} from="right" />
      <LightLeak start={716} len={30} from="left" />
      <LightLeak start={744} len={26} from="right" hue="lime" />
      <DayBand cut={210} day="DAY 1" date="01.22" dow="THURSDAY" />
      <DayBand cut={390} day="DAY 2" date="01.23" dow="FRIDAY" />
      <DayBand cut={630} day="DAY 3" date="01.24" dow="SATURDAY" />
      <Flash opacity={black} color="#000" />
      <Flash opacity={white} />
    </>
  );
};

const BrandBug: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 222 || frame > 748) return null;
  const o = ramp(frame, 222, 232) * interpolate(frame, [740, 748], [1, 0], clampX);
  return (
    <div style={{ position: "absolute", right: 60, top: 300, opacity: o * 0.92 }}>
      <Img src={staticFile("brand/classin-wordmark.png")} style={{ width: 176, filter: "brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }} />
    </div>
  );
};

/* ======================================================================
   비트 펄스 — 그루브 구간에서 박자마다 화면이 살짝 튄다 (마디 첫 박은 더 크게)
   ====================================================================== */
const beatPulse = (frame: number) => {
  let k = 0;
  for (let b = 150; b < 750; b += BEAT) {
    const d = frame - b;
    if (d < 0 || d > 10) continue;
    const down = (b - 30) % (BEAT * 4) === 0;
    k += (down ? 0.026 : 0.014) * Math.exp(-d / 3);
  }
  return k;
};

/* ======================================================================
   메인 컴포지션 — 1080×1920 · 30fps · 900f
   ====================================================================== */
export const GuangzhouVlog: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = shakeAt(frame, 150, 20, 12, "a");
  const s2 = shakeAt(frame, 750, 22, 12, "b");
  const s3 = shakeAt(frame, 870, 9, 10, "c");
  const sx = s1.x + s2.x + s3.x;
  const sy = s1.y + s2.y + s3.y;
  const sr = s1.r + s2.r + s3.r;
  const shaking = Math.abs(sx) + Math.abs(sy) > 0.01;
  const pulse = 1 + beatPulse(frame);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${sr}deg) scale(${(shaking ? 1.04 : 1) * pulse})` }}>
        <ShotStack />
        <GlobalCaptions />
      </AbsoluteFill>
      <TransitionOverlays />
      <BrandBug />
      <DateStamp day="DAY 1" date="26 01 22" from={222} to={388} />
      <DateStamp day="DAY 2" date="26 01 23" from={402} to={628} />
      <DateStamp day="DAY 3" date="26 01 24" from={642} to={748} />
      <Grain opacity={frame >= 806 ? 0.04 : 0.08} />
      <Vignette strength={frame >= 812 ? 0.12 : 0.36} />
      <Audio src={staticFile("guangzhou/audio/mix.wav")} />
    </AbsoluteFill>
  );
};
