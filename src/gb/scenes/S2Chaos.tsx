import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { Icon, IconName } from "../icons";
import { CL, HandText, Highlighter, Hud, Ink, KText, Layer, PaperBg, Pencil, Sticky, Tape, eIn, eOutExpo, gradeCircle, hand, lerp, ramp, rng, roughLine, shake } from "../kit";

// 바쁜 책상 — 학생 6명 × 할 일 6가지 = 36장의 포스트잇이 플래너를 덮는다.
export const COLS: Array<{ label: string; icon: IconName; note: string; color: string }> = [
  { label: "진도 배정", icon: "route", note: "진도표 수정", color: "#FFE479" },
  { label: "테스트 채점", icon: "test", note: "채점하기", color: "#FFC2D1" },
  { label: "숙제", icon: "book", note: "숙제 확인", color: "#B9EBCF" },
  { label: "질문", icon: "chat", note: "질문 답장", color: "#BFD7FF" },
  { label: "상담", icon: "consult", note: "상담 전화", color: "#FFD3A6" },
  { label: "학부모 보고", icon: "report", note: "보고 작성", color: "#DCCBFF" },
];
const SLAMS = [
  { w: "진도표,", at: 0, col: 0 },
  { w: "채점,", at: 15, col: 1 },
  { w: "상담,", at: 30, col: 4 },
  { w: "보고까지.", at: 45, col: 5 },
];
export const PLAN = { x: 300, y: 414, cw: 226, ch: 88, head: 74, rowHead: 70 };
export const cellXY = (c: number, r: number) => ({ x: PLAN.x + PLAN.rowHead + c * PLAN.cw, y: PLAN.y + PLAN.head + r * PLAN.ch });
export const cellAt = (c: number, r: number) => {
  const s = SLAMS.find((x) => x.col === c);
  if (s) return s.at + 2 + r * 1.5;
  return (c === 2 ? 50 : 57) + r * 1.2;
};
export const NOTE_ROT = (() => {
  const r = rng(21);
  return Array.from({ length: 36 }, () => ({ rot: (r() - 0.5) * 12, dx: (r() - 0.5) * 26, dy: (r() - 0.5) * 18 }));
})();

const Planner: React.FC<{ f: number }> = ({ f }) => {
  const P = PLAN;
  const W = P.rowHead + 6 * P.cw;
  const H = P.head + 6 * P.ch;
  const pencil = "#55555A";
  return (
    <>
      {/* 플래너 종이 */}
      <div style={{ position: "absolute", left: P.x - 30, top: P.y - 26, width: W + 60, height: H + 52, background: "#FFFEFA", boxShadow: "0 18px 40px rgba(90,70,40,0.16), 0 2px 4px rgba(90,70,40,0.1)", transform: "rotate(-0.6deg)", opacity: ramp(f, -4, 4) }} />
      <Tape x={P.x + W / 2 - 60} y={P.y - 44} w={140} rot={-3} />
      <Layer>
        {Array.from({ length: 8 }, (_, i) => {
          const y = P.y + (i === 0 ? 0 : P.head + (i - 1) * P.ch);
          return <Ink key={"h" + i} d={roughLine(P.x, y, P.x + W, y, 30 + i, 1.2)} color={pencil} width={1.8} at={-6 + i} dur={10} filter="pencil" opacity={0.7} />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const x = i === 0 ? P.x : P.x + P.rowHead + (i - 1) * P.cw;
          return <Ink key={"v" + i} d={roughLine(x, P.y, x, P.y + H, 50 + i, 1.2)} color={pencil} width={1.8} at={-4 + i} dur={10} filter="pencil" opacity={0.6} />;
        })}
      </Layer>
      {COLS.map((c, i) => {
        const s = SLAMS.find((x) => x.col === i);
        const hot = s ? Math.max(0, 1 - Math.abs(f - s.at - 3) / 10) : 0;
        return (
          <div key={c.label} style={{ position: "absolute", left: P.x + P.rowHead + i * P.cw, top: P.y + 14, width: P.cw, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: ramp(f, i * 2 - 4, i * 2 + 4) }}>
            <Icon name={c.icon} size={30} color={hot > 0.05 ? INK.red : "#4A4A4E"} draw={ramp(f, i * 2 - 4, i * 2 + 10)} stroke={1.9} round style={{ transform: `scale(${1 + hot * 0.3})` }} />
            <span style={hand(40, hot > 0.05 ? INK.red : INK.graphite)}>{c.label}</span>
          </div>
        );
      })}
      {STUDENTS.map((s, r) => (
        <div key={s.id} style={{ position: "absolute", left: P.x + 20, top: P.y + P.head + r * P.ch + 18, ...hand(52, PENCIL[s.id]), opacity: ramp(f, r - 2, r + 4) }}>
          {s.id}
        </div>
      ))}
    </>
  );
};

