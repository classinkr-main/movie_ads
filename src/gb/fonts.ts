import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import "../lib/fonts"; // Pretendard 6굵기 (앱 화면 안 글자)
import { HAND, HEAD } from "./theme";

// 제목: 고운바탕(SIL OFL 1.1) · 손글씨: 나눔손글씨 펜(SIL OFL 1.1)
export const analogFontsReady = Promise.all([
  loadFont({ family: HEAD, url: staticFile("fonts/GowunBatang-Bold.woff2"), weight: "700", format: "woff2", display: "block" }),
  loadFont({ family: HEAD, url: staticFile("fonts/GowunBatang-Regular.woff2"), weight: "400", format: "woff2", display: "block" }),
  loadFont({ family: HAND, url: staticFile("fonts/NanumPenScript.woff2"), weight: "400", format: "woff2", display: "block" }),
]).then(() => undefined);
