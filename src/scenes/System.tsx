import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Camera, GraphPaper } from "../components/Stage";
import { Clip, Cutout, Tape } from "../components/Media";
import { HandLine, Highlighter } from "../components/Marks";
import { Caption, MaskUp, Slam } from "../components/Type";
import { IconBoard, IconChart, IconFile, IconPhone, IconRec } from "../components/Icons";
import { C, CUES, FONT, scene } from "../lib/theme";
import { POP, clamp, ease, prog, sp } from "../lib/motion";

// S6 시스템 흐름 (600–840f) — 수업 전·중·후가 한 줄로 이어지는 노선도. 역은 박마다 하나씩 켜진다.
const { from } = scene("system");
const ST = CUES.system.stations.map((f) => f - from);
const LOOP = CUES.system.loop.map((f) => f - from);
const FLOW = CUES.system.flow - from;
const ZOOM = CUES.system.zoom.map((f) => f - from);

const X = [230, 595, 960, 1325, 1690];
const LINE_Y = 610;

const MiniDoc: React.FC = () => (
  <AbsoluteFill style={{ background: C.white, padding: 18, boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ padding: "3px 10px", background: C.cobalt, color: C.white, fontFamily: FONT.mono, fontWeight: 600, fontSize: 16, borderRadius: 4 }}>EDB</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 15, color: C.muted }}>3step_02.edb</div>
    </div>
    {[0.92, 0.7, 0.84, 0.55, 0.76].map((w, i) => (
      <div key={i} style={{ width: `${w * 100}%`, height: 10, borderRadius: 5, background: i === 2 ? C.signal : C.ink, opacity: i === 2 ? 0.85 : 0.18, marginBottom: 12 }} />
    ))}
  </AbsoluteFill>
);

const MiniChart: React.FC = () => (
  <AbsoluteFill style={{ background: C.white }}>
    <svg width="100%" height="100%" viewBox="0 0 250 150">
      {[0.55, 0.8, 0.62, 0.9, 0.72].map((h, i) => (
        <rect key={i} x={22 + i * 44} y={130 - h * 100} width={28} height={h * 100} rx={4} fill={i === 3 ? C.signal : C.cobalt} />
      ))}
      <line x1={14} x2={236} y1={130} y2={130} stroke={C.ink} strokeOpacity={0.25} strokeWidth={2} />
    </svg>
  </AbsoluteFill>
);

const CameraCard: React.FC = () => <Img src={staticFile("photos/hw-camera.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%" }} />;

const STATIONS: Array<{ title: string; sub: string; Icon: React.FC<{ size?: number; color?: string }>; card: React.ReactNode }> = [
  { title: "EDB 교안", sub: "판서·교안 파일", Icon: IconFile, card: <MiniDoc /> },
  { title: "전자칠판", sub: "실시간 판서", Icon: IconBoard, card: <Img src={staticFile("photos/hw-room86.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 40%" }} /> },
  { title: "수업 녹화", sub: "자동 녹화·다시보기", Icon: IconRec, card: <CameraCard /> },
  { title: "복습 · LMS", sub: "과제·복습", Icon: IconPhone, card: <Clip src="phone.mp4" pos="50% 40%" /> },
  { title: "관리자 데이터", sub: "출결·참여·운영", Icon: IconChart, card: <MiniChart /> },
];

const GROUPS: Array<{ label: string; x0: number; x1: number; at: number }> = [
  { label: "수업 전", x0: X[0] - 150, x1: X[0] + 150, at: ST[0] },
  { label: "수업 중", x0: X[1] - 150, x1: X[2] + 150, at: ST[1] },
  { label: "수업 후", x0: X[3] - 150, x1: X[4] + 150, at: ST[3] },
];

