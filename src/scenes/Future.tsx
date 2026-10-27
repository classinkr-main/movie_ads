import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Clip, Photo } from "../components/Media";
import { Flash, Marquee } from "../components/Fx";
import { LimeStage } from "../components/Stage";
import { C, CUES, FONT, scene } from "../lib/theme";
import { clamp, ease, shake } from "../lib/motion";

// S5 미래 교실 (510–600f) — 8분음표마다 컷. 전자칠판·AI 카메라·AI 강의 분석·학원 현장·학원 교실·멀티터치를 스트로브로.
// screen = Classin 앱 실제 화면 캡처(수업 다시보기 + 오른쪽 AI 강의 분석, 개인정보는 모자이크된 제공본)
type ShotKind = "photo" | "clip" | "card" | "screen";
const SHOTS: Array<{ kind: ShotKind; src: string; pos?: string; label: string }> = [
  { kind: "photo", src: "hw-board.jpg", pos: "50% 50%", label: "BOARD" },
  { kind: "card", src: "hw-camera.jpg", label: "AI CAMERA" },
  { kind: "screen", src: "ai-analysis.jpg", pos: "50% 42%", label: "AI ANALYSIS" },
  { kind: "clip", src: "quad-board.mp4", pos: "50% 40%", label: "IN CLASS" },
  { kind: "photo", src: "jayscan-room.jpg", pos: "50% 55%", label: "SPACE" },
  { kind: "photo", src: "hw-multitouch.jpg", pos: "50% 45%", label: "TOGETHER" },
];
const isLight = (kind: ShotKind) => kind === "card" || kind === "screen"; // 밝은 컷은 어두운 그라디언트 없이 잉크 라벨

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const shot = SHOTS[i];
  const z = interpolate(frame, [0, 15], [1.12, 1.03], { ...clamp, easing: ease.outExpo });
  const intense = i >= 4 ? 1.6 : 1;
  const sh = shake(frame, 0, 8 * intense, 10, `f${i}`);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      {shot.kind === "photo" && <Photo src={shot.src} pos={shot.pos} scale={z} filter="contrast(1.1) saturate(0.85)" />}
      {shot.kind === "clip" && <Clip src={shot.src} pos={shot.pos} scale={z} filter="contrast(1.1) saturate(0.8)" />}
      {shot.kind === "screen" && <Photo src={shot.src} pos={shot.pos} scale={z} origin="72% 40%" style={{ background: C.white }} />}
      {shot.kind === "card" && (
        <LimeStage style={{ alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile(`photos/${shot.src}`)} style={{ width: 900, borderRadius: 28, transform: `scale(${z}) rotate(-3deg)`, boxShadow: `0 40px 80px ${C.shadow}` }} />
        </LimeStage>
      )}
      {!isLight(shot.kind) && (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,11,20,0.35) 0%, rgba(10,11,20,0) 35%, rgba(10,11,20,0) 60%, rgba(10,11,20,0.55) 100%)" }} />
      )}
      <div
        style={{
          position: "absolute",
          right: 110,
          bottom: 120,
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.3em",
          color: shot.kind === "card" ? C.ink : C.white,
          // 앱 화면 위에서는 UI 글자와 겹치지 않도록 잉크 바탕을 깐다
          ...(shot.kind === "screen" ? { background: C.ink, padding: "8px 10px 8px 20px", marginRight: -20 } : {}),
        }}
      >
        {String(i + 1).padStart(2, "0")} / {shot.label}
      </div>
    </AbsoluteFill>
  );
};

export const Future: React.FC = () => {
  const frame = useCurrentFrame();
  const { from, len } = scene("future");
  const cuts = CUES.future.map((f) => f - from);
  const chip = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: ease.outBack });
  // 흰 앱 화면 위에선 흰 윤곽선이 배경에 묻히고 글자 획만 깎아 보이므로, 그 컷에서만 옅은 잉크 윤곽선으로 바꾼다
  const cur = cuts.reduce((acc, c, k) => (frame >= c ? k : acc), 0);
  const onScreen = SHOTS[cur].kind === "screen";
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {cuts.map((c, i) => (
        <Sequence key={c} from={c} durationInFrames={(cuts[i + 1] ?? len) - c}>
          <Shot i={i} />
        </Sequence>
      ))}
      <Marquee text="FUTURE CLASSROOM" y={330} size={300} speed={11} color={onScreen ? C.ink : C.white} opacity={onScreen ? 0.2 : 0.9} />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 130,
          padding: "10px 26px 16px",
          background: C.signal,
          fontFamily: FONT.display,
          fontWeight: 850,
          fontSize: 92,
          letterSpacing: "-0.03em",
          color: C.white,
          transform: `scale(${chip}) rotate(-2deg)`,
          transformOrigin: "0% 50%",
        }}
      >
        미래 교실
      </div>
      <Flash at={0} dur={6} max={0.5} />
    </AbsoluteFill>
  );
};
