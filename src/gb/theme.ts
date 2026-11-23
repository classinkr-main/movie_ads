// 개별진도 × ClassIn + AI 쇼릴 — 디자인 토큰과 타임라인
// 콘셉트: 하루의 빛. 수업이 끝난 밤(문제) → 과부하의 열기 → 암전(전환) → 새벽(AI 설계) → 블루아워(수업 기록)
//        → 아침(한 화면 관리) → 낮(시작 제안). 장면마다 색온도가 조금씩 바뀐다.
// 규칙: 왼쪽 점·색 띠·색 면 장식 없음, 모서리는 2~4px, 강조는 선·아이콘·타이포로.

export const FPS = 30;
export const DUR = 900; // 30초
export const W = 1920;
export const H = 1080;

// 120 BPM(1마디 = 2초 = 60프레임). 큰 전환은 마디 첫 박에 둔다.
export const SC = {
  s1: { from: 0, dur: 120 }, // 0–4s   한 반에 여섯 명, 진도는 여섯 갈래
  s2: { from: 120, dur: 120 }, // 4–8s   손이 많이 갑니다
  s3: { from: 240, dur: 60 }, // 8–10s  AI로 설계하고, 한 화면에서 관리한다면요?
  s4: { from: 300, dur: 120 }, // 10–14s AI 진도 설계 (방향 예시)
  s5: { from: 420, dur: 120 }, // 14–18s 수업방·녹화 → AI 강의분석 (지금 됨)
  s6: { from: 540, dur: 180 }, // 18–24s 원장 대시보드 → 학생 E → 학부모 리포트 초안 (방향 예시)
  s7: { from: 720, dur: 180 }, // 24–30s 엔딩
} as const;

export type Tone = {
  bg: string; // 바탕
  bg2: string; // 바탕 그라데이션 끝
  glow: string; // 은은한 빛
  ink: string; // 본문
  sub: string; // 보조
  line: string; // 헤어라인
  accent: string; // 장면 강조색
  dark: boolean;
};

// 장면별 색조 (하루의 빛)
export const TONES: Record<string, Tone> = {
  night: { bg: "#090C1C", bg2: "#0E1230", glow: "#26307A", ink: "#EEF0F8", sub: "#8C93B8", line: "rgba(178,188,255,0.16)", accent: "#8FE3C8", dark: true },
  ember: { bg: "#140907", bg2: "#22100A", glow: "#6A2410", ink: "#FFF2EA", sub: "#C29A88", line: "rgba(255,190,160,0.14)", accent: "#FFB547", dark: true },
  void: { bg: "#050606", bg2: "#0A0C0C", glow: "#1B2B26", ink: "#F4F7F5", sub: "#8A9692", line: "rgba(255,255,255,0.12)", accent: "#9BFFD6", dark: true },
  dawn: { bg: "#03191A", bg2: "#06302B", glow: "#0E6B55", ink: "#E9FFF7", sub: "#86B5A6", line: "rgba(150,255,220,0.13)", accent: "#5FF0BE", dark: true },
  blue: { bg: "#05142A", bg2: "#0A2648", glow: "#1A5C9C", ink: "#EAF4FF", sub: "#8AA6C8", line: "rgba(160,205,255,0.15)", accent: "#6CCBFF", dark: true },
  morning: { bg: "#E4EDE7", bg2: "#F2F5EF", glow: "#FFFFFF", ink: "#0E1E18", sub: "#5B7068", line: "rgba(14,30,24,0.12)", accent: "#00A06E", dark: false },
  day: { bg: "#F4F2EB", bg2: "#FBFAF6", glow: "#FFFFFF", ink: "#0D1A14", sub: "#5F6B64", line: "rgba(13,26,20,0.12)", accent: "#00A975", dark: false },
};

// ClassIn 브랜드
export const BRAND = { green: "#00A975", green2: "#00B67E", deep: "#084734" } as const;

// 상태색
export const AMBER = "#FFB547";
export const AMBER_INK = "#B86E00"; // 밝은 배경용
export const CORAL = "#FF7A6B";
export const REC = "#FF5468";

// 학생별 노선 색 — 지하철 노선도처럼 학생마다 한 색. C·E(먼저 챙길 학생)는 따뜻한 색.
export const LINE: Record<string, string> = {
  A: "#4FD8C4",
  B: "#7FA6FF",
  C: "#FFB547",
  D: "#B9A0FF",
  E: "#FF8A73",
  F: "#7BEA9E",
};
// 밝은 배경용(채도·명도 조정)
export const LINE_ON_LIGHT: Record<string, string> = {
  A: "#0F9E8A",
  B: "#3D6BE0",
  C: "#C77F00",
  D: "#7A5BD9",
  E: "#E0533B",
  F: "#1E9E52",
};

export const FONT = "Pretendard";
export const MONO = "JetBrains Mono";

// 가상 반 데이터 — 설명회 페이지 v2.2 데모 모형 값 그대로
export const STUDENTS = [
  { id: "A", today: "일차방정식 활용", pos: "표준", score: 80, flag: "" },
  { id: "B", today: "연립방정식 도입", pos: "앞선 진도", score: 90, flag: "금요일 합반 후보" },
  { id: "C", today: "중1 일차방정식 복습", pos: "보완", score: 55, flag: "숙제 미완 3회" },
  { id: "D", today: "일차부등식", pos: "약간 앞섬", score: 85, flag: "금요일 합반 후보" },
  { id: "E", today: "일차방정식 활용 · 부호 정리 재확인", pos: "표준 · 어제 문항 미달", score: 62, flag: "최근 하락" },
  { id: "F", today: "연립방정식 활용", pos: "가장 앞섬", score: 95, flag: "상위반 구상 후보" },
] as const;

export type StudentId = (typeof STUDENTS)[number]["id"];
