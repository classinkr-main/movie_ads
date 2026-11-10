import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// 의존성 없이 FontFace API 로 직접 올립니다(@remotion/fonts 가 없는 OpenMontage 컴포저에서도 같은 코드로 렌더).
type Face = { family: string; file: string; weight: string; unicodeRange?: string };

const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const FACES: Face[] = [
  { family: "Pretendard", file: "fonts/Pretendard-Medium.woff2", weight: "500" },
  { family: "Pretendard", file: "fonts/Pretendard-SemiBold.woff2", weight: "600" },
  { family: "Pretendard", file: "fonts/Pretendard-Bold.woff2", weight: "700" },
  { family: "Pretendard", file: "fonts/Pretendard-ExtraBold.woff2", weight: "800" },
  { family: "Pretendard", file: "fonts/Pretendard-Black.woff2", weight: "900" },
  { family: "Black Han Sans", file: "fonts/BlackHanSans-Latin.woff2", weight: "400", unicodeRange: LATIN },
  { family: "Black Han Sans", file: "fonts/BlackHanSans-Korean.woff2", weight: "400", unicodeRange: "U+1100-11FF,U+3000-303F,U+3130-318F,U+AC00-D7A3,U+FF00-FFEF" },
];

let loaded = false;
let pending: Promise<void> | null = null;

export const ensureFonts = (): Promise<void> => {
  if (pending) return pending;
  if (typeof document === "undefined") return Promise.resolve();
  pending = Promise.all(
    FACES.map(async (f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format("woff2")`, {
        weight: f.weight,
        style: "normal",
        display: "block",
        ...(f.unicodeRange ? { unicodeRange: f.unicodeRange } : {}),
      });
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => {
    loaded = true;
  });
  return pending;
};

/** 폰트가 다 올라올 때까지 렌더를 붙잡습니다. 캔버스 텍스처에 글자를 굽기 전에 반드시 통과해야 합니다. */
export const useFontsReady = (): boolean => {
  const [ok, setOk] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender("fonts")));
  useEffect(() => {
    let alive = true;
    ensureFonts().then(() => {
      if (alive) setOk(true);
      if (handle !== null) continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [handle]);
  return ok;
};
