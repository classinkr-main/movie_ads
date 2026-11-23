import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APP, BRAND, INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { AppWindow, Pill, Sidebar, StudentCard } from "../app";
import { Icon, IconName } from "../icons";
import { CL, Cursor, HandText, Hud, KText, Layer, PaperBg, Pencil, Sheen, Stamp, StatusStamp, Tape, eInOut, gradeCircle, hand, lerp, ramp, roughArrow, roughLine, t } from "../kit";

// 아침 — ClassIn 홈 화면 구성 그대로(사이드바 · 카드 · 우측 패널)에 원장용 개별진도 화면을 넣은 방향 예시.
const WIN = { x: 240, y: 392, w: 1560, h: 646 };
const BODY = { x: WIN.x, y: WIN.y + 54 };
const GRID = { x: 224, y: 74, cw: 195, ch: 226, gx: 18, gy: 14, s: 0.92 };
const PANEL = { x: 1170, w: 390 };
const cardPos = (i: number) => ({ x: GRID.x + (i % 3) * (GRID.cw + GRID.gx), y: GRID.y + Math.floor(i / 3) * (GRID.ch + GRID.gy) });
const BADGE: Record<string, number | undefined> = { C: 3, E: 1 };
const ITEMS = [
  { id: "C", title: "학생 C · 중1 일차방정식 복습", meta: "숙제 미완 3회 · 어제 55점", pill: "상담 메모", y: 92 },
  { id: "E", title: "학생 E · 일차방정식 활용", meta: "어제 62점 · 최근 하락", pill: "리포트 초안", y: 232 },
  { id: "B", title: "학생 B · 연립방정식 도입", meta: "금요일 합반 후보", pill: "보기", y: 372 },
];
// 학생 E 한 명에게 매일 붙는 체크 항목 6가지 (촘촘한 개인화 관리)
const E_CHECKS: Array<{ icon: IconName; label: string; value: string; warn?: boolean }> = [
  { icon: "route", label: "진도", value: "활용 재도전" },
  { icon: "trend", label: "테스트", value: "70 → 62", warn: true },
  { icon: "book", label: "숙제", value: "4 / 6 제출" },
  { icon: "chat", label: "질문", value: "부호 1건" },
  { icon: "warning", label: "막힌 곳", value: "부호 정리", warn: true },
  { icon: "report", label: "학부모", value: "요약 초안" },
];

