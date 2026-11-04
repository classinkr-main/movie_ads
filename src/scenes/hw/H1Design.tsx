import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BottomShade, ChapterTag, Fade, Lines, Plate, Screen, t, TopShade, Vignette } from "../../components/Cine";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { H } from "../../lib/hwTheme";
import type { Pt } from "../../lib/homography";

// 목동 쇼룸 실물 촬영본(2026-11-03). 두 대가 나란히 걸린 벽 — 오른쪽 보드(카메라 장착)로 천천히 푸시인.
// 화면 네 꼭짓점은 scripts/prep-hw-assets.py 가 검출한 값(2560×1440 기준).
const RIGHT: [Pt, Pt, Pt, Pt] = [
  [1320, 393],
  [2467, 378],
  [2502, 1039],
  [1327, 1043],
];
const LEFT: [Pt, Pt, Pt, Pt] = [
  [121, 397],
  [1261, 391],
  [1270, 1039],
  [102, 1058],
];

// 화면 켜짐: 검정 → 흰 스캔라인 한 번 → 콘텐츠 페이드인 + 글로우
const PowerOn: React.FC<{ at: number; src: string }> = ({ at, src }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  const line = interpolate(f, [0, 6], [0, 1], clamp);
  const on = interpolate(f, [3, 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#07090A" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, objectFit: "cover", opacity: on, filter: `brightness(${0.8 + on * 0.3})` }} />
      {f >= 0 && f < 8 && <div style={{ position: "absolute", left: 0, right: 0, top: line * 900 - 3, height: 6, background: "rgba(255,255,255,0.9)", boxShadow: "0 0 30px rgba(255,255,255,0.9)" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%)", opacity: on }} />
    </div>
  );
};

const PANELS = [
  { src: "hw/bezel-macro.jpg", w: 1647, h: 955, focus: [0.3, 0.5] as [number, number], cap: "8mm 슬림 베젤", sub: "화면만 남기고, 모두 덜어냈습니다" },
  { src: "hw/side-profile.jpg", w: 1408, h: 768, focus: [0.55, 0.5] as [number, number], cap: "슬림 프로파일", sub: "벽걸이 · 이동형 스탠드" },
  { src: "hw/bezel-wall.jpg", w: 1536, h: 1024, focus: [0.5, 0.5] as [number, number], cap: "매트 화이트 마감", sub: "어떤 교실에도 자연스럽게" },
];
const PANEL_AT = 150;

// 01 — 디자인
export const H1Design: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textOut = interpolate(frame, [PANEL_AT - 6, PANEL_AT + 10], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <Plate src="hw/showroom-wall.jpg" w={2560} h={1440} zoom={[1.0, 1.34]} focus={[0.74, 0.5]} over={PANEL_AT + 30} grade="brightness(0.86) contrast(1.1) saturate(0.82)">
        <Screen quad={RIGHT} glow={interpolate(frame, [40, 60], [0, 1], clamp)}>
          <PowerOn at={38} src="hw/ui-board-class.jpg" />
        </Screen>
        <Screen quad={LEFT}>
          <PowerOn at={64} src="hw/ui-earth.jpg" />
        </Screen>
      </Plate>
      <Vignette strength={0.5} />
      <TopShade height={240} opacity={0.8} />
      <BottomShade height={640} opacity={0.95} />

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "flex-end", paddingBottom: 120, opacity: textOut }}>
        <ChapterTag n="01" en="DESIGN" delay={14} />
        <Lines lines={["환경이 집중을 만듭니다."]} delay={24} size={84} style={{ marginTop: 20 }} />
        <Fade delay={46} y={14} style={{ marginTop: 20 }}>
          <div style={t(30, 400, H.muted, { maxWidth: 1100, lineHeight: 1.5, wordBreak: "keep-all" })}>
            8mm 슬림 베젤과 매트 화이트 마감. <span style={{ color: H.text, fontWeight: 600 }}>보는 순간 정돈되는 교실</span>이 공부의 시작입니다.
          </div>
        </Fade>
      </AbsoluteFill>

      {/* 디테일 트립틱 — 아래에서 올라오는 세로 패널 3장 */}
      {PANELS.map((p, i) => {
        const d = PANEL_AT + i * 7;
        const s = sp(frame - d, fps, SMOOTH, 30);
        const o = interpolate(frame - d, [0, 8], [0, 1], clamp);
        const x = 150 + i * 548;
        const push = 1.04 + Math.max(0, frame - d) * 0.0009;
        return (
          <div key={p.cap} style={{ position: "absolute", left: x, top: 100, width: 524, height: 880, borderRadius: 22, overflow: "hidden", opacity: o, transform: `translateY(${(1 - s) * 120}px)`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", background: H.bg2 }}>
            <Img src={staticFile(p.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${p.focus[0] * 100}% ${p.focus[1] * 100}%`, transform: `scale(${push})`, filter: "contrast(1.05)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(180deg, rgba(7,9,8,0) 0%, rgba(7,9,8,0.9) 100%)" }} />
            <div style={{ position: "absolute", left: 34, bottom: 38 }}>
              <div style={{ width: 36 * sp(frame - d - 10, fps, SMOOTH, 20), height: 2, background: H.mint, marginBottom: 16 }} />
              <div style={t(38, 700, H.text, { letterSpacing: "-0.03em" })}>{p.cap}</div>
              <div style={{ ...t(21, 400, H.muted), marginTop: 8 }}>{p.sub}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
