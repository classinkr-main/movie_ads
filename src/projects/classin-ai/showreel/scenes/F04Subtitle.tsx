import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FeatureLayout } from "../components/Feature";
import { ClipReveal, TypeText } from "../components/Flourish";
import { FONT_FAMILY } from "../../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../../shared/motion";
import { C } from "../theme";

const KO = "'별'은 화자가 지향하는 이상을 상징해요.";
const LANGS = [
  { chip: "English", text: "The “star” symbolizes the ideal the speaker longs for.", from: 46, student: "Alex" },
  { chip: "中文", text: "“星星”象征着诗中说话者所向往的理想。", from: 90, student: "Lin" },
  { chip: "日本語", text: "「星」は話し手が目指す理想を象徴しています。", from: 104, student: "Yui" },
  { chip: "Tiếng Việt", text: "“Ngôi sao” tượng trưng cho lý tưởng mà nhân vật trữ tình hướng tới.", from: 118, student: "Thu" },
];
const STUDENTS = [
  { name: "김지민", lang: "한국어" },
  { name: "박도윤", lang: "한국어" },
  { name: "Alex", lang: "English" },
  { name: "Lin", lang: "中文" },
  { name: "Yui", lang: "日本語" },
  { name: "Thu", lang: "Tiếng Việt" },
];
const BOARD = [
  { w: "하늘", m: "양심 · 삶의 기준", d: 18 },
  { w: "바람", m: "시련 · 갈등", d: 24 },
  { w: "별", m: "이상 · 희망", d: 30 },
];

const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

const Chalk: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - d, fps, SMOOTH, 16);
  return <div style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, ...style }}>{children}</div>;
};

// 04 — AI 자동 번역 · 실시간 자막
export const F04Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let active = 0;
  LANGS.forEach((l, i) => {
    if (frame >= l.from) active = i;
  });
  const lang = LANGS[active];
  const swap = sp(frame - lang.from, fps, SMOOTH, 10);
  const W = 940;
  const H = 580;

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
      sub="교사의 말이 실시간 자막이 되고, 학생마다 자기 언어로 번역해 봅니다. 다문화 교실도 같은 수업을 듣습니다."
      bullets={["실시간 자막", "학생별 언어 선택", "다시보기에도 자막 유지"]}
    >
      <ClipReveal delay={8} radius={36} from="right">
        <div style={{ width: W, height: H, borderRadius: 36, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #2A3D2F 0%, #15271C 60%, #0F1C14 100%)", boxShadow: "0 40px 100px rgba(28,27,23,0.22)" }}>
          {/* 상단 바 */}
          <div style={{ position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 14px" }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: C.lime, opacity: frame % 20 < 12 ? 1 : 0.3 }} />
            <span style={t(15, 800, C.white, { letterSpacing: "0.14em" })}>LIVE</span>
            <span style={t(14, 600, "rgba(255,255,255,0.7)")}>중2 국어 A반 · 17:26</span>
          </div>
          <div style={{ position: "absolute", right: 24, top: 20, display: "flex", gap: 8 }}>
            {LANGS.map((l, i) => {
              const on = i === active;
              return (
                <span key={l.chip} style={{ ...t(14, 700, on ? C.ink : "rgba(255,255,255,0.75)"), background: on ? C.lime : "rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 12px", transform: `scale(${on ? 1.06 : 1})`, opacity: interpolate(frame - 10 - i * 3, [0, 6], [0, 1], clamp) }}>
                  {l.chip}
                </span>
              );
            })}
          </div>

          {/* 칠판 */}
          <div style={{ position: "absolute", left: 32, right: 32, top: 66, height: 196, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", padding: "18px 26px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <Chalk d={12}>
                <div style={t(26, 800, C.white)}>
                  서시 <span style={{ ...t(18, 600, "rgba(255,255,255,0.6)") }}>— 윤동주</span>
                </div>
              </Chalk>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {BOARD.map((b) => (
                  <Chalk key={b.w} d={b.d}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ ...t(20, 800, C.lime), width: 50 }}>{b.w}</span>
                      <span style={t(18, 600, "rgba(255,255,255,0.55)")}>→</span>
                      <span style={t(20, 600, "rgba(255,255,255,0.9)")}>{b.m}</span>
                    </div>
                  </Chalk>
                ))}
              </div>
            </div>
            {/* 교사 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingRight: 10 }}>
              <div style={{ width: 96, height: 96, borderRadius: 999, background: "rgba(200,240,90,0.16)", border: `2px solid ${C.lime}`, display: "grid", placeItems: "center", ...t(30, 800, C.lime) }}>이</div>
              <div style={t(14, 700, "rgba(255,255,255,0.85)")}>이서윤 선생님</div>
              <div style={{ display: "flex", gap: 3, height: 18, alignItems: "center" }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} style={{ width: 4, height: 4 + 14 * Math.abs(Math.sin(frame / 4 + i * 0.8)), borderRadius: 4, background: C.lime }} />
                ))}
              </div>
            </div>
          </div>

          {/* 학생 타일 */}
          <div style={{ position: "absolute", left: 32, right: 32, top: 280, display: "flex", gap: 10 }}>
            {STUDENTS.map((s, i) => {
              const on = s.name === lang.student;
              return (
                <div key={s.name} style={{ flex: 1, height: 54, borderRadius: 14, background: on ? "rgba(200,240,90,0.16)" : "rgba(255,255,255,0.07)", border: `1.5px solid ${on ? C.lime : "rgba(255,255,255,0.14)"}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", opacity: interpolate(frame - 16 - i * 2, [0, 6], [0, 1], clamp) }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, background: on ? C.lime : "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.15 }}>
                    <div style={t(14, 800, C.white)}>{s.name}</div>
                    <div style={t(12, 600, on ? C.lime : "rgba(255,255,255,0.55)")}>{s.lang}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 자막 */}
          <div style={{ position: "absolute", left: 32, right: 32, bottom: 24, background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "16px 24px" }}>
            <div style={t(13, 800, C.lime, { letterSpacing: "0.06em" })}>
              실시간 자막 · 한국어 → {lang.chip}
              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{`  ·  ${lang.student} 학생 화면`}</span>
            </div>
            <div style={{ ...t(22, 600, "rgba(255,255,255,0.9)"), marginTop: 6, minHeight: 30 }}>
              <TypeText text={KO} delay={24} cps={1.3} caretColor={C.lime} />
            </div>
            <div style={{ ...t(26, 800, C.lime), marginTop: 4, minHeight: 70, lineHeight: 1.3 }}>
              {active === 0 ? (
                <TypeText text={LANGS[0].text} delay={LANGS[0].from} cps={1.7} caretColor={C.lime} />
              ) : (
                <span style={{ display: "inline-block", opacity: swap, transform: `translateY(${(1 - swap) * 14}px)` }}>{lang.text}</span>
              )}
            </div>
          </div>
        </div>
      </ClipReveal>
    </FeatureLayout>
  );
};
