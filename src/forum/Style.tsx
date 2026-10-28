import React from "react";
import { AbsoluteFill, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, easeInOutCubic, easeOutExpo, SMOOTH, sp, SNAP } from "../lib/motion";
import { C, FPS } from "../lib/theme";
import type { PanelSpec, StyleSpec } from "./types";

// 스타일편 전용 화면 요소 — 레터박스 틀, 그레인, 분할 화면, 박자 타이포.
const f = (sec: number) => Math.round(sec * FPS);
const shadow = "0 2px 24px rgba(0,0,0,0.5)";

// 위아래 레터박스와 그 안의 작은 글자. 아래 줄에는 지금 섹션과 날짜, 진행 막대
export const StyleFrame: React.FC<{ style: StyleSpec; total: number }> = ({ style, total }) => {
  const frame = useCurrentFrame();
  const bars = style.bars ?? 0;
  const sections = style.sections ?? [];
  const cur = [...sections].reverse().find((s) => frame >= f(s.at));
  const since = cur ? frame - f(cur.at) : 0;
  const swap = interpolate(since, [0, 10], [0, 1], { ...clamp, easing: easeOutExpo });
  const intro = interpolate(frame, [0, 12], [0, 1], clamp);
  const outro = interpolate(frame, [total - 30, total - 6], [1, 0], clamp);
  const small: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: "0.22em",
    color: "rgba(255,255,255,0.78)",
    whiteSpace: "nowrap",
  };
  if (!bars) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#050505" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#050505" }} />
      <div style={{ opacity: intro * outro }}>
        {style.top ? (
          <>
            <div style={{ ...small, position: "absolute", left: 72, top: bars / 2 - 11 }}>{style.top[0]}</div>
            <div style={{ ...small, position: "absolute", right: 72, top: bars / 2 - 11 }}>{style.top[1]}</div>
          </>
        ) : null}
        {cur ? (
          <>
            <div style={{ ...small, position: "absolute", left: 72, bottom: bars / 2 - 11, display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: C.lime }} />
              <span style={{ opacity: swap, transform: `translateY(${(1 - swap) * 10}px)`, color: C.white }}>{cur.label}</span>
            </div>
            <div style={{ ...small, position: "absolute", right: 72, bottom: bars / 2 - 11, opacity: swap }}>{cur.date}</div>
          </>
        ) : null}
        <div style={{ position: "absolute", left: 0, bottom: bars - 2, height: 2, width: `${(frame / total) * 100}%`, background: C.lime, opacity: 0.85 }} />
      </div>
    </AbsoluteFill>
  );
};

