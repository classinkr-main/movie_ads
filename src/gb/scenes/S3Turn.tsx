import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TONES } from "../theme";
import { Icon } from "../icons";
import { Backdrop, CL, FrameMarks, Hud, KText, Timecode, eIn, eInOut, eOut, lerp, ramp, rng } from "../kit";
import { COLS, GRID, cellXY } from "./S2Chaos";

// 암전 — 36칸이 한 점으로 빨려 들어가고, 한 줄(한 화면)이 열린다.
const T = TONES.void;
const CX = 960;
const CY = 530;

export const S3Turn: React.FC = () => {
  const f = useCurrentFrame();
  const r = rng(5);
  const lineW = interpolate(f, [8, 26], [0, 1720], { ...CL, easing: eInOut });
  const charge = ramp(f, 38, 54, eIn);
  const open = ramp(f, 51, 60, eIn);
  const textOut = ramp(f, 50, 56, eIn);
  const core = interpolate(f, [5, 10, 18], [0, 1, 0], { ...CL, easing: eOut });
  const cells: Array<{ x: number; y: number; c: number; d: number }> = [];
  for (let c = 0; c < 6; c++)
    for (let row = 0; row < 6; row++) {
      const p = cellXY(c, row);
      cells.push({ x: p.x + GRID.cw / 2, y: p.y + GRID.ch / 2, c, d: r() * 3 });
    }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop from={T} to={TONES.dawn} k={charge * 0.5} grid={0.25} gridSize={40} />
      {/* 아이콘 36개가 중심으로 수렴 */}
      {cells.map((c, i) => {
        const k = ramp(f, c.d, 10 + c.d, eIn);
        if (k >= 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: lerp(c.x, CX, k) - 15, top: lerp(c.y, CY, k) - 15, opacity: 1 - k * 0.7, transform: `scale(${1 - k * 0.6}) rotate(${k * 90}deg)` }}>
            <Icon name={COLS[c.c].icon} size={30} color="#FFE1D2" stroke={1.7} />
          </div>
        );
      })}
      {/* 중심: 다이아몬드 섬광 */}
      <div style={{ position: "absolute", left: CX - 40, top: CY - 40, width: 80, height: 80, border: "2px solid #FFFFFF", transform: `rotate(45deg) scale(${0.3 + core * 1.6})`, opacity: core }} />
      <div style={{ position: "absolute", left: CX - 9, top: CY - 9, width: 18, height: 18, background: "#FFFFFF", transform: `rotate(45deg) scale(${core * 1.4})`, opacity: core, boxShadow: "0 0 40px rgba(255,255,255,0.8)" }} />
      {/* 한 줄 → 한 화면 */}
      <div
        style={{
          position: "absolute",
          left: CX - lineW / 2,
          top: CY - 1.5 - open * 560,
          width: lineW,
          height: 3 + open * 1120,
          background: open > 0.001 ? `rgba(240,255,249,${0.6 + 0.4 * open})` : "linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFFFFF 18%, #FFFFFF 82%, rgba(255,255,255,0) 100%)",
          boxShadow: `0 0 ${10 + charge * 30}px rgba(180,255,225,${0.35 + charge * 0.4})`,
        }}
      />
      {/* 선 양 끝 눈금 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ramp(f, 20, 28) * (1 - open) }}>
        {Array.from({ length: 25 }, (_, i) => {
          const x = CX - 840 + i * 70;
          const big = i % 6 === 0;
          return <line key={i} x1={x} x2={x} y1={CY + 12} y2={CY + (big ? 30 : 20)} stroke="rgba(255,255,255,0.4)" strokeWidth={1.3} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 352, opacity: 1 - textOut, transform: `scale(${1 + charge * 0.025})` }}>
        <KText lines={[[{ t: "AI", c: T.accent }, { t: "로 설계하고," }]]} at={12} size={118} color={T.ink} align="center" stagger={1.5} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 588, opacity: 1 - textOut, transform: `scale(${1 + charge * 0.025})` }}>
        <KText lines={[[{ t: "한 화면에서", c: T.accent, u: T.accent }, { t: " 관리한다면요?" }]]} at={26} size={118} color={T.ink} align="center" stagger={1.5} />
      </div>
      <Hud tone={T} chapter={3} label="전환" out={50} />
      <FrameMarks tone={T} out={52} />
      <Timecode tone={T} offset={240} />
    </AbsoluteFill>
  );
};
