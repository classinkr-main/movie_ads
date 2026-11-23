import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APP, BRAND, COVER, INK, PAPER, STUDENTS } from "../theme";
import { AppWindow, LaurelScore, Meter, Pill } from "../app";
import { Icon } from "../icons";
import { CL, HandText, Hud, Ink, KText, Layer, PaperBg, StatusStamp, Sticky, Whip, eInOut, hand, lerp, ramp, roughArrow, roughLine, t } from "../kit";

// 지금 되는 기능 — (A) 수업방: 칠판 판서 + 채팅 질문 + 녹화, (B) 수업 다시보기 → AI 강의 분석.
// 실제 앱 화면 구조를 가상 데이터로 다시 그렸다. 두 장면은 화면 전환으로 분리한다.
const WIN = { x: 240, y: 392, w: 1560, h: 646 };

/* ───────── (A) 수업방 ───────── */

const Board: React.FC<{ f: number }> = ({ f }) => {
  const mv = ramp(f, 32, 46, eInOut);
  const l2 = ramp(f, 30, 40);
  const l3 = ramp(f, 48, 56);
  const ink = INK.navy;
  const x = lerp(250, 418, mv);
  const y = lerp(64, 196, mv);
  const arrow = roughArrow([300, 150], [440, 214], 0.35, 9);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1090, height: 528, background: "#FFFFFF", borderRight: `1px solid ${APP.line}`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <span style={{ position: "absolute", left: 24, top: 18, ...t(13, 700, APP.sub, { lineHeight: 1 }) }}>칠판 · 일차방정식 활용</span>
      <div style={{ position: "absolute", left: 90, top: 64, ...hand(104, ink) }}>2x</div>
      <div style={{ position: "absolute", left: 250, top: 64, ...hand(104, ink), opacity: mv > 0 ? 0.25 : 0 }}>+ 3</div>
      <div style={{ position: "absolute", left: 420, top: 64, ...hand(104, ink) }}>= 11</div>
      {/* 이동하는 항: +3 → −3 */}
      <div style={{ position: "absolute", left: x, top: y, ...hand(104, mv > 0.5 ? INK.red : ink) }}>{mv > 0.5 ? "− 3" : "+ 3"}</div>
      <div style={{ position: "absolute", left: 90, top: 196, ...hand(104, ink), opacity: l2 }}>2x = 11</div>
      <Layer style={{ width: 1090, height: 528 }}>
        <Ink d={arrow.body} color={INK.red} width={4} at={36} dur={10} />
        <Ink d={arrow.head} color={INK.red} width={4} at={44} dur={4} />
        <Ink d={roughLine(86, 448, 330, 444, 31, 1.5)} color={INK.green} width={5} at={56} dur={8} />
      </Layer>
      <HandText x={600} y={230} size={52} color={INK.red} at={40} dur={12} rotate={-4}>
        넘기면 부호가 바뀐다!
      </HandText>
      <div style={{ position: "absolute", left: 90, top: 336, ...hand(104, INK.green), opacity: l3, transform: `translateY(${(1 - l3) * 12}px)` }}>x = 4</div>
    </div>
  );
};

