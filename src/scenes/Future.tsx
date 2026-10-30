import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Clip, Photo } from "../components/Media";
import { Flash, Marquee } from "../components/Fx";
import { LimeStage } from "../components/Stage";
import { C, CUES, FONT, scene } from "../lib/theme";
import { clamp, ease, shake } from "../lib/motion";

// S5 미래 교실 (510–600f) — 8분음표마다 컷. 전자칠판·AI 카메라·AI 강의 분석·학원 현장·학원 교실·양방향 수업 시연을 스트로브로.
// cutout = 연두 무대 위 제품 누끼(마퀴가 제품 뒤로 지나간다)
// screen = Classin 앱 실제 화면 캡처(수업 다시보기 + 오른쪽 AI 강의 분석, 개인정보는 모자이크된 제공본)
type ShotKind = "photo" | "clip" | "cutout" | "screen";
const SHOTS: Array<{ kind: ShotKind; src: string; pos?: string; label: string }> = [
  { kind: "photo", src: "hw-board-stand.jpg", pos: "50% 50%", label: "BOARD" },
  { kind: "cutout", src: "hw-camera-cutout.png", label: "AI CAMERA" },
  { kind: "screen", src: "ai-analysis.jpg", pos: "50% 42%", label: "AI ANALYSIS" },
  { kind: "clip", src: "quad-board.mp4", pos: "50% 40%", label: "IN CLASS" },
  { kind: "photo", src: "jayscan-room.jpg", pos: "50% 55%", label: "SPACE" },
  { kind: "photo", src: "expo-dualscreen.jpg", pos: "50% 50%", label: "INTERACTIVE" },
];
const isLight = (kind: ShotKind) => kind === "cutout" || kind === "screen"; // 밝은 컷은 어두운 그라디언트 없이 잉크 라벨
const MARQUEE = { text: "FUTURE CLASSROOM", y: 330, size: 300, speed: 11 };

const Shot: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const frame = useCurrentFrame();
  const shot = SHOTS[i];
  const z = interpolate(frame, [0, 15], [1.12, 1.03], { ...clamp, easing: ease.outExpo });
  const intense = i >= 4 ? 1.6 : 1;
  const sh = shake(frame, 0, 8 * intense, 10, `f${i}`);
  const jolt = `translate(${sh.x}px, ${sh.y}px)`;
  return (
    <AbsoluteFill style={{ transform: shot.kind === "cutout" ? undefined : jolt }}>
      {shot.kind === "photo" && <Photo src={shot.src} pos={shot.pos} scale={z} filter="contrast(1.1) saturate(0.85)" />}
      {shot.kind === "clip" && <Clip src={shot.src} pos={shot.pos} scale={z} filter="contrast(1.1) saturate(0.8)" />}
      {shot.kind === "screen" && <Photo src={shot.src} pos={shot.pos} scale={z} origin="72% 40%" style={{ background: C.white }} />}
      {shot.kind === "cutout" && (
        <LimeStage style={{ alignItems: "center", justifyContent: "center" }}>
          <Marquee {...MARQUEE} opacity={0.9} offset={at} />
          <Img
            src={staticFile(`photos/${shot.src}`)}
            style={{ width: 1000, transform: `${jolt} scale(${z}) rotate(-4deg)`, filter: "drop-shadow(0 36px 44px rgba(30,44,6,0.34))" }}
          />
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
          color: shot.kind === "cutout" ? C.ink : C.white,
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
  // 흰 앱 화면 위에선 흰 윤곽선이 배경에 묻히고 글자 획만 깎아 보이므로 옅은 잉크로,
  // 누끼 컷에선 마퀴를 컷 안(제품 뒤)에서 이어 그리므로 바깥 마퀴는 숨긴다
  const kind = SHOTS[cuts.reduce((acc, c, k) => (frame >= c ? k : acc), 0)].kind;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {cuts.map((c, i) => (
        <Sequence key={c} from={c} durationInFrames={(cuts[i + 1] ?? len) - c}>
          <Shot i={i} at={c} />
        </Sequence>
      ))}
      <Marquee {...MARQUEE} color={kind === "screen" ? C.ink : C.white} opacity={kind === "screen" ? 0.2 : kind === "cutout" ? 0 : 0.9} />
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
