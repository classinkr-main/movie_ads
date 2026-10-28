import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, easeInOutCubic, easeOutExpo, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

// 다큐 톤 오버레이 — 화면을 덮지 않도록 작고 단정하게. 흰 글자 + 연두 포인트.
const shadow = "0 2px 18px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)";

const useInOut = (dur: number, inLen = 14, outLen = 12) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, inLen], [0, 1], { ...clamp, easing: easeOutExpo });
  const exit = interpolate(frame, [dur - outLen, dur], [1, 0], { ...clamp, easing: easeInOutCubic });
  return { frame, enter, exit, alpha: Math.min(enter, exit) };
};

// 아래에서 마스크로 올라오는 한 줄
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}>
      <div style={{ transform: `translateY(${interpolate(s, [0, 1], [105, 0])}%)`, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), ...style }}>
        {children}
      </div>
    </div>
  );
};

const Scrim: React.FC<{ alpha: number; from?: "bottom" | "left" | "full"; strength?: number }> = ({ alpha, from = "bottom", strength = 0.55 }) => {
  const bg =
    from === "full"
      ? `rgba(0,0,0,${strength})`
      : from === "left"
        ? `linear-gradient(90deg, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,${strength * 0.5}) 45%, rgba(0,0,0,0) 75%)`
        : `linear-gradient(0deg, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,${strength * 0.45}) 30%, rgba(0,0,0,0) 55%)`;
  return <AbsoluteFill style={{ background: bg, opacity: alpha }} />;
};