const Toolbar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 528, width: 1090, height: 64, background: "#2C2C2E", display: "flex", alignItems: "center", padding: "0 22px", gap: 22 }}>
    <Icon name="pen" size={22} color="#FFFFFF" round />
    <Icon name="board" size={22} color="#BDBDC2" round />
    <Icon name="dashboard" size={22} color="#BDBDC2" round />
    <div style={{ margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={t(15, 700, "#BDBDC2", { lineHeight: 1 })}>‹</span>
      <span style={{ padding: "6px 14px", borderRadius: 8, background: "#3A3A3D", ...t(14, 700, "#FFFFFF", { lineHeight: 1 }) }}>3 / 12</span>
      <span style={t(15, 700, "#BDBDC2", { lineHeight: 1 })}>›</span>
    </div>
    <span style={{ padding: "8px 16px", borderRadius: 999, background: "#F59E2E", ...t(14, 800, "#FFFFFF", { lineHeight: 1 }) }}>회수</span>
  </div>
);

const Bubble: React.FC<{ who: string; text: string; at: number; f: number; me?: boolean; dim?: boolean; hot?: boolean }> = ({ who, text, at, f, me, dim, hot }) => {
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const p = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 190 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start", gap: 5, opacity: interpolate(f - at, [0, 4], [0, 1], CL) * (dim ? 0.5 : 1), transform: `translateY(${(1 - p) * 16}px)` }}>
      <span style={t(12, 700, hot ? APP.badge : APP.sub, { lineHeight: 1 })}>{who}</span>
      <div
        style={{
          maxWidth: 330,
          padding: "10px 14px",
          borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: me ? BRAND.green : hot ? "#FFF1EF" : APP.pill,
          border: hot ? `1.5px solid ${APP.badge}` : "none",
          ...t(16, hot ? 800 : 600, me ? "#FFFFFF" : APP.ink, { lineHeight: 1.35 }),
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Side: React.FC<{ f: number }> = ({ f }) => {
  const typing = f >= 20 && f < 30;
  return (
    <div style={{ position: "absolute", left: 1090, top: 0, right: 0, bottom: 0, background: "#FAFAFB" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 12 }}>
        {STUDENTS.map((s, i) => {
          const ask = s.id === "C" ? ramp(f, 6, 12) * (1 - ramp(f, 44, 52)) : 0;
          return (
            <div key={s.id} style={{ position: "relative", height: 78, borderRadius: 10, background: `linear-gradient(135deg, ${COVER[s.id][0]}, ${COVER[s.id][1]})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ask > 0.05 ? `0 0 0 3px ${APP.badge}` : undefined, opacity: ramp(f, i, i + 6) }}>
              <Icon name="student" size={28} color="#FFFFFF" stroke={2.2} round />
              <span style={{ position: "absolute", left: 8, bottom: 6, ...t(11, 700, "#FFFFFF", { lineHeight: 1 }) }}>학생 {s.id}</span>
            </div>
          );
        })}
      </div>
      <div style={{ margin: "4px 12px 0", height: 1, background: APP.line }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
        <Icon name="chat" size={19} color={APP.ink} round />
        <span style={t(15, 800, APP.ink, { lineHeight: 1 })}>채팅</span>
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Bubble who="학생 F" text="다음 문제 풀어도 되나요?" at={-10} f={f} dim />
        <Bubble who="학생 C" text="부호가 왜 바뀌나요?" at={12} f={f} hot />
        {typing ? <span style={{ alignSelf: "flex-end", ...t(12, 600, APP.sub, { lineHeight: 1 }) }}>선생님 입력 중…</span> : null}
        <Bubble who="선생님" text="이항하면 부호가 바뀌어요. 칠판 볼게요!" at={30} f={f} me />
      </div>
    </div>
  );
};

const ClassRoom: React.FC<{ f: number }> = ({ f }) => {
  const rec = Math.floor(f / 12) % 2 === 0;
  const secs = 23 * 60 + 14 + Math.floor(f / 30);
  const tc = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <AppWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} pill="중2 수학 개별진도반 A">
      <Board f={f} />
      <Toolbar />
      <Side f={f} />
      <div style={{ position: "absolute", right: 120, top: -38, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 99, background: APP.badge, opacity: rec ? 1 : 0.35 }} />
        <span style={t(14, 800, APP.badge, { lineHeight: 1 })}>녹화 중</span>
        <span style={t(14, 700, APP.ink, { lineHeight: 1 })}>00:{tc}</span>
      </div>
    </AppWindow>
  );
};

/* ───────── (B) 수업 다시보기 → AI 강의 분석 ───────── */

const Replay: React.FC<{ f: number }> = ({ f }) => {
  const prog = ramp(f, 2, 40, eInOut);
  return (
    <AppWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} bar={false}>
      <div style={{ position: "absolute", left: 24, top: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <Img src={staticFile("brand/classin-mark.png")} style={{ height: 18 }} />
        <span style={t(13, 600, APP.sub, { lineHeight: 1 })}>종료됨</span>
      </div>
      <div style={{ position: "absolute", right: 24, top: 18, display: "flex", gap: 16 }}>
        <Icon name="refresh" size={18} color="#555" round />
        <Icon name="sideToggle" size={18} color="#B5B5B8" round />
      </div>
      <div style={{ position: "absolute", left: 24, top: 56, display: "flex", gap: 30 }}>
        {["수업 다시보기", "수업 정보", "수업 평가", "강의 보고서"].map((tab, i) => (
          <div key={tab} style={{ paddingBottom: 10, borderBottom: i === 0 ? `2.5px solid ${APP.ink}` : "2.5px solid transparent", ...t(16, i === 0 ? 800 : 500, i === 0 ? APP.ink : APP.sub, { lineHeight: 1 }) }}>
            {tab}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 92, height: 1, background: APP.line }} />
      {/* 녹화본 */}
      <div style={{ position: "absolute", left: 24, top: 112, width: 640, height: 400, borderRadius: 14, background: "#121212", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, top: 40, right: 40, bottom: 70, background: "#FFFFFF", borderRadius: 6 }}>
          <div style={{ position: "absolute", left: 30, top: 18, ...hand(64, INK.navy) }}>2x + 3 = 11</div>
          <div style={{ position: "absolute", left: 30, top: 100, ...hand(64, INK.navy) }}>
            2x = 11 <span style={{ color: INK.red }}>− 3</span>
          </div>
          <div style={{ position: "absolute", left: 30, top: 182, ...hand(64, INK.green) }}>x = 4</div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: "44%", width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: 99, background: APP.chart, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M8 5 L19 12 L8 19 Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.25)" }}>
          <div style={{ width: `${prog * 100}%`, height: 5, borderRadius: 9, background: APP.chart }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 24, top: 530, display: "flex", gap: 20, ...t(13, 600, APP.sub, { lineHeight: 1 }) }}>
        <span>중2 수학 개별진도반 A</span>
        <span>45분</span>
        <span>칠판 화면 녹화</span>
      </div>
      {/* AI 패널 */}
      <div style={{ position: "absolute", left: 700, top: 112, right: 28, bottom: 24 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Pill dark size={14}>AI 강의 분석</Pill>
          <Pill size={14}>AI 요약</Pill>
          <Pill size={14}>AI 스크립트</Pill>
        </div>
        <div style={{ marginTop: 22, display: "inline-block", padding: "5px 10px", borderRadius: 6, background: APP.pill, ...t(12, 700, APP.sub, { lineHeight: 1 }) }}>일차방정식 활용</div>
        <div style={{ marginTop: 10, ...t(24, 800, APP.ink, { lineHeight: 1.2 }) }}>중2 수학 개별진도반 A</div>
        <div style={{ marginTop: 8, width: 520, ...t(14, 500, APP.sub, { lineHeight: 1.45 }) }}>식 세우기와 부호 정리를 단계별로 설명하고, 질문에 바로 답한 수업</div>
        <div style={{ position: "absolute", right: 10, top: 64 }}>
          <LaurelScore v={86} f={f} at={6} />
        </div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Meter label="지식 설명 품질" v={87} f={f} at={10} />
          <Meter label="사고 수준 및 방법 정리" v={84} f={f} at={14} />
          <Meter label="학생 학습 품질" v={76} color={APP.orange} f={f} at={18} />
          <Meter label="수업 구조 및 효율" v={82} f={f} at={22} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Pill size={13}>
            <Icon name="download" size={15} color={APP.ink} round />
            다운로드
          </Pill>
        </div>
      </div>
    </AppWindow>
  );
};

export const S5Record: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Whip id="s5out" enter={0} exit={120}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <PaperBg paper={PAPER.morning} grid={0.5} gridGap={36} />
        <Whip id="s5a" exit={63}>
          <ClassRoom f={f} />
        </Whip>
        {f >= 57 ? (
          <Whip id="s5b" enter={57}>
            <Replay f={f - 60} />
            <Sticky x={1586} y={318} w={250} h={116} color="#B9EBCF" rot={5} at={36}>
              <div style={{ ...hand(36, "#2F3A33"), lineHeight: 1.05 }}>수업 끝나면</div>
              <div style={{ ...hand(36, "#2F3A33"), lineHeight: 1.05 }}>바로 확인!</div>
            </Sticky>
          </Whip>
        ) : null}
        <KText lines={[[{ t: "수업은" }]]} at={4} size={100} out={56} outDur={6} style={{ position: "absolute", left: 116, top: 112 }} />
        <KText lines={[[{ t: "ClassIn", c: BRAND.green }, { t: "에 남기고," }]]} at={12} size={100} out={56} outDur={6} style={{ position: "absolute", left: 116, top: 236 }} />
        <KText lines={[[{ t: "AI 강의분석으로" }]]} at={62} size={100} style={{ position: "absolute", left: 116, top: 112 }} />
        <KText lines={[[{ t: "수업의 질", c: BRAND.green }, { t: "을 확인합니다." }]]} at={70} size={100} style={{ position: "absolute", left: 116, top: 236 }} />
        <Hud page={5} label="수업 · 녹화 · AI 강의분석" />
        <StatusStamp kind="now" at={4} />
      </AbsoluteFill>
    </Whip>
  );
};

