import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import "../lib/fonts"; // Pretendard 6굵기

export { FONT_FAMILY } from "../lib/fonts";

// 판서용 손글씨(SIL OFL 1.1) — public/fonts/LICENSE-Gaegu.txt
export const CHALK_FONT = "Gaegu";

export const chalkFontReady: Promise<void> = loadFont({
  family: CHALK_FONT,
  url: staticFile("fonts/Gaegu-Bold.woff2"),
  weight: "700",
  format: "woff2",
  display: "block",
}).then(() => undefined);
