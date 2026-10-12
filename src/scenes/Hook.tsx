import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { Chars, GhostWord, RollingNumber } from "../components/Flourish";
import { Chip, Eyebrow, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const pad2 = (n: number) => String(n).padStart(2, "0");

// S1 — 훅: "수업은 매일 쌓입니다." 12개 수업 타일이 채워진다.
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalSec = Math.round(interpolate(frame, [0, 96], [0, 12 * 3600], clamp));
  const tc = `${pad2(Math.floor(totalSec / 3600))}:${pad2(Math.floor((totalSec % 3600) / 60))}:${pad2(totalSec % 60)}`;
  const blink = frame % 24 < 14;
  const cellW = 150;
  const cellH = 100;
  const gap = 16;

  return (
    <IvoryStage>
      <GhostWord text="RECORDED" size={300} top="68%" opacity={0.08} speed={1.4} />

      {/* 상단 바 */}
      <div style={{ position: "absolute", top: 64, left: 120, display: "flex", alignItems: "center", gap: 14 }}>
        <Chip delay={0} size={22} bg={C.white} color={C.ink} shadow>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 999, background: C.limeDeep, marginRight: 10, opacity: blink ? 1 : 0.3 }} />
          REC · 자동 녹화
        </Chip>
      </div>
      <div style={{ position: "absolute", top: 60, right: 120, textAlign: "right" }}>
        <Rise delay={3} distance={16}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "0.03em" }}>{tc}</div>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: C.gray300, letterSpacing: "0.12em" }}>오늘 누적 녹화</div>
        </Rise>
      </div>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", top: 180, left: 120 }}>
        <Rise delay={0} distance={14}>
          <Eyebrow size={22}>Every lesson, every day</Eyebrow>
        </Rise>
        <div style={{ marginTop: 18, fontFamily: FONT_FAMILY, fontSize: 136, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.06 }}>
          <Chars text="수업은 매일" delay={4} stagger={2} />
          <br />
          <Chars text="쌓입니다." delay={16} stagger={2} />
        </div>
      </div>

      {/* 수업 타일 6x2 */}
      <div style={{ position: "absolute", left: 120, top: 560, display: "grid", gridTemplateColumns: `repeat(6, ${cellW}px)`, gap }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const start = 22 + i * 3;
          const s = sp(frame - start, fps, PUNCH);
          const on = frame >= start;
          return (
            <div
              key={i}
              style={{
                width: cellW,
                height: cellH,
                borderRadius: 18,
                background: on ? C.lime : C.white,
                border: `1.5px solid ${C.hairline}`,
                boxShadow: on ? "0 14px 30px rgba(139,201,38,0.25)" : "0 8px 20px rgba(28,27,23,0.05)",
                transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -8}deg)`,
                opacity: interpolate(frame - start + 6, [0, 4], [0, 1], clamp),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {Array.from({ length: 9 }).map((_, k) => (
                <div key={k} style={{ width: 5, height: 10 + 26 * Math.abs(Math.sin(frame / 6 + k * 0.9 + i)), borderRadius: 4, background: on ? C.ink : C.hairline, opacity: on ? 0.75 : 1 }} />
              ))}
            </div>
          );
        })}
      </div>

      {/* 오도미터 */}
      <div style={{ position: "absolute", right: 140, top: 430, textAlign: "right" }}>
        <Rise delay={20} distance={30}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 10 }}>
            <RollingNumber to={12} delay={22} duration={44} size={300} color={C.forest} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: 64, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>개</span>
          </div>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 600, color: C.gray, marginTop: -10, letterSpacing: "-0.01em" }}>오늘 녹화된 수업</div>
        </Rise>
      </div>

      {/* 리드 아웃 */}
      <div style={{ position: "absolute", left: 120, bottom: 110 }}>
        <Rise delay={62} distance={20}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 600, color: C.gray, letterSpacing: "-0.01em" }}>
            녹화는 자동으로 쌓입니다. <span style={{ color: C.ink, fontWeight: 800 }}>그런데 —</span>
          </div>
        </Rise>
      </div>
    </IvoryStage>
  );
};