const Station: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const at = ST[i];
  if (frame < at - 1) return null;
  const s = sp(frame - at, POP);
  const card = sp(frame - at - 3, POP);
  const label = prog(frame, at + 2, at + 12, ease.outQuint);
  const { Icon, title, sub } = STATIONS[i];
  const rot = i % 2 ? 3 : -3;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - card) * 50}px)`, opacity: Math.min(1, card * 2) }}>
        <Cutout x={X[i] - 150} y={330} w={300} h={210} rotate={rot} border={10} shadow={0.8}>
          <Sequence from={at} layout="none">
            {STATIONS[i].card}
          </Sequence>
        </Cutout>
        <Tape x={X[i] + (i % 2 ? -60 : 60)} y={334} w={110} rotate={i % 2 ? -14 : 12} color={i % 2 ? "rgba(47,60,255,0.7)" : "rgba(255,90,31,0.78)"} />
      </div>
      <div
        style={{
          position: "absolute",
          left: X[i] - 50,
          top: LINE_Y - 50,
          width: 100,
          height: 100,
          borderRadius: 99,
          background: C.cobalt,
          border: `7px solid ${C.limeLight}`,
          boxSizing: "border-box",
          boxShadow: `0 0 0 4px ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s})`,
        }}
      >
        <Icon size={46} color={C.white} />
      </div>
      <div style={{ position: "absolute", left: X[i] - 200, width: 400, top: LINE_Y + 76, textAlign: "center" }}>
        <MaskUp start={at + 2} dur={10}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{title}</div>
        </MaskUp>
        <Caption size={20} style={{ marginTop: 6, opacity: label, color: C.ink }}>
          {sub}
        </Caption>
      </div>
    </>
  );
};

const Track: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [ST[0], ST[4]], [0, 1], clamp);
  const x1 = X[0] + (X[4] - X[0]) * p;
  // 되돌아오는 점선 루프: 마지막 역 → 아래로 → 왼쪽 → 첫 역
  const loopP = prog(frame, LOOP[0], LOOP[1], ease.inOut);
  const yB = 800;
  const loopD = `M${X[4]},${LINE_Y} C${X[4] + 170},${LINE_Y} ${X[4] + 170},${yB} ${X[4] - 40},${yB} L${X[0] + 40},${yB} C${X[0] - 170},${yB} ${X[0] - 170},${LINE_Y + 90} ${X[0] - 64},${LINE_Y + 34}`;
  const loopLen = 2 * 330 + (X[4] - X[0] - 80) + 60;
  const head = prog(frame, LOOP[1] - 4, LOOP[1] + 2);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={X[0]} x2={x1} y1={LINE_Y} y2={LINE_Y} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      {loopP > 0 && (
        <path d={loopD} fill="none" stroke={C.signal} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${loopLen * loopP} ${loopLen}`} />
      )}
      {head > 0 && (
        <g transform={`translate(${X[0] - 64},${LINE_Y + 34}) rotate(-38)`} opacity={head}>
          <path d="M0,0 L-30,-14 M0,0 L-30,14" stroke={C.signal} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

const Groups: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {GROUPS.map((g) => {
        const a = prog(frame, g.at, g.at + 10);
        return (
          <React.Fragment key={g.label}>
            <HandLine from={[g.x0, 300]} to={[g.x1, 300]} start={g.at} dur={10} color={C.ink} width={3} wobble={2} seed={g.label} />
            <div style={{ position: "absolute", left: g.x0, top: 300, width: 3, height: 16, background: C.ink, opacity: a }} />
            <div style={{ position: "absolute", left: g.x1 - 3, top: 300, width: 3, height: 16, background: C.ink, opacity: a }} />
            <div style={{ position: "absolute", left: (g.x0 + g.x1) / 2 - 100, width: 200, top: 256, textAlign: "center", opacity: a }}>
              <span style={{ background: C.limeLight, padding: "0 14px", fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: C.cobalt }}>{g.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export const System: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, ZOOM[0]], [1, 1.03], clamp);
  const zoom = interpolate(frame, [ZOOM[0], ZOOM[1]], [1, 3.4], { ...clamp, easing: ease.inExpo });
  const blur = interpolate(frame, [ZOOM[0] + 10, ZOOM[1]], [0, 14], clamp);
  const toLime = interpolate(frame, [ZOOM[1] - 12, ZOOM[1]], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.limeLight, overflow: "hidden" }}>
      <Camera scale={drift * zoom} blur={blur} originX={960} originY={900}>
        <GraphPaper>
          <div style={{ position: "absolute", left: 120, top: 92 }}>
            <Caption size={22} color={C.cobalt} style={{ fontWeight: 600, letterSpacing: "0.24em" }}>
              HOW IT WORKS
            </Caption>
            <MaskUp start={0} dur={12} style={{ marginTop: 8 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 820, fontSize: 96, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1.05 }}>수업 시스템 OS</div>
            </MaskUp>
          </div>
          <HandLine from={[124, 238]} to={[640, 232]} start={6} dur={14} width={9} wobble={5} hook seed="title" />
          <Groups />
          <Track />
          {STATIONS.map((_, i) => (
            <Station key={i} i={i} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 838, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              {frame >= FLOW && <Highlighter x={-24} y="22%" w="calc(100% + 48px)" h="70%" start={FLOW + 2} dur={9} />}
              <Slam start={FLOW} from={1.4} rgb={false} style={{ position: "relative", fontFamily: FONT.display, fontWeight: 900, fontSize: 132, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1.05 }}>
                한 흐름으로.
              </Slam>
            </div>
          </div>
        </GraphPaper>
      </Camera>
      <AbsoluteFill style={{ background: C.lime, opacity: toLime }} />
    </AbsoluteFill>
  );
};
