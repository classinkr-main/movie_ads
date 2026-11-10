import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, clamp, E, V3 } from "./lib/motion";
import { useFontsReady } from "./lib/fonts";
import { makeProjector, Stage } from "./three/Stage";
import { Finish, PaperBG } from "./overlay/kit";
import { ActRail, Caption, TodoNote } from "./overlay/chrome";
import { SCENES, WIPES } from "./scenes";
import { Wipe } from "./overlay/kit";

export type FilmProps = {
  /** 구절 자막 표시 */
  captions: boolean;
};

const WHIP = 6;

// 휩 팬: 장면 끝에서 카메라가 옆으로 채이고, 다음 장면이 반대편에서 미끄러져 들어옵니다.
const whip = (cam: Cam, amount: number): Cam => {
  if (amount === 0) return cam;
  const dx = cam.t[0] - cam.p[0];
  const dz = cam.t[2] - cam.p[2];
  const len = Math.hypot(dx, dz) || 1;
  const right: V3 = [-dz / len, 0, dx / len];
  const d = Math.hypot(dx, cam.t[1] - cam.p[1], dz);
  const k = amount * d * 0.9;
  return { ...cam, p: [cam.p[0] + right[0] * k, cam.p[1], cam.p[2] + right[2] * k], t: [cam.t[0] + right[0] * k, cam.t[1], cam.t[2] + right[2] * k] };
};

export const Film: React.FC<FilmProps> = ({ captions }) => {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const ready = useFontsReady();
  const tall = h > w;
  const u = Math.min(w, h) / 1080;
  const scene = SCENES.find((s) => f >= s.start && f < s.end) ?? SCENES[SCENES.length - 1];

  let cam = scene.cam(f, tall);
  if (tall) {
    const k = scene.tallK ?? 1.75;
    cam = { ...cam, p: [cam.t[0] + (cam.p[0] - cam.t[0]) * k, cam.t[1] + (cam.p[1] - cam.t[1]) * k, cam.t[2] + (cam.p[2] - cam.t[2]) * k] };
  }
  let blur = 0;
  if (scene.exit === "whip" && f >= scene.end - WHIP) {
    const t = E.in(clamp((f - (scene.end - WHIP)) / WHIP));
    cam = whip(cam, t);
    blur = t;
  }
  if (scene.enter === "whip" && f < scene.start + WHIP + 2) {
    const t = 1 - E.out(clamp((f - scene.start) / (WHIP + 2)));
    cam = whip(cam, -t);
    blur = Math.max(blur, t);
  }
  const look = typeof scene.look === "function" ? scene.look(f) : scene.look;
  const bg = typeof scene.bg === "function" ? scene.bg(f) : scene.bg;
  const pr = makeProjector(cam, w, h);
  const bp = scene.blueprint ? scene.blueprint(f) : 0;
  const Over = scene.Over;

  if (!ready) return <AbsoluteFill style={{ background: bg }} />;

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <PaperBG color={bg} u={u} grid={scene.dark ? 0.0 : 0.55} />
      <AbsoluteFill style={{ filter: [blur > 0.02 ? `blur(${blur * 16 * u}px)` : "", bp > 0 ? "grayscale(1) invert(1) contrast(1.5) brightness(1.05)" : ""].join(" ").trim() || undefined }}>
        {bp > 0 && <AbsoluteFill style={{ background: "#F3EEE2" }} />}
        <Stage cam={cam} look={look} width={w} height={h}>
          <scene.World key={scene.id} f={f} />
        </Stage>
      </AbsoluteFill>
      {bp > 0 && (
        <>
          {/* 설계도 모드: 흑백 반전한 3D 위에 코발트를 스크린으로 얹고, 흰 모눈을 깝니다. */}
          <AbsoluteFill style={{ background: "#1E48C4", mixBlendMode: "screen" }} />
          <AbsoluteFill
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.22) ${2 * u}px, transparent ${2 * u}px), linear-gradient(90deg, rgba(255,255,255,0.22) ${2 * u}px, transparent ${2 * u}px)`,
              backgroundSize: `${64 * u}px ${64 * u}px`,
            }}
          />
        </>
      )}
      {Over && <Over f={f} pr={pr} w={w} h={h} u={u} tall={tall} />}
      <TodoNote f={f} w={w} h={h} u={u} tall={tall} />
      <ActRail f={f} w={w} u={u} tall={tall} />
      {captions && <Caption f={f} w={w} h={h} u={u} tall={tall} />}
      {WIPES.map((wp) => (
        <Wipe key={wp.at} f={f} at={wp.at} color={wp.color} color2={wp.color2} />
      ))}
      <Finish dark={scene.dark ? 1 : 0} />
    </AbsoluteFill>
  );
};
