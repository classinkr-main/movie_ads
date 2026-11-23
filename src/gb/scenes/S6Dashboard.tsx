import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { AMBER_INK, BRAND, LINE_ON_LIGHT, STUDENTS, TONES } from "../theme";
import { Icon, IconName } from "../icons";
import { Backdrop, Bracket, CL, Cursor, FrameMarks, Hud, KText, Sheen, StatusTag, Tag, Timecode, eInOut, eOut, eOutBack, lerp, mono, panel, ramp, t } from "../kit";

// 아침 — 원장 대시보드 한 화면에서 챙길 학생(C·E)을 보고, 학생 E → 학부모 리포트 초안까지. 전부 방향 예시 · 가상 데이터.
const T = TONES.morning;
const DASH = { x: 300, y: 400, w: 1500, h: 600 };
const ROW0 = 216;
const RH = 64;
const C_X = { id: 28, today: 210, pos: 720, score: 960, flag: 1240 };

const Dashboard: React.FC<{ f: number }> = ({ f }) => {
  const enter = ramp(f, 0, 14, eOut);
  const avg = Math.round(interpolate(f, [12, 30], [0, 78], { ...CL, easing: eOut }));
  const hi = ramp(f, 30, 42, eOut);
  const recede = ramp(f, 60, 74, eInOut);
  return (
    <div
      style={{
        ...panel(T, { left: DASH.x, top: DASH.y, width: DASH.w, height: DASH.h }),
        opacity: enter * lerp(1, 0.2, recede),
        transform: `translateY(${(1 - enter) * 40}px) scale(${lerp(1, 0.965, recede)})`,
        filter: recede > 0.02 ? `blur(${recede * 2.5}px)` : undefined,
      }}
    >
      {/* 머리 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 60, borderBottom: `1.2px solid ${T.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 28px" }}>
        <Icon name="dashboard" size={22} color={T.ink} draw={ramp(f, 2, 14)} />
        <span style={t(20, 800, T.ink, { lineHeight: 1 })}>원장 대시보드</span>
        <span style={mono(14, 500, T.sub)}>중2 수학 개별진도반 A · 오늘</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 26 }}>
          <span style={{ ...t(16, 800, T.ink, { lineHeight: 1 }), paddingBottom: 6, borderBottom: `2px solid ${T.ink}` }}>오늘</span>
          <span style={{ ...t(16, 600, T.sub, { lineHeight: 1 }), paddingBottom: 6 }}>주간</span>
        </div>
      </div>
      {/* KPI */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 116, borderBottom: `1.2px solid ${T.line}`, display: "flex" }}>
        <div style={{ width: 500, padding: "22px 28px", borderRight: `1.2px solid ${T.line}`, opacity: ramp(f, 8, 16) }}>
          <div style={t(15, 600, T.sub, { lineHeight: 1 })}>어제 데일리 테스트 반 평균</div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={mono(50, 700, T.ink, { letterSpacing: 0 })}>{avg}</span>
            <span style={t(22, 700, T.ink, { lineHeight: 1 })}>점</span>
          </div>
        </div>
        <div style={{ width: 560, padding: "22px 28px", borderRight: `1.2px solid ${T.line}`, opacity: ramp(f, 12, 20), position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, ...t(15, 600, T.sub, { lineHeight: 1 }) }}>
            <Icon name="eye" size={18} color={T.sub} draw={ramp(f, 12, 24)} />
            오늘 먼저 볼 학생
          </div>
          <div style={{ marginTop: 16, position: "relative", display: "inline-block" }}>
            <div style={{ position: "absolute", left: 0, bottom: -8, height: 4, width: `${hi * 100}%`, background: AMBER_INK }} />
            <span style={{ position: "relative", ...t(36, 800, AMBER_INK, { lineHeight: 1 }), transform: `scale(${1 + Math.max(0, 1 - Math.abs(f - 34) / 8) * 0.06})`, display: "inline-block" }}>학생 C · 학생 E</span>
          </div>
        </div>
        <div style={{ flex: 1, padding: "22px 28px", opacity: ramp(f, 16, 24) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, ...t(15, 600, T.sub, { lineHeight: 1 }) }}>
            <Icon name="record" size={18} color={T.sub} draw={ramp(f, 16, 28)} />
            오늘 수업 녹화
          </div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={t(36, 800, T.ink, { lineHeight: 1 })}>완료</span>
            <Icon name="check" size={30} color={BRAND.green} draw={ramp(f, 20, 32)} stroke={2.6} />
          </div>
        </div>
      </div>
      {/* 표 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 176, height: 40, borderBottom: `1.2px solid ${T.line}`, opacity: ramp(f, 8, 16) }}>
        {(
          [
            ["학생", C_X.id],
            ["오늘 진도", C_X.today],
            ["위치", C_X.pos],
            ["어제 테스트", C_X.score],
            ["표시", C_X.flag],
          ] as Array<[string, number]>
        ).map(([l, x]) => (
          <span key={l} style={{ position: "absolute", left: x, top: 14, ...mono(13, 700, T.sub, { letterSpacing: "0.08em" }) }}>
            {l}
          </span>
        ))}
      </div>
      {STUDENTS.map((s, i) => {
        const y = ROW0 + i * RH;
        const at = 10 + i * 3;
        const p = ramp(f, at, at + 10);
        const attn = s.id === "C" || s.id === "E";
        const dim = attn ? 1 : lerp(1, 0.42, hi);
        const flagCol = attn ? AMBER_INK : T.sub;
        const icon: IconName = "flag";
        return (
          <div key={s.id} style={{ position: "absolute", left: 0, right: 0, top: y, height: RH }}>
            {attn && hi > 0 ? (
              <div style={{ position: "absolute", left: 10, right: 10, top: 6, bottom: 6, transform: `scale(${lerp(1.05, 1, hi)})`, opacity: hi }}>
                <Bracket color={AMBER_INK} size={14} w={2.4} />
              </div>
            ) : null}
            <div style={{ position: "absolute", left: 0, bottom: 0, height: 1.2, width: `${ramp(f, at - 2, at + 12, eInOut) * 100}%`, background: T.line }} />
            <div style={{ position: "absolute", inset: 0, opacity: p * dim, transform: `translateX(${(1 - p) * 24}px)` }}>
              <div style={{ position: "absolute", left: C_X.id, top: 22, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={t(18, 800, T.ink, { lineHeight: 1 })}>
                  학생 <span style={{ color: LINE_ON_LIGHT[s.id] }}>{s.id}</span>
                </span>
                <div style={{ width: 22, height: 3, background: LINE_ON_LIGHT[s.id] }} />
              </div>
              <span style={{ position: "absolute", left: C_X.today, top: 21, ...t(19, 600, T.ink, { lineHeight: 1 }) }}>{s.today}</span>
              <span style={{ position: "absolute", left: C_X.pos, top: 23, ...t(16, 500, T.sub, { lineHeight: 1 }) }}>{s.pos}</span>
              <span style={{ position: "absolute", left: C_X.score, top: 20, ...mono(20, 700, attn ? AMBER_INK : T.ink, { letterSpacing: 0 }) }}>{s.score}</span>
              <div style={{ position: "absolute", left: C_X.score + 60, top: 30, width: 160, height: 3, background: T.line }}>
                <div style={{ width: `${(s.score / 100) * ramp(f, at + 4, at + 20) * 100}%`, height: 3, background: attn ? AMBER_INK : T.ink }} />
              </div>
              <div style={{ position: "absolute", left: C_X.flag, top: 20, display: "flex", alignItems: "center", gap: 8 }}>
                {s.flag ? <Icon name={icon} size={18} color={flagCol} draw={ramp(f, at + 4, at + 16)} /> : null}
                <span style={t(15, 700, flagCol, { lineHeight: 1 })}>{s.flag || "—"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EPATH = [
  { l: "방정식 복습", st: "done" },
  { l: "일차방정식 활용", st: "now" },
  { l: "활용 재도전", st: "next" },
  { l: "연립방정식 도입", st: "next" },
] as const;
const SCORES = [70, 74, 68, 66, 62];

const StudentE: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - 60, fps, config: { damping: 18, stiffness: 140 } });
  if (f < 60) return null;
  const col = LINE_ON_LIGHT.E;
  const sx = (i: number) => 80 + i * 150;
  const sy = (v: number) => 410 - (v - 55) * 7;
  const chartD = SCORES.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(v)}`).join(" ");
  const cp = ramp(f, 70, 86, eInOut);
  const ev = evolvePath(Math.max(0.0001, cp), chartD);
  const press = f >= 90 && f < 95;
  const btnHot = ramp(f, 90, 94);
  return (
    <div
      style={{
        ...panel(T, { left: 300, top: 400, width: 740, height: 600 }),
        opacity: interpolate(f, [60, 66], [0, 1], CL),
        transform: `translateY(${(1 - p) * 140}px) scale(${lerp(0.92, 1, p)})`,
        transformOrigin: "50% 90%",
      }}
    >
      <div style={{ height: 64, borderBottom: `1.2px solid ${T.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 26px" }}>
        <Icon name="student" size={26} color={col} draw={ramp(f, 62, 74)} />
        <span style={t(24, 800, T.ink, { lineHeight: 1 })}>학생 E</span>
        <span style={mono(13, 500, T.sub)}>학생별 한 화면</span>
        <div style={{ marginLeft: "auto" }}>
          <Tag color={AMBER_INK} size={14}>
            <Icon name="flag" size={15} color={AMBER_INK} draw={ramp(f, 64, 76)} />
            최근 하락
          </Tag>
        </div>
      </div>
      {/* 진도 경로 (노선) */}
      <span style={{ position: "absolute", left: 28, top: 86, ...mono(12, 700, T.sub, { letterSpacing: "0.14em" }) }}>진도 경로</span>
      <svg width={740} height={120} style={{ position: "absolute", left: 0, top: 104 }}>
        <line x1={60} x2={60 + 630 * ramp(f, 64, 80, eInOut)} y1={30} y2={30} stroke={col} strokeWidth={6} />
        <line x1={270} x2={690} y1={30} y2={30} stroke={col} strokeWidth={6} strokeOpacity={0.25} />
        {EPATH.map((e, i) => {
          const x = 60 + i * 210;
          const on = ramp(f, 66 + i * 3, 72 + i * 3);
          if (e.st === "now") return <rect key={e.l} x={x - 10} y={20} width={20} height={20} fill="#FFFFFF" stroke={col} strokeWidth={3.5} opacity={on} />;
          return <rect key={e.l} x={x - 3.5} y={30 - 13 * on} width={7} height={26 * on} fill={col} opacity={e.st === "next" ? 0.45 : 1} />;
        })}
      </svg>
      {EPATH.map((e, i) => {
        const x = 60 + i * 210;
        const align = i === 0 ? "left" : i === 3 ? "right" : "center";
        const left = i === 0 ? x - 12 : i === 3 ? x - 168 : x - 80;
        return (
          <span key={e.l} style={{ position: "absolute", left, top: 158, width: i === 0 || i === 3 ? 180 : 160, textAlign: align, ...t(16, e.st === "now" ? 800 : 600, e.st === "now" ? T.ink : T.sub, { lineHeight: 1.2, opacity: ramp(f, 68 + i * 3, 76 + i * 3) }) }}>
            {e.l}
          </span>
        );
      })}
      {/* 테스트 추이 */}
      <span style={{ position: "absolute", left: 28, top: 214, ...mono(12, 700, T.sub, { letterSpacing: "0.14em" }) }}>데일리 테스트 추이</span>
      <svg width={740} height={460} style={{ position: "absolute", left: 0, top: 0 }}>
        {[60, 70, 80].map((v) => (
          <g key={v}>
            <line x1={60} x2={700} y1={sy(v)} y2={sy(v)} stroke={T.line} strokeWidth={1.2} />
            <text x={52} y={sy(v) + 4} textAnchor="end" style={mono(11, 500, T.sub)} fill={T.sub}>
              {v}
            </text>
          </g>
        ))}
        <path d={chartD} fill="none" stroke={col} strokeWidth={3} strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        {SCORES.map((v, i) => {
          const on = ramp(f, 70 + i * 3.2, 74 + i * 3.2);
          return <rect key={i} x={sx(i) - 5} y={sy(v) - 5} width={10} height={10} fill={i === 4 ? col : "#FFFFFF"} stroke={col} strokeWidth={2} opacity={on} />;
        })}
        <text x={sx(4) - 12} y={sy(62) + 30} textAnchor="middle" style={mono(18, 700, col)} fill={col} opacity={ramp(f, 84, 90)}>
          62
        </text>
        {SCORES.map((_, i) => (
          <text key={i} x={sx(i)} y={436} textAnchor="middle" style={mono(11, 500, T.sub)} fill={T.sub} opacity={ramp(f, 68, 78)}>
            {i + 1}회
          </text>
        ))}
      </svg>
      {/* 오답 요지 */}
      <div style={{ position: "absolute", left: 28, top: 462, right: 28, opacity: ramp(f, 76, 86) }}>
        <div style={mono(12, 700, T.sub, { letterSpacing: "0.14em" })}>오답 요지</div>
        <div style={{ marginTop: 10, ...t(18, 600, T.ink, { lineHeight: 1.35 }) }}>식을 세운 뒤 부호를 정리하는 문항에서 막혔습니다.</div>
      </div>
      {/* 버튼 */}
      <div
        style={{
          position: "absolute",
          right: 26,
          bottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 20px",
          borderRadius: 3,
          background: btnHot > 0 ? BRAND.green : T.ink,
          transform: `scale(${press ? 0.95 : 1})`,
          opacity: ramp(f, 78, 86),
        }}
      >
        <Icon name="ai" size={20} color="#FFFFFF" draw={ramp(f, 78, 90)} />
        <span style={t(17, 800, "#FFFFFF", { lineHeight: 1 })}>리포트 초안 만들기</span>
      </div>
    </div>
  );
};

