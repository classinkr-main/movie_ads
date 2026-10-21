import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../motion";
import { Highlighter } from "./Flourish";
import { MaskText } from "./Kinetic";
import { C } from "./theme";

// 내레이션형 애니매틱(06·07) 공용 — 비트 타이밍, 하단 자막, 큰 타이포, 갈매기 해설자, 기기 프레임.

export type Beat = { from: number; to: number; line: string };

// 현재 비트 인덱스와 비트 안 로컬 프레임
export const useBeat = (beats: readonly Beat[]) => {
  const frame = useCurrentFrame();
  let i = beats.findIndex((b) => frame >= b.from && frame < b.to);
  if (i < 0) i = frame < beats[0].from ? 0 : beats.length - 1;
  return { i, local: frame - beats[i].from, beat: beats[i], frame };
};

// 비트 안에서만 보이는 레이어 — 앞뒤 fade 포함. 안쪽 useCurrentFrame()은 비트 시작이 0이다.
export const InBeat: React.FC<{ beat: Beat; children: React.ReactNode; fade?: number; style?: React.CSSProperties }> = ({ beat, children, fade = 8, style }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [beat.from, beat.from + fade, beat.to, beat.to + fade], [0, 1, 1, 0], clamp);
  return (
    <Sequence from={beat.from} durationInFrames={beat.to - beat.from + fade} layout="none">
      <AbsoluteFill style={{ opacity: o, ...style }}>{children}</AbsoluteFill>
    </Sequence>
  );
};

// 하단 자막 — 녹음 대본 한 줄씩. 녹음 전이므로 비트 길이에 맞춘 가이드 타이밍.
export const Caption: React.FC<{ beats: readonly Beat[]; bottom?: number }> = ({ beats, bottom = 64 }) => {
  const { i, local, beat } = useBeat(beats);
  const len = beat.to - beat.from;
  const o = interpolate(local, [0, 6, len - 6, len], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        key={i}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 34,
          fontWeight: 600,
          color: C.white,
          background: "rgba(28,27,23,0.78)",
          borderRadius: 14,
          padding: "12px 28px",
          letterSpacing: "-0.01em",
          maxWidth: 1400,
          textAlign: "center",
          wordBreak: "keep-all",
        }}
      >
        {beat.line}
      </div>
    </div>
  );
};

// 큰 타이포 — 핵심어. mark에 해당하는 부분을 형광펜으로 칠한다.
export const BigType: React.FC<{ text: string; mark?: string; delay?: number; size?: number; align?: "left" | "center"; color?: string; style?: React.CSSProperties }> = ({
  text,
  mark,
  delay = 4,
  size = 96,
  align = "left",
  color = C.ink,
  style,
}) => {
  const lines = text.split("\n");
  return (
    <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 900, color, letterSpacing: "-0.045em", lineHeight: 1.16, textAlign: align, wordBreak: "keep-all", ...style }}>
      {lines.map((ln, li) => {
        const k = mark ? ln.indexOf(mark) : -1;
        const body =
          k < 0 ? (
            ln
          ) : (
            <>
              {ln.slice(0, k)}
              <Highlighter delay={delay + 10 + li * 4}>{mark}</Highlighter>
              {ln.slice(k + mark!.length)}
            </>
          );
        return (
          <div key={li}>
            <MaskText delay={delay + li * 4}>
              <span>{body}</span>
            </MaskText>
          </div>
        );
      })}
    </div>
  );
};

// 갈매기 해설자 — 00_공통에셋 투명 PNG. 살짝 위아래로 떠 있다.
export const Seagull: React.FC<{ size: number; x: number; y: number; delay?: number; flip?: boolean; style?: React.CSSProperties }> = ({ size, x, y, delay = 0, flip = false, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, PUNCH);
  const bob = Math.sin((frame - delay) / 9) * size * 0.012;
  return (
    <Img
      src={staticFile("00_공통에셋/character/seagull_explain.png")}
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        width: size,
        height: size,
        opacity: interpolate(frame - delay, [0, 4], [0, 1], clamp),
        transform: `scale(${interpolate(s, [0, 1], [0.5, 1])}) scaleX(${flip ? -1 : 1})`,
        transformOrigin: "50% 90%",
        filter: "drop-shadow(0 18px 24px rgba(28,27,23,0.12))",
        ...style,
      }}
    />
  );
};

// 기기 프레임 — 화면 안은 children. 같은 크기의 화면 영역을 유지해 교안 위치가 바뀌지 않게 할 수 있다.
export type DeviceKind = "phone" | "tablet" | "laptop" | "board";
export const Device: React.FC<{ kind: DeviceKind; width: number; height: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ kind, width, height, children, style }) => {
  const bezel = kind === "phone" ? 18 : kind === "tablet" ? 22 : kind === "laptop" ? 16 : 20;
  const radius = kind === "phone" ? 44 : kind === "tablet" ? 34 : kind === "laptop" ? 18 : 10;
  const frameColor = kind === "board" ? "#2A2A26" : C.ink;
  return (
    <div style={{ position: "relative", width, ...style }}>
      <div style={{ width, height, background: frameColor, borderRadius: radius, padding: bezel, boxSizing: "border-box", boxShadow: "0 40px 90px rgba(28,27,23,0.18)" }}>
        <div style={{ width: "100%", height: "100%", background: C.white, borderRadius: Math.max(6, radius - bezel), overflow: "hidden", position: "relative" }}>{children}</div>
      </div>
      {kind === "laptop" && <div style={{ width: width * 1.14, height: 22, marginLeft: -width * 0.07, background: "#3A3934", borderRadius: "0 0 18px 18px" }} />}
      {kind === "board" && <div style={{ width: 8, height: 90, margin: "0 auto", background: "#3A3934" }} />}
    </div>
  );
};

// 전·중·후 알약 — 06의 중심 모티프. on은 켜진 구간.
export const PhasePills: React.FC<{ on: [boolean, boolean, boolean]; connect?: number; size?: number; delay?: number }> = ({ on, connect = 0, size = 64, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = ["전", "중", "후"];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {labels.map((l, i) => {
        const s = sp(frame - delay - i * 3, fps, SMOOTH);
        return (
          <React.Fragment key={l}>
            <div
              style={{
                width: size * 2.2,
                height: size * 1.4,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                fontFamily: FONT_FAMILY,
                fontSize: size,
                fontWeight: 900,
                color: on[i] ? C.ink : C.gray300,
                background: on[i] ? C.lime : C.white,
                border: on[i] ? "none" : `2px dashed ${C.gray300}`,
                transform: `scale(${0.7 + s * 0.3})`,
                opacity: s,
                transition: "none",
              }}
            >
              {l}
            </div>
            {i < 2 && (
              <div style={{ width: size * 1.4, height: 6, background: C.hairline, position: "relative", borderRadius: 6 }}>
                <div style={{ position: "absolute", inset: 0, width: `${Math.min(1, Math.max(0, connect * 2 - i)) * 100}%`, background: C.limeDeep, borderRadius: 6 }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
