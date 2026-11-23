import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { Icon, IconName } from "../icons";
import { CL, KText, Layer, PaperBg, Pencil, Sticky, Tape, eInOut, eOut, hand, lerp, ramp, roughArrow, roughLine, roughRect, t, wavyLine } from "../kit";

// 낮 — 인포그래픽 엔딩: 손이 가는 일은 줄고(왼쪽), 학생별 챙김은 촘촘해진다(오른쪽).
// 숫자는 예시 반(가상) 기준: 오늘 챙길 일 36가지 → 먼저 볼 학생 2명, 학생 6명 × 챙길 항목 6가지.
const L = { x: 206, y: 382, w: 720, h: 380, rot: -1.2 };
const R = { x: 994, y: 382, w: 720, h: 380, rot: 1.2 };
const COLS: IconName[] = ["route", "test", "book", "chat", "consult", "report"];

const PaperCard: React.FC<{ x: number; y: number; w: number; h: number; rot: number; at: number; children: React.ReactNode }> = ({ x, y, w, h, rot, at, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 16, stiffness: 140 } });
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 40}px) rotate(${rot}deg)`, opacity: interpolate(f - at, [0, 4], [0, 1], CL) }}>
      <div style={{ position: "absolute", inset: 0, background: "#FFFDF7", boxShadow: "0 22px 46px rgba(80,60,30,0.16), 0 2px 4px rgba(80,60,30,0.1)" }} />
      <Tape x={w / 2 - 65} y={-15} w={130} rot={-rot * 2} />
      {children}
    </div>
  );
};

// 왼쪽: 손이 가는 일 — 혼자 챙길 때 36가지 → AI와 함께 먼저 볼 2명
const LeftChart: React.FC<{ f: number }> = ({ f }) => {
  const base = 318;
  const b1 = ramp(f, 10, 24, eOut);
  const b2 = ramp(f, 28, 38, eOut);
  const h1 = 168 * b1;
  const h2 = 52 * b2;
  const hatch = (x0: number, w: number, top: number, color: string, at: number, seed: number) => {
    // 45° 평행 빗금: x + y = c 직선과 막대 사각형의 교점끼리 잇는다
    const lines: React.ReactNode[] = [];
    for (let c = x0 + top + 10; c < x0 + w + base; c += 15) {
      const xs = Math.max(x0, c - base);
      const xe = Math.min(x0 + w, c - top);
      if (xe - xs <= 4) continue;
      lines.push(<Pencil key={c} d={roughLine(xs, c - xs, xe, c - xe, seed + c, 0.8)} color={color} width={3.2} at={at} dur={6} opacity={0.75} raw />);
    }
    return lines;
  };
  const arrow = roughArrow([210, 92], [470, base - 70], 0.25, 8);
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 22, display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={hand(48, INK.graphite)}>손이 가는 일</span>
        <span style={hand(36, INK.red)}>줄이고</span>
      </div>
      <svg width={L.w} height={L.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Pencil d={roughLine(50, base, 670, base, 3, 1)} color={INK.graphite} width={4} at={6} dur={8} />
        {b1 > 0 ? <g filter="url(#gb-crayon)">{hatch(120, 150, base - h1, INK.red, 18, 100)}</g> : null}
        {b1 > 0 ? <Pencil d={roughRect(120, base - h1, 150, h1, 9, 1.2)} color={INK.red} width={5} at={12} dur={8} /> : null}
        {b2 > 0 ? <g filter="url(#gb-crayon)">{hatch(430, 150, base - h2, BRAND.green, 34, 200)}</g> : null}
        {b2 > 0 ? <Pencil d={roughRect(430, base - h2, 150, h2, 19, 1.2)} color={BRAND.green} width={5} at={30} dur={8} /> : null}
        <Pencil d={arrow.body} color={INK.navy} width={5} at={32} dur={8} />
        <Pencil d={arrow.head} color={INK.navy} width={5} at={39} dur={3} />
      </svg>
      <div style={{ position: "absolute", left: 128, top: base - h1 - 58, ...hand(46, INK.red), opacity: ramp(f, 20, 24), filter: "url(#gb-crayon)" }}>36가지</div>
      <div style={{ position: "absolute", left: 428, top: base - 52 - 58, ...hand(46, BRAND.green), opacity: ramp(f, 36, 40), filter: "url(#gb-crayon)" }}>먼저 2명</div>
      <div style={{ position: "absolute", left: 300, top: 150, ...hand(32, INK.navy), opacity: ramp(f, 38, 42), transform: "rotate(-4deg)" }}>AI가 정리</div>
      <div style={{ position: "absolute", left: 120, top: base + 10, width: 150, textAlign: "center", ...hand(34, INK.sub), opacity: ramp(f, 14, 18) }}>혼자 챙길 때</div>
      <div style={{ position: "absolute", left: 430, top: base + 10, width: 150, textAlign: "center", ...hand(34, INK.sub), opacity: ramp(f, 30, 34) }}>AI와 함께</div>
    </>
  );
};

// 오른쪽: 학생별 챙김 — 학생 6명 × 챙길 항목 6가지에 매일 체크가 찬다
const RightGrid: React.FC<{ f: number }> = ({ f }) => {
  const gx = 120;
  const gy = 124;
  const cw = 86;
  const ch = 32;
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 22, display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={hand(48, INK.graphite)}>학생별 챙김</span>
        <span style={hand(36, BRAND.green)}>더 촘촘하게</span>
      </div>
      {COLS.map((ic, c) => (
        <div key={ic} style={{ position: "absolute", left: gx + c * cw + cw / 2 - 12, top: 88, opacity: ramp(f, 12 + c, 18 + c) }}>
          <Icon name={ic} size={24} color={INK.graphite} stroke={1.9} round draw={ramp(f, 12 + c, 22 + c)} />
        </div>
      ))}
      {STUDENTS.map((s, r) => (
        <div key={s.id} style={{ position: "absolute", left: 66, top: gy + r * ch - 4, ...hand(34, PENCIL[s.id]), opacity: ramp(f, 12 + r, 18 + r) }}>
          {s.id}
        </div>
      ))}
      <svg width={R.w} height={R.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g filter="url(#gb-crayon)">
        {STUDENTS.map((s, r) =>
          COLS.map((_, c) => {
            const cx = gx + c * cw + cw / 2;
            const cy = gy + r * ch + 12;
            const at = 18 + (r + c) * 3.2;
            return (
              <g key={`${r}-${c}`}>
                <Pencil d={roughRect(cx - 11, cy - 11, 22, 22, 300 + r * 6 + c, 0.8)} color="#8A8780" width={2.4} at={12 + r} dur={6} opacity={0.8} raw />
                <Pencil d={`M ${cx - 9} ${cy + 1} L ${cx - 2} ${cy + 9} L ${cx + 13} ${cy - 13}`} color={BRAND.green} width={5} at={at} dur={4} raw />
              </g>
            );
          }),
        )}
        </g>
        <Pencil d={roughArrow([660, 300], [660, 112], 0, 3).body} color={BRAND.green} width={5} at={40} dur={8} />
        <Pencil d={roughArrow([660, 300], [660, 112], 0, 3).head} color={BRAND.green} width={5} at={47} dur={3} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 322, ...hand(32, INK.sub), opacity: ramp(f, 52, 58) }}>매일 · 학생마다 6가지</div>
    </>
  );
};

export const S7End: React.FC = () => {
  const f = useCurrentFrame();
  const drift = lerp(1, 1.008, ramp(f, 60, 180, eInOut));
  const arrow = roughArrow([1176, 846], [1258, 842], 0, 4);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.day} ruled={0.3} />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <KText lines={[[{ t: "손은 덜고," }]]} at={4} size={100} align="center" style={{ position: "absolute", left: 0, right: 0, top: 96 }} />
        <KText lines={[[{ t: "퀄리티와 만족", c: BRAND.green }, { t: "은 높게." }]]} at={16} size={100} align="center" style={{ position: "absolute", left: 0, right: 0, top: 220 }} />
        <Layer>
          <Pencil d={wavyLine(540, 1080, 352, 8, 5)} color={BRAND.green} width={7} at={34} dur={10} />
        </Layer>
        <PaperCard {...L} at={2}>
          <LeftChart f={f} />
        </PaperCard>
        <PaperCard {...R} at={8}>
          <RightGrid f={f} />
        </PaperCard>
        {/* 시작 제안 */}
        <Sticky x={600} y={790} w={720} h={108} color="#FFE479" rot={-1.4} at={66}>
          <div style={{ ...hand(64, INK.navy), lineHeight: 1, marginTop: 2, marginLeft: 16 }}>시작은, 개별진도반 하나부터</div>
        </Sticky>
        <Layer>
          <Pencil d={arrow.body} color={INK.navy} width={5} at={76} dur={7} />
          <Pencil d={arrow.head} color={INK.navy} width={5} at={82} dur={3} />
        </Layer>
        <div style={{ position: "absolute", left: 0, right: 0, top: 930, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: ramp(f, 84, 94) }}>
          <div style={{ width: 80 * ramp(f, 84, 100), height: 1.5, background: INK.sub }} />
          <Img src={staticFile("brand/classin-mark.png")} style={{ height: 30 }} />
          <span style={t(26, 800, INK.head, { lineHeight: 1, letterSpacing: "0.01em" })}>
            개별진도 × <span style={{ color: BRAND.green }}>ClassIn</span> + AI
          </span>
          <div style={{ width: 80 * ramp(f, 84, 100), height: 1.5, background: INK.sub }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1016, textAlign: "center", ...t(16, 500, INK.sub, { lineHeight: 1 }), opacity: ramp(f, 96, 106) }}>
          AI 진도 설계 · 개별진도 대시보드 · 원장 화면 · 학부모 리포트는 개발이 필요한 방향 예시이며, 숫자와 학생은 가상 반 기준입니다.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
