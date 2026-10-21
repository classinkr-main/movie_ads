import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Camera, GraphPaper } from "../components/Stage";
import { Cutout, Tape } from "../components/Media";
import { HandArrow, HandCircle, Highlighter, Stamp, Tag } from "../components/Marks";
import { Caption, Typewriter } from "../components/Type";
import { C, CUES, FONT, H } from "../lib/theme";
import { clamp, ease, prog } from "../lib/motion";

// S1 훅 + S2 상실 (0–240f) — 파스텔 연두 모눈종이 지면 위 Vox식 해설.
// 위쪽 지면(0–1080)에 질문을 타이핑하고, 카메라가 아래 지면(1080–2160)으로 휩 팬해 실제 학원 사진에 주석을 단다.
// 206f에 불이 꺼지고 "미래의 학원은,"이 찍힌 뒤 240f 드롭으로 넘어간다.

const T = CUES.typing;
const L = CUES.loss;
const HK = CUES.hook;

// 사진 컷아웃 배치(지면 좌표). 사진 원본 1800×811
const PHOTO = { x: 300, y: H + 170, w: 1320, border: 16 };
const IMG_W = PHOTO.w - PHOTO.border * 2;
const IMG_H = Math.round(IMG_W / (1800 / 811));
const PHOTO_H = IMG_H + PHOTO.border * 2;
const ix = (u: number) => PHOTO.x + PHOTO.border + u * IMG_W; // 사진 안 상대좌표 → 지면 좌표
const iy = (v: number) => PHOTO.y + PHOTO.border + v * IMG_H;

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const a = prog(frame, 0, 18);
  return (
    <div style={{ opacity: 0.35 + 0.65 * a }}>
      <div style={{ position: "absolute", left: 120, top: 76, display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, letterSpacing: "0.22em", color: C.cobalt }}>FIELD NOTES</span>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, color: C.signal }}>No.05</span>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, color: C.ink, marginLeft: 10 }}>학원 편</span>
      </div>
      <Caption size={20} style={{ position: "absolute", right: 120, top: 80, color: C.ink, opacity: 0.55 }}>
        CLASSIN · 수업 시스템 OS
      </Caption>
      <div style={{ position: "absolute", left: 120, right: 120, top: 128, height: 2, background: C.ink, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 136, height: 1, background: C.ink, opacity: 0.35 }} />
    </div>
  );
};

const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const base: React.CSSProperties = { fontFamily: FONT.display, fontSize: 138, lineHeight: 1.18, letterSpacing: "-0.035em", color: C.ink };
  // 2행을 세 토막으로 나눠 "어디로"에 형광펜, "?"에 동그라미를 단다(타이밍은 cues.json 그대로)
  const s1 = "수업은 ";
  const s2 = "어디로";
  const s3 = " 갈까";
  const st2 = T.hook2.start + Array.from(s1).length * T.hook2.step;
  const st3 = st2 + Array.from(s2).length * T.hook2.step;
  const stQ = st3 + Array.from(s3).length * T.hook2.step;
  return (
    <div style={{ position: "absolute", left: 150, top: 330 }}>
      <Caption size={22} color={C.signal} style={{ marginBottom: 26, opacity: prog(frame, 6, 16) }}>
        Q.01 ─────
      </Caption>
      <div style={{ ...base, fontWeight: 560 }}>
        <Typewriter text={T.hook1.text} start={T.hook1.start} step={T.hook1.step} caretUntil={T.hook2.start} />
      </div>
      <div style={{ ...base, fontWeight: 820 }}>
        <Typewriter text={s1} start={T.hook2.start} step={T.hook2.step} caretUntil={st2} />
        <span style={{ position: "relative", display: "inline-block" }}>
          <Highlighter x={-12} y="18%" w="calc(100% + 24px)" h="72%" start={HK.highlight} dur={10} />
          <span style={{ position: "relative" }}>
            <Typewriter text={s2} start={st2} step={T.hook2.step} caretUntil={st3} />
          </span>
        </span>
        <Typewriter text={s3} start={st3} step={T.hook2.step} caretUntil={stQ} />
        <span style={{ position: "relative", display: "inline-block" }}>
          <Typewriter text="?" start={stQ} step={T.hook2.step} />
          <div style={{ position: "absolute", left: "50%", top: "52%", width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -110, top: -110 }}>
              <HandCircle cx={110} cy={110} rx={82} ry={92} start={HK.circle} dur={12} w={220} h={220} width={8} seed="q" />
            </div>
          </div>
        </span>
      </div>
    </div>
  );
};

