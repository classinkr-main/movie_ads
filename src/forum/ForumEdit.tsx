import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../lib/motion";
import { FPS } from "../lib/theme";
import { ChapterTag, EndCard, LiveHud, LowerThird, Statement, Subtitle, TitleCard } from "./Overlays";
import { Flash, Grain, Lockup, Panels, Stamp, StyleFrame, Vignette, Words } from "./Style";
import type { BiteSpec, Edl, PanelSpec, ShotSpec, TextSpec } from "./types";

const f = (sec: number) => Math.round(sec * FPS);

type PlacedShot = ShotSpec & { from: number; frames: number; xf: number };

// 컷을 순서대로 이어 붙인다. xfade 만큼 이전 컷과 겹친다.
export const placeShots = (shots: ShotSpec[]): PlacedShot[] => {
  let cursor = 0;
  return shots.map((s) => {
    const xf = f(s.xfade ?? 0);
    const from = cursor - xf;
    const frames = f(s.dur);
    cursor = from + frames;
    return { ...s, from, frames, xf };
  });
};

export const edlFrames = (edl: Edl) => f(edl.duration);

// 사운드바이트가 들리는 구간이면 1 → 덕킹 계수로 부드럽게 내려간다.
const biteCover = (bites: BiteSpec[], frame: number) => {
  let cover = 0;
  for (const b of bites) {
    const a = f(b.at);
    const z = a + f(b.dur);
    const v = interpolate(frame, [a - 8, a + 4, z - 4, z + 12], [0, 1, 1, 0], clamp);
    cover = Math.max(cover, v);
  }
  return cover;
};

