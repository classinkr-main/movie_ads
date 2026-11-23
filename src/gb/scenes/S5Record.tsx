import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { AMBER, LINE, REC, STUDENTS, TONES } from "../theme";
import { Icon, IconName } from "../icons";
import { Backdrop, CL, FrameMarks, Hud, KText, StatusTag, Tag, Timecode, Whip, eInOut, eOut, eOutBack, lerp, mono, panel, ramp, t } from "../kit";

// 블루아워 — 지금 되는 기능: 수업방 채팅 질문과 녹화(A), 수업 후 AI 강의분석(B). 두 장면은 화면 전환으로 분리한다.
const T = TONES.blue;
const WIN = { x: 300, y: 400, w: 1500, h: 590 };
const CH = 36; // 모노 60px 글자 폭

const TitleBar: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 58, borderBottom: `1.2px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>{children}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{right}</div>
  </div>
);

const Equation: React.FC<{ f: number }> = ({ f }) => {
  const mv = ramp(f, 32, 46, eInOut);
  const l2 = ramp(f, 30, 40);
  const l3 = ramp(f, 48, 56);
  const arrow = ramp(f, 36, 48, eOut);
  const token = (txt: string, idx: number, y: number, color: string, op = 1) => (
    <span style={{ position: "absolute", left: 70 + idx * CH, top: y, ...mono(60, 700, color, { letterSpacing: 0, opacity: op }) }}>{txt}</span>
  );
  // "+ 3"이 등호를 넘어 "− 3"이 된다
  const fromX = 70 + 3 * CH;
  const toX = 70 + 8 * CH;
  const x = lerp(fromX, toX, mv);
  const y = lerp(108, 208, mv);
  return (
    <div style={{ position: "absolute", left: 24, top: 76, width: 1000, height: 364, border: `1.2px solid ${T.line}`, borderRadius: 3, background: "rgba(255,255,255,0.025)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.45 }} />
      <span style={{ position: "absolute", left: 22, top: 18, ...mono(12, 700, T.sub, { letterSpacing: "0.16em" }) }}>칠판 · 일차방정식 활용</span>
      {token("2x", 0, 108, T.ink)}
      {token("+ 3", 3, 108, T.ink, mv > 0 ? 0.32 : 0)}
      {token("=", 7, 108, T.ink)}
      {token("11", 9, 108, T.ink)}
      {/* 이동하는 항 */}
      <span style={{ position: "absolute", left: x, top: y, ...mono(60, 700, mv > 0.5 ? AMBER : T.ink, { letterSpacing: 0 }) }}>{mv > 0.5 ? "− 3" : "+ 3"}</span>
      {token("2x", 0, 208, T.ink, l2)}
      {token("=", 3, 208, T.ink, l2)}
      {token("11", 5, 208, T.ink, l2)}
      {/* 이항 화살표 */}
      <svg width={1000} height={364} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${fromX + 50} 178 C ${fromX + 90} 220 ${toX - 40} 160 ${toX + 20} 204`} fill="none" stroke={AMBER} strokeWidth={2} strokeDasharray="6 6" opacity={arrow} />
      </svg>
      <div style={{ position: "absolute", left: toX + 150, top: 226, display: "flex", alignItems: "center", gap: 10, opacity: arrow }}>
        <Icon name="arrow" size={22} color={AMBER} draw={arrow} />
        <span style={t(20, 700, AMBER, { lineHeight: 1 })}>이항하면 부호가 반대로</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 292, opacity: l3, transform: `translateY(${(1 - l3) * 12}px)` }}>
        <span style={mono(60, 700, T.accent, { letterSpacing: 0 })}>x = 4</span>
      </div>
    </div>
  );
};

