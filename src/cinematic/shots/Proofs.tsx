import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Board } from "../Board";
import { Lesson, LESSON_FULL, Slate } from "../Chalk";
import { Dust, Stage, cl } from "../fx";
import { FONT, FadeIn, Hairline, LineUp, Tracked } from "../type";
import { BAR_H, BOARD, H, K, W, rgba } from "../theme";

// 오늘 (240–360f) — 수업이 남는 두 가지 방식. 한 마디(60f)에 하나씩.

const SOFT = { damping: 200, stiffness: 120, mass: 0.9 };
const POP = { damping: 16, stiffness: 190, mass: 0.8 };

const ProofText: React.FC<{ side: "left" | "right"; era: string; en: string; title: string; sub: React.ReactNode }> = ({ side, era, en, title, sub }) => (
  <div style={{ position: "absolute", left: side === "left" ? 150 : 1182, top: 0, width: 680, height: H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <FadeIn at={2} y={0} x={side === "left" ? -16 : 16} dur={10}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: K.mint, letterSpacing: "0.02em" }}>{era}</span>
        <Hairline at={3} width={56} dur={14} />
        <Tracked size={21} color={K.dim} spacing={0.26}>
          {en}
        </Tracked>
      </div>
    </FadeIn>
    <div style={{ fontFamily: FONT, fontSize: 128, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1.08, whiteSpace: "nowrap", textShadow: "0 10px 50px rgba(0,0,0,0.6)" }}>
      <LineUp at={4} dur={18}>
        {title}
      </LineUp>
    </div>
    <FadeIn at={13} y={12} dur={12} style={{ marginTop: 24 }}>
      <div style={{ fontFamily: FONT, fontSize: 37, fontWeight: 500, color: "rgba(244,246,242,0.76)", letterSpacing: "-0.02em", lineHeight: 1.45 }}>{sub}</div>
    </FadeIn>
  </div>
);

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <b style={{ color: K.white, fontWeight: 700 }}>{children}</b>;

