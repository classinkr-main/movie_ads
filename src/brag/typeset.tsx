import React from "react";
import { MONO, SERIF, SERIF_EN } from "../lib/fonts";

// 브래그컷 타입셋 — 타이틀(국문 헤드라인) · 디스플레이(큰 숫자 88·90 + 영문 액센트) · 타이머(60:00) 폰트 조합.
// 컴포지션 prop `typeset`으로 고른다. 본편은 `couture`(B · 하이패션 디돈, 4종 비교에서 선택 — out/brag/typeset/),
// `current`는 이전 본편(나눔명조 + Instrument Serif)으로 되돌릴 때 쓴다.
export type TypesetId = "current" | "couture";

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
    name: "이전 · 시네마 명조",
    note: "나눔명조 + Instrument Serif Italic + JetBrains Mono",
    title: { family: SERIF, weight: same, scale: 1, track: 0 },
    display: { family: SERIF_EN, style: "italic", upper: false, weight: () => 400, scale: 1, textScale: 1, track: 0, numTrack: -0.02 },
    timer: { family: MONO, weight: () => 200, scale: 1, track: 0 },
  },
  couture: {
    id: "couture",
    name: "본편 · 하이패션 디돈",
    note: "Noto Serif KR (Light ↔ Black) + Bodoni Moda Italic",
    title: { family: `"Noto Serif KR", ${FALLBACK}`, weight: bold(300, 900), scale: 0.94, track: -0.01 },
    display: { family: `"Bodoni Moda", ${FALLBACK}`, style: "italic", upper: false, weight: () => 400, scale: 0.98, textScale: 0.9, track: 0, numTrack: -0.03 },
    timer: { family: `"Bodoni Moda", ${FALLBACK}`, weight: () => 400, scale: 1.05, track: -0.02 },
  },
};

const TypesetContext = React.createContext<Typeset>(TYPESETS.couture);
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
