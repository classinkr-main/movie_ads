import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT_FAMILY = "Pretendard";
// 시네마틱 타입 시스템(브래그컷) — 국문 세리프 헤드라인 · 영문 이탤릭 세리프 · 모노 HUD. 없는 글리프는 Pretendard로 대체.
export const SERIF = `"Nanum Myeongjo", "Pretendard", serif`;
export const SERIF_EN = `"Instrument Serif", "Nanum Myeongjo", serif`;
export const MONO = `"JetBrains Mono", "Pretendard", monospace`;

const WEIGHTS: Array<[string, string]> = [
  ["900", "Pretendard-Black.woff2"],
  ["800", "Pretendard-ExtraBold.woff2"],
  ["700", "Pretendard-Bold.woff2"],
  ["600", "Pretendard-SemiBold.woff2"],
  ["500", "Pretendard-Medium.woff2"],
  ["400", "Pretendard-Regular.woff2"],
];

// 모듈 로드 시점에 모든 굵기를 등록한다. loadFont는 내부에서 delayRender/continueRender를 처리한다.
export const fontsReady: Promise<void> = Promise.all(
  WEIGHTS.map(([weight, file]) =>
    loadFont({
      family: FONT_FAMILY,
      url: staticFile(`fonts/${file}`),
      weight,
      format: "woff2",
      display: "block",
    }),
  ),
).then(() => undefined);

export const cinematicFontsReady: Promise<void> = Promise.all([
  ...([
    ["400", "Regular"],
    ["700", "Bold"],
    ["800", "ExtraBold"],
  ] as const).map(([weight, name]) => loadFont({ family: "Nanum Myeongjo", url: staticFile(`fonts/NanumMyeongjo-${name}.woff2`), weight, format: "woff2", display: "block" })),
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Regular.woff2"), weight: "400", style: "normal", format: "woff2", display: "block" }),
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic", format: "woff2", display: "block" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/JetBrainsMono.woff2"), weight: "100 800", format: "woff2", display: "block" }),
]).then(() => undefined);
