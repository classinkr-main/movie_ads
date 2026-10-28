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
  scale?: number; // 시작 배율(기본 1). 사진을 옮길 여유를 줄 때 1.06 처럼 쓴다
  pan?: [number, number]; // 컷 동안 옮겨 가는 거리(px, x·y)
  img?: string; // 사진 컷 — public/forum/stills/<img>. cut.py 가 <footage>/photos/<img> 를 줄여 둔다
  focus?: [number, number]; // 사진에서 화면 가운데에 둘 지점(%, x·y)
  tall?: boolean; // 세로 원본을 자르지 않고 가운데 세우고 양옆은 흐린 같은 화면으로 채운다
  panels?: PanelSpec[]; // 화면을 세로로 나눠 여러 컷을 나란히 둔다
  flash?: number; // 컷 시작에 흰 플래시(초)
  punch?: number; // 컷 시작에 살짝 당겨졌다 풀리는 줌(예: 0.06)
  color?: string; // 영상 없이 단색 화면(타이포 전용 구간)
};

// 분할 화면의 한 칸. src·in(·tall·crop·lufs) 이 있으면 cut.py 가 id 로 중간본을 만들고, img 는 사진을 쓴다
export type PanelSpec = {
  id?: string;
  src?: string;
  in?: number;
  dur?: number;
  tall?: boolean;
  crop?: [number, number, number];
  lufs?: number;
  clip?: string;
  img?: string;
  offset?: number;
  focus?: [number, number];
  zoom?: number; // 칸 안에서 더 당겨 보기(기본 1)
  delay?: number; // 컷 시작 뒤 이 칸이 열리는 시점(초). 칸 영상은 이때 offset 부터 재생된다
  rate?: number; // 재생 속도(짧은 원본을 늘일 때 0.7 처럼)
  freeze?: boolean; // offset 프레임에서 멈춘 정지 화면으로 쓴다
  vol?: number; // 이 칸의 현장음(기본 0)
  label?: string; // 칸 아래 이름
  sub?: string;
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
  | { kind: "end"; at: number; dur: number; title: string; sub: string }
  // 스타일편 — 박자에 맞춰 단어가 들어오는 큰 글자. s 는 텍스트 시작 기준 초
  | { kind: "words"; at: number; dur: number; items: Array<{ t: string; s: number; accent?: boolean }>; mode?: "swap" | "stack"; size?: number; align?: "center" | "left" }
  // 스타일편 — DAY 01 같은 큰 외곽선 숫자와 섹션 이름
  | { kind: "stamp"; at: number; dur: number; num: string; eyebrow: string; title: string; sub: string }
  // 스타일편 — 가운데 타이틀 락업
  | { kind: "lockup"; at: number; dur: number; eyebrow: string; title: string; sub: string; logo?: boolean };

// 스타일편 화면 틀 — 레터박스와 그 안의 작은 글자, 그레인·비네트·색보정
export type StyleSpec = {
  bars?: number; // 위아래 레터박스 높이(px)
  top?: [string, string]; // 위 레터박스 왼쪽·오른쪽 글자
  sections?: Array<{ at: number; label: string; date: string }>; // 아래 레터박스 왼쪽(섹션)·오른쪽(날짜)
  grain?: number; // 필름 그레인 세기(0–1)
  vignette?: number; // 비네트 세기(0–1)
  grade?: string; // 컷에 거는 CSS filter
};

export type Edl = {
  name: string;
  duration: number; // 전체 길이(초)
  // 음악 큐. from 은 음원 안의 시작 초, gain 은 타임라인 초 기준 [초, 선형 볼륨] 키프레임
  music?: Array<{ src: string; at: number; from?: number; gain: Array<[number, number]> }>;
  duck?: { nat: number; music: number }; // 사운드바이트가 들릴 때 현장음·음악에 곱하는 비율
  hud?: boolean; // 좌상단 LIVE 라벨
  style?: StyleSpec;
  shots: ShotSpec[];
  bites?: BiteSpec[];
  texts: TextSpec[];
};