// 프레임마다 씨앗을 바꾸는 노이즈. 절반 해상도로 그려 키워서 입자가 조금 굵다
export const Grain: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: amount, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={960} height={540} style={{ width: 1920, height: 1080 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ amount: number }> = ({ amount }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${amount}) 100%)`, pointerEvents: "none" }} />
);

// 컷 시작의 흰 플래시
export const Flash: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, len], [0.9, 0], { ...clamp, easing: easeInOutCubic });
  return <AbsoluteFill style={{ background: "#fff", opacity: a, pointerEvents: "none" }} />;
};

// 분할 화면 — 칸마다 아래에서 열리고, 이름이 있으면 칸 아래쪽에 붙인다.
// volume(p) 은 그 칸이 열린 시점부터 센 프레임을 받는다
export const Panels: React.FC<{ panels: PanelSpec[]; frames: number; volume: (p: PanelSpec) => (fr: number) => number }> = ({ panels, frames, volume }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = 10;
  const n = panels.length;
  const w = (1920 - gap * (n - 1)) / n;
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      {panels.map((p, i) => {
        const d = f(p.delay ?? 0);
        const open = sp(frame - d, fps, SNAP);
        const drift = 1 + 0.04 * (frame / frames);
        const pos = p.focus ? `${p.focus[0]}% ${p.focus[1]}%` : "50% 50%";
        const media: React.CSSProperties = {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          transform: `scale(${(p.zoom ?? 1) * drift})`,
          transformOrigin: `50% ${p.focus?.[1] ?? 50}%`,
        };
        const tag = interpolate(frame - d, [8, 20], [0, 1], { ...clamp, easing: easeOutExpo });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (w + gap),
              top: 0,
              width: w,
              height: 1080,
              overflow: "hidden",
              clipPath: `inset(${(1 - open) * 100}% 0 0 0)`,
            }}
          >
            {/* 칸 영상은 열리는 순간 offset 부터 재생한다 */}
            <Sequence from={d} layout="none">
              {p.freeze ? (
                <Freeze frame={0}>
                  <OffthreadVideo src={staticFile(`forum/clips/${p.clip ?? p.id}.mp4`)} startFrom={f(p.offset ?? 0)} muted style={media} />
                </Freeze>
              ) : p.img ? (
                <Img src={staticFile(`forum/stills/${p.img}`)} style={media} />
              ) : (
                <OffthreadVideo
                  src={staticFile(`forum/clips/${p.clip ?? p.id}.mp4`)}
                  startFrom={f(p.offset ?? 0)}
                  playbackRate={p.rate ?? 1}
                  volume={volume(p)}
                  style={media}
                />
              )}
            </Sequence>
            {p.label ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "120px 26px 150px",
                  background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%)",
                  fontFamily: FONT_FAMILY,
                  color: C.white,
                  opacity: tag,
                  transform: `translateY(${(1 - tag) * 16}px)`,
                }}
              >
                <div style={{ width: 34, height: 4, background: C.lime, marginBottom: 14 }} />
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{p.label}</div>
                {p.sub ? <div style={{ fontSize: 19, fontWeight: 600, color: "rgba(255,255,255,0.78)", marginTop: 8, lineHeight: 1.35 }}>{p.sub}</div> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 박자에 맞춰 들어오는 큰 글자. swap 은 한 단어씩 갈아 끼우고, stack 은 줄을 쌓는다
export const Words: React.FC<{
  dur: number;
  items: Array<{ t: string; s: number; accent?: boolean }>;
  mode?: "swap" | "stack";
  size?: number;
  align?: "center" | "left";
}> = ({ dur, items, mode = "swap", size = 150, align = "center" }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], clamp);
  const shown = items.filter((it) => frame >= f(it.s));
  const visible = mode === "swap" ? shown.slice(-1) : shown;
  const left = align === "left";
  const scrim = interpolate(frame, [0, 8], [0, 1], clamp) * exit;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: left
            ? "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 80%)"
            : "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 70%)",
          opacity: scrim,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: left ? "flex-start" : "center",
          justifyContent: "center",
          padding: left ? "0 0 0 120px" : 0,
          fontFamily: FONT_FAMILY,
          color: C.white,
          textAlign: left ? "left" : "center",
          opacity: exit,
        }}
      >
        {visible.map((it) => {
          const k = frame - f(it.s);
          const slam = interpolate(k, [0, 5], [1.18, 1], { ...clamp, easing: easeOutExpo });
          const a = interpolate(k, [0, 3], [0, 1], clamp);
          return (
            <div
              key={`${it.t}-${it.s}`}
              style={{
                fontSize: size,
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.02,
                color: it.accent ? C.lime : C.white,
                textShadow: shadow,
                opacity: a,
                transform: `scale(${slam})`,
                transformOrigin: left ? "0% 50%" : "50% 50%",
                whiteSpace: "nowrap",
              }}
            >
              {it.t}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// DAY 01 — 큰 외곽선 숫자 옆에 섹션 이름
export const Stamp: React.FC<{ dur: number; num: string; eyebrow: string; title: string; sub: string }> = ({ dur, num, eyebrow, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const n = sp(frame, fps, SNAP);
  const t1 = sp(frame - 5, fps, SMOOTH);
  const t2 = sp(frame - 10, fps, SMOOTH);
  const rule = interpolate(frame, [4, 24], [0, 1], { ...clamp, easing: easeOutExpo });
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 65%)" }} />
      <div style={{ position: "absolute", left: 112, bottom: 150, display: "flex", alignItems: "flex-end", gap: 40, fontFamily: FONT_FAMILY, color: C.white }}>
        <div style={{ overflow: "hidden", paddingRight: 10 }}>
          <div
            style={{
              fontSize: 300,
              fontWeight: 900,
              lineHeight: 0.78,
              letterSpacing: "-0.05em",
              color: "transparent",
              WebkitTextStroke: `4px ${C.lime}`,
              transform: `translateY(${(1 - n) * 100}%)`,
            }}
          >
            {num}
          </div>
        </div>
        <div style={{ paddingBottom: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.4em", color: C.lime, opacity: t1, transform: `translateX(${(1 - t1) * -20}px)` }}>{eyebrow}</div>
          <div style={{ height: 3, width: 120 * rule, background: C.white, margin: "16px 0 18px" }} />
          <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, textShadow: shadow, opacity: t1, transform: `translateY(${(1 - t1) * 30}px)` }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.24em", marginTop: 16, color: "rgba(255,255,255,0.82)", opacity: t2 }}>{sub}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 가운데 타이틀 — 위아래 가는 선이 열리고 제목이 마스크로 올라온다
export const Lockup: React.FC<{ dur: number; eyebrow: string; title: string; sub: string; logo?: boolean }> = ({ dur, eyebrow, title, sub, logo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const rule = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: easeOutExpo });
  const t = sp(frame - 4, fps, SMOOTH);
  const s = sp(frame - 12, fps, SMOOTH);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      {/* 배경 화면의 글자와 겹치지 않도록 흐리게 눌러 둔다 */}
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * rule})`, backdropFilter: `blur(${14 * rule}px)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, color: C.white, textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.42em", color: C.lime, opacity: t }}>{eyebrow}</div>
        <div style={{ height: 2, width: 760 * rule, background: "rgba(255,255,255,0.8)", margin: "30px 0 26px" }} />
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 128, fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.05, textShadow: shadow, transform: `translateY(${(1 - t) * 105}%)` }}>{title}</div>
        </div>
        <div style={{ height: 2, width: 760 * rule, background: "rgba(255,255,255,0.8)", margin: "26px 0 28px" }} />
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.3em", opacity: s, transform: `translateY(${(1 - s) * 14}px)` }}>{sub}</div>
        {logo ? (
          <Img
            src={staticFile("brand/classin-wordmark.png")}
            style={{ height: 56, marginTop: 64, filter: "brightness(0) invert(1)", opacity: sp(frame - 24, fps, SMOOTH) }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
