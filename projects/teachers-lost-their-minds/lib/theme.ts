// 아트 디렉션(art-direction.md)의 팔레트. 장면 코드는 여기 값만 씁니다.
export const C = {
  // 종이 무대
  paper: "#F3EEE2",
  paper2: "#E7DFCC",
  ink: "#1B1A17",
  ink2: "#4A463E",
  line: "rgba(27,26,23,0.14)",
  white: "#FFFFFF",

  // 문제(1막) — 스트레스 레드 / 경고 앰버
  red: "#F0553A",
  redDeep: "#C73B24",
  amber: "#F6B73C",
  // 첫 시도(2막) — 설계도 코발트
  cobalt: "#2F5BEA",
  cobaltDeep: "#1C3FB3",
  sky: "#9CC7F2",
  // 해결·결과(3·4막) — ClassIn 그린 / 형광펜 라임
  forest: "#084734",
  brand: "#009060",
  leaf: "#3FB86B",
  lime: "#C8F05A",

  // 장난감 소재
  skin: "#F4CBA4",
  skin2: "#E9B58A",
  hair: "#2A2420",
  hairBrown: "#6B4A2F",
  wood: "#D8A56A",
  woodDark: "#B07A45",
  board: "#2E6B55",
  boardFrame: "#8A5A33",
  metal: "#9AA3AD",
  metalDark: "#5C646E",
  screen: "#1E2330",
  cloud: "#FFFFFF",
  cardboard: "#C99A62",

  // 밤
  night: "#1B2140",
  night2: "#11152C",
  lamp: "#FFD27A",
  moon: "#FFF3C4",
} as const;

export const FONT = {
  body: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
  slam: '"Black Han Sans", "Pretendard", sans-serif',
} as const;
