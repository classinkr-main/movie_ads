import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { Chars, Dots, Highlighter } from "../../../shared/brand/Flourish";
import { Eyebrow, LogoMark, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";
import { tx } from "../tm/TmLayout";

// S1 — 훅: "매 수업 옆에, 코치를 둘 수 있다면?" 우측에 AI 코치를 상징하는 동심 궤도가 그려지고 빛점이 공전한다.
const RINGS = [150, 230, 310];

export const HookV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = sp(frame, fps, { damping: 13, stiffness: 140, mass: 1 });
  const core = sp(frame - 20, fps, SMOOTH, 30);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
  const cx = 1440;
  const cy = 540;

  return (
    <IvoryStage variant="white">
      <Dots count={20} opacity={0.4} speed={0.35} seed="hv" />

      {/* 궤도 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {RINGS.map((r, i) => {
          const p = sp(frame - 10 - i * 10, fps, SMOOTH, 46);
          const rot = ((frame * (0.25 + i * 0.12)) % 360) * (i % 2 === 0 ? 1 : -1);
          const ang = ((frame * (1.1 - i * 0.25)) % 360) * (Math.PI / 180) * (i % 2 === 0 ? 1 : -1);
          return (
            <g key={r} transform={`rotate(${rot} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={r} stroke={i === 1 ? C.limeDeep : "rgba(28,27,23,0.14)"} strokeWidth={i === 1 ? 2 : 1.2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
              <circle cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r} r={i === 1 ? 7 : 5} fill={i === 1 ? C.limeDeep : C.lime} opacity={p} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={66 + pulse * 10} fill="none" stroke={C.limeDeep} strokeWidth={1.5} opacity={core * (0.4 - pulse * 0.25)} />
        <circle cx={cx} cy={cy} r={54} fill={C.lime} opacity={core} style={{ filter: "drop-shadow(0 10px 30px rgba(139,201,38,0.45))" }} />
      </svg>
      <div style={{ position: "absolute", left: cx - 60, top: cy - 16, width: 120, textAlign: "center", ...tx(20, 900, C.forest), opacity: core, transform: `scale(${0.8 + core * 0.2})` }}>AI 코치</div>
      <div style={{ position: "absolute", left: cx - 200, top: cy + 346, width: 400, textAlign: "center", ...tx(16, 700, C.gray300), letterSpacing: "0.14em", opacity: interpolate(frame - 70, [0, 10], [0, 1], clamp) }}>녹화된 모든 수업에 붙습니다</div>

      {/* 로고 + 아이브로 */}
      <div style={{ position: "absolute", left: 150, top: 150, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ transform: `translateY(${interpolate(drop, [0, 1], [-240, 0])}px)` }}>
          <LogoMark height={56} />
        </div>
        <Rise delay={8} distance={10}>
          <Eyebrow size={22} color={C.forest}>
            Classin AI · 강의 평가
          </Eyebrow>
        </Rise>
      </div>

      {/* 헤드라인 — 2줄 고정 */}
      <div style={{ position: "absolute", left: 150, top: 330, fontFamily: FONT_FAMILY, fontSize: 118, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
        <Chars text="매 수업 옆에," delay={12} stagger={2.6} rotate={6} rise={44} />
        <br />
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 28 }}>
          <Highlighter delay={62} duration={16} inset={12}>
            <Chars text="코치를" delay={38} stagger={2.6} rotate={6} rise={44} style={{ color: C.forest }} />
          </Highlighter>
          <Chars text="둘 수 있다면?" delay={48} stagger={2.6} rotate={6} rise={44} />
        </span>
      </div>

      <Rise delay={80} distance={18} style={{ position: "absolute", left: 150, top: 622 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em", lineHeight: 1.5 }}>
          최고의 전문가도 코치와 함께 성장합니다.
          <br />
          <span style={{ color: C.ink, fontWeight: 700 }}>이제 수업에도, AI 코치가 붙습니다.</span>
        </div>
      </Rise>
    </IvoryStage>
  );
};
