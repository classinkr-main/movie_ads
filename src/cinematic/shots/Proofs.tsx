import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Board } from "../Board";
import { Lesson, LESSON_FULL, Slate } from "../Chalk";
import { Dust, Stage, cl } from "../fx";
import { FONT, FadeIn, Hairline, LineUp, Roll, Tracked } from "../type";
import { BAR_H, BOARD, H, K, W, rgba } from "../theme";

// S3 (240–420f) — 남는 방식 세 가지. 한 마디(60f)에 하나씩.

const SOFT = { damping: 200, stiffness: 120, mass: 0.9 };
const POP = { damping: 16, stiffness: 190, mass: 0.8 };

const ProofText: React.FC<{ side: "left" | "right"; n: string; en: string; title: string; sub: React.ReactNode }> = ({ side, n, en, title, sub }) => (
  <div style={{ position: "absolute", left: side === "left" ? 150 : 1150, top: 0, width: 680, height: H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <FadeIn at={2} y={0} x={side === "left" ? -16 : 16} dur={10}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: K.mint, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>{n}</span>
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

/* ───────── 01 자동 녹화 — 카메라 뷰파인더 ───────── */

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
        n="01"
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

/* ───────── 02 AI 강의 평가 — 실제 리포트 화면 ───────── */

const REPORT = { w: 1062, h: 700 };
const CARDS: Array<[number, number, number, number]> = [
  [556, 383, 233, 105],
  [799, 383, 232, 105],
  [556, 498, 233, 105],
  [799, 498, 232, 105],
];

export const ProofAi: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(f, [0, 60], [0, 1]);
  const pw = 940;
  const k = pw / REPORT.w;
  const ph = REPORT.h * k;
  const scan = interpolate(f, [5, 36], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const scanOn = interpolate(f, [5, 8, 34, 38], [0, 1, 1, 0], cl);
  const ring = interpolate(f, [12, 40], [0, 0.83], { ...cl, easing: Easing.out(Easing.cubic) });
  const badge = spring({ frame: f - 9, fps, config: POP });
  const R = 92;
  const CIRC = 2 * Math.PI * R;

  return (
    <Stage glowX={0.68} glowY={0.5} glow={0.9}>
      <Dust count={60} seed="p2" px={push * 60} opacity={0.7} />
      <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "58% 50%" }}>
        <div style={{ position: "absolute", left: 842, top: (H - ph) / 2 - 4, width: pw, height: ph, transformStyle: "preserve-3d", transform: `translate3d(${push * 18}px, 0, ${push * 40}px) rotateY(${-17 + push * 2.5}deg) rotateX(1.5deg)` }}>
          {/* 패널이 뿜는 빛 */}
          <div style={{ position: "absolute", left: -160, top: -140, width: pw + 320, height: ph + 280, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(K.mint, 0.22)} 0%, transparent 68%)` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", boxShadow: `0 50px 120px rgba(0,0,0,0.7), 0 0 0 1.5px ${rgba(K.mintHot, 0.5)}`, background: "#fff" }}>
            <Img src={staticFile("cinematic/ai-report.webp")} style={{ width: pw, height: ph, display: "block", filter: "brightness(0.8) contrast(1.06)" }} />
            {/* 스캔된 영역 강조 카드 */}
            {CARDS.map(([x, y, w, h], i) => {
              const on = interpolate(f, [20 + i * 4, 25 + i * 4], [0, 1], cl);
              return <div key={i} style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, borderRadius: 12 * k, border: `3px solid ${K.green}`, opacity: on, boxShadow: `0 0 22px ${rgba(K.green, 0.45)}` }} />;
            })}
            {/* 스캔 라인 */}
            <div style={{ position: "absolute", left: 0, top: scan * ph - 120, width: pw, height: 120, opacity: scanOn, background: `linear-gradient(180deg, transparent, ${rgba(K.mint, 0.3)} 85%, ${rgba(K.green, 0.9)} 100%)` }} />
            {/* 유리 반사 */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(4,10,8,0.16) 0%, transparent 30%, rgba(255,255,255,0.0) 60%, rgba(4,10,8,0.26) 100%)" }} />
          </div>

          {/* 점수 배지 — 패널 앞으로 떠오른다 */}
          <div style={{ position: "absolute", left: -150, top: ph - 318, width: 300, transform: `translateZ(${90 + badge * 60}px) scale(${0.7 + badge * 0.3})`, opacity: Math.min(1, badge * 1.6) }}>
            <div style={{ borderRadius: 26, background: "rgba(6,14,12,0.9)", border: `1.5px solid ${rgba(K.mint, 0.65)}`, boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 60px ${rgba(K.mint, 0.22)}`, padding: "26px 26px 22px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", width: 220, height: 220 }}>
                <svg width={220} height={220} viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={110} cy={110} r={R} stroke={rgba(K.white, 0.12)} strokeWidth={12} fill="none" />
                  <circle cx={110} cy={110} r={R} stroke={K.mint} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC * ring} ${CIRC}`} style={{ filter: `drop-shadow(0 0 10px ${rgba(K.mint, 0.8)})` }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1 }}>
                    <Roll to={83} at={12} dur={28} />
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: K.faint, letterSpacing: "0.16em", marginTop: 4 }}>AI EVAL.</span>
                </div>
              </div>
              <div style={{ marginTop: 14, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: K.mint, letterSpacing: "-0.01em" }}>4개 영역 · 11개 항목</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <ProofText
        side="left"
        n="02"
        en="AI Lecture Report"
        title="AI 강의 평가"
        sub={
          <>
            수업이 끝나면,
            <br />
            <Strong>AI가 바로 평가합니다.</Strong>
          </>
        }
      />
      <FadeIn at={20} y={0} dur={10} style={{ position: "absolute", left: 150, bottom: BAR_H + 40 }}>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, color: K.faint, letterSpacing: "0.04em" }}>* 리포트 예시 화면</div>
      </FadeIn>
    </Stage>
  );
};

/* ───────── 03 EDB 교안 — 판서가 페이지로 떠올라 파일이 된다 ───────── */

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
    <Stage glowX={0.34} glowY={0.5} glow={0.9}>
      <Dust count={60} seed="p3" px={-push * 60} opacity={0.7} />
      <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: "40% 46%" }}>
        <div style={{ position: "absolute", left: 20, top: (H - bh) / 2 + 40, width: bw, height: bh, transformStyle: "preserve-3d", transform: `translate3d(${push * -14}px, 0, ${push * 30 - 120}px) rotateY(${26 - push * 3}deg) rotateX(6deg)` }}>
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
                  transform: `translate3d(${s * (30 + i * 58)}px, ${s * -(12 + i * 26)}px, ${s * (60 + i * 78)}px)`,
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
      <div style={{ position: "absolute", left: 430, top: 812, opacity: Math.min(1, chip * 1.5), transform: `translateY(${(1 - chip) * 26}px) scale(${0.9 + chip * 0.1})`, display: "flex", alignItems: "center", gap: 16, background: "rgba(8,18,15,0.86)", border: `1.5px solid ${rgba(K.mint, 0.7)}`, borderRadius: 14, padding: "14px 24px", boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${rgba(K.mint, 0.18)}` }}>
        <svg width={30} height={36} viewBox="0 0 30 36">
          <path d="M3 1.5 H19 L27.5 10 V34.5 H3 Z" fill="none" stroke={K.mint} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M19 1.5 V10 H27.5" fill="none" stroke={K.mint} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M8.5 19 H21.5 M8.5 25 H18" stroke={K.mint} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: K.white, letterSpacing: "-0.02em" }}>이차함수의 그래프.edb</span>
        <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: K.mint, marginLeft: 4 }}>코스 파일로 저장</span>
      </div>

      <ProofText
        side="right"
        n="03"
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
