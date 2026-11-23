import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import "../lib/fonts"; // Pretendard 6굵기
import { MONO } from "./theme";

// 데이터 라벨·타임코드용 모노 폰트 (JetBrains Mono, SIL OFL 1.1)
export const monoReady = Promise.all(
  (
    [
      ["500", "JetBrainsMono-Medium.woff2"],
      ["700", "JetBrainsMono-Bold.woff2"],
    ] as const
  ).map(([weight, file]) =>
    loadFont({ family: MONO, url: staticFile(`fonts/${file}`), weight, format: "woff2", display: "block" }),
  ),
).then(() => undefined);
