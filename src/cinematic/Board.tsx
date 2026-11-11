import React from "react";
import { Img, staticFile } from "remotion";
import { Slate } from "./Chalk";
import { BOARD, K, rgba } from "./theme";

/**
 * Classin Board — 실제 제품 프레임(classinkr-web 홈 히어로 에셋) 위에 화면 내용을 얹는다.
 * children 은 1291×681 좌표계로 그리면 화면 영역에 맞춰 축소·확대된다.
 */
export const Board: React.FC<{
  id: string;
  width: number;
  children?: React.ReactNode;
  glare?: number; // 유리 반사 0~1
  lit?: number; // 화면 밝기 0~1
  rim?: number; // 프레임 림라이트 0~1
  style?: React.CSSProperties;
}> = ({ id, width, children, glare = 0.5, lit = 1, rim = 0.7, style }) => {
  const k = width / BOARD.w;
  const height = BOARD.h * k;
  return (
    <div style={{ position: "relative", width, height, ...style }}>
      {/* 화면이 뿜는 빛 */}
      <div
        style={{
          position: "absolute",
          left: -width * 0.22,
          top: -height * 0.3,
          width: width * 1.44,
          height: height * 1.6,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(K.mint, 0.2 * lit * rim)} 0%, ${rgba(K.green, 0.16 * lit * rim)} 35%, transparent 68%)`,
        }}
      />
      <Img src={staticFile("cinematic/board-frame.webp")} style={{ position: "absolute", left: 0, top: 0, width, height, filter: `brightness(${0.5 + rim * 0.22}) contrast(1.12) saturate(0.6)` }} />
      {/* 화면 */}
      <div style={{ position: "absolute", left: BOARD.sx * k, top: BOARD.sy * k, width: BOARD.sw * k, height: BOARD.sh * k, overflow: "hidden", background: K.slate }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: BOARD.sw, height: BOARD.sh, transform: `scale(${k})`, transformOrigin: "0 0" }}>
          <Slate id={`${id}-slate`} />
          <div style={{ position: "absolute", inset: 0, opacity: lit }}>{children}</div>
        </div>
        {/* 화면 가장자리 어둠 + 유리 글레어 */}
        <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${90 * k}px rgba(0,0,0,0.55)`, background: `radial-gradient(ellipse 80% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)` }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: glare,
            background: `linear-gradient(112deg, transparent 0%, transparent 30%, rgba(255,255,255,0.055) 38%, rgba(255,255,255,0.10) 44%, rgba(255,255,255,0.02) 50%, transparent 58%, transparent 100%), linear-gradient(180deg, ${rgba(K.mintHot, 0.07)} 0%, transparent 22%)`,
          }}
        />
      </div>
      {/* 프레임 위쪽 림라이트 */}
      <div
        style={{
          position: "absolute",
          left: 44 * k,
          top: 27 * k,
          width: 1322 * k,
          height: 3 * k + 1,
          borderRadius: 4,
          background: `linear-gradient(90deg, transparent 0%, ${rgba(K.mintHot, 0.75 * rim)} 22%, #ffffff 46%, ${rgba(K.mintHot, 0.75 * rim)} 70%, transparent 100%)`,
          opacity: rim,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};
