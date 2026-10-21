import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeOutExpo } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { Clip } from "../media";
import { Brackets, Dust, Letterbox, Mono, Timecode } from "../fx";
import { Chars, MaskLine } from "../type";
import { R } from "../theme";

/*
 * S1 훅 (0–180f · 3.0s)
 *   0–22    중앙에 민트 라인이 그어진다
 *   10–90   "미래의 수업" 거대 타이포 — 글자 안에서 스톡 영상(SPACE TRAVEL 전자칠판)이 재생된다
 *   86–120  글자 레이어가 커지며 사라지고 영상이 풀프레임으로 열린다(줌스루)
 *   118–168 "이미, 학원에서 시작됐습니다."
 *   166–180 왼쪽으로 휩 아웃(S2가 오른쪽에서 겹쳐 들어온다)
 * 시네마틱: 2.39:1 레터박스로 시작해 줌스루 순간 16:9로 열리고(화면비 확장), 풀프레임 이후 먼지 입자가 빛 속을 떠다닌다.
 */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const line = interpolate(f, [0, 24], [0, 1], { ...clamp, easing: easeOutExpo });
  const lineFade = interpolate(f, [70, 92], [1, 0], clamp);
  const zoom = interpolate(f, [84, 122], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const maskOpacity = interpolate(f, [100, 122], [1, 0], clamp);
  const exit = interpolate(f, [164, 180], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const hud = interpolate(f, [4, 18, 150, 166], [0, 1, 1, 0], clamp);
  const open = interpolate(f, [98, 128], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill style={{ background: R.night, transform: `translateX(${-exit * 32}%)`, filter: `blur(${exit * 14}px)` }}>
      {/* 영상 — 글자 안에서 시작해 풀프레임으로 */}
      <Clip src="space" from={{ s: 1.32, x: 2 }} to={{ s: 1.02, x: 0 }} dur={170} grade="soft" style={{ filter: `brightness(${interpolate(f, [0, 96, 124], [1.55, 1.55, 1], clamp)})` }} />

      {/* 글자 마스크 레이어: 검정 위의 흰 글자를 multiply → 글자 모양으로만 영상이 보인다 */}
      {maskOpacity > 0 && (
        <AbsoluteFill style={{ background: "#000", mixBlendMode: "multiply", opacity: maskOpacity, transform: `scale(${1 + zoom * 9})`, transformOrigin: "47% 52%" }}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 330, fontWeight: 900, color: "#FFF", letterSpacing: "-0.06em", lineHeight: 1 }}>
              <Chars text="미래의 수업" at={10} stagger={4} lift={0.35} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* 글자 외곽선 — 어두운 영상 구간에서도 글자 모양이 또렷하게 */}
      {maskOpacity > 0 && (
        <AbsoluteFill style={{ opacity: maskOpacity * 0.85, transform: `scale(${1 + zoom * 9})`, transformOrigin: "47% 52%", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 330, fontWeight: 900, color: "transparent", WebkitTextStroke: `2px rgba(${R.accentRgb},0.55)`, letterSpacing: "-0.06em", lineHeight: 1 }}>
            <Chars text="미래의 수업" at={10} stagger={4} lift={0.35} />
          </div>
        </AbsoluteFill>
      )}

      {/* 민트 라인 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: lineFade }}>
        <div style={{ width: 1560 * line, height: 4, marginTop: 420, background: R.accent, boxShadow: `0 0 24px rgba(${R.accentRgb},0.9)`, borderRadius: 4 }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: interpolate(f, [112, 132], [0, 1], clamp) }}>
        <Dust count={40} seed="hook" opacity={0.6} />
      </AbsoluteFill>
      <Letterbox open={open} />

      {/* 풀프레임 이후 카피 */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(3,11,8,0.82) 0%, rgba(3,11,8,0.25) 42%, rgba(3,11,8,0) 60%)", opacity: interpolate(f, [104, 124], [0, 1], clamp) }} />
      <div style={{ position: "absolute", left: 120, bottom: 128, fontFamily: FONT_FAMILY, color: R.white }}>
        <MaskLine at={116} dur={22}>
          <Mono size={22} color={R.accent}>The future of class</Mono>
        </MaskLine>
        <MaskLine at={122} dur={28} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            이미, <span style={{ color: R.accent }}>학원에서</span> 시작됐습니다.
          </div>
        </MaskLine>
      </div>

      {/* HUD */}
      <div style={{ position: "absolute", inset: 0, opacity: hud }}>
        <div style={{ position: "absolute", left: 72, top: 60 }}>
          <Mono size={17}>Classin · Brand Reel 2026</Mono>
        </div>
        <div style={{ position: "absolute", right: 72, top: 60 }}>
          <Timecode size={17} />
        </div>
        <div style={{ position: "absolute", right: 72, bottom: 60 }}>
          <Mono size={17}>수업 시스템 OS</Mono>
        </div>
        <Brackets inset={40} len={36} thick={2} opacity={interpolate(f, [110, 126], [0, 0.7], clamp)} />
      </div>
    </AbsoluteFill>
  );
};