const LINES: Array<{ label: string; icon: IconName; text: string; at: number }> = [
  { label: "오늘 한 일", icon: "book", text: "오늘은 일차방정식 활용을 다뤘습니다.", at: 96 },
  { label: "막힌 점", icon: "warning", text: "식을 세운 뒤 부호를 정리하는 문항에서 막혔습니다.", at: 116 },
  { label: "다음에 할 일", icon: "arrow", text: "내일은 같은 유형 다섯 문항과 짧은 테스트를 합니다.", at: 136 },
];

const Report: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - 90, fps, config: { damping: 17, stiffness: 120 } });
  if (f < 90) return null;
  const stamp = interpolate(f, [154, 162], [0, 1], { ...CL, easing: eOutBack });
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <div
        style={{
          ...panel(T, { left: 1080, top: 380, width: 720, height: 620 }),
          opacity: interpolate(f, [90, 96], [0, 1], CL),
          transform: `translate(${(1 - p) * -180}px, ${(1 - p) * 300}px) rotateY(${(1 - p) * -24}deg) scale(${lerp(0.7, 1, p)})`,
          transformOrigin: "0% 100%",
          boxShadow: "0 40px 90px rgba(20,60,40,0.2), 0 2px 6px rgba(20,60,40,0.08)",
        }}
      >
        <div style={{ position: "absolute", left: 32, top: 30, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="ai" size={20} color={BRAND.green} draw={ramp(f, 92, 104)} />
          <span style={mono(13, 700, BRAND.green, { letterSpacing: "0.14em" })}>AI 생성 예시</span>
        </div>
        <div style={{ position: "absolute", left: 32, top: 70, ...t(29, 800, T.ink, { lineHeight: 1 }) }}>학생 E · 오늘 수업 요약</div>
        <div style={{ position: "absolute", left: 32, top: 112, ...mono(13, 500, T.sub) }}>중2 수학 개별진도반 A</div>
        <div style={{ position: "absolute", left: 32, right: 32, top: 146, height: 1.2, background: T.line }} />
        {LINES.map((l, i) => {
          const chars = Array.from(l.text);
          const n = Math.floor(interpolate(f, [l.at, l.at + 16], [0, chars.length], CL));
          const typing = f >= l.at && n < chars.length;
          const caretOn = Math.floor(f / 4) % 2 === 0;
          return (
            <div key={l.label} style={{ position: "absolute", left: 32, right: 32, top: 172 + i * 122, opacity: ramp(f, l.at - 6, l.at) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, ...t(15, 700, T.sub, { lineHeight: 1 }) }}>
                <Icon name={l.icon} size={18} color={T.sub} draw={ramp(f, l.at - 6, l.at + 6)} />
                {l.label}
              </div>
              <div style={{ marginTop: 12, ...t(23, 600, T.ink, { lineHeight: 1.42 }) }}>
                {chars.slice(0, n).join("")}
                {typing || (i === 2 && f >= l.at + 16 && f < 156) ? <span style={{ display: "inline-block", width: 2.5, height: 26, background: BRAND.green, marginLeft: 3, verticalAlign: "-4px", opacity: caretOn ? 1 : 0 }} /> : null}
              </div>
              {i < 2 ? <div style={{ position: "absolute", left: 0, right: 0, top: 104, borderTop: `1.2px dashed ${T.line}` }} /> : null}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 32, bottom: 26, ...mono(12, 500, T.sub, { opacity: ramp(f, 150, 158) }) }}>가상 수업 기록으로 만든 요약 예시</div>
        {/* 초안 스탬프 */}
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 26,
            padding: "8px 16px",
            border: `2.6px solid ${AMBER_INK}`,
            ...t(24, 900, AMBER_INK, { lineHeight: 1, letterSpacing: "0.1em" }),
            transform: `rotate(-8deg) scale(${lerp(1.8, 1, stamp)})`,
            opacity: stamp,
          }}
        >
          초안
        </div>
        <Sheen at={160} dur={20} strength={0.5} />
      </div>
    </AbsoluteFill>
  );
};

