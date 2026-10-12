import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FeatureLayout } from "../components/Feature";
import { ClipReveal, TypeText } from "../components/Flourish";
import { Chip } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const LANGS = ["English", "中文", "日本語", "Tiếng Việt"];
const KO = "오늘은 분수의 덧셈을 배워 볼게요.";
const EN = "Today we'll learn how to add fractions.";

// 04 — AI 자동 번역 · 실시간 자막
export const F04Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = Math.min(LANGS.length - 1, Math.max(0, Math.floor((frame - 30) / 22)));
  const W = 880;
  const H = 500;

  return (
    <FeatureLayout
      index={3}
      side="left"
      variant="ivory2"
      title={
        <>
          말하는 순간,
          <br />
          번역 자막이 뜹니다
        </>
      }
      sub="수업 음성을 실시간으로 받아 적고 원하는 언어로 번역해 자막으로 띄웁니다. 다국어 교실도, 해외 학생도 같은 수업을 듣습니다."
      bullets={["실시간 자막", "다국어 자동 번역", "녹화본에도 자막 유지"]}
    >
      <ClipReveal delay={8} radius={36} from="right">
        <div style={{ width: W, height: H, borderRadius: 36, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, #2A3D2F 0%, #15271C 60%, #0F1C14 100%)`, boxShadow: "0 40px 100px rgba(28,27,23,0.22)" }}>
          {/* 교실 추상: 칠판 + 실루엣 */}
          <div style={{ position: "absolute", left: 60, top: 54, right: 60, height: 230, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: 28, top: 34 + i * 40, height: 10, width: `${[48, 30, 40][i]}%`, borderRadius: 999, background: "rgba(200,240,90,0.35)", transform: `scaleX(${sp(frame - 14 - i * 8, fps, SMOOTH, 20)})`, transformOrigin: "0 50%" }} />
            ))}
            <div style={{ position: "absolute", right: 40, top: 30, width: 120, height: 120, borderRadius: 999, background: "rgba(200,240,90,0.18)", border: "2px solid rgba(200,240,90,0.5)" }} />
          </div>
          <div style={{ position: "absolute", left: 60, bottom: 150, display: "flex", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 999, background: `rgba(255,255,255,${0.12 + random(`av${i}`) * 0.15})`, border: "1.5px solid rgba(255,255,255,0.2)" }} />
            ))}
          </div>
          {/* LIVE */}
          <div style={{ position: "absolute", left: 24, top: 22, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 14px" }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: C.lime, opacity: frame % 20 < 12 ? 1 : 0.3 }} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: "0.14em" }}>LIVE</span>
          </div>
          {/* 언어 칩 */}
          <div style={{ position: "absolute", right: 24, top: 22, display: "flex", gap: 8 }}>
            {LANGS.map((l, i) => {
              const on = i === active;
              return (
                <span key={l} style={{ fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 700, color: on ? C.ink : "rgba(255,255,255,0.75)", background: on ? C.lime : "rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 12px", transform: `scale(${on ? 1.06 : 1})`, opacity: interpolate(frame - 10 - i * 3, [0, 6], [0, 1], clamp) }}>
                  {l}
                </span>
              );
            })}
          </div>
          {/* 자막 */}
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 28, background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "18px 24px", backdropFilter: "blur(6px)" }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.85)", minHeight: 30 }}>
              <TypeText text={KO} delay={18} cps={1.1} caretColor={C.lime} />
            </div>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 800, color: C.lime, marginTop: 6, minHeight: 38, letterSpacing: "-0.01em" }}>
              <TypeText text={EN} delay={34} cps={1.3} caretColor={C.lime} />
            </div>
          </div>
        </div>
      </ClipReveal>
    </FeatureLayout>
  );
};