const Panel: React.FC<{ f: number }> = ({ f }) => {
  const open = ramp(f, 62, 78, eInOut);
  return (
    <div style={{ position: "absolute", left: PANEL.x, top: 0, width: PANEL.w, bottom: 0, borderLeft: `1px solid ${APP.line}`, background: "#FFFFFF" }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: 22, display: "flex", alignItems: "center" }}>
        <span style={t(17, 800, APP.ink, { lineHeight: 1 })}>오늘 먼저 볼 학생</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, ...t(13, 600, APP.sub, { lineHeight: 1 }) }}>
          더보기 <Icon name="external" size={14} color={APP.sub} round />
        </span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 60, display: "flex", alignItems: "center", gap: 10, ...t(11, 600, "#B0B0B4", { lineHeight: 1 }) }}>
        <div style={{ flex: 1, height: 1, background: APP.line }} />
        AI가 고른 학생
        <div style={{ flex: 1, height: 1, background: APP.line }} />
      </div>
      {ITEMS.map((it, i) => {
        const at = 18 + i * 4;
        const p = ramp(f, at, at + 10);
        const isE = it.id === "E";
        const hot = it.id === "C" || it.id === "E" ? ramp(f, 30, 38) : 0;
        const shift = it.id === "B" ? open * 162 : 0;
        const pillHot = isE ? Math.max(ramp(f, 86, 90) * (1 - ramp(f, 100, 110)), 0) : 0;
        const icon: IconName = it.id === "B" ? "calendar" : "flag";
        return (
          <div key={it.id} style={{ position: "absolute", left: 16, right: 16, top: it.y + shift, padding: "12px 10px 12px 12px", borderRadius: 14, background: isE && open > 0 ? "#FFF6F4" : "transparent", border: `1px solid ${isE && open > 0 ? "rgba(240,72,62,0.35)" : "transparent"}`, opacity: p * (it.id === "B" ? lerp(1, 0.4, open) : 1), transform: `translateY(${(1 - p) * 14}px)` }}>
            <div style={{ display: "flex", gap: 12 }}>
              <Icon name={icon} size={21} color={hot > 0 ? APP.badge : APP.ink} round style={{ marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={t(15, 800, APP.ink, { lineHeight: 1.3 })}>{it.title}</div>
                <div style={{ marginTop: 6, ...t(12.5, 600, hot > 0 ? APP.badge : APP.sub, { lineHeight: 1.2 }) }}>{it.meta}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <Pill size={13} hot={pillHot}>
                {it.pill}
              </Pill>
            </div>
            {isE ? (
              <div style={{ overflow: "hidden", height: open * 160 }}>
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {E_CHECKS.map((c, k) => {
                    const cp = ramp(f, 66 + k * 2.5, 72 + k * 2.5);
                    return (
                      <div key={c.label} style={{ padding: "9px 9px 8px", borderRadius: 10, background: c.warn ? "#FFF1EF" : "#FFFFFF", border: `1px solid ${c.warn ? "rgba(240,72,62,0.35)" : APP.line}`, opacity: cp, transform: `scale(${lerp(0.85, 1, cp)})` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, ...t(11, 700, APP.sub, { lineHeight: 1 }) }}>
                          <Icon name={c.icon} size={13} color={c.warn ? APP.badge : APP.sub} stroke={2.1} round />
                          {c.label}
                        </div>
                        <div style={{ marginTop: 7, ...t(13, 800, c.warn ? APP.badge : APP.ink, { lineHeight: 1.1, whiteSpace: "nowrap" }) }}>{c.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const Home: React.FC<{ f: number }> = ({ f }) => {
  const hot = ramp(f, 30, 38);
  const pickE = ramp(f, 60, 66);
  return (
    <>
      <Sidebar active="개별진도" extra={{ icon: "route", label: "개별진도", tag: "예시" }} />
      <div style={{ position: "absolute", left: GRID.x, top: 22, display: "flex", alignItems: "center", gap: 6, opacity: ramp(f, 2, 10) }}>
        <span style={t(20, 800, APP.ink, { lineHeight: 1 })}>중2 수학 개별진도반 A</span>
        <Icon name="chevronDown" size={18} color={APP.ink} round />
      </div>
      <div style={{ position: "absolute", left: PANEL.x - 190, top: 12, opacity: ramp(f, 4, 12) }}>
        <Pill dark size={14}>
          <Icon name="plus" size={15} color="#FFFFFF" stroke={2.2} round />
          진도 배정
        </Pill>
      </div>
      {STUDENTS.map((s, i) => {
        const { x, y } = cardPos(i);
        const at = 6 + i * 2.5;
        const p = ramp(f, at, at + 10);
        const attn = s.id === "C" || s.id === "E";
        return (
          <div key={s.id} style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - p) * 20}px) scale(${GRID.s})`, transformOrigin: "0 0", opacity: p }}>
            <StudentCard id={s.id} title={`학생 ${s.id}`} sub={`${s.today} · 어제 ${s.score}점`} badge={BADGE[s.id]} hot={s.id === "E" ? Math.max(hot, pickE) : attn ? hot : 0} dim={attn ? 1 : lerp(1, 0.55, hot)} />
          </div>
        );
      })}
      <Panel f={f} />
    </>
  );
};

// 손글씨 인포그래픽: 오늘 챙길 일 36 → 먼저 볼 학생 2명 (AI가 먼저 골라 준다)
const TriageNote: React.FC<{ f: number }> = ({ f }) => {
  const out = 1 - ramp(f, 84, 91);
  if (f < 24 || out <= 0) return null;
  const arrow = roughArrow([1318, 336], [1468, 330], -0.12, 12);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <HandText x={1168} y={256} size={34} color={INK.sub} at={24} dur={8} rotate={-2}>
        오늘 챙길 일
      </HandText>
      <div style={{ position: "absolute", left: 1186, top: 284, ...hand(92, INK.red), opacity: ramp(f, 26, 30), filter: "url(#gb-crayon)" }}>36</div>
      <HandText x={1500} y={252} size={34} color={INK.sub} at={40} dur={8} rotate={-2}>
        먼저 볼 학생
      </HandText>
      <div style={{ position: "absolute", left: 1526, top: 282, ...hand(92, BRAND.green), opacity: ramp(f, 44, 48), filter: "url(#gb-crayon)" }}>2명</div>
      <HandText x={1336} y={350} size={30} color={INK.navy} at={44} dur={8} rotate={-2}>
        AI가 골라요
      </HandText>
      <Layer>
        <Pencil d={roughLine(1176, 352, 1300, 318, 14, 2)} color={INK.red} width={6} at={34} dur={6} />
        <Pencil d={arrow.body} color={INK.navy} width={5} at={36} dur={7} />
        <Pencil d={arrow.head} color={INK.navy} width={5} at={42} dur={3} />
        <Pencil d={gradeCircle(1590, 338, 92, 52, 24)} color={BRAND.green} width={8} at={48} dur={9} />
      </Layer>
    </div>
  );
};

const REPORT = [
  { label: "오늘 한 일", icon: "book" as IconName, text: "오늘은 일차방정식 활용을 다뤘습니다.", at: 96 },
  { label: "막힌 점", icon: "warning" as IconName, text: "식을 세운 뒤 부호를 정리하는 문항에서 막혔습니다.", at: 116 },
  { label: "다음에 할 일", icon: "arrow" as IconName, text: "내일은 같은 유형 다섯 문항과 짧은 테스트를 합니다.", at: 136 },
];

const ReportPaper: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  if (f < 90) return null;
  const p = spring({ frame: f - 90, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 1010,
        top: 300,
        width: 740,
        height: 710,
        transform: `translate(${(1 - p) * 360}px, ${(1 - p) * 260}px) rotate(${lerp(8, -1.6, p)}deg) scale(${lerp(0.6, 1, p)})`,
        transformOrigin: "80% 80%",
        opacity: interpolate(f, [90, 95], [0, 1], CL),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#FFFDF6",
          boxShadow: "0 30px 60px rgba(60,50,30,0.22), 0 3px 6px rgba(60,50,30,0.12)",
          backgroundImage: "linear-gradient(transparent 52px, rgba(98,128,176,0.18) 52px, rgba(98,128,176,0.18) 54px)",
          backgroundSize: "100% 54px",
          backgroundPosition: "0 30px",
        }}
      />
      <div style={{ position: "absolute", left: 66, top: 0, bottom: 0, width: 2, background: "rgba(214,96,96,0.4)" }} />
      <Tape x={300} y={-16} w={150} rot={-2} />
      <div style={{ position: "absolute", left: 92, top: 48, display: "flex", alignItems: "center", gap: 10 }}>
        <Img src={staticFile("brand/classin-mark.png")} style={{ height: 16 }} />
        <span style={t(13, 800, BRAND.green, { lineHeight: 1, letterSpacing: "0.06em" })}>AI 생성 예시</span>
      </div>
      <div style={{ position: "absolute", left: 92, top: 84, ...t(30, 800, APP.ink, { lineHeight: 1 }) }}>학생 E · 오늘 수업 요약</div>
      <div style={{ position: "absolute", left: 92, top: 126, ...t(14, 600, APP.sub, { lineHeight: 1 }) }}>중2 수학 개별진도반 A</div>
      {REPORT.map((l, i) => {
        const chars = Array.from(l.text);
        const n = Math.floor(interpolate(f, [l.at, l.at + 16], [0, chars.length], CL));
        const typing = f >= l.at && n < chars.length;
        const caret = Math.floor(f / 4) % 2 === 0;
        return (
          <div key={l.label} style={{ position: "absolute", left: 92, right: 50, top: 186 + i * 140, opacity: ramp(f, l.at - 6, l.at) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, ...t(15, 700, APP.sub, { lineHeight: 1 }) }}>
              <Icon name={l.icon} size={17} color={APP.sub} round draw={ramp(f, l.at - 6, l.at + 6)} />
              {l.label}
            </div>
            <div style={{ marginTop: 14, ...t(24, 600, APP.ink, { lineHeight: 1.5 }) }}>
              {chars.slice(0, n).join("")}
              {typing || (i === 2 && f >= l.at + 16 && f < 154) ? <span style={{ display: "inline-block", width: 2.5, height: 26, background: BRAND.green, marginLeft: 3, verticalAlign: "-4px", opacity: caret ? 1 : 0 }} /> : null}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 92, bottom: 34, ...t(12.5, 600, APP.sub, { lineHeight: 1 }), opacity: ramp(f, 150, 158) }}>가상 수업 기록으로 만든 요약 예시</div>
      <Stamp color={INK.red} at={154} rot={-9} size={30} style={{ right: 52, top: 40 }} pad="10px 22px">
        초안
      </Stamp>
      <Sheen at={160} dur={20} strength={0.45} />
    </div>
  );
};

export const S6Dashboard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: f, fps, config: { damping: 20, stiffness: 110 } });
  const cardE = cardPos(4);
  const ex = BODY.x + cardE.x + (GRID.cw * GRID.s) / 2;
  const ey = BODY.y + cardE.y + (GRID.ch * GRID.s) / 2;
  const pillX = BODY.x + PANEL.x + PANEL.w - 16 - 10 - 52;
  const pillY = BODY.y + ITEMS[1].y + 12 + 52 + 10 + 14;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.morning} to={PAPER.day} k={ramp(f, 120, 180) * 0.6} grid={0.35} gridGap={36} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - win) * 60}px)`, opacity: interpolate(f, [0, 5], [0, 1], CL) }}>
        <AppWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} pill="오늘 · 원장 화면 예시">
          <Home f={f} />
        </AppWindow>
      </div>
      <TriageNote f={f} />
      <ReportPaper f={f} />
      <Cursor
        show={[42, 104]}
        clicks={[60, 90]}
        path={[
          { f: 42, x: 1700, y: 1080 },
          { f: 58, x: ex, y: ey },
          { f: 76, x: ex + 20, y: ey + 6 },
          { f: 88, x: pillX, y: pillY },
          { f: 104, x: pillX + 40, y: pillY + 60 },
        ]}
      />
      <KText lines={[[{ t: "원장님은 " }, { t: "한 화면", c: BRAND.green }, { t: "에서" }]]} at={4} size={100} out={86} outDur={6} style={{ position: "absolute", left: 116, top: 112 }} />
      <KText lines={[[{ t: "챙길 학생을 보고," }]]} at={16} size={100} out={86} outDur={6} style={{ position: "absolute", left: 116, top: 236 }} />
      <KText lines={[[{ t: "학부모 리포트" }]]} at={92} size={100} style={{ position: "absolute", left: 116, top: 112 }} />
      <KText lines={[[{ t: "초안", c: INK.red }, { t: "까지." }]]} at={100} size={100} style={{ position: "absolute", left: 116, top: 236 }} />
      <Hud page={6} label="원장 화면 · 학생 E · 리포트 초안" />
      <StatusStamp kind="example" at={4} />
    </AbsoluteFill>
  );
};

