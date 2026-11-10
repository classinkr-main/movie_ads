import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ChapterTag, DarkStage, Fade, Lines, Spec, t } from "../Cine";
import { LogoMark } from "../../shared/brand/Ui";
import { clamp, SMOOTH, sp } from "../../shared/motion";
import { H } from "../hwTheme";

// 노드 좌표(1920×1080)
const BOARD = { x: 150, y: 470, w: 520, h: 300 };
const HUB = { x: 960, y: 650, r: 64 };
const TARGETS = [
  { y: 440, title: "노트북 · 교사", desc: "수업 영상 · 판서 PDF 자동 저장", glyph: "laptop" },
  { y: 570, title: "태블릿 · 학생", desc: "집에서도 같은 수업, 언제나 복습", glyph: "tablet" },
  { y: 700, title: "스마트폰 · 학부모", desc: "오늘 배운 내용을 바로 공유", glyph: "phone" },
  { y: 830, title: "관리자 대시보드", desc: "모든 교실을 한 화면에서 관리", glyph: "grid" },
] as const;
const TX = 1210;
const TW = 560;
const TH = 104;
const LINK_AT = 56;

const Glyph: React.FC<{ kind: string }> = ({ kind }) => {
  const c = H.mint;
  if (kind === "laptop")
    return (
      <svg width={40} height={40} viewBox="0 0 40 40">
        <rect x={7} y={9} width={26} height={17} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <path d="M3 30 H37" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    );
  if (kind === "tablet")
    return (
      <svg width={40} height={40} viewBox="0 0 40 40">
        <rect x={9} y={6} width={22} height={28} rx={3} stroke={c} strokeWidth={2} fill="none" />
        <circle cx={20} cy={30} r={1.5} fill={c} />
      </svg>
    );
  if (kind === "phone")
    return (
      <svg width={40} height={40} viewBox="0 0 40 40">
        <rect x={13} y={5} width={14} height={30} rx={3} stroke={c} strokeWidth={2} fill="none" />
        <path d="M17 9 H23" stroke={c} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={40} height={40} viewBox="0 0 40 40">
      {[0, 1].map((r) => [0, 1].map((cc) => <rect key={`${r}${cc}`} x={8 + cc * 14} y={8 + r * 14} width={10} height={10} rx={2} stroke={c} strokeWidth={2} fill="none" />))}
    </svg>
  );
};

