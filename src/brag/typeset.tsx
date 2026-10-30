import React from "react";
import { MONO, SERIF, SERIF_EN } from "../lib/fonts";

// 브래그컷 타입셋 — 타이틀(국문 헤드라인) · 디스플레이(큰 숫자 88·90 + 영문 액센트) · 타이머(60:00) 폰트 조합.
// 컴포지션 prop `typeset`으로 고른다. 기본값 `current`가 본편이고, 나머지는 비교용 후보다.
export type TypesetId = "current" | "trailer" | "couture" | "scifi" | "arthouse";

type Face = {
  family: string;
  weight: (w: number) => number; // 장면에서 쓴 굵기(400–800)를 이 폰트의 굵기로 옮긴다
  scale: number; // 같은 자리에서 시각 크기를 맞추는 배율
  track: number; // 기본 자간에 더할 값(em)
};
type Display = Face & { style: "italic" | "normal"; upper: boolean; textScale: number; numTrack: number };

export type Typeset = { id: TypesetId; name: string; note: string; title: Face; display: Display; timer: Face };

const FALLBACK = `"Pretendard", sans-serif`;
const bold = (light: number, heavy: number) => (w: number) => (w >= 600 ? heavy : light);
const same = (w: number) => w;

export const TYPESETS: Record<TypesetId, Typeset> = {
  current: {
    id: "current",
    name: "현재 · 시네마 명조",
    note: "나눔명조 + Instrument Serif Italic + JetBrains Mono",
    title: { family: SERIF, weight: same, scale: 1, track: 0 },
    display: { family: SERIF_EN, style: "italic", upper: false, weight: () => 400, scale: 1, textScale: 1, track: 0, numTrack: -0.02 },
    timer: { family: MONO, weight: () => 200, scale: 1, track: 0 },
  },
  trailer: {
    id: "trailer",
    name: "A · 블록버스터 트레일러",
    note: "Black Han Sans + Bebas Neue",
    title: { family: `"Black Han Sans", ${FALLBACK}`, weight: () => 400, scale: 1.02, track: 0 },
    display: { family: `"Bebas Neue", ${FALLBACK}`, style: "normal", upper: true, weight: () => 400, scale: 1.18, textScale: 0.95, track: 0.06, numTrack: 0 },
    timer: { family: `"Bebas Neue", ${FALLBACK}`, weight: () => 400, scale: 1.4, track: 0.02 },
  },
  couture: {
    id: "couture",
    name: "B · 하이패션 디돈",
    note: "Noto Serif KR (Light ↔ Black) + Bodoni Moda Italic",
    title: { family: `"Noto Serif KR", ${FALLBACK}`, weight: bold(300, 900), scale: 0.94, track: -0.01 },
    display: { family: `"Bodoni Moda", ${FALLBACK}`, style: "italic", upper: false, weight: () => 400, scale: 0.98, textScale: 0.9, track: 0, numTrack: -0.03 },
    timer: { family: `"Bodoni Moda", ${FALLBACK}`, weight: () => 400, scale: 1.05, track: -0.02 },
  },
  scifi: {
    id: "scifi",
    name: "C · SF 미니멀",
    note: "IBM Plex Sans KR (ExtraLight ↔ Medium) + JetBrains Mono Thin",
    title: { family: `"IBM Plex Sans KR", ${FALLBACK}`, weight: bold(200, 500), scale: 0.86, track: 0.03 },
    display: { family: MONO, style: "normal", upper: true, weight: () => 100, scale: 0.86, textScale: 0.62, track: 0.14, numTrack: -0.04 },
    timer: { family: MONO, weight: () => 100, scale: 1, track: 0 },
  },
  arthouse: {
    id: "arthouse",
    name: "D · 아트하우스",
    note: "송명 + Cormorant Garamond Italic",
    title: { family: `"Song Myung", ${FALLBACK}`, weight: () => 400, scale: 0.98, track: 0 },
    display: { family: `"Cormorant Garamond", ${FALLBACK}`, style: "italic", upper: false, weight: () => 500, scale: 1.12, textScale: 1.05, track: 0, numTrack: -0.02 },
    timer: { family: `"Cormorant Garamond", ${FALLBACK}`, weight: () => 300, scale: 1.22, track: -0.01 },
  },
};

const TypesetContext = React.createContext<Typeset>(TYPESETS.current);
export const TypesetProvider: React.FC<{ id: TypesetId; children: React.ReactNode }> = ({ id, children }) => <TypesetContext.Provider value={TYPESETS[id]}>{children}</TypesetContext.Provider>;
export const useTypeset = () => React.useContext(TypesetContext);

// 스타일 헬퍼 — 장면 코드는 크기·굵기·색만 넘기고, 폰트별 차이는 여기서 흡수한다.
// 타이틀의 자간 보정값은 CSS 변수(--tadj)로 내려 BlurIn의 자간 애니메이션에 더해진다.
export const useType = () => {
  const ts = useTypeset();
  const title = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    fontFamily: ts.title.family,
    fontSize: size * ts.title.scale,
    fontWeight: ts.title.weight(weight),
    color,
    letterSpacing: `calc(-0.03em + ${ts.title.track}em)`,
    ["--tadj" as string]: `${ts.title.track}em`,
    ...extra,
  });
  const display = (size: number, color: string, kind: "number" | "text", extra?: React.CSSProperties): React.CSSProperties => ({
    fontFamily: ts.display.family,
    fontStyle: ts.display.style,
    fontWeight: ts.display.weight(400),
    fontSize: size * (kind === "number" ? ts.display.scale : ts.display.textScale),
    textTransform: kind === "text" && ts.display.upper ? "uppercase" : undefined,
    letterSpacing: `${kind === "number" ? ts.display.numTrack : ts.display.track}em`,
    fontVariantNumeric: kind === "number" ? "tabular-nums lining-nums" : undefined,
    color,
    ...extra,
  });
  const timer = (size: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    fontFamily: ts.timer.family,
    fontWeight: ts.timer.weight(400),
    fontSize: size * ts.timer.scale,
    letterSpacing: `${-0.04 + ts.timer.track}em`,
    fontVariantNumeric: "tabular-nums lining-nums",
    color,
    ...extra,
  });
  return { ts, title, display, timer };
};
