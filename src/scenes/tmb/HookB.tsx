import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkStage, Reveal, Shine, td } from "../../components/Dark";
import { Chars, Dots } from "../../components/Flourish";
import { DrawLine } from "../../components/Kinetic";
import { LogoMark } from "../../components/Ui";
import { FONT_FAMILY } from "../../lib/fonts";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { D } from "../../lib/themeDark";

// S1 — 훅: "매 수업 옆에, 코치를 둘 수 있다면?" 우측에는 AI 코치를 상징하는 동심 궤도가 그려진다.
const RINGS = [150, 230, 310];

export const HookB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = sp(frame, fps, { damping: 13, stiffness: 140, mass: 1 });
  const core = sp(frame - 20, fps, SMOOTH, 30);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
  const cx = 1440;
  const cy = 540;

  return (
    <DarkStage>
      <Dots count={22} color={D.lime} opacity={0.35} speed={0.35} seed="hb" />

      {/* 궤도 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {RINGS.map((r, i) => {
          const p = sp(frame - 10 - i * 10, fps, SMOOTH, 46);
          const rot = (frame * (0.25 + i * 0.12)) % 360 * (i % 2 === 0 ? 1 : -1);
          const ang = ((frame * (1.1 - i * 0.25)) % 360) * (Math.PI / 180) * (i % 2 === 0 ? 1 : -1);
          return (
            <g key={r} transform={`rotate(${rot} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={r} stroke={i === 1 ? D.limeDeep : D.line2} strokeWidth={i === 1 ? 1.5 : 1} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} opacity={0.9} />
              <circle cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r} r={i === 1 ? 6 : 4} fill={D.lime} opacity={p * (i === 1 ? 1 : 0.6)} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={64 + pulse * 10} fill="none" stroke={D.lime} strokeWidth={1} opacity={core * (0.35 - pulse * 0.2)} />
        <circle cx={cx} cy={cy} r={52} fill="url(#coreGrad)" opacity={core} />
        <defs>
          <radialGradient id="coreGrad">
            <stop offset="0%" stopColor={D.lime} />
            <stop offset="70%" stopColor={D.limeDeep} />
            <stop offset="100%" stopColor="rgba(139,201,38,0)" />
          </radialGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", left: cx - 60, top: cy - 20, width: 120, textAlign: "center", ...td(20, 900, "#0A1A14"), opacity: core, transform: `scale(${0.8 + core * 0.2})` }}>AI 코치</div>
      <div style={{ position: "absolute", left: cx - 200, top: cy + 346, width: 400, textAlign: "center", ...td(16, 600, D.faint), letterSpacing: "0.14em", opacity: interpolate(frame - 70, [0, 10], [0, 1], clamp) }}>녹화된 모든 수업에 붙습니다</div>

      {/* 로고 + 아이브로 */}
      <div style={{ position: "absolute", left: 150, top: 150, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ transform: `translateY(${interpolate(drop, [0, 1], [-240, 0])}px)` }}>
          <LogoMark height={56} />
        </div>
        <Reveal delay={8} distance={10}>
          <span style={td(22, 700, D.lime, { letterSpacing: "0.22em", textTransform: "uppercase" })}>Classin AI · 강의 평가</span>
        </Reveal>
      </div>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 150, top: 330, fontFamily: FONT_FAMILY, fontSize: 118, fontWeight: 900, color: D.ink, letterSpacing: "-0.05em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
        <Chars text="매 수업 옆에," delay={12} stagger={2.6} rotate={0} rise={44} />
        <br />
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 28 }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <Chars text="코치를" delay={38} stagger={2.6} rotate={0} rise={44} style={{ color: D.lime }} />
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 6 }}>
              <DrawLine delay={62} color={D.lime} thickness={6} duration={16} />
            </span>
          </span>
          <Chars text="둘 수 있다면?" delay={48} stagger={2.6} rotate={0} rise={44} />
        </span>
      </div>

      <Reveal delay={82} distance={18} style={{ position: "absolute", left: 150, top: 622 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 500, color: D.mute, letterSpacing: "-0.015em", lineHeight: 1.5 }}>
          최고의 전문가도 코치와 함께 성장합니다.
          <br />
          <Shine delay={100} duration={46}>
            <span style={{ fontWeight: 700 }}>이제 수업에도, AI 코치가 붙습니다.</span>
          </Shine>
        </div>
      </Reveal>
    </DarkStage>
  );
};
