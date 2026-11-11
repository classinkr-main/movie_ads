import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import "../lib/fonts"; // Pretendard 6굵기

export { FONT_FAMILY } from "../lib/fonts";

// 시대별 서체 (모두 SIL OFL 1.1 — public/fonts/LICENSE-*.txt)
export const CHALK_FONT = "Gaegu"; // 판서 손글씨
export const SERIF_FONT = "Nanum Myeongjo"; // 어제 — 옛 필름 자막·타이틀
export const MONO_FONT = "IBM Plex Mono"; // 내일 — HUD 숫자·라벨

const face = (family: string, file: string, weight: string, unicodeRange?: string) =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, format: "woff2", display: "block", unicodeRange });

export const eraFontsReady: Promise<void> = Promise.all([
  face(CHALK_FONT, "Gaegu-Bold.woff2", "700"),
  face(SERIF_FONT, "NanumMyeongjo-ExtraBold-latin.woff2", "800", "U+0000-00FF, U+2000-206F"),
  face(SERIF_FONT, "NanumMyeongjo-ExtraBold-korean.woff2", "800", "U+1100-11FF, U+3000-303F, U+3130-318F, U+AC00-D7AF"),
  face(MONO_FONT, "IBMPlexMono-Medium.woff2", "500"),
]).then(() => undefined);