const Students: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 24, top: 456, width: 1000, height: 110, display: "flex", gap: 14 }}>
    {STUDENTS.map((s, i) => {
      const asking = s.id === "C" && f >= 6;
      const hl = asking ? ramp(f, 6, 12) * (1 - ramp(f, 40, 50)) : 0;
      return (
        <div key={s.id} style={{ position: "relative", flex: 1, border: `1.2px solid ${hl > 0.05 ? AMBER : T.line}`, borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: hl > 0.05 ? "rgba(255,181,71,0.07)" : "rgba(255,255,255,0.02)", opacity: ramp(f, 2 + i, 8 + i) }}>
          <Icon name="student" size={34} color={LINE[s.id]} draw={ramp(f, 2 + i, 14 + i)} stroke={1.8} />
          <span style={t(15, 700, T.ink, { lineHeight: 1 })}>학생 {s.id}</span>
          {asking ? (
            <div style={{ position: "absolute", right: 10, top: 10, opacity: hl }}>
              <Icon name="chat" size={20} color={AMBER} draw={ramp(f, 6, 14)} />
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

const Bubble: React.FC<{ who: string; text: string; at: number; f: number; me?: boolean; dim?: boolean; hot?: boolean; size?: number }> = ({ who, text, at, f, me, dim, hot, size = 18 }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 190 } });
  if (f < at) return null;
  const glow = hot ? Math.max(0, 1 - (f - at) / 24) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start", gap: 6, opacity: interpolate(f - at, [0, 4], [0, 1], CL) * (dim ? 0.45 : 1), transform: `translateY(${(1 - p) * 18}px) scale(${lerp(0.94, 1, p)})`, transformOrigin: me ? "100% 100%" : "0% 100%" }}>
      <span style={mono(12, 700, hot ? AMBER : T.sub, { letterSpacing: "0.12em" })}>{who}</span>
      <div
        style={{
          maxWidth: 360,
          padding: "11px 15px",
          borderRadius: 3,
          border: `1.3px solid ${hot ? AMBER : me ? "rgba(108,203,255,0.6)" : T.line}`,
          background: me ? "rgba(108,203,255,0.14)" : hot ? `rgba(255,181,71,${0.08 + glow * 0.12})` : "rgba(255,255,255,0.05)",
          ...t(size, hot ? 700 : 600, T.ink, { lineHeight: 1.35 }),
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Chat: React.FC<{ f: number }> = ({ f }) => {
  const typing = f >= 20 && f < 30;
  const dots = "·".repeat(1 + (Math.floor(f / 4) % 3));
  return (
    <div style={{ position: "absolute", left: 1044, top: 76, width: 432, height: 490, border: `1.2px solid ${T.line}`, borderRadius: 3, background: "rgba(0,0,0,0.12)" }}>
      <div style={{ height: 52, borderBottom: `1.2px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        <Icon name="chat" size={22} color={T.ink} draw={ramp(f, 0, 12)} />
        <span style={t(18, 800, T.ink, { lineHeight: 1 })}>채팅</span>
        <span style={{ marginLeft: "auto", ...mono(13, 700, T.sub) }}>수업 중</span>
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <Bubble who="학생 F" text="다음 문제 풀어도 되나요?" at={-10} f={f} dim size={16} />
        <Bubble who="선생님" text="네, 5번부터요." at={-10} f={f} dim me size={16} />
        <Bubble who="학생 C" text="부호가 왜 바뀌나요?" at={12} f={f} hot size={21} />
        {typing ? <span style={{ alignSelf: "flex-end", ...mono(13, 700, T.sub) }}>선생님 입력 중 {dots}</span> : null}
        <Bubble who="선생님" text="이항하면 부호가 바뀌어요. 칠판 볼게요!" at={30} f={f} me size={18} />
      </div>
    </div>
  );
};

const ClassWindow: React.FC<{ f: number }> = ({ f }) => {
  const recOn = Math.floor(f / 12) % 2 === 0;
  const secs = 23 * 60 + 14 + Math.floor(f / 30);
  const tc = `00:${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <div style={{ ...panel(T, { left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h }), opacity: ramp(f, 0, 6), transform: `translateY(${(1 - ramp(f, 0, 12)) * 30}px)` }}>
      <TitleBar
        right={
          <>
            <Icon name="record" size={22} color={REC} style={{ opacity: recOn ? 1 : 0.35 }} />
            <span style={mono(15, 700, REC)}>REC</span>
            <span style={mono(15, 700, T.ink)}>{tc}</span>
          </>
        }
      >
        <span style={t(20, 800, T.ink, { lineHeight: 1 })}>수업방</span>
        <span style={mono(14, 500, T.sub)}>중2 수학 개별진도반 A</span>
      </TitleBar>
      <Equation f={f} />
      <Students f={f} />
      <Chat f={f} />
    </div>
  );
};

const AREAS: Array<{ label: string; items: string; icon: IconName; v: number }> = [
  { label: "수업 전달", items: "효과성 · 흥미·몰입도 · 스캐폴딩", icon: "megaphone", v: 0.86 },
  { label: "수업 분위기", items: "적극적 참여 · 협업 · 정서적 안전감", icon: "sun", v: 0.8 },
  { label: "수업 상호작용", items: "공평성 · 반응성·평등성 · 자율성", icon: "interact", v: 0.72 },
  { label: "언어 표현", items: "명료성·유창성 · 표현력·전달력", icon: "voice", v: 0.84 },
];

const Analysis: React.FC<{ f: number }> = ({ f }) => {
  const ph = ramp(f, 2, 40, eInOut);
  const N = 120;
  const segs = [
    { l: "도입 · 8분", w: 8 },
    { l: "전개 · 28분", w: 28 },
    { l: "정리 · 9분", w: 9 },
  ];
  const done = ramp(f, 40, 46);
  return (
    <div style={{ ...panel(T, { left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h }) }}>
      <TitleBar right={<div style={{ opacity: done, transform: `scale(${lerp(1.3, 1, done)})` }}><Tag color={T.accent} size={15}><Icon name="check" size={16} color={T.accent} draw={done} stroke={2.4} />분석 완료</Tag></div>}>
        <Icon name="ai" size={24} color={T.accent} draw={ramp(f, 0, 14)} />
        <span style={t(20, 800, T.ink, { lineHeight: 1 })}>AI 강의분석 리포트</span>
        <span style={mono(14, 500, T.sub)}>수업 녹화 · 45분 · 중2 수학 개별진도반 A</span>
      </TitleBar>
      {/* 녹화 타임라인 */}
      <div style={{ position: "absolute", left: 24, top: 80, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="play" size={18} color={T.ink} draw={ramp(f, 0, 10)} />
        <span style={t(16, 700, T.ink, { lineHeight: 1 })}>수업 녹화</span>
        <span style={mono(13, 500, T.sub)}>00:00 — 45:00</span>
      </div>
      <svg width={1452} height={130} style={{ position: "absolute", left: 24, top: 108 }}>
        {Array.from({ length: N }, (_, i) => {
          const h = 12 + Math.abs(noise2D("wave", i * 0.21, 1)) * 96 + Math.abs(noise2D("wave2", i * 0.9, 3)) * 18;
          const x = (i / N) * 1452;
          const passed = i / N < ph;
          return <rect key={i} x={x} y={65 - h / 2} width={5.5} height={h} fill={passed ? T.accent : "rgba(160,205,255,0.28)"} />;
        })}
        <line x1={ph * 1452} x2={ph * 1452} y1={0} y2={130} stroke="#FFFFFF" strokeWidth={2} />
        <rect x={ph * 1452 - 6} y={0} width={12} height={12} fill="#FFFFFF" />
      </svg>
      <div style={{ position: "absolute", left: 24, top: 246, width: 1452, height: 28, display: "flex", gap: 6 }}>
        {segs.map((s, i) => {
          const start = segs.slice(0, i).reduce((a, b) => a + b.w, 0) / 45;
          const end = start + s.w / 45;
          const active = ph >= start && ph < end;
          return (
            <div key={s.l} style={{ flex: s.w, border: `1.2px solid ${active ? T.accent : T.line}`, borderRadius: 2, display: "flex", alignItems: "center", paddingLeft: 10, ...mono(12, 700, active ? T.accent : T.sub, { letterSpacing: "0.1em" }) }}>
              {s.l}
            </div>
          );
        })}
      </div>
      {/* 네 영역 */}
      <div style={{ position: "absolute", left: 24, top: 296, width: 1452, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {AREAS.map((a, i) => {
          const at = 8 + i * 6;
          const p = ramp(f, at, at + 22, eOut);
          return (
            <div key={a.label} style={{ height: 126, border: `1.2px solid ${T.line}`, borderRadius: 3, padding: "18px 22px", position: "relative", opacity: ramp(f, at - 4, at + 2) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon name={a.icon} size={32} color={T.accent} draw={ramp(f, at - 2, at + 14)} stroke={1.7} />
                <div>
                  <div style={t(23, 800, T.ink, { lineHeight: 1 })}>{a.label}</div>
                  <div style={{ marginTop: 8, ...t(14, 500, T.sub, { lineHeight: 1 }) }}>{a.items}</div>
                </div>
              </div>
              <svg width={660} height={24} style={{ position: "absolute", left: 22, bottom: 14 }}>
                <line x1={0} x2={660} y1={12} y2={12} stroke="rgba(160,205,255,0.22)" strokeWidth={3} />
                {Array.from({ length: 11 }, (_, k) => (
                  <line key={k} x1={k * 66} x2={k * 66} y1={4} y2={20} stroke="rgba(160,205,255,0.25)" strokeWidth={1.2} />
                ))}
                <line x1={0} x2={660 * a.v * p} y1={12} y2={12} stroke={T.accent} strokeWidth={3} />
                <rect x={660 * a.v * p - 5} y={5} width={10} height={14} fill="#FFFFFF" opacity={p} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const S5Record: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Whip id="s5out" enter={0} exit={120}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Backdrop from={T} to={TONES.dawn} k={ramp(f, 60, 120) * 0.3} grid={0.45} gridSize={60} />
        <Whip id="s5a" exit={63}>
          <ClassWindow f={f} />
        </Whip>
        {f >= 57 ? (
          <Whip id="s5b" enter={57}>
            <AnalysisWrap f={f - 60} />
          </Whip>
        ) : null}
        {/* 헤드라인 A → B */}
        <KText lines={[[{ t: "수업은" }]]} at={4} size={88} color={T.ink} out={56} outDur={6} style={{ position: "absolute", left: 116, top: 124 }} />
        <KText lines={[[{ t: "ClassIn", c: T.accent, u: T.accent }, { t: "에 남기고," }]]} at={12} size={88} color={T.ink} out={56} outDur={6} style={{ position: "absolute", left: 116, top: 230 }} />
        <KText lines={[[{ t: "AI 강의분석으로" }]]} at={62} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 124 }} />
        <KText lines={[[{ t: "수업의 질", c: T.accent, u: T.accent }, { t: "을 확인합니다." }]]} at={70} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 230 }} />
        <Hud tone={T} chapter={5} label="수업 · 녹화 · AI 강의분석" />
        <StatusTag kind="now" tone={T} at={4} />
        <FrameMarks tone={T} />
        <Timecode tone={T} offset={420} />
      </AbsoluteFill>
    </Whip>
  );
};

const AnalysisWrap: React.FC<{ f: number }> = ({ f }) => <Analysis f={f} />;
