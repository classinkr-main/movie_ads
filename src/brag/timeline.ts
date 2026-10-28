import data from "./cues.json";

// 브래그컷(9:16 · 20s) 타임라인 — 영상과 scripts/brag-audio.py가 같은 cues.json을 읽는다.
export const BRAG = data;
export type SceneId = (typeof data.scenes)[number]["id"];
export type CueName = keyof typeof data.cues;

// 씬 시작 프레임: 앞 씬 시작 + 앞 씬 길이 − 사이 전환 길이
export const SCENE_FROM: Record<string, number> = {};
data.scenes.reduce((from, s, i) => {
  SCENE_FROM[s.id] = from;
  return from + s.frames - (data.transitions[i] ?? 0);
}, 0);

// 씬 안에서 쓸 로컬 프레임
export const local = (scene: SceneId, name: CueName) => data.cues[name] - SCENE_FROM[scene];
