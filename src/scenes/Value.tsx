import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage, LimeStage, PanelWipe } from "../components/Backgrounds";
import { Chars, GlassCard } from "../components/Flourish";
import { DrawLine, WordPop } from "../components/Kinetic";
import { Chip, Eyebrow, LogoMark, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SOFT, sp } from "../lib/motion";
import { C } from "../lib/theme";

const IconGrid: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 48 48" fill="none" stroke={C.limeInk} strokeWidth="2.5" strokeLinecap="round">
    <rect x="6" y="6" width="16" height="12" rx="3" />
    <rect x="26" y="6" width="16" height="20" rx="3" />
    <rect x="6" y="22" width="16" height="20" rx="3" />
    <rect x="26" y="30" width="16" height="12" rx="3" />
  </svg>
);
const IconPlay: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 48 48" fill="none" stroke={C.limeInk} strokeWidth="2.5" strokeLinejoin="round">
    <rect x="5" y="9" width="38" height="30" rx="5" />
    <path d="M20 17v14l11-7z" fill={C.limeInk} />
  </svg>
);

const SWITCH = 50; // 비트 B 시작(패널 와이프)

// S6 — 가치: 비트 A(누가 어디서 보나) → 비트 B(포지셔닝 라인, 연두 풀블리드)
export const Value: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftS = sp(frame - 14, fps, SOFT);
  const rightS = sp(frame - 22, fps, SOFT);

  return (
    <AbsoluteFill>
      {/* 비트 A */}
      {frame < SWITCH + 10 && (
        <IvoryStage>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
            <Rise delay={0} distance={16}>
              <Eyebrow size={22}>Data-driven teacher development</Eyebrow>
            </Rise>
            <div style={{ marginTop: 14, fontFamily: FONT_FAMILY, fontSize: 92, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.12, textAlign: "center" }}>
              <Chars text="교사 역량 개발을," delay={2} stagger={2} />{" "}
              <Chars text="감이 아니라" delay={14} stagger={2} />
              <span style={{ color: C.forest }}>
                {" "}
                <Chars text="데이터로." delay={24} stagger={2} />
              </span>
            </div>
          </AbsoluteFill>

          <div style={{ position: "absolute", top: 440, left: 160, right: 160, display: "flex", gap: 48 }}>
            <div style={{ flex: 1, transform: `translateX(${(1 - leftS) * -500}px) rotate(${(1 - leftS) * -6}deg)`, opacity: leftS }}>
              <GlassCard padding={40} radius={36} tilt={2.5}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 92, height: 92, borderRadius: 26, background: C.limeSoft, display: "grid", placeItems: "center" }}>
                    <IconGrid />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>관리자 대시보드</div>
                    <div style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 600, color: C.gray }}>학습 관리 → 교사 개발</div>
                  </div>
                </div>
                <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Chip delay={30} size={22}>최근 수업 성과 요약 · 전체 점수와 주요 이슈</Chip>
                  <Chip delay={35} size={22}>세션별 상세 리포트 열람 · 다운로드</Chip>
                </div>
              </GlassCard>
            </div>
            <div style={{ flex: 1, transform: `translateX(${(1 - rightS) * 500}px) rotate(${(1 - rightS) * 6}deg)`, opacity: rightS }}>
              <GlassCard padding={40} radius={36} tilt={2.5}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 92, height: 92, borderRadius: 26, background: C.limeSoft, display: "grid", placeItems: "center" }}>
                    <IconPlay />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>클래스인 앱</div>
                    <div style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 600, color: C.gray }}>코스 → 수업 다시보기</div>
                  </div>
                </div>
                <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Chip delay={38} size={22}>수업 교사가 자기 리포트를 직접 확인</Chip>
                  <Chip delay={43} size={22}>녹화와 리포트가 항상 함께 남음</Chip>
                </div>
              </GlassCard>
            </div>
          </div>
        </IvoryStage>
      )}

      {/* 비트 B */}
      <Sequence from={SWITCH + 6} layout="none">
        <LimeStage>
          <div style={{ position: "absolute", right: -160, bottom: -120, opacity: 0.16, transform: `rotate(${frame * 0.25}deg)` }}>
            <LogoMark height={640} />
          </div>
          <div style={{ position: "absolute", top: 84, left: 120 }}>
            <Rise delay={2} distance={16}>
              <Eyebrow size={22} color={C.limeInk}>
                Classin · 수업 시스템 OS
              </Eyebrow>
            </Rise>
          </div>
          <AbsoluteFill style={{ justifyContent: "center", padding: "0 120px" }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 128, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <WordPop delay={2} fromScale={1.5}>
                  좋은 수업을,
                </WordPop>
              </div>
              <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start" }}>
                <WordPop delay={10} fromScale={1.5}>
                  <span style={{ color: "rgba(28,27,23,0.55)" }}>강사의 개인기에서</span>
                </WordPop>
                <DrawLine delay={22} color={C.ink} thickness={14} style={{ top: "52%", transform: "translateY(-50%) rotate(-1.5deg)" }} duration={10} />
              </div>
              <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start", marginTop: 6 }}>
                <WordPop delay={26} fromScale={2.1} rotate={-3}>
                  <span style={{ color: C.forest, fontSize: 144 }}>학원의 시스템으로</span>
                </WordPop>
                <DrawLine delay={38} color={C.white} thickness={12} style={{ bottom: -4 }} duration={12} />
              </div>
            </div>
          </AbsoluteFill>
        </LimeStage>
      </Sequence>

      {/* 비트 전환 패널 */}
      <Sequence from={SWITCH} durationInFrames={18} layout="none">
        <PanelWipe colors={[C.forest, C.limeSoft]} direction="btt" duration={18} />
      </Sequence>
    </AbsoluteFill>
  );
};
