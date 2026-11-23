import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Board } from "../Board";
import { Lesson, LESSON_FULL } from "../Chalk";
import { Dust, Stage, cl } from "../fx";
import { FONT, FadeIn, Hairline, LineUp, SweepText, Tracked } from "../type";
import { BOARD, H, K, W, rgba } from "../theme";

// 오늘 (120–240f) — 임팩트. 필름이 컬러·와이드로 열리고, 카메라가 빠지며 Classin Board 가 드러난다. 지워진 판서가 빛으로 되살아난다.

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const PERSP = 1700;
const BW = BOARD.w;

/** 되살아나는 판서 — 왼쪽에서 오른쪽으로 스캔 */
const RestoredLesson: React.FC<{ f: number; id: string }> = ({ f, id }) => {
  const wipe = interpolate(f, [10, 44], [-0.06, 1.08], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const tint = interpolate(f, [10, 40, 86], [1, 1, 0.16], cl);
  const edge = wipe * BOARD.sw;
  const scan = interpolate(f, [10, 14, 42, 48], [0, 1, 1, 0], cl);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, filter: "blur(5px)" }}>
        <Lesson id={`${id}-ghost`} p={LESSON_FULL} rough={false} />
      </div>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `linear-gradient(90deg, #000 ${edge - 70}px, transparent ${edge}px)` }}>
        <Lesson id={`${id}-live`} p={LESSON_FULL} tint={tint} />
      </div>
      {/* 스캔 라인 */}
      <div style={{ position: "absolute", left: edge - 150, top: 0, width: 150, height: BOARD.sh, opacity: scan, background: `linear-gradient(90deg, transparent, ${rgba(K.mint, 0.22)} 80%, ${rgba(K.mintHot, 0.9)} 100%)`, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: edge - 2, top: 0, width: 4, height: BOARD.sh, opacity: scan, background: "#fff", boxShadow: `0 0 26px 6px ${rgba(K.mint, 0.9)}` }} />
    </>
  );
};

export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 48], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
  const late = Math.max(0, f - 24);
  const z = lerp(640, -700, p) - late * 0.7;
  const x = lerp(0, 505, p) - late * 0.22;
  const y = lerp(-20, -34, p);
  const ry = lerp(0, -18, p) + late * 0.03;
  const rx = lerp(0, 2.2, p);
  const stageIn = interpolate(f, [0, 30], [0, 1], cl);

  return (
    <Stage glowX={0.68} glowY={0.5} glow={stageIn * 0.95}>
      <Dust count={80} seed="rv" px={-p * 340 - late * 0.6} py={p * 30} opacity={0.85} />

      {/* 3D 무대 */}
      <AbsoluteFill style={{ perspective: PERSP, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: (W - BW) / 2, top: (H - BOARD.h) / 2, width: BW, height: BOARD.h, transformStyle: "preserve-3d", transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg)` }}>
          {/* 바닥 반사 */}
          <div style={{ position: "absolute", left: 0, top: BOARD.h - 118 + 8, width: BW, height: BOARD.h, transform: "scaleY(-1)", opacity: 0.2 * p, filter: "blur(4px)", WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 46%)" }}>
            <Board id="rv-ref" width={BW} glare={0} rim={0.4}>
              <Lesson id="rv-ref-lesson" p={LESSON_FULL} rough={false} tint={0.3} opacity={interpolate(f, [30, 50], [0, 1], cl)} />
            </Board>
          </div>
          <Board id="rv" width={BW} glare={0.25 + p * 0.5} rim={0.35 + p * 0.65}>
            <RestoredLesson f={f} id="rv-lesson" />
          </Board>
        </div>
      </AbsoluteFill>

      {/* 바닥 빛 */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: p * 0.9, background: `radial-gradient(ellipse 34% 7% at 68% 80.5%, ${rgba(K.mint, 0.32)} 0%, transparent 100%)` }} />

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 150, top: 0, height: H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FadeIn at={6} y={0} x={-14}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: K.mint, letterSpacing: "0.02em" }}>오늘</span>
            <Hairline at={7} width={56} />
            <Tracked size={21} color={K.dim} spacing={0.26}>
              Today
            </Tracked>
          </div>
        </FadeIn>
        <FadeIn at={4} y={10}>
          <div style={{ fontFamily: FONT, fontSize: 50, fontWeight: 500, color: "rgba(244,246,242,0.8)", letterSpacing: "-0.015em", marginBottom: 12 }}>오늘의 수업은,</div>
        </FadeIn>
        <div style={{ fontFamily: FONT, fontSize: 184, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1.06, textShadow: "0 10px 60px rgba(0,0,0,0.6)" }}>
          <LineUp at={8}>
            <SweepText at={16} dur={34}>
              남습니다.
            </SweepText>
          </LineUp>
        </div>
        <Hairline at={30} width={560} dur={26} color={rgba(K.white, 0.5)} style={{ marginTop: 34 }} />
        <FadeIn at={36} y={12} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: FONT, fontSize: 35, fontWeight: 500, color: "rgba(244,246,242,0.78)", letterSpacing: "-0.02em", lineHeight: 1.5 }}>
            칠판은 지워져도,
            <br />
            판서는 <b style={{ color: K.white, fontWeight: 700 }}>교안</b>으로, 수업은 <b style={{ color: K.white, fontWeight: 700 }}>녹화</b>로.
          </div>
        </FadeIn>
      </div>
    </Stage>
  );
};
