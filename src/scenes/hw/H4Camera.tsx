import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ChapterTag, Fade, LeftShade, Lines, Plate, Reticle, Spec, t, TopShade, Vignette } from "../../components/Cine";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { H } from "../../lib/hwTheme";

const CUT = 92; // 실물 카메라 → 교실 트래킹 컷
const UPLOAD_AT = 182;

const pad = (n: number) => String(n).padStart(2, "0");

// 04 — AI 트래킹 카메라: 실물 상단 카메라 모듈 푸시인 → 교실에서 강사를 따라가는 레티클 → 수업 종료 즉시 업로드
export const H4Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cut = interpolate(frame, [CUT - 8, CUT + 6], [0, 1], clamp);
  // 트래킹 박스 — 강사(1408×768 좌표)가 살짝 움직이는 것처럼 드리프트
  const f2 = Math.max(0, frame - CUT);
  const bx = 532 + Math.sin(f2 / 23) * 14 + Math.sin(f2 / 7) * 3;
  const by = 92 + Math.cos(f2 / 29) * 8;
  const lock = sp(frame - CUT - 6, fps, SMOOTH, 18);
  const bw = 300 + (1 - lock) * 260;
  const bh = 480 + (1 - lock) * 200;
  const sec = 12 * 60 + 40 + Math.floor(Math.max(0, frame - CUT) / fps); // 00:12:40 부터
  const up = sp(frame - UPLOAD_AT, fps, SMOOTH, 26);
  const done = interpolate(frame, [UPLOAD_AT + 34, UPLOAD_AT + 40], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: H.bg }}>
      {/* A — 쇼룸 실물: 보드 상단 카메라 모듈로 푸시인 */}
      <Plate src="hw/real-camera-bezel.jpg" w={1920} h={1080} zoom={[1.0, 1.9]} focus={[0.3, 0.24]} over={CUT + 10} opacity={1 - cut} grade="brightness(0.88) contrast(1.1) saturate(0.85)">
        <div style={{ opacity: interpolate(frame, [28, 40], [0, 1], clamp) }}>
          <Reticle x={430} y={200} w={380} h={118} label="4K AI CAMERA" thickness={2} labelPos="bottom" />
        </div>
      </Plate>
      {/* B — 교실: 강사 트래킹 */}
      <Plate src="hw/teacher-writing.jpg" w={1408} h={768} zoom={[1.0, 1.08]} focus={[0.5, 0.4]} over={160} opacity={cut} grade="contrast(1.05) saturate(0.92)" style={{ transform: `scale(${1 + (1 - cut) * 0.04})` }}>
        <div style={{ opacity: cut }}>
          <Reticle x={bx} y={by} w={bw} h={bh} label="TRACKING" thickness={3} />
          {/* 자동 줌 범위 */}
          <div style={{ position: "absolute", left: bx - 120, top: by - 60, width: bw + 240, height: bh + 140, border: `1px dashed rgba(110,231,183,${0.35 * lock})`, borderRadius: 6 }} />
        </div>
      </Plate>
      <Vignette strength={0.55} />
      <TopShade height={220} opacity={1 - cut} />
      <LeftShade width={1150} opacity={0.9} />

      {/* REC 표시 */}
      <div style={{ position: "absolute", right: 120, top: 110, display: "flex", alignItems: "center", gap: 14, opacity: cut }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: "#FF4D4D", opacity: frame % 30 < 18 ? 1 : 0.25, boxShadow: "0 0 14px #FF4D4D" }} />
        <span style={t(22, 800, H.text, { letterSpacing: "0.2em" })}>REC</span>
        <span style={t(22, 600, H.muted, { fontVariantNumeric: "tabular-nums" })}>
          {pad(Math.floor(sec / 3600))}:{pad(Math.floor((sec % 3600) / 60))}:{pad(sec % 60)}
        </span>
        <span style={{ ...t(14, 800, H.bg, { letterSpacing: "0.12em" }), background: H.mint, borderRadius: 5, padding: "4px 8px", marginLeft: 8 }}>4K</span>
      </div>

      {/* 업로드 카드 */}
      <div style={{ position: "absolute", right: 120, bottom: 120, width: 520, padding: "22px 26px", borderRadius: 18, background: "rgba(10,14,12,0.7)", border: `1px solid ${H.line2}`, backdropFilter: "blur(12px)", opacity: up, transform: `translateY(${(1 - up) * 24}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={t(20, 700, H.text)}>수업 종료 · 영상 자동 업로드</span>
          <span style={{ ...t(16, 800, done ? H.mint : H.muted) }}>{done ? "완료 ✓" : `${Math.round(up * 100)}%`}</span>
        </div>
        <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${up * 100}%`, height: "100%", background: H.mint, borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 12, ...t(15, 500, H.dim) }}>편집도, 수동 업로드도 없이 — 판서 PDF와 함께 LMS에 저장됩니다</div>
      </div>

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "flex-end", paddingBottom: 120 }}>
        <ChapterTag n="04" en="AI TRACKING CAMERA" delay={10} />
        <Lines lines={["카메라 감독 없이,", "4K로 담깁니다."]} delay={20} size={80} style={{ marginTop: 20 }} />
        <Fade delay={46} y={14} style={{ marginTop: 20 }}>
          <div style={t(28, 400, H.muted, { maxWidth: 820, lineHeight: 1.5, wordBreak: "keep-all" })}>
            강사를 자동으로 따라가며 녹화합니다. <span style={{ color: H.text, fontWeight: 600 }}>수업이 끝나면 영상은 이미 올라가 있습니다.</span>
          </div>
        </Fade>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Spec value="자동 추적" delay={CUT + 20} size={19} />
          <Spec value="자동 줌·팬" delay={CUT + 26} size={19} />
          <Spec value="자동 녹화" delay={CUT + 32} size={19} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
