import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { evolvePath, getLength } from "@remotion/paths";
import { BRAND, LINE_ON_LIGHT, STUDENTS, TONES } from "../theme";
import { Icon } from "../icons";
import { Backdrop, Bracket, CL, FrameMarks, KText, eInOut, eOut, eOutBack, lerp, mono, ramp, t } from "../kit";

// 낮 — 학생 여섯의 노선이 한 역(ClassIn)으로 모인다. 마지막 프레임은 HTML 페이지 첫 화면(포스터)으로 쓴다.
const T = TONES.day;
const MARK = { cx: 960, cy: 236, w: 190 };
// 왼쪽 묶음(A·B·C)과 오른쪽 묶음(D·E·F)이 마크 높이(222/236/250)로 들어온다. 모든 꺾임은 45°.
const ROUTES: Record<string, string> = {
  A: "M -20 92 H 300 L 430 222 H 850",
  B: "M -20 470 H 470 L 704 236 H 850",
  C: "M 180 1100 V 864 L 794 250 H 850",
  D: "M 1940 140 H 1620 L 1538 222 H 1070",
  E: "M 1940 520 H 1460 L 1176 236 H 1070",
  F: "M 1740 1100 V 864 L 1126 250 H 1070",
};
const LINE_AT: Record<string, number> = { A: 0, B: 2, C: 4, D: 1, E: 3, F: 5 };

export const S7End: React.FC = () => {
  const f = useCurrentFrame();
  const mark = interpolate(f, [16, 30], [0, 1], { ...CL, easing: eOutBack });
  const burst = ramp(f, 16, 40, eOut);
  const fadeLines = lerp(1, 0.17, ramp(f, 28, 52));
  const drift = lerp(1, 1.012, ramp(f, 60, 180, eInOut));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop from={T} grid={0.5} gridSize={60} />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        {/* 모이는 노선 */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: fadeLines }}>
          {STUDENTS.map((s) => {
            const d = ROUTES[s.id];
            const at = LINE_AT[s.id];
            const p = ramp(f, at, at + 18, eInOut);
            if (p <= 0) return null;
            const ev = evolvePath(p, d);
            const len = getLength(d);
            const trainK = ((f - 30) / 70 + LINE_AT[s.id] * 0.17) % 1;
            return (
              <g key={s.id}>
                <path d={d} fill="none" stroke={LINE_ON_LIGHT[s.id]} strokeWidth={7} strokeLinejoin="miter" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
                {f > 30 ? <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray={`30 ${len + 30}`} strokeDashoffset={-(len * trainK - 30)} /> : null}
              </g>
            );
          })}
        </svg>
        {/* 역 = ClassIn 마크 */}
        <div style={{ position: "absolute", left: MARK.cx - 150, top: MARK.cy - 150, width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 120, height: 120, border: `2px solid ${BRAND.green}`, transform: `rotate(45deg) scale(${0.4 + burst * 2.2})`, opacity: (1 - burst) * (f >= 16 ? 1 : 0) }} />
          <Img src={staticFile("brand/classin-mark.png")} style={{ width: MARK.w, transform: `scale(${lerp(0.4, 1, mark)})`, opacity: interpolate(f, [16, 20], [0, 1], CL), filter: mark < 0.95 ? `blur(${(1 - mark) * 8}px)` : undefined }} />
        </div>
        <KText lines={[[{ t: "손은 덜고," }]]} at={30} size={120} color={T.ink} align="center" stagger={1.6} style={{ position: "absolute", left: 0, right: 0, top: 352 }} />
        <KText lines={[[{ t: "퀄리티와 만족", c: BRAND.green, u: BRAND.green }, { t: "은 높게." }]]} at={42} size={120} color={T.ink} align="center" stagger={1.6} style={{ position: "absolute", left: 0, right: 0, top: 492 }} />
        {/* 시작 제안 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", opacity: ramp(f, 62, 72), transform: `translateY(${(1 - ramp(f, 62, 74, eOut)) * 20}px)` }}>
          <div style={{ position: "relative", padding: "20px 34px", display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,0.6)" }}>
            <Bracket color={BRAND.green} size={18} w={2.6} />
            <span style={t(40, 800, T.ink, { lineHeight: 1 })}>시작은, 개별진도반 하나부터</span>
            <Icon name="arrow" size={36} color={BRAND.green} draw={ramp(f, 66, 82)} stroke={2.2} />
          </div>
        </div>
        {/* 락업 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 846, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: ramp(f, 80, 90) }}>
          <div style={{ width: 90 * ramp(f, 80, 96, eOut), height: 1.5, background: T.sub }} />
          <span style={t(26, 800, T.ink, { lineHeight: 1, letterSpacing: "0.01em" })}>
            개별진도 × <span style={{ color: BRAND.green }}>ClassIn</span> + AI
          </span>
          <div style={{ width: 90 * ramp(f, 80, 96, eOut), height: 1.5, background: T.sub }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 972, textAlign: "center", ...t(17, 500, T.sub, { lineHeight: 1, opacity: ramp(f, 92, 102) }) }}>
          AI 진도 설계 · 원장 대시보드 · 학부모 리포트는 개발이 필요한 방향 예시이며, 화면 속 학생과 점수는 가상 데이터입니다.
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 60, ...mono(15, 700, T.sub, { letterSpacing: "0.12em", opacity: ramp(f, 70, 80) }) }}>07 / 07</div>
      <FrameMarks tone={T} />
    </AbsoluteFill>
  );
};
