import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT_FAMILY = "Pretendard";

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
