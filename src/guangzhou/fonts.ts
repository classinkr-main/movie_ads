import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 브이로그 전용 서체 — 모두 SIL OFL 1.1 (public/guangzhou/fonts/LICENSE-*)
export const HAND = "Nanum Pen Script"; // 손글씨 캡션
export const SERIF_CN = "Noto Serif SC GZ"; // 广州 등 한자 (서브셋)
export const SERIF = "Instrument Serif"; // 영문 이탤릭 포인트
export const SEG = "DSEG7 Classic"; // 필름 카메라 날짜 각인

export const gzFontsReady: Promise<void> = Promise.all([
  loadFont({ family: HAND, url: staticFile("guangzhou/fonts/NanumPenScript-Regular.woff2"), weight: "400", format: "woff2", display: "block" }),
  loadFont({ family: SERIF_CN, url: staticFile("guangzhou/fonts/NotoSerifSC-Black-subset.woff2"), weight: "900", format: "woff2", display: "block" }),
  loadFont({ family: SERIF, url: staticFile("guangzhou/fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic", format: "woff2", display: "block" }),
  loadFont({ family: SEG, url: staticFile("guangzhou/fonts/DSEG7Classic-Bold.woff2"), weight: "700", format: "woff2", display: "block" }),
]).then(() => undefined);
