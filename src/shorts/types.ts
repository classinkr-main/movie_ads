// 숏폼 한 편의 정의. 시간은 모두 source에 적힌 원본 영상 기준 초다.
// 같은 JSON을 scripts/cut-clips.py가 읽어 구간을 잘라 붙이고, Remotion이 읽어 자막을 그린다.

// 원본 1920×1080에서 보여 줄 16:9 영역. h = w × 9/16
export type Crop = { x: number; y: number; w: number };

export type Segment = {
  from: number; // 원본 기준 시작(초)
  to: number; // 원본 기준 끝(초)
  shot?: "wide" | "close"; // wide = LED 화면 전체, close = 발표자 클로즈업. 번갈아 써서 점프컷을 투캠 편집처럼 보이게 한다
};

export type Cue = {
  start: number; // 원본 기준 초
  end: number;
  ko: string; // 한국어 자막. *강조*는 연두로 칠한다
  src?: string; // 원어 자막. 한국어 발화면 비운다
  speaker: number; // speakers 인덱스
};

export type Speaker = {
  name: string;
  role?: string;
  // 이름표 표시 방식. 기본은 처음 말을 시작할 때 잠깐(연사), "run"은 말하는 동안 계속(현장 질문)
  tag?: "run";
};

// 헤드라인 한 줄 = 텍스트 조각 배열. hl이면 연두 하이라이터를 깐다
export type HeadlineRun = { t: string; hl?: boolean };

export type ShortSpec = {
  id: string;
  source: string; // 원본 영상 파일명(드라이브 「부산 포럼 영상/섹션별 렌더링본」 폴더). segments·cues 시간의 기준
  eyebrow: string;
  headline: HeadlineRun[][];
  speakers: Speaker[];
  segments: Segment[];
  cues: Cue[];
  crops: { wide: Crop; close: Crop };
};