// 05 — 생태계: 보드 → Classin Cloud → 노트북·태블릿·폰·관리자. 하나의 표준으로, 언제 어디서나.
export const H5Ecosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boardIn = sp(frame - 30, fps, SMOOTH, 28);
  const hubIn = sp(frame - 48, fps, SMOOTH, 22);
  const l1 = sp(frame - LINK_AT, fps, SMOOTH, 24); // 보드 → 허브
  const bx = BOARD.x + BOARD.w + 16;
  const by = BOARD.y + BOARD.h / 2;
  const hx = HUB.x - HUB.r - 8;
  const hy = HUB.y;
  const p1 = `M ${bx} ${by} C ${bx + 110} ${by}, ${hx - 110} ${hy}, ${hx} ${hy}`;
  const bez = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, tt: number) => ({
    x: (1 - tt) ** 3 * x0 + 3 * (1 - tt) ** 2 * tt * x1 + 3 * (1 - tt) * tt ** 2 * x2 + tt ** 3 * x3,
    y: (1 - tt) ** 3 * y0 + 3 * (1 - tt) ** 2 * tt * y1 + 3 * (1 - tt) * tt ** 2 * y2 + tt ** 3 * y3,
  });
  const pulse = (frame / 36) % 1;

  return (
    <DarkStage grid glow>
      <AbsoluteFill style={{ padding: "150px 150px 0" }}>
        <ChapterTag n="05" en="ECOSYSTEM" delay={6} />
        <Lines lines={["보드에서 끝나지 않습니다."]} delay={14} size={76} style={{ marginTop: 18 }} />
        <Fade delay={32} y={14} style={{ marginTop: 16 }}>
          <div style={t(26, 400, H.muted, { maxWidth: 940, lineHeight: 1.5, wordBreak: "keep-all" })}>
            판서·녹화·교안·LMS가 <span style={{ color: H.text, fontWeight: 600 }}>하나의 표준</span>으로 이어집니다. 언제 어디서나 수업과 자료에 접근하고, 한 곳에서 관리합니다.
          </div>
        </Fade>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 150, top: 160, display: "flex", gap: 12 }}>
        <Spec value="표준화" label="같은 수업 환경" delay={40} size={19} />
        <Spec value="언제 어디서나" label="접근" delay={46} size={19} />
        <Spec value="한 곳에서" label="관리" delay={52} size={19} />
      </div>

      {/* 연결선 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="lk" x1="0" x2="1">
            <stop offset="0" stopColor={H.green} />
            <stop offset="1" stopColor={H.mint} />
          </linearGradient>
        </defs>
        <path d={p1} stroke="url(#lk)" strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - l1} />
        {TARGETS.map((tg, i) => {
          const d = LINK_AT + 22 + i * 6;
          const p = sp(frame - d, fps, SMOOTH, 24);
          const x0 = HUB.x + HUB.r + 8;
          const y0 = HUB.y;
          const x3 = TX - 14;
          const y3 = tg.y + TH / 2;
          const path = `M ${x0} ${y0} C ${x0 + 120} ${y0}, ${x3 - 120} ${y3}, ${x3} ${y3}`;
          const dot = bez(x0, y0, x0 + 120, y0, x3 - 120, y3, x3, y3, (pulse + i * 0.25) % 1);
          return (
            <g key={tg.title}>
              <path d={path} stroke="url(#lk)" strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
              {p > 0.98 && <circle cx={dot.x} cy={dot.y} r={5} fill={H.mint} style={{ filter: `drop-shadow(0 0 8px ${H.mint})` }} />}
            </g>
          );
        })}
        {l1 > 0.98 && (() => {
          const d = bez(bx, by, bx + 110, by, hx - 110, hy, hx, hy, pulse);
          return <circle cx={d.x} cy={d.y} r={6} fill={H.mint} style={{ filter: `drop-shadow(0 0 10px ${H.mint})` }} />;
        })()}
      </svg>

      {/* 보드 카드 */}
      <div style={{ position: "absolute", left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h, opacity: boardIn, transform: `translateY(${(1 - boardIn) * 30}px)` }}>
        <div style={{ position: "absolute", inset: -12, borderRadius: 20, background: "linear-gradient(180deg, #F2F2EF, #D9D9D4)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", background: "#000" }}>
          <Img src={staticFile("hw/ui-board-class.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: BOARD.h + 34, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: H.mint }} />
          <span style={t(20, 700, H.text)}>Classin Board</span>
          <span style={t(18, 500, H.dim)}>교실 · 판서 + 4K 녹화</span>
        </div>
      </div>

      {/* 허브 */}
      <div style={{ position: "absolute", left: HUB.x - HUB.r, top: HUB.y - HUB.r, width: HUB.r * 2, height: HUB.r * 2, borderRadius: 999, background: "rgba(0,163,108,0.14)", border: `2px solid ${H.green}`, display: "grid", placeItems: "center", opacity: hubIn, transform: `scale(${0.6 + hubIn * 0.4})`, boxShadow: `0 0 ${40 + Math.sin(frame / 9) * 10}px rgba(0,163,108,0.45)` }}>
        <LogoMark height={34} />
      </div>
      <div style={{ position: "absolute", left: HUB.x - 120, top: HUB.y + HUB.r + 18, width: 240, textAlign: "center", opacity: hubIn }}>
        <div style={t(18, 800, H.mint, { letterSpacing: "0.12em" })}>CLASSIN CLOUD</div>
        <div style={{ ...t(15, 500, H.dim), marginTop: 4 }}>수업 기록이 자동으로 모입니다</div>
      </div>

      {/* 대상 카드 */}
      {TARGETS.map((tg, i) => {
        const d = LINK_AT + 40 + i * 6;
        const s = sp(frame - d, fps, SMOOTH, 22);
        const o = interpolate(frame - d, [0, 6], [0, 1], clamp);
        return (
          <div key={tg.title} style={{ position: "absolute", left: TX, top: tg.y, width: TW, height: TH, borderRadius: 16, background: H.panel, border: `1px solid ${H.line2}`, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", opacity: o, transform: `translateX(${(1 - s) * 40}px)`, backdropFilter: "blur(8px)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: H.mintSoft, display: "grid", placeItems: "center" }}>
              <Glyph kind={tg.glyph} />
            </div>
            <div>
              <div style={t(22, 700, H.text)}>{tg.title}</div>
              <div style={{ ...t(17, 500, H.muted), marginTop: 4 }}>{tg.desc}</div>
            </div>
          </div>
        );
      })}
    </DarkStage>
  );
};
