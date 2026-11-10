import React from "react";
import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { Chars, Highlighter } from "../../../shared/brand/Flourish";
import { Chip, Eyebrow, LogoMark, Rise, Sticker } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";
import { tx } from "./TmLayout";

// S1 — 훅: "지난주 우리 학원 수업, 몇 개나 보셨나요?"
// 아래에는 32개의 뿌연 '교실 창'이 깔리고, 그중 2개만 참관으로 켜진다.
const COLS = 8;
const ROWS = 4;
const TILE_W = 120;
const TILE_H = 78;
const GAP = 12;
const SEEN = new Set([5, 19]); // 직접 본 수업 2회
const WALL_IN = 26;
const LIT_AT = 88;
const DIM_AT = 92;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = sp(frame, fps, { damping: 12, stiffness: 140, mass: 1 });
  const dim = interpolate(frame, [DIM_AT, DIM_AT + 16], [0, 1], clamp);
  const ghost = sp(frame - 6, fps, SMOOTH, 80);

  return (
    <IvoryStage variant="white">
      {/* 배경 거대 "?" 아웃라인 — 질문의 무게를 우측 여백에 깔아 둔다 */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: -60,
          fontFamily: FONT_FAMILY,
          fontSize: 980,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: `2.5px ${C.limeDeep}`,
          opacity: 0.2 * ghost,
          transform: `translateY(${(1 - ghost) * 80}px) rotate(${(1 - ghost) * -6 + 4}deg)`,
          transformOrigin: "50% 50%",
          pointerEvents: "none",
        }}
      >
        ?
      </div>
      {/* 로고 + 아이브로 */}
      <div style={{ position: "absolute", left: 150, top: 118, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ transform: `translateY(${interpolate(drop, [0, 1], [-240, 0])}px)` }}>
          <LogoMark height={60} />
        </div>
        <Rise delay={8} distance={12}>
          <Eyebrow size={24} color={C.forest}>
            Classin AI · 강의 평가
          </Eyebrow>
        </Rise>
      </div>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 150, top: 196, fontFamily: FONT_FAMILY, fontSize: 112, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
        <Chars text="지난주 우리 학원 수업," delay={12} stagger={2.4} rotate={7} rise={50} />
        <br />
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 30 }}>
          <Chars text="몇 개나" delay={42} stagger={2.4} rotate={7} rise={50} />
          <Highlighter delay={70} duration={18} inset={12}>
            <Chars text="보셨나요?" delay={52} stagger={2.4} rotate={7} rise={50} style={{ color: C.forest }} />
          </Highlighter>
        </span>
      </div>

      {/* 서브 */}
      <Rise delay={78} distance={20} style={{ position: "absolute", left: 150, top: 470 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 36, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em" }}>
          원장님 혼자, <span style={{ color: C.ink, fontWeight: 700 }}>학원의 모든 수업을 참관할 수는 없습니다.</span>
        </div>
      </Rise>

      {/* 교실 창 벽 */}
      <div style={{ position: "absolute", left: 150, top: 590, width: COLS * TILE_W + (COLS - 1) * GAP, height: ROWS * TILE_H + (ROWS - 1) * GAP }}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const d = WALL_IN + col * 1.6 + row * 3;
          const s = sp(frame - d, fps, SMOOTH, 20);
          const o = interpolate(frame - d, [0, 8], [0, 1], clamp);
          const seen = SEEN.has(i);
          const lit = seen ? sp(frame - LIT_AT, fps, SMOOTH, 14) : 0;
          const frosted = seen ? 0 : dim;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * (TILE_W + GAP),
                top: row * (TILE_H + GAP),
                width: TILE_W,
                height: TILE_H,
                borderRadius: 14,
                background: seen ? interpolateColors(lit, [0, 1], [C.ivory2, C.lime]) : C.ivory2,
                border: `1.5px solid ${seen && lit > 0.5 ? C.limeDeep : C.hairline}`,
                boxSizing: "border-box",
                padding: 12,
                opacity: o * (1 - frosted * 0.5),
                filter: frosted > 0.05 ? `blur(${frosted * 1.6}px)` : undefined,
                transform: `translateY(${(1 - s) * 26}px) scale(${0.92 + s * 0.08})`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: seen && lit > 0.5 ? C.forest : C.gray300, opacity: 0.8 }} />
                <span style={{ height: 6, width: 36, borderRadius: 999, background: seen && lit > 0.5 ? "rgba(8,71,52,0.45)" : "rgba(28,27,23,0.1)" }} />
              </div>
              <div style={{ marginTop: 10, height: 6, width: "70%", borderRadius: 999, background: seen && lit > 0.5 ? "rgba(8,71,52,0.35)" : "rgba(28,27,23,0.08)" }} />
              <div style={{ marginTop: 6, height: 6, width: "48%", borderRadius: 999, background: seen && lit > 0.5 ? "rgba(8,71,52,0.35)" : "rgba(28,27,23,0.08)" }} />
              {seen && frame >= LIT_AT && (
                <div style={{ position: "absolute", right: -10, top: -14 }}>
                  <Sticker delay={LIT_AT + 2} size={15} rotate={-8}>
                    참관
                  </Sticker>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 집계 */}
      <div style={{ position: "absolute", left: 150, top: 930, display: "flex", gap: 12, alignItems: "center" }}>
        <Chip delay={100} size={20} bg={C.lime} color={C.ink}>
          직접 본 수업 2회
        </Chip>
        <Chip delay={106} size={20} bg={C.ivory2} color={C.gray}>
          보지 못한 수업 30회
        </Chip>
        <Rise delay={112} distance={10}>
          <span style={tx(20, 500, C.gray300)}>— 나머지는 강사의 말과 인상으로.</span>
        </Rise>
      </div>
    </IvoryStage>
  );
};
