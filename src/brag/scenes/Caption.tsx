import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TypeText } from "../../components/Flourish";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { K } from "../Cinema";
import { CineFeature, ExampleTag, GiantType, mono, serif, t } from "../Layout";
import { local } from "../timeline";

const L = {
  title: local("caption", "caption.title"),
  card: local("caption", "caption.card"),
  koStart: local("caption", "caption.koStart"),
  koEnd: local("caption", "caption.koEnd"),
};
const KO = "'별'은 화자가 지향하는 이상을 상징해요.";
// 지원 언어는 v4와 같은 예시 — 실제 지원 범위에 맞춰 조정 필요(README 검수 참고)
const LANGS = [
  { chip: "English", text: "The “star” stands for the speaker's ideal.", from: local("caption", "caption.en"), student: "Alex" },
  { chip: "中文", text: "“星星”象征着说话者所向往的理想。", from: local("caption", "caption.zh"), student: "Lin" },
  { chip: "日本語", text: "「星」は話し手が目指す理想を象徴しています。", from: local("caption", "caption.ja"), student: "Yui" },
  { chip: "Tiếng Việt", text: "“Ngôi sao” tượng trưng cho lý tưởng.", from: local("caption", "caption.vi"), student: "Thu" },
];
const STUDENTS = [
  { name: "김지민", lang: "한국어" },
  { name: "Alex", lang: "English" },
  { name: "Lin", lang: "中文" },
  { name: "박도윤", lang: "한국어" },
  { name: "Yui", lang: "日本語" },
  { name: "Thu", lang: "Tiếng Việt" },
];
const BOARD = [
  { w: "하늘", m: "양심 · 삶의 기준" },
  { w: "바람", m: "시련 · 갈등" },
  { w: "별", m: "이상 · 희망" },
];

const Chalk: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - d, fps, SMOOTH, 14);
  return <div style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>{children}</div>;
};

// 03 — 실시간으로 통역합니다
export const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let active = -1;
  LANGS.forEach((l, i) => {
    if (frame >= l.from) active = i;
  });
  const lang = active >= 0 ? LANGS[active] : null;
  const swap = lang ? sp(frame - lang.from, fps, SMOOTH, 8) : 0;
  const cps = Array.from(KO).length / (L.koEnd - L.koStart);

  return (
    <CineFeature
      index={2}
      titleAt={L.title}
      cardAt={L.card}
      sheenAt={L.koEnd}
      lineA="실시간으로"
      lineB="통역합니다."
      sub="교사의 말이 학생마다 자기 언어 자막으로"
      beamX={60}
      rest={{ rx: 7, ry: -9 }}
      backdrop={lang ? <GiantType key={lang.chip} text={lang.chip} at={lang.from} size={400} top={300} left={300} opacity={0.14} /> : null}
    >
        <div style={{ width: 952, height: 730, borderRadius: 44, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #2C5440 0%, #173528 55%, #0E241A 100%)", boxShadow: `0 0 0 2px ${K.rim}, 0 70px 140px rgba(0,0,0,0.6), 0 0 120px rgba(200,240,90,0.2)` }}>
          {/* 상단 바 */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 26, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "8px 18px" }}>
              <span style={{ width: 13, height: 13, borderRadius: 999, background: C.lime, opacity: frame % 20 < 12 ? 1 : 0.3 }} />
              <span style={mono(22, 700, C.white, { letterSpacing: "0.16em" })}>LIVE</span>
              <span style={t(22, 600, "rgba(255,255,255,0.7)")}>중2 국어 A반</span>
            </div>
            <ExampleTag dark />
          </div>

          {/* 칠판 + 교사 */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 96, height: 214, borderRadius: 24, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", padding: "20px 28px", display: "flex", justifyContent: "space-between", boxSizing: "border-box" }}>
            <div>
              <Chalk d={L.card + 6}>
                <div style={serif(36, 700, C.white)}>
                  서시 <span style={serif(24, 500, "rgba(255,255,255,0.6)")}>— 윤동주</span>
                </div>
              </Chalk>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {BOARD.map((b, i) => (
                  <Chalk key={b.w} d={L.card + 10 + i * 4}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ ...serif(30, 700, C.lime), width: 64 }}>{b.w}</span>
                      <span style={t(24, 600, "rgba(255,255,255,0.55)")}>→</span>
                      <span style={t(28, 600, "rgba(255,255,255,0.9)")}>{b.m}</span>
                    </div>
                  </Chalk>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ width: 104, height: 104, borderRadius: 999, background: "rgba(200,240,90,0.16)", border: `3px solid ${C.lime}`, display: "grid", placeItems: "center", ...t(40, 800, C.lime) }}>이</div>
              <div style={{ display: "flex", gap: 4, height: 24, alignItems: "center" }}>
                {Array.from({ length: 9 }).map((_, i) => {
                  const talking = frame >= L.koStart && frame <= L.koEnd + 30;
                  return <span key={i} style={{ width: 5, height: 5 + (talking ? 18 : 3) * Math.abs(Math.sin(frame / 4 + i * 0.8)), borderRadius: 4, background: C.lime }} />;
                })}
              </div>
            </div>
          </div>

          {/* 학생 타일 3×2 */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 330, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {STUDENTS.map((s, i) => {
              const on = lang !== null && s.name === lang.student;
              return (
                <div key={s.name} style={{ height: 70, borderRadius: 18, background: on ? "rgba(200,240,90,0.18)" : "rgba(255,255,255,0.07)", border: `2px solid ${on ? C.lime : "rgba(255,255,255,0.14)"}`, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", opacity: interpolate(frame - L.card - 8 - i * 2, [0, 6], [0, 1], clamp), transform: `scale(${on ? 1.03 : 1})` }}>
                  <span style={{ width: 34, height: 34, borderRadius: 999, background: on ? C.lime : "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.15 }}>
                    <div style={t(22, 800, C.white)}>{s.name}</div>
                    <div style={t(18, 600, on ? C.lime : "rgba(255,255,255,0.55)")}>{s.lang}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 자막 */}
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, height: 222, background: "rgba(0,0,0,0.5)", borderRadius: 28, padding: "20px 28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, ...mono(20, 700, C.lime, { letterSpacing: "0.1em" }) }}>
              <span>LIVE CAPTION</span>
              {lang && (
                <span style={t(20, 800, C.ink, { background: C.lime, borderRadius: 999, padding: "3px 14px", transform: `scale(${0.8 + swap * 0.2})`, display: "inline-block" })}>
                  한국어 → {lang.chip}
                </span>
              )}
            </div>
            <div style={{ ...t(30, 600, "rgba(255,255,255,0.9)"), marginTop: 12, minHeight: 40 }}>
              <TypeText text={KO} delay={L.koStart} cps={cps} caretColor={C.lime} />
            </div>
            <div style={{ ...t(36, 800, C.lime), marginTop: 8, lineHeight: 1.3 }}>
              {lang && <span style={{ display: "inline-block", opacity: swap, transform: `translateY(${(1 - swap) * 16}px)` }}>{lang.text}</span>}
            </div>
          </div>
        </div>
    </CineFeature>
  );
};
