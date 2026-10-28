// 부산 포럼 스케치 EDL 타입. 시간 단위는 모두 초이며, 렌더 시 30fps 프레임으로 바꾼다.
// 같은 JSON을 tools/forum/cut.py 가 읽어 원본에서 컷·사운드바이트를 잘라 낸다.

export type ShotSpec = {
  id: string; // public/forum/clips/<id>.mp4
  src?: string; // 원본 경로(푸티지 폴더 기준) — cut.py 전용. 없으면 clip 의 기존 중간본을 재사용한다
  in?: number; // 원본 시작 초 — cut.py 전용
  clip?: string; // 다른 컷의 중간본을 재사용할 때 그 id
  offset?: number; // 재사용하는 중간본 안의 시작 초
  dur: number; // 컷 길이(초). 다음 컷과 겹치는 xfade 구간을 포함한다
  crop?: [number, number, number]; // cut.py 전용
  lufs?: number; // cut.py 전용
  xfade?: number; // 이전 컷과 겹치는 디졸브 길이(초). 0 또는 생략이면 하드 컷
  vol?: number; // 현장음 볼륨(0–1)
  push?: number; // 컷 동안 천천히 확대되는 정도(예: 0.04)
};

export type BiteSpec = {
  id: string; // public/forum/audio/<id>.wav
  src: string; // 원본 경로, 또는 이미 다듬은 바이트를 다시 자를 때 "bite:<파일명>"
  in: number;
  dur: number;
  lufs?: number;
  at: number; // 타임라인 시작 초
  vol?: number;
  // 자막 — 바이트 시작 기준 초
  subs?: Array<{ s: number; e: number; t: string }>;
};

export type TextSpec =
  | { kind: "title"; at: number; dur: number; eyebrow: string; title: string; sub: string }
  | { kind: "lower"; at: number; dur: number; name: string; role: string; note?: string }
  | { kind: "chapter"; at: number; dur: number; index: string; label: string }
  | { kind: "statement"; at: number; dur: number; lines: string[]; eyebrow?: string; align?: "center" | "left" }
  | { kind: "end"; at: number; dur: number; title: string; sub: string };

export type Edl = {
  name: string;
  duration: number; // 전체 길이(초)
  // 음악 큐. from 은 음원 안의 시작 초, gain 은 타임라인 초 기준 [초, 선형 볼륨] 키프레임
  music?: Array<{ src: string; at: number; from?: number; gain: Array<[number, number]> }>;
  duck?: { nat: number; music: number }; // 사운드바이트가 들릴 때 현장음·음악에 곱하는 비율
  hud?: boolean; // 좌상단 LIVE 라벨
  shots: ShotSpec[];
  bites?: BiteSpec[];
  texts: TextSpec[];
};