/* ───────── 오늘 ① 자동 녹화 — 카메라 뷰파인더 ───────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

const Bracket: React.FC<{ x: number; y: number; w: number; h: number; len?: number; color?: string; t?: number; grow?: number }> = ({ x, y, w, h, len = 34, color = K.white, t = 3, grow = 1 }) => {
  const l = len * grow;
  const c = (sx: number, sy: number, key: string) => (
    <g key={key} transform={`translate(${sx ? x + w : x} ${sy ? y + h : y}) scale(${sx ? -1 : 1} ${sy ? -1 : 1})`}>
      <path d={`M0 ${l} L0 0 L${l} 0`} stroke={color} strokeWidth={t} fill="none" strokeLinecap="square" />
    </g>
  );
  return (
    <>
      {c(0, 0, "a")}
      {c(1, 0, "b")}
      {c(0, 1, "c")}
      {c(1, 1, "d")}
    </>
  );
};

export const ProofRecord: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(f, [0, 60], [0, 1]);
  const stop = 44; // 수업 종료 — 타임코드가 45:00 에 멈춘다
  const total = 45 * 60 * 30 - Math.max(0, stop - f); // 30fps 타임코드
  const mm = Math.floor(total / 30 / 60);
  const ss = Math.floor(total / 30) % 60;
  const ff = total % 30;
  const saved = spring({ frame: f - stop, fps, config: POP });
  const blink = f < stop ? (Math.floor(f / 8) % 2 === 0 ? 1 : 0.25) : 1;
  const hud = interpolate(f, [2, 9], [0, 1], cl);
  const lock = spring({ frame: f - 8, fps, config: SOFT, durationInFrames: 16 });
  const bw = 1060;
  const bh = (bw * BOARD.h) / BOARD.w;

  return (
    <Stage glowX={0.32} glowY={0.5} glow={0.9}>
      <Dust count={60} seed="p1" px={-push * 60} opacity={0.7} />
      <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "42% 50%" }}>
        <div style={{ position: "absolute", left: 70, top: (H - bh) / 2 + 4, width: bw, height: bh, transformStyle: "preserve-3d", transform: `translate3d(${push * -18}px, 0, ${push * 46}px) rotateY(${17 - push * 2.5}deg) rotateX(1.5deg)` }}>
          <Board id="p1" width={bw} glare={0.7} rim={1}>
            <Lesson id="p1-lesson" p={LESSON_FULL} tint={0.12} />
            {/* AI 카메라 PIP */}
            <div style={{ position: "absolute", right: 30, top: 28, width: 250, height: 146, borderRadius: 10, overflow: "hidden", border: `2px solid ${rgba(K.mint, 0.8)}`, background: "linear-gradient(160deg, #1d3a31 0%, #0c1a16 100%)", opacity: hud }}>
              <div style={{ position: "absolute", left: 96, top: 30, width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(180deg, #d8e6df, #8fa69c)" }} />
              <div style={{ position: "absolute", left: 60, top: 92, width: 126, height: 90, borderRadius: "50% 50% 0 0", background: "linear-gradient(180deg, #4b9c80, #1f5b47)" }} />
              <div style={{ position: "absolute", left: 10, bottom: 8, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: K.white, background: "rgba(0,0,0,0.5)", padding: "2px 9px", borderRadius: 5 }}>AI 카메라</div>
            </div>
          </Board>
        </div>
      </AbsoluteFill>

      {/* 뷰파인더 HUD — 화면 전체가 카메라 시점 */}
      <AbsoluteFill style={{ opacity: hud }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <Bracket x={84} y={BAR_H + 44} w={W - 168} h={H - BAR_H * 2 - 88} len={46} color={rgba(K.white, 0.7)} t={2.5} />
          {/* 피사체 추적 박스 */}
          <g opacity={lock} transform={`translate(${(1 - lock) * -30} 0)`}>
            <Bracket x={96 - (1 - lock) * 60} y={212 - (1 - lock) * 40} w={1090 + (1 - lock) * 120} h={660 + (1 - lock) * 80} len={30} color={K.mint} t={3.5} />
          </g>
          {/* 중앙 십자 */}
          <path d={`M${W / 2 - 14} ${H / 2} H${W / 2 + 14} M${W / 2} ${H / 2 - 14} V${H / 2 + 14}`} stroke={rgba(K.white, 0.4)} strokeWidth={1.5} />
        </svg>
        {/* REC + 타임코드 */}
        <div style={{ position: "absolute", right: 128, top: BAR_H + 70, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", background: f < stop ? K.rec : K.mint, opacity: blink, boxShadow: `0 0 18px ${f < stop ? K.rec : K.mint}` }} />
          <span style={{ fontSize: 26, fontWeight: 800, color: f < stop ? K.rec : K.mint, letterSpacing: "0.12em" }}>{f < stop ? "REC" : "SAVED"}</span>
          <span style={{ fontSize: 30, fontWeight: 600, color: K.white, letterSpacing: "0.04em", marginLeft: 8 }}>
            00:{pad2(mm)}:{pad2(ss)}:{pad2(ff)}
          </span>
        </div>
        <div style={{ position: "absolute", right: 128, bottom: BAR_H + 68, fontFamily: FONT, fontSize: 22, fontWeight: 600, color: K.dim, letterSpacing: "0.1em" }}>칠판 화면 + AI 카메라 동시 녹화</div>
      </AbsoluteFill>

      {/* 저장 완료 토스트 */}
      <div style={{ position: "absolute", left: 400, top: 800, opacity: Math.min(1, saved * 1.5), transform: `translateY(${(1 - saved) * 26}px) scale(${0.9 + saved * 0.1})`, display: "flex", alignItems: "center", gap: 14, background: "rgba(8,18,15,0.82)", border: `1.5px solid ${rgba(K.mint, 0.7)}`, borderRadius: 14, padding: "14px 24px", boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${rgba(K.mint, 0.18)}` }}>
        <svg width={30} height={30} viewBox="0 0 30 30">
          <circle cx={15} cy={15} r={14} fill={K.mint} />
          <path d="M8.5 15.5 L13 20 L21.5 10.5" stroke={K.forest} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: K.white, letterSpacing: "-0.02em" }}>클라우드에 자동 저장</span>
      </div>

      <ProofText
        side="right"
        era="오늘"
        en="Auto Recording"
        title="자동 녹화"
        sub={
          <>
            수업만 하면, 녹화가
            <br />
            <Strong>저절로 쌓입니다.</Strong>
          </>
        }
      />
    </Stage>
  );
};

/* ───────── 오늘 ② EDB 교안 — 판서가 페이지로 떠올라 파일이 된다 ───────── */

const PAGES = 4;

export const ProofEdb: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(f, [0, 60], [0, 1]);
  const bw = 960;
  const k = bw / BOARD.w;
  const bh = BOARD.h * k;
  const sw = BOARD.sw * k;
  const sh = BOARD.sh * k;
  const chip = spring({ frame: f - 38, fps, config: POP });

  return (
    <Stage glowX={0.66} glowY={0.5} glow={0.9}>
      <Dust count={60} seed="p3" px={push * 60} opacity={0.7} />
      <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: "60% 46%" }}>
        <div style={{ position: "absolute", left: W - bw - 20, top: (H - bh) / 2 + 40, width: bw, height: bh, transformStyle: "preserve-3d", transform: `translate3d(${push * 14}px, 0, ${push * 30 - 120}px) rotateY(${-(26 - push * 3)}deg) rotateX(6deg)` }}>
          <Board id="p3" width={bw} glare={0.5} rim={0.9} lit={0.55}>
            <Lesson id="p3-lesson" p={LESSON_FULL} tint={0.1} rough={false} />
          </Board>
          {/* 떠오르는 페이지들 */}
          {Array.from({ length: PAGES }).map((_, i) => {
            const s = spring({ frame: f - 6 - i * 6, fps, config: SOFT, durationInFrames: 26 });
            const top = i === PAGES - 1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: BOARD.sx * k,
                  top: BOARD.sy * k,
                  width: sw,
                  height: sh,
                  transform: `translate3d(${-s * (26 + i * 50)}px, ${s * -(12 + i * 26)}px, ${s * (60 + i * 78)}px)`,
                  opacity: Math.min(1, s * 2) * (top ? 1 : 0.88),
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1.5px solid ${rgba(K.mint, top ? 0.9 : 0.4)}`,
                  boxShadow: `0 30px 70px rgba(0,0,0,0.55)${top ? `, 0 0 50px ${rgba(K.mint, 0.25)}` : ""}`,
                  background: K.slate,
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, width: BOARD.sw, height: BOARD.sh, transform: `scale(${k})`, transformOrigin: "0 0" }}>
                  <Slate id={`p3-pg${i}`} />
                  <div style={{ position: "absolute", inset: 0 }}>
                    <Lesson id={`p3-pl${i}`} p={LESSON_FULL} rough={top} tint={top ? 0.28 : 0} opacity={top ? 1 : 0.5} />
                  </div>
                  {/* 페이지 헤더 */}
                  <div style={{ position: "absolute", left: 0, bottom: 0, width: BOARD.sw, height: 58, background: "rgba(3,8,6,0.72)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontFamily: FONT, fontSize: 24, fontWeight: 700, color: K.dim, letterSpacing: "0.06em" }}>
                    <span style={{ color: K.mint }}>EDB</span>
                    <span>PAGE {pad2(i + 1)} / 04</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* 파일 칩 */}
      <div style={{ position: "absolute", left: 930, top: 812, opacity: Math.min(1, chip * 1.5), transform: `translateY(${(1 - chip) * 26}px) scale(${0.9 + chip * 0.1})`, display: "flex", alignItems: "center", gap: 16, background: "rgba(8,18,15,0.86)", border: `1.5px solid ${rgba(K.mint, 0.7)}`, borderRadius: 14, padding: "14px 24px", boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${rgba(K.mint, 0.18)}` }}>
        <svg width={30} height={36} viewBox="0 0 30 36">
          <path d="M3 1.5 H19 L27.5 10 V34.5 H3 Z" fill="none" stroke={K.mint} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M19 1.5 V10 H27.5" fill="none" stroke={K.mint} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M8.5 19 H21.5 M8.5 25 H18" stroke={K.mint} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: K.white, letterSpacing: "-0.02em" }}>이차함수의 그래프.edb</span>
        <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: K.mint, marginLeft: 4 }}>코스 파일로 저장</span>
      </div>

      <ProofText
        side="left"
        era="오늘"
        en="EDB Lesson File"
        title="EDB 교안"
        sub={
          <>
            판서가 교안 파일로.
            <br />
            <Strong>누가 들어가도, 같은 수업.</Strong>
          </>
        }
      />
    </Stage>
  );
};
