import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, PAPER, STUDENTS } from "../theme";
import { AppWindow, Sidebar, StudentCard } from "../app";
import { CL, Hud, Ink, KText, Layer, PaperBg, eIn, lerp, ramp, roughLine } from "../kit";
import { COLS, cellXY, NOTE_ROT } from "./S2Chaos";

// 새 페이지 — 포스트잇 36장이 앱 화면 하나로 빨려 들어간다.
const WIN = { x: 520, y: 430, w: 880, h: 560 };
const CX = WIN.x + WIN.w / 2;
const CY = WIN.y + WIN.h / 2;

export const S3Turn: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 6, fps, config: { damping: 16, stiffness: 120 } });
  const push = ramp(f, 46, 60, eIn);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.clean} to={PAPER.graph} k={ramp(f, 30, 60) * 0.6} />
      <AbsoluteFill style={{ transform: `scale(${1 + push * 0.9})`, transformOrigin: `${CX}px ${CY}px`, opacity: 1 - ramp(f, 54, 60) * 0.6 }}>
        {/* 앱 창 */}
        <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.55, 1, pop)})`, transformOrigin: `${CX}px ${CY}px`, opacity: interpolate(f, [6, 10], [0, 1], CL) }}>
          <AppWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} pill="한 화면">
            <Sidebar w={170} />
            <div style={{ position: "absolute", left: 186, top: 14, right: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {STUDENTS.map((s, i) => (
                <div key={s.id} style={{ opacity: ramp(f, 14 + i * 2, 20 + i * 2), transform: `translateY(${(1 - ramp(f, 14 + i * 2, 22 + i * 2)) * 14}px) scale(0.72)`, transformOrigin: "0 0", height: 180 }}>
                  <StudentCard id={s.id} title={`학생 ${s.id}`} sub={s.today} />
                </div>
              ))}
            </div>
          </AppWindow>
        </div>
        {/* 포스트잇이 창 속으로 */}
        {COLS.map((c, ci) =>
          STUDENTS.map((s, r) => {
            const k = ci * 6 + r;
            const { x, y } = cellXY(ci, r);
            const d = (k % 7) * 0.5;
            const m = ramp(f, d, 11 + d, eIn);
            if (m >= 1) return null;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: lerp(x + 14 + NOTE_ROT[k].dx, CX - 98, m),
                  top: lerp(y + 6 + NOTE_ROT[k].dy, CY - 40, m),
                  width: 196,
                  height: 80,
                  background: c.color,
                  transform: `rotate(${NOTE_ROT[k].rot + m * 40}deg) scale(${1 - m * 0.85})`,
                  boxShadow: "0 8px 16px rgba(70,50,20,0.16)",
                  opacity: 1 - m * 0.4,
                }}
              />
            );
          }),
        )}
      </AbsoluteFill>
      <KText lines={[[{ t: "AI", c: BRAND.green }, { t: "로 설계하고," }]]} at={10} size={100} style={{ position: "absolute", left: 116, top: 112 }} />
      <KText lines={[[{ t: "한 화면에서", c: BRAND.green }, { t: " 관리한다면요?" }]]} at={24} size={100} style={{ position: "absolute", left: 116, top: 236 }} />
      <Layer>
        <Ink d={roughLine(118, 370, 640, 366, 41, 2)} color={BRAND.green} width={6} at={40} dur={10} />
      </Layer>
      <Hud page={3} label="전환" out={50} />
    </AbsoluteFill>
  );
};