const Ruler: React.FC = () => (
  <div style={{ position: "absolute", left: 120, right: 120, top: 952, height: 40 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: C.ink, opacity: 0.5 }} />
    {Array.from({ length: 84 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: `${(i / 83) * 100}%`, top: 0, width: 2, height: i % 5 === 0 ? 18 : 9, background: C.ink, opacity: 0.45 }} />
    ))}
    <Caption size={18} style={{ position: "absolute", right: 0, top: 26, color: C.ink, opacity: 0.5 }}>
      p.01
    </Caption>
  </div>
);

// 왼쪽 칠판을 지우개가 훑고 지나가며 판서를 지운다
const Eraser: React.FC = () => {
  const frame = useCurrentFrame();
  const [e0, e1] = L.erase;
  const p = prog(frame, e0, e1, ease.inOut);
  if (frame < e0 - 2) return null;
  const bx0 = ix(0.452);
  const bx1 = ix(0.612);
  const by0 = iy(0.075);
  const by1 = iy(0.415);
  const front = bx0 + (bx1 - bx0) * p;
  const zig = Math.sin((frame - e0) * 0.9) * (by1 - by0) * 0.32;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: bx0,
          top: by0,
          width: front - bx0,
          height: by1 - by0,
          background: "linear-gradient(90deg, #2B2D31 0%, #34363B 55%, #2E3034 100%)",
          boxShadow: "inset 0 0 18px rgba(255,255,255,0.06)",
          opacity: 0.97,
        }}
      />
      {p < 1 && (
        <div
          style={{
            position: "absolute",
            left: front - 46,
            top: (by0 + by1) / 2 + zig - 26,
            width: 92,
            height: 52,
            borderRadius: 8,
            background: "linear-gradient(180deg, #F2F4F8 0%, #F2F4F8 42%, #9AA0B4 43%, #6D7389 100%)",
            boxShadow: "0 8px 16px rgba(10,11,20,0.35)",
            transform: `rotate(${Math.sin((frame - e0) * 0.9) * 8}deg)`,
          }}
        />
      )}
    </>
  );
};

// 선생님 옆 말풍선 — 설명이 점으로 흩어져 날아간다
const Bubble: React.FC = () => {
  const frame = useCurrentFrame();
  const start = L.label2 - 6;
  if (frame < start) return null;
  const pop = prog(frame, start, start + 6, ease.outBack);
  const scatter = prog(frame, L.scatter, L.scatter + 26, ease.out);
  const bx = ix(0.865);
  const by = iy(0.06);
  const lines = [150, 118, 136];
  return (
    <div style={{ position: "absolute", left: bx, top: by }}>
      <div
        style={{
          position: "absolute",
          width: 210,
          height: 118,
          borderRadius: 26,
          background: C.white,
          boxShadow: "0 10px 24px rgba(10,11,20,0.25)",
          transform: `scale(${pop})`,
          transformOrigin: "0% 100%",
          opacity: 1 - scatter * 0.85,
        }}
      >
        {lines.map((w, i) => (
          <div key={i} style={{ position: "absolute", left: 26, top: 24 + i * 26, width: w * (1 - scatter), height: 11, borderRadius: 6, background: C.ink, opacity: 0.75 }} />
        ))}
      </div>
      {scatter > 0 &&
        Array.from({ length: 26 }, (_, i) => {
          const r0x = 26 + random(`bx${i}`) * 150;
          const r0y = 24 + Math.floor(random(`by${i}`) * 3) * 26;
          const dx = (80 + random(`bdx${i}`) * 320) * scatter;
          const dy = (-60 - random(`bdy${i}`) * 220) * scatter;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: r0x + dx,
                top: r0y + dy,
                width: 10,
                height: 10,
                background: i % 3 === 0 ? C.signal : C.ink,
                opacity: (1 - scatter) * 0.9,
                transform: `rotate(${scatter * 220 * (random(`br${i}`) - 0.5)}deg)`,
              }}
            />
          );
        })}
    </div>
  );
};

const LossBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const land = interpolate(frame, [L.whip + 4, L.land], [1, 0], { ...clamp, easing: ease.out });
  const vanish = prog(frame, L.stamp + 4, L.lightsOff + 6, ease.in);
  const dots = interpolate(frame, [L.stamp + 2, L.stamp + 10, L.lightsOff + 4], [0, 1, 0.6], clamp);
  const rot = -1.6 + land * -3 + vanish * 2.5;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${land * 60 + vanish * 40}px)`, opacity: 1 - vanish * 0.25 }}>
        <Cutout x={PHOTO.x} y={PHOTO.y} w={PHOTO.w} h={PHOTO_H} rotate={rot} border={PHOTO.border}>
          <Img
            src={staticFile("photos/case-busan.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: `grayscale(1) contrast(1.15) brightness(${1.04 - vanish * 0.1})`, opacity: 1 - dots * 0.85 }}
          />
          <Img src={staticFile("photos/case-busan-dots.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: dots, filter: "brightness(0)" }} />
        </Cutout>
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${PHOTO.x + PHOTO.w / 2}px ${PHOTO.y + PHOTO_H / 2}px` }}>
          <Eraser />
          <Bubble />
        </div>
        <Tape x={PHOTO.x + 60} y={PHOTO.y + 6} rotate={-28} w={170} />
        <Tape x={PHOTO.x + PHOTO.w - 50} y={PHOTO.y + 10} rotate={24} w={170} color="rgba(47,60,255,0.72)" />
      </div>
      <HandCircle cx={ix(0.535)} cy={iy(0.245)} rx={175} ry={128} start={L.circle} dur={12} h={2160} seed="board" tilt={-6} />
      <Tag x={ix(0.43)} y={PHOTO.y - 44} start={L.label1} index="01" text="판서는, 지워지고" rotate={-2.5} anchor="right" />
      <HandArrow from={[ix(0.86) + 120, PHOTO.y + PHOTO_H + 70]} to={[ix(0.8), iy(0.43)]} bend={-0.18} start={L.arrow} dur={12} h={2160} />
      <Tag x={ix(0.86) + 40} y={PHOTO.y + PHOTO_H + 96} start={L.label2} index="02" text="설명은, 흩어지고" rotate={1.5} anchor="center" />
      <Tag x={PHOTO.x + 40} y={PHOTO.y + PHOTO_H + 96} start={L.label3} index="03" text="노하우는, 퇴근한다" rotate={-1.5} />
      <Stamp x={ix(0.3)} y={iy(0.55)} start={L.stamp} text="퇴근" sub="KNOW-HOW · OFF" size={150} rotate={-13} />
    </>
  );
};

// 소등 → 잉크 화면 위에 "미래의 학원은," 타이핑
const LightsOff: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, L.lightsOff, L.lightsOff + 8, ease.inExpo);
  if (frame < L.lightsOff) return null;
  return (
    <AbsoluteFill style={{ transform: `translateY(${(p - 1) * 100}%)`, background: C.ink }}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 112, letterSpacing: "-0.03em", color: C.white }}>
          <Typewriter text={T.pre.text} start={T.pre.start} step={T.pre.step} caretColor={C.signal} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  // 카메라: 시작 줌아웃 → 휩 팬(아래 지면) → 천천히 밀고 들어감
  const settle = interpolate(frame, [0, 54], [1.12, 1], { ...clamp, easing: ease.outQuint });
  const drift = interpolate(frame, [54, L.whip], [1, 1.025], clamp);
  const whip = interpolate(frame, [L.whip, L.whip + 14], [0, 1], { ...clamp, easing: ease.inOut });
  const push = interpolate(frame, [L.whip + 14, L.lightsOff + 8], [1, 1.07], { ...clamp, easing: ease.inOut });
  const blurAmt = Math.sin(whip * Math.PI) * 26;
  const scale = frame < L.whip ? settle * drift : push * (1 + Math.sin(whip * Math.PI) * 0.04);
  const originY = 540 + whip * (H + 20);
  return (
    <AbsoluteFill style={{ background: C.limeLight, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whipblur">
          <feGaussianBlur stdDeviation={`0 ${blurAmt.toFixed(2)}`} />
        </filter>
      </svg>
      <Camera y={-whip * H} scale={scale} originY={originY}>
        <div style={{ position: "absolute", inset: 0, filter: blurAmt > 0.3 ? "url(#whipblur)" : undefined }}>
          <GraphPaper height={H * 2}>
            <Header />
            <Question />
            <Ruler />
            <LossBoard />
          </GraphPaper>
        </div>
      </Camera>
      <LightsOff />
    </AbsoluteFill>
  );
};
