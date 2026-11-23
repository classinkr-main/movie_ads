import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { CL, Ink, KText, Layer, PaperBg, Sticky, Tape, eInOut, eOutBack, hand, lerp, ramp, roughArrow, roughPoly, t, wavyLine } from "../kit";

// 낮 — 학생 여섯의 색연필 선이 ClassIn 마크로 모인다. 마지막 프레임은 HTML 첫 화면(포스터)으로 쓴다.
const MARK = { cx: 960, cy: 214, w: 180 };
const ROUTES: Record<string, Array<[number, number]>> = {
  A: [[-20, 96], [300, 96], [418, 200], [858, 200]],
  B: [[-20, 430], [470, 430], [664, 214], [858, 214]],
  C: [[160, 1100], [160, 880], [796, 228], [858, 228]],
  D: [[1940, 120], [1620, 120], [1540, 200], [1062, 200]],
  E: [[1940, 470], [1460, 470], [1216, 214], [1062, 214]],
  F: [[1760, 1100], [1760, 880], [1124, 228], [1062, 228]],
};
const AT: Record<string, number> = { A: 0, B: 2, C: 4, D: 1, E: 3, F: 5 };

export const S7End: React.FC = () => {
  const f = useCurrentFrame();
  const mark = interpolate(f, [16, 30], [0, 1], { ...CL, easing: eOutBack });
  const fade = lerp(1, 0.32, ramp(f, 30, 56));
  const drift = lerp(1, 1.01, ramp(f, 60, 180, eInOut));
  const arrow = roughArrow([1204, 744], [1290, 742], 0.0, 4);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.day} ruled={0.35} />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <Layer style={{ opacity: fade }}>
          {STUDENTS.map((s, i) => (
            <Ink key={s.id} d={roughPoly(ROUTES[s.id], 70 + i, 1.4)} color={PENCIL[s.id]} width={8} at={AT[s.id]} dur={18} filter="pencil" />
          ))}
        </Layer>
        <div style={{ position: "absolute", left: MARK.cx - MARK.w / 2, top: MARK.cy - 34, width: MARK.w, display: "flex", justifyContent: "center", transform: `scale(${lerp(0.4, 1, mark)})`, opacity: interpolate(f, [16, 20], [0, 1], CL) }}>
          <Img src={staticFile("brand/classin-mark.png")} style={{ width: MARK.w }} />
        </div>
        <KText lines={[[{ t: "손은 덜고," }]]} at={30} size={116} align="center" style={{ position: "absolute", left: 0, right: 0, top: 318 }} />
        <KText lines={[[{ t: "퀄리티와 만족", c: BRAND.green }, { t: "은 높게." }]]} at={42} size={116} align="center" style={{ position: "absolute", left: 0, right: 0, top: 462 }} />
        <Layer>
          <Ink d={wavyLine(452, 1098, 610, 8, 6)} color={BRAND.green} width={7} at={62} dur={12} />
        </Layer>
        {/* 시작 제안: 포스트잇 손글씨 */}
        <Sticky x={566} y={676} w={770} h={130} color="#FFE479" rot={-1.6} at={70}>
          <div style={{ ...hand(74, INK.navy), lineHeight: 1, marginTop: 6, marginLeft: 18 }}>시작은, 개별진도반 하나부터</div>
        </Sticky>
        <Tape x={886} y={662} w={130} rot={3} />
        <Layer>
          <Ink d={arrow.body} color={INK.navy} width={5} at={84} dur={8} />
          <Ink d={arrow.head} color={INK.navy} width={5} at={90} dur={4} />
        </Layer>
        <div style={{ position: "absolute", left: 0, right: 0, top: 862, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: ramp(f, 88, 98) }}>
          <div style={{ width: 90 * ramp(f, 88, 104), height: 1.5, background: INK.sub }} />
          <span style={t(27, 800, INK.head, { lineHeight: 1, letterSpacing: "0.01em" })}>
            개별진도 × <span style={{ color: BRAND.green }}>ClassIn</span> + AI
          </span>
          <div style={{ width: 90 * ramp(f, 88, 104), height: 1.5, background: INK.sub }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 976, textAlign: "center", ...t(17, 500, INK.sub, { lineHeight: 1 }), opacity: ramp(f, 98, 108) }}>
          AI 진도 설계 · 원장 화면 · 학부모 리포트는 개발이 필요한 방향 예시이며, 화면 속 학생과 점수는 가상 데이터입니다.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