export const S6Dashboard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop from={T} to={TONES.day} k={ramp(f, 110, 180) * 0.6} grid={0.6} gridSize={60} />
      <Dashboard f={f} />
      <StudentE f={f} />
      <Report f={f} />
      <Cursor
        dark={false}
        show={[42, 104]}
        clicks={[60, 90]}
        path={[
          { f: 42, x: 1760, y: 1070 },
          { f: 58, x: 680, y: 904 },
          { f: 76, x: 680, y: 904 },
          { f: 88, x: 905, y: 958 },
          { f: 104, x: 960, y: 1000 },
        ]}
      />
      <KText lines={[[{ t: "원장님은 " }, { t: "한 화면", c: BRAND.green, u: BRAND.green }, { t: "에서" }]]} at={4} size={88} color={T.ink} out={86} outDur={6} style={{ position: "absolute", left: 116, top: 124 }} />
      <KText lines={[[{ t: "챙길 학생을 보고," }]]} at={16} size={88} color={T.ink} out={86} outDur={6} style={{ position: "absolute", left: 116, top: 230 }} />
      <KText lines={[[{ t: "학부모 리포트" }]]} at={92} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 124 }} />
      <KText lines={[[{ t: "초안", c: BRAND.green, u: BRAND.green }, { t: "까지." }]]} at={100} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 230 }} />
      <Hud tone={T} chapter={6} label="원장 대시보드 · 학생 E · 리포트 초안" />
      <StatusTag kind="example" tone={T} at={4} />
      <FrameMarks tone={T} />
      <Timecode tone={T} offset={540} />
    </AbsoluteFill>
  );
};
