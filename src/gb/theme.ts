// 개별진도 × ClassIn + AI 쇼릴 v3 — "공책 × ClassIn 앱"
// 손으로 쓰는 공책(문제와 선생님의 메모)과 ClassIn 앱 화면(해결)이 만나는 톤.
// 제목은 고운바탕(따뜻한 명조) 2줄 이내, 메모는 나눔손글씨 펜, 앱 화면 안 글자는 Pretendard.

export const FPS = 30;
export const DUR = 900; // 30초
export const W = 1920;
export const H = 1080;

// 120 BPM(1마디 = 2초 = 60프레임). 큰 전환은 마디 첫 박에 둔다(음악 gb_score.wav와 같은 시점).
export const SC = {
  s1: { from: 0, dur: 120 }, // 0–4s   한 반에 여섯 명, 진도는 여섯 갈래
  s2: { from: 120, dur: 120 }, // 4–8s   손이 많이 갑니다
  s3: { from: 240, dur: 60 }, // 8–10s  AI로 설계하고, 한 화면에서 관리한다면요?
  s4: { from: 300, dur: 120 }, // 10–14s AI 진도 설계 (방향 예시)
  s5: { from: 420, dur: 120 }, // 14–18s 수업방·녹화 → AI 강의분석 (지금 됨)
  s6: { from: 540, dur: 180 }, // 18–24s 원장 화면 → 학생 E → 학부모 리포트 초안 (방향 예시)
  s7: { from: 720, dur: 180 }, // 24–30s 엔딩
} as const;

// 장면별 종이 색 — 저녁 공책 → 바쁜 책상 → 새 페이지 → 모눈 → 아침 책상 → 낮
export type Paper = { base: string; tint: string; rule?: string; margin?: string; grid?: string };
export const PAPER: Record<string, Paper> = {
  evening: { base: "#EBEEF2", tint: "#DCE3EC", rule: "rgba(98,128,176,0.22)", margin: "rgba(214,96,96,0.45)" },
  desk: { base: "#F3EBDD", tint: "#EADCC6" },
  clean: { base: "#F8F6F1", tint: "#EFEBE2" },
  graph: { base: "#EDF3EE", tint: "#DFEBE2", grid: "rgba(70,140,105,0.16)" },
  morning: { base: "#EEF1EE", tint: "#E1E8E3" },
  day: { base: "#F7F3EA", tint: "#EFE8DA" },
};

// 잉크
export const INK = {
  graphite: "#2B2A28", // 연필·본문
  head: "#1F2321", // 제목
  sub: "#6B6862", // 보조
  faint: "rgba(43,42,40,0.38)",
  navy: "#2A4A94", // 파란 펜
  red: "#D9473A", // 빨간 펜(첨삭·주의)
  green: "#0E9F6E", // 초록 펜(해결)
  hiYellow: "rgba(255,221,72,0.62)",
  hiMint: "rgba(112,226,176,0.55)",
} as const;

// ClassIn 브랜드·앱 UI
export const BRAND = { green: "#00A975", green2: "#00B67E", deep: "#084734" } as const;
export const APP = {
  bg: "#FFFFFF",
  side: "#FFFFFF",
  line: "#ECECEC",
  line2: "#E2E2E2",
  hover: "#F2F2F3",
  pill: "#F1F1F2",
  ink: "#1C1C1E",
  sub: "#8A8A8E",
  badge: "#F0483E",
  online: "#2DC26B",
  black: "#141414",
  chart: "#2ED36A", // 리포트 도넛·막대 초록
  teal: "#2BB59B",
  orange: "#F59E2E",
} as const;

// 학생별 색연필 — 노선·카드·경로에 같은 색을 쓴다. C·E(먼저 챙길 학생)는 따뜻한 색.
export const PENCIL: Record<string, string> = {
  A: "#3AA79A",
  B: "#4C74D6",
  C: "#E9952C",
  D: "#8E6FD6",
  E: "#E5604F",
  F: "#3EA862",
};
// 앱 카드 표지용 부드러운 그라데이션
export const COVER: Record<string, [string, string]> = {
  A: ["#BFE9E1", "#8ED3C6"],
  B: ["#C9D8FF", "#97B2F2"],
  C: ["#FFE1B8", "#F8BE73"],
  D: ["#E2D6FF", "#BBA6F2"],
  E: ["#FFD2CA", "#F6A296"],
  F: ["#CDEFD6", "#97DBA8"],
};

export const FONT = "Pretendard";
export const HEAD = "Gowun Batang";
export const HAND = "Nanum Pen Script";

// 가상 반 데이터 — 설명회 페이지 v2.2 데모 모형 값 그대로
export const STUDENTS = [
  { id: "A", today: "일차방정식 활용", pos: "표준", score: 80, flag: "" },
  { id: "B", today: "연립방정식 도입", pos: "앞선 진도", score: 90, flag: "금요일 합반 후보" },
  { id: "C", today: "중1 일차방정식 복습", pos: "보완", score: 55, flag: "숙제 미완 3회" },
  { id: "D", today: "일차부등식", pos: "약간 앞섬", score: 85, flag: "금요일 합반 후보" },
  { id: "E", today: "일차방정식 활용 · 부호 정리", pos: "표준 · 어제 문항 미달", score: 62, flag: "최근 하락" },
  { id: "F", today: "연립방정식 활용", pos: "가장 앞섬", score: 95, flag: "상위반 구상 후보" },
] as const;

export type StudentId = (typeof STUDENTS)[number]["id"];
