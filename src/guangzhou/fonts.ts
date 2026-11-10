import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 브이로그 전용 서체 — 모두 SIL OFL 1.1 (public/guangzhou/fonts/LICENSE-*)
export const HAND = "Nanum Pen Script"; // 손글씨 캡션
export const SERIF_CN = "Noto Serif SC GZ"; // 广州 등 한자 (서브셋)
export const SERIF = "Instrument Serif GZ"; // 영문 이탤릭 포인트 — 브래그컷의 Instrument Serif(다른 파일)와 겹치지 않게 이름을 따로 쓴다
export const SEG = "DSEG7 Classic"; // 필름 카메라 날짜 각인
export const SERIF_CN_FILM = "Noto Serif SC Film"; // 행사 영상 타이틀 한자 (서브셋)
export const SANS_CN = "Noto Sans SC Film"; // 하단 자막의 기관명 한자 (서브셋)

export const gzFontsReady: Promise<void> = Promise.all([
  loadFont({ family: HAND, url: staticFile("guangzhou/fonts/NanumPenScript-Regular.woff2"), weight: "400", format: "woff2", display: "block" }),
  loadFont({ family: SERIF_CN, url: staticFile("guangzhou/fonts/NotoSerifSC-Black-subset.woff2"), weight: "900", format: "woff2", display: "block" }),
  loadFont({ family: SERIF, url: staticFile("guangzhou/fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic", format: "woff2", display: "block" }),
  loadFont({ family: SEG, url: staticFile("guangzhou/fonts/DSEG7Classic-Bold.woff2"), weight: "700", format: "woff2", display: "block" }),
  loadFont({ family: SERIF_CN_FILM, url: staticFile("guangzhou/fonts/NotoSerifSC-Black-film.woff2"), weight: "900", format: "woff2", display: "block" }),
  loadFont({ family: SANS_CN, url: staticFile("guangzhou/fonts/NotoSansSC-Bold-film.woff2"), weight: "700", format: "woff2", display: "block" }),
]).then(() => undefined);