const Shot: React.FC<{ shot: PlacedShot; bites: BiteSpec[]; duckNat: number }> = ({ shot, bites, duckNat }) => {
  const frame = useCurrentFrame();
  const opacity = shot.xf > 0 ? interpolate(frame, [0, shot.xf], [0, 1], clamp) : 1;
  const p = frame / shot.frames;
  const [px, py] = shot.pan ?? [0, 0];
  const kick = (shot.punch ?? 0) * Math.exp(-frame / 5);
  const transform = `translate(${px * p}px, ${py * p}px) scale(${(shot.scale ?? 1) + (shot.push ?? 0) * p + kick})`;
  const edge = Math.max(shot.xf, 6);

  if (shot.color) {
    return <AbsoluteFill style={{ opacity, background: shot.color }} />;
  }

  if (shot.img) {
    const pos = shot.focus ? `${shot.focus[0]}% ${shot.focus[1]}%` : "50% 50%";
    return (
      <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
        <Img
          src={staticFile(`forum/stills/${shot.img}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform, transformOrigin: pos }}
        />
      </AbsoluteFill>
    );
  }

  const src = staticFile(`forum/clips/${shot.clip ?? shot.id}.mp4`);
  const startFrom = f(shot.offset ?? 0);
  const gainAt = (vol: number) => (fr: number) => {
    const ramp = interpolate(fr, [0, edge, shot.frames - 6, shot.frames], [0, 1, 1, 0], clamp);
    const duck = 1 - biteCover(bites, shot.from + fr) * (1 - duckNat);
    return vol * ramp * duck;
  };
  const volume = gainAt(shot.vol ?? 1);

  if (shot.panels) {
    // 칸 소리는 그 칸이 열릴 때부터 짧게 올라온다
    const panelVolume = (pn: PanelSpec) => {
      const d = f(pn.delay ?? 0);
      return (fr: number) => gainAt(pn.vol ?? 0)(fr + d) * interpolate(fr, [0, 4], [0, 1], clamp);
    };
    return (
      <AbsoluteFill style={{ opacity, transform }}>
        <Panels panels={shot.panels} frames={shot.frames} volume={panelVolume} />
      </AbsoluteFill>
    );
  }

  if (shot.tall) {
    // 세로 원본: 흐리게 깐 같은 화면 위에 원본 비율 그대로 세운다
    return (
      <AbsoluteFill style={{ opacity, overflow: "hidden", background: "#000" }}>
        <OffthreadVideo
          src={src}
          startFrom={startFrom}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.2)", filter: "blur(40px) brightness(0.5) saturate(1.2)" }}
        />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <OffthreadVideo
            src={src}
            startFrom={startFrom}
            volume={volume}
            style={{ height: "100%", transform, boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <OffthreadVideo src={src} startFrom={startFrom} style={{ width: "100%", height: "100%", transform }} volume={volume} />
    </AbsoluteFill>
  );
};

const Text: React.FC<{ t: TextSpec }> = ({ t }) => {
  const dur = f(t.dur);
  switch (t.kind) {
    case "title":
      return <TitleCard dur={dur} eyebrow={t.eyebrow} title={t.title} sub={t.sub} />;
    case "lower":
      return <LowerThird dur={dur} name={t.name} role={t.role} note={t.note} />;
    case "chapter":
      return <ChapterTag dur={dur} index={t.index} label={t.label} />;
    case "statement":
      return <Statement dur={dur} lines={t.lines} eyebrow={t.eyebrow} align={t.align} />;
    case "end":
      return <EndCard dur={dur} title={t.title} sub={t.sub} />;
    case "words":
      return <Words dur={dur} items={t.items} mode={t.mode} size={t.size} align={t.align} />;
    case "stamp":
      return <Stamp dur={dur} num={t.num} eyebrow={t.eyebrow} title={t.title} sub={t.sub} />;
    case "lockup":
      return <Lockup dur={dur} eyebrow={t.eyebrow} title={t.title} sub={t.sub} logo={t.logo} />;
  }
};

export const ForumEdit: React.FC<{ edl: Edl }> = ({ edl }) => {
  const frame = useCurrentFrame();
  const shots = placeShots(edl.shots);
  const bites = edl.bites ?? [];
  const duck = edl.duck ?? { nat: 0.3, music: 0.45 };
  const cues = edl.music ?? [];
  const musicVolume = (cue: (typeof cues)[number]) => (fr: number) => {
    const g = cue.gain;
    const base = interpolate(fr / FPS + cue.at, g.map(([t]) => t), g.map(([, v]) => v), clamp);
    return base * (1 - biteCover(bites, fr + f(cue.at)) * (1 - duck.music));
  };

  const style = edl.style;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: style?.grade }}>
        {shots.map((s) => (
          <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
            <Shot shot={s} bites={bites} duckNat={duck.nat} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {style?.vignette ? <Vignette amount={style.vignette} /> : null}
      {shots
        .filter((s) => s.flash)
        .map((s) => (
          <Sequence key={`flash-${s.id}`} from={s.from + s.xf} durationInFrames={f(s.flash ?? 0)} name={`flash-${s.id}`}>
            <Flash len={f(s.flash ?? 0)} />
          </Sequence>
        ))}

      {cues.map((cue, i) => (
        <Sequence key={i} from={f(cue.at)} durationInFrames={f(cue.gain[cue.gain.length - 1][0] - cue.at)} name={`music-${i}`}>
          <Audio src={staticFile(`forum/audio/${cue.src}`)} startFrom={f(cue.from ?? 0)} volume={musicVolume(cue)} />
        </Sequence>
      ))}

      {bites.map((b) => (
        <Sequence key={b.id} from={f(b.at)} durationInFrames={f(b.dur)} name={b.id}>
          <Audio src={staticFile(`forum/audio/${b.id}.wav`)} volume={b.vol ?? 1} />
          {(b.subs ?? []).map((s, i) => (
            <Sequence key={i} from={f(s.s)} durationInFrames={f(s.e - s.s)}>
              <Subtitle dur={f(s.e - s.s)} text={s.t} />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {edl.hud ? <LiveHud frame={frame} total={edlFrames(edl)} /> : null}

      {edl.texts.map((t, i) => (
        <Sequence key={i} from={f(t.at)} durationInFrames={f(t.dur)} name={`${t.kind}-${i}`}>
          <Text t={t} />
        </Sequence>
      ))}

      {style?.grain ? <Grain amount={style.grain} /> : null}
      {style ? <StyleFrame style={style} total={edlFrames(edl)} /> : null}
    </AbsoluteFill>
  );
};