export const TitleCard: React.FC<{ dur: number; eyebrow: string; title: string; sub: string }> = ({ dur, eyebrow, title, sub }) => {
  const { frame, alpha, exit } = useInOut(dur, 18, 16);
  const line = interpolate(frame, [6, 34], [0, 1], { ...clamp, easing: easeOutExpo });
  return (
    <AbsoluteFill>
      <Scrim alpha={alpha} from="left" strength={0.62} />
      <div style={{ position: "absolute", left: 120, bottom: 150, fontFamily: FONT_FAMILY, color: C.white, opacity: exit, textShadow: shadow }}>
        <Rise delay={4}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.32em", color: C.lime }}>{eyebrow}</div>
        </Rise>
        <div style={{ height: 3, width: 140 * line, background: C.lime, margin: "22px 0 26px" }} />
        <Rise delay={10}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.08 }}>{title}</div>
        </Rise>
        <Rise delay={18}>
          <div style={{ fontSize: 36, fontWeight: 500, marginTop: 24, color: "rgba(255,255,255,0.86)", letterSpacing: "0.02em" }}>{sub}</div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{ dur: number; name: string; role: string; note?: string }> = ({ dur, name, role, note }) => {
  const { frame, exit, alpha } = useInOut(dur, 12, 12);
  const bar = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: easeOutExpo });
  return (
    <>
      {/* 밝은 벽·스크린 위에서도 읽히도록 왼쪽 아래만 살짝 어둡게 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 150,
          width: 1250,
          height: note ? 300 : 260,
          background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)",
          opacity: alpha,
        }}
      />
      <div style={{ position: "absolute", left: 120, bottom: 230, display: "flex", alignItems: "stretch", gap: 22, fontFamily: FONT_FAMILY, opacity: exit }}>
        <div style={{ width: 6, background: C.lime, transform: `scaleY(${bar})`, transformOrigin: "50% 100%", borderRadius: 3 }} />
        <div style={{ textShadow: shadow }}>
          <Rise delay={4}>
            <div style={{ fontSize: 44, fontWeight: 700, color: C.white, letterSpacing: "-0.01em" }}>{name}</div>
          </Rise>
          <Rise delay={9}>
            <div style={{ fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.82)", marginTop: 4 }}>{role}</div>
          </Rise>
          {note ? (
            <Rise delay={14}>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.lime, letterSpacing: "0.04em", marginTop: 10 }}>{note}</div>
            </Rise>
          ) : null}
        </div>
      </div>
    </>
  );
};

// 좌상단 섹션 라벨 — "02  축사"
export const ChapterTag: React.FC<{ dur: number; index: string; label: string }> = ({ dur, index, label }) => {
  const { alpha } = useInOut(dur, 12, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 128,
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        fontFamily: FONT_FAMILY,
        color: C.white,
        opacity: alpha,
        textShadow: shadow,
        transform: `translateX(${(1 - alpha) * -16}px)`,
        padding: "10px 20px 12px",
        marginLeft: -20,
        borderRadius: 10,
        background: "rgba(0,0,0,0.38)",
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 700, color: C.lime, letterSpacing: "0.08em" }}>{index}</span>
      <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.02em" }}>{label}</span>
    </div>
  );
};

// 상시 HUD — 실황 느낌의 LIVE 표시와 행사명
export const LiveHud: React.FC<{ frame: number; total: number }> = ({ frame, total }) => {
  const alpha = interpolate(frame, [20, 40, total - 120, total - 96], [0, 1, 1, 0], clamp);
  const blink = 0.55 + 0.45 * Math.round((Math.sin((frame / 30) * Math.PI) + 1) / 2);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 72,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONT_FAMILY,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "0.16em",
        color: "rgba(255,255,255,0.88)",
        opacity: alpha,
        textShadow: shadow,
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 6, background: "#FF4D4D", opacity: blink, boxShadow: "0 0 10px rgba(255,77,77,0.7)" }} />
      <span>LIVE</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span>ASIA AI EDUCATION FORUM · BUSAN</span>
    </div>
  );
};

export const Subtitle: React.FC<{ dur: number; text: string }> = ({ dur, text }) => {
  const { alpha } = useInOut(dur, 5, 5);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, display: "flex", justifyContent: "center", opacity: alpha }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 46,
          fontWeight: 600,
          color: C.white,
          letterSpacing: "-0.01em",
          lineHeight: 1.35,
          textAlign: "center",
          padding: "10px 28px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.52)",
          maxWidth: 1500,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// 화면 중앙(또는 좌측)의 짧은 메시지 — 하이라이트 버전의 키 카피
export const Statement: React.FC<{ dur: number; lines: string[]; eyebrow?: string; align?: "center" | "left" }> = ({ dur, lines, eyebrow, align = "center" }) => {
  const { alpha, exit } = useInOut(dur, 16, 14);
  const left = align === "left";
  return (
    <AbsoluteFill>
      <Scrim alpha={alpha} from={left ? "left" : "full"} strength={left ? 0.6 : 0.42} />
      <AbsoluteFill
        style={{
          alignItems: left ? "flex-start" : "center",
          justifyContent: left ? "flex-end" : "center",
          padding: left ? "0 0 160px 120px" : 0,
          fontFamily: FONT_FAMILY,
          color: C.white,
          textAlign: left ? "left" : "center",
          textShadow: shadow,
          opacity: exit,
        }}
      >
        {eyebrow ? (
          <Rise delay={2}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.3em", color: C.lime, marginBottom: 22 }}>{eyebrow}</div>
          </Rise>
        ) : null}
        {lines.map((l, i) => (
          <Rise key={i} delay={6 + i * 6}>
            <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.16 }}>{l}</div>
          </Rise>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ dur: number; title: string; sub: string }> = ({ dur, title, sub }) => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 24], [0, 0.72], { ...clamp, easing: easeInOutCubic });
  const fadeAll = interpolate(frame, [dur - 24, dur], [1, 0], clamp);
  const logo = interpolate(frame, [26, 50], [0, 1], { ...clamp, easing: easeOutExpo });
  return (
    <AbsoluteFill style={{ opacity: fadeAll }}>
      <AbsoluteFill style={{ background: `rgba(4, 28, 21, ${bg})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, color: C.white, textAlign: "center" }}>
        <Rise delay={8}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.3em", color: C.lime }}>{title}</div>
        </Rise>
        <Rise delay={14}>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 26 }}>{sub}</div>
        </Rise>
        <Img
          src={staticFile("brand/classin-wordmark.png")}
          style={{
            height: 64,
            marginTop: 70,
            filter: "brightness(0) invert(1)",
            opacity: logo,
            transform: `translateY(${(1 - logo) * 14}px)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