const Notes: React.FC<{ f: number; heat: number }> = ({ f, heat }) => (
  <>
    {COLS.map((c, ci) =>
      STUDENTS.map((s, r) => {
        const { x, y } = cellXY(ci, r);
        const k = ci * 6 + r;
        const jit = heat * 6;
        const jx = noise2D("nx" + k, f * 0.3, 0) * jit;
        const jy = noise2D("ny" + k, 0, f * 0.3) * jit;
        const attn = s.id === "C" || s.id === "E";
        return (
          <Sticky key={k} x={x + 14 + NOTE_ROT[k].dx + jx} y={y + 5 + NOTE_ROT[k].dy * 0.8 + jy} w={196} h={76} color={c.color} rot={NOTE_ROT[k].rot} at={cellAt(ci, r)} shadow={0.7}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: -4 }}>
              <span style={hand(34, attn ? INK.red : "#3A3A3E")}>{s.id}</span>
              <span style={hand(32, "#3A3A3E")}>{c.note}</span>
            </div>
          </Sticky>
        );
      }),
    )}
  </>
);

const SlamWord: React.FC<{ w: string; at: number; f: number }> = ({ w, at, f }) => {
  const local = f - at;
  const p = interpolate(local, [0, 6], [0, 1], { ...CL, easing: eOutExpo });
  const vis = local >= 0;
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.28em",
        transformOrigin: "50% 70%",
        transform: `scale(${vis ? lerp(1.6, 1, p) : 1}) rotate(${vis ? (1 - p) * -4 : 0}deg)`,
        opacity: vis ? interpolate(local, [-1, 1], [0, 1], CL) : 0,
        filter: vis && p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
      }}
    >
      {w}
    </span>
  );
};

export const S2Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const punch = SLAMS.reduce((acc, s) => acc + Math.max(0, 1 - Math.abs(f - s.at - 1) / 5) * 0.012, 0);
  const heat = ramp(f, 70, 118, eIn);
  const shk = shake(f, lerp(0.5, 6, heat), "s2");
  let count = 0;
  for (let c = 0; c < 6; c++) for (let r = 0; r < 6; r++) if (f >= cellAt(c, r)) count++;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.desk} to={PAPER.clean} k={ramp(f, 100, 120) * 0.5} />
      <AbsoluteFill style={{ transform: `translate(${shk.x}px, ${shk.y}px) scale(${1 + punch})` }}>
        <Planner f={f} />
        <Notes f={f} heat={heat} />
        {/* 빨간 펜: 먼저 챙겨야 할 C·E 줄 */}
        <Layer>
          {[2, 4].map((r, i) => {
            const y = PLAN.y + PLAN.head + r * PLAN.ch + PLAN.ch / 2;
            return <Pencil key={r} d={gradeCircle(PLAN.x + 36, y + 2, 36, 32, 90 + i)} color={INK.red} width={7} at={78 + i * 6} dur={9} />;
          })}
        </Layer>
        <HandText x={PLAN.x - 230} y={PLAN.y + PLAN.head + 2 * PLAN.ch + 8} size={46} color={INK.red} at={84} dur={10} rotate={-6} style={{ filter: "url(#gb-crayon)" }}>
          급해요!
        </HandText>
      </AbsoluteFill>
      {/* 제목 2줄 */}
      <div style={{ position: "absolute", left: 116, top: 112, fontFamily: "Gowun Batang", fontWeight: 700, fontSize: 96, color: INK.head, letterSpacing: "-0.015em", lineHeight: 1.24, whiteSpace: "nowrap" }}>
        {SLAMS.map((s) => (
          <SlamWord key={s.w} w={s.w} at={s.at} f={f} />
        ))}
      </div>
      <Highlighter x={598} y={292} w={392} h={48} at={74} dur={12} />
      <KText lines={[[{ t: "개별진도는 " }, { t: "손이 많이" }, { t: " 갑니다." }]]} at={60} size={96} style={{ position: "absolute", left: 116, top: 232 }} />
      {/* 카운터: 손글씨 숫자 */}
      <div style={{ position: "absolute", right: 96, top: 54, textAlign: "center", opacity: ramp(f, 0, 6) }}>
        <div style={hand(40, INK.sub)}>오늘 챙길 일</div>
        <div style={{ ...hand(132, count > 24 ? INK.red : INK.graphite), lineHeight: 0.9, filter: "url(#gb-crayon)" }}>{count}</div>
      </div>
      <Layer>
        <Pencil d={gradeCircle(1750, 184, 90, 66, 7)} color={INK.red} width={12} at={64} dur={11} />
      </Layer>
      <Hud page={2} label="손이 많이 가는 이유" />
    </AbsoluteFill>
  );
};

