import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FAMILY } from "./theme";

const FACES: Array<{ family: string; file: string; weight: string }> = [
  { family: FAMILY.display, file: "Hahmlet-Variable.woff2", weight: "100 900" },
  { family: FAMILY.sans, file: "IBMPlexSansKR-SemiBold.woff2", weight: "600" },
  { family: FAMILY.sans, file: "IBMPlexSansKR-Bold.woff2", weight: "700" },
  { family: FAMILY.num, file: "Anton-Regular.woff2", weight: "400" },
  { family: FAMILY.mono, file: "IBMPlexMono-Medium.woff2", weight: "500" },
  { family: FAMILY.mono, file: "IBMPlexMono-SemiBold.woff2", weight: "600" },
];

// 모듈 로드 시점에 모든 서체를 등록한다. loadFont는 내부에서 delayRender/continueRender를 처리한다.
export const fontsReady: Promise<void> = Promise.all(
  FACES.map(({ family, file, weight }) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight, format: "woff2", display: "block" }),
  ),
).then(() => undefined);
