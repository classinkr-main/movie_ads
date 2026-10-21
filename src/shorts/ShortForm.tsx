import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY, FONT_FAMILY_ZH } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";
import { segmentAt, segmentOffsets, timedCues } from "./timeline";
import type { Crop, ShortSpec } from "./types";

// 1080×1920 세로 레이아웃. 상단 헤드 카피 → 가운데 16:9 영상 → 바로 아래 원어·한국어 자막 → 하단 Classin
export const SHORT_W = 1080;
export const SHORT_H = 1920;
const VIDEO_TOP = 650;
const VIDEO_H = Math.round((SHORT_W * 9) / 16); // 608
const SUB_TOP = VIDEO_TOP + VIDEO_H + 44;

const BG_TOP = "#0F2119";
const BG_BOTTOM = "#07110D";

// *강조* 구간을 연두로 칠한다
const Emph: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span key={i} style={{ color: C.lime }}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

// 고정 노이즈 — 그라디언트 밴딩을 덮는다. 매 프레임 바꾸면 인코딩 용량이 몇 배로 커지므로 정지 텍스처로 둔다
const NightGrain: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.06,
      mixBlendMode: "screen",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      backgroundSize: "240px 240px",
    }}
  />
);

// 어두운 배경용 강조 — 글자 높이 전체를 덮는 연두 박스가 왼쪽부터 칠해지고 글자는 잉크색으로 뒤집힌다
const MarkerBox: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - delay, fps, SMOOTH, 14);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.14em", margin: "0 0.04em" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: "0.1em",
          bottom: "0.04em",
          width: `${p * 100}%`,
          background: C.lime,
          borderRadius: "0.12em",
          transform: "rotate(-1.2deg)",
        }}
      />
      <span style={{ position: "relative", color: p > 0.5 ? C.ink : C.white }}>{text}</span>
    </span>
  );
};

const Header: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrowIn = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, height: VIDEO_TOP - 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 30,
          fontWeight: 700,
          color: C.lime,
          letterSpacing: "0.02em",
          opacity: eyebrowIn,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ width: 34, height: 3, background: C.lime, borderRadius: 2 }} />
        {spec.eyebrow}
        <span style={{ width: 34, height: 3, background: C.lime, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {spec.headline.map((line, li) => {
          const delay = 3 + li * 5;
          const s = sp(frame - delay, fps, SMOOTH, 16);
          return (
            <div
              key={li}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 86,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.035em",
                color: C.white,
                textAlign: "center",
                opacity: interpolate(frame - delay, [0, 6], [0, 1], clamp),
                transform: `translateY(${interpolate(s, [0, 1], [36, 0])}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {line.map((run, ri) => (run.hl ? <MarkerBox key={ri} delay={delay + 8} text={run.t} /> : <span key={ri}>{run.t}</span>))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 원본 1920×1080 중 crop 영역이 1080×608 상자에 꽉 차도록 놓는다. 구간 안에서 아주 느리게 밀어 들어간다
const VideoPane: React.FC<{ spec: ShortSpec; clip: string }> = ({ spec, clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = segmentAt(spec.segments, t);
  const seg = spec.segments[idx];
  const segStart = segmentOffsets(spec.segments)[idx];
  const segLen = seg.to - seg.from;
  const crop: Crop = spec.crops[seg.shot ?? "wide"];
  const drift = interpolate(t - segStart, [0, segLen], [1, 1.035], clamp);
  const scale = (SHORT_W / crop.w) * drift;
  const cropH = (crop.w * 9) / 16;
  // 크롭 중심을 기준으로 확대해 가장자리가 비지 않게 한다
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + cropH / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: VIDEO_TOP, width: SHORT_W, height: VIDEO_H, overflow: "hidden", background: "#000" }}>
      <OffthreadVideo
        src={staticFile(clip)}
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          left: SHORT_W / 2 - cx * scale,
          top: VIDEO_H / 2 - cy * scale,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          maxWidth: "none",
        }}
      />
    </div>
  );
};

const NameTag: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // 지금 화자와, 그 화자가 말하기 시작한 시점(화자가 바뀔 때마다 이름표가 다시 들어온다)
  let speakerIdx = spec.cues[0].speaker;
  let runStart = 0;
  for (const c of timedCues(spec)) {
    if (c.at > t) break;
    if (c.speaker !== speakerIdx) runStart = c.at;
    speakerIdx = c.speaker;
  }
  const speaker = spec.speakers[speakerIdx];
  const local = frame - Math.round(runStart * fps);
  const s = sp(local, fps, SMOOTH, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: VIDEO_TOP + VIDEO_H - 92,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 22px 12px 14px",
        borderRadius: 999,
        background: "rgba(7,17,13,0.78)",
        border: "1px solid rgba(200,240,90,0.35)",
        opacity: interpolate(local, [0, 6], [0, 1], clamp),
        transform: `translateX(${interpolate(s, [0, 1], [-24, 0])}px)`,
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 6, background: C.lime, marginLeft: 6 }} />
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>{speaker.name}</span>
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.72)" }}>{speaker.role}</span>
    </div>
  );
};

const Subtitles: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = timedCues(spec).find((c) => t >= c.at && t < c.until);
  if (!cue) return null;
  const local = frame - Math.round(cue.at * fps);
  const appear = interpolate(local, [0, 4], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: SUB_TOP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [10, 0])}px)`,
      }}
    >
      {cue.src ? (
        <div style={{ fontFamily: FONT_FAMILY_ZH, fontSize: 36, fontWeight: 500, lineHeight: 1.4, color: "rgba(255,255,255,0.62)", letterSpacing: "0.01em", textWrap: "balance" }}>{cue.src}</div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.32,
          letterSpacing: "-0.025em",
          color: C.white,
          wordBreak: "keep-all",
          textWrap: "balance",
          textShadow: "0 2px 12px rgba(0,0,0,0.35)",
        }}
      >
        <Emph text={cue.ko} />
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1606, display: "flex", justifyContent: "center" }}>
    <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 60, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.95 }} />
  </div>
);

export const ShortForm: React.FC<{ spec: ShortSpec; clip: string }> = ({ spec, clip }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)` }}>
    <Header spec={spec} />
    <VideoPane spec={spec} clip={clip} />
    <NameTag spec={spec} />
    <Subtitles spec={spec} />
    <Footer />
    <NightGrain />
  </AbsoluteFill>
);
