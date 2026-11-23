import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COVER, INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { Icon, IconName } from "../icons";
import { CL, Hud, KText, Layer, PaperBg, Pencil, StatusStamp, Whip, eInOut, eOut, gradeCircle, lerp, ramp, t } from "../kit";

// 모눈종이 위 '개별진도 대시보드'(ClassIn 화면이 아닌 별도 대시보드 · 방향 예시 · 가상 데이터)
// 학생별 진도 경로 · 상태 · 어제 테스트 · 체크 항목과 AI 진도 설계 제안을 한 화면에.
const FR = { x: 120, y: 384, w: 1680, h: 656 };
const NAVY = "#1C2541";
const BG = "#F5F7FB";
const LINE = "#E4E8F0";
const SUB = "#7A8396";

type St = { label: string; fg: string; bg: string };
const STATUS: Record<string, St> = {
  A: { label: "순조", fg: "#1F9D61", bg: "#E4F6EC" },
  B: { label: "앞섬", fg: "#2D5BD7", bg: "#E7EEFF" },
  C: { label: "보완 필요", fg: "#D8453A", bg: "#FDECEA" },
  D: { label: "앞섬", fg: "#2D5BD7", bg: "#E7EEFF" },
  E: { label: "확인 필요", fg: "#D77A12", bg: "#FFF1E0" },
  F: { label: "가장 앞섬", fg: "#6B4FD0", bg: "#EFEAFF" },
};
type Chk = { icon: IconName; text: string; warn?: boolean };
const CHECKS: Record<string, Chk[]> = {
  A: [{ icon: "check", text: "테스트 완료" }, { icon: "book", text: "숙제 제출" }, { icon: "chat", text: "질문 없음" }],
  B: [{ icon: "check", text: "테스트 90" }, { icon: "book", text: "숙제 제출" }, { icon: "flag", text: "합반 후보" }],
  C: [{ icon: "book", text: "숙제 미완 3회", warn: true }, { icon: "chat", text: "질문 1건" }, { icon: "route", text: "중1 복습" }],
  D: [{ icon: "check", text: "테스트 85" }, { icon: "book", text: "숙제 제출" }, { icon: "flag", text: "합반 후보" }],
  E: [{ icon: "trend", text: "70 → 62", warn: true }, { icon: "warning", text: "오답: 부호", warn: true }, { icon: "book", text: "숙제 4/6" }],
  F: [{ icon: "check", text: "테스트 95" }, { icon: "spark", text: "심화 추가" }, { icon: "flag", text: "상위반 후보" }],
};
const AI_ITEMS = [
  { who: "학생 C", tag: "보완", text: "중1 개념 보완 → '이항·부호 정리' 반복 배정", at: 44 },
  { who: "학생 E", tag: "확인", text: "활용 문항 미달 → 같은 유형 재확인 후 연립 도입", at: 58 },
  { who: "학생 F", tag: "심화", text: "가장 앞섬 → 일차부등식 심화 문항 추가", at: 72 },
  { who: "학생 B · D", tag: "합반", text: "금요일 합반 → 사고력 문항 묶음 제안", at: 86 },
];

const LogoGlyph: React.FC = () => {
  const ids = ["A", "B", "C", "D", "E", "F"];
  return (
    <svg width={30} height={30} viewBox="-15 -15 30 30">
      {ids.map((id, i) => {
        const a0 = ((i * 60 - 90 + 4) * Math.PI) / 180;
        const a1 = (((i + 1) * 60 - 90 - 4) * Math.PI) / 180;
        const r = 11;
        return <path key={id} d={`M ${Math.cos(a0) * r} ${Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r}`} fill="none" stroke={PENCIL[id]} strokeWidth={4.5} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const TopBar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: NAVY, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
    <LogoGlyph />
    <span style={t(18, 800, "#FFFFFF", { lineHeight: 1 })}>개별진도 대시보드</span>
    <span style={{ ...t(11, 800, "rgba(255,255,255,0.8)", { lineHeight: 1 }), border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 4, padding: "3px 6px" }}>예시</span>
    <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 34, height: 64, alignItems: "center" }}>
      {["오늘", "주간", "학생별", "리포트"].map((l, i) => (
        <div key={l} style={{ height: 64, display: "flex", alignItems: "center", borderBottom: i === 0 ? "3px solid #2ED36A" : "3px solid transparent", boxSizing: "border-box", ...t(15, i === 0 ? 800 : 600, i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.55)", { lineHeight: 1 }) }}>
          {l}
        </div>
      ))}
    </div>
    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
      <span style={{ padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", ...t(13, 700, "#FFFFFF", { lineHeight: 1 }) }}>중2 수학 반 A · 2주차</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "#2ED36A", ...t(13, 800, "#0B2A1A", { lineHeight: 1 }) }}>
        <Icon name="spark" size={13} color="#0B2A1A" round />
        AI 진도 설계
      </span>
    </div>
  </div>
);

const Kpi: React.FC<{ x: number; icon: IconName; label: string; value: string; sub?: string; subColor?: string; at: number; f: number; iconColor?: string }> = ({ x, icon, label, value, sub, subColor = SUB, at, f, iconColor = NAVY }) => {
  const p = ramp(f, at, at + 10);
  return (
    <div style={{ position: "absolute", left: x, top: 18, width: 290, height: 92, background: "#FFFFFF", borderRadius: 14, border: `1px solid ${LINE}`, padding: "16px 18px", boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={17} color={iconColor} round />
        <span style={t(13, 600, SUB, { lineHeight: 1 })}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
        <span style={t(30, 800, NAVY, { lineHeight: 1, letterSpacing: "-0.03em" })}>{value}</span>
        {sub ? <span style={t(13, 800, subColor, { lineHeight: 1 })}>{sub}</span> : null}
      </div>
    </div>
  );
};

const Ring: React.FC<{ v: number; color: string; p: number }> = ({ v, color, p }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <svg width={92} height={92} viewBox="-46 -46 92 92">
      <circle r={r} fill="none" stroke="#EEF0F5" strokeWidth={8} />
      <circle r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${c * (v / 100) * p} ${c}`} transform="rotate(-90)" />
      <text y={4} textAnchor="middle" style={t(21, 800, NAVY, { lineHeight: 1 })} fill={NAVY}>
        {Math.round(v * p)}
      </text>
      <text y={20} textAnchor="middle" style={t(10, 700, SUB, { lineHeight: 1 })} fill={SUB}>
        점
      </text>
    </svg>
  );
};

const Card: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const { fps } = useVideoConfig();
  const s = STUDENTS[i];
  const st = STATUS[s.id];
  const cw = 390;
  const ch = 218;
  const x = 24 + (i % 3) * (cw + 14);
  const y = 124 + Math.floor(i / 3) * (ch + 14);
  const at = 10 + i * 4;
  const pin = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 150 } });
  const path = ramp(f, 24 + i * 4, 48 + i * 4, eInOut);
  const ring = ramp(f, 26 + i * 4, 56 + i * 4, eOut);
  const nodes = [28, 98, 168, 238];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: cw, height: ch, background: "#FFFFFF", borderRadius: 14, border: `1px solid ${LINE}`, opacity: interpolate(f - at, [0, 4], [0, 1], CL), transform: `translateY(${(1 - pin) * 18}px)` }}>
      <div style={{ position: "absolute", left: 16, top: 16, width: 38, height: 38, borderRadius: 99, background: COVER[s.id][0], display: "flex", alignItems: "center", justifyContent: "center", ...t(17, 800, PENCIL[s.id], { lineHeight: 1 }) }}>{s.id}</div>
      <div style={{ position: "absolute", left: 64, top: 26, ...t(16, 800, NAVY, { lineHeight: 1 }) }}>학생 {s.id}</div>
      <div style={{ position: "absolute", right: 16, top: 20, padding: "6px 11px", borderRadius: 999, background: st.bg, ...t(12, 800, st.fg, { lineHeight: 1 }) }}>{st.label}</div>
      <div style={{ position: "absolute", left: 16, top: 68, ...t(11, 600, SUB, { lineHeight: 1 }) }}>오늘 진도 · 2주차</div>
      <div style={{ position: "absolute", left: 16, top: 86, width: 260, ...t(17, 800, NAVY, { lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{s.today}</div>
      {/* 4주 경로 */}
      <svg width={270} height={44} style={{ position: "absolute", left: 4, top: 118 }}>
        <line x1={nodes[0]} x2={nodes[3]} y1={14} y2={14} stroke="#E3E6EE" strokeWidth={3} strokeLinecap="round" />
        <line x1={nodes[0]} x2={lerp(nodes[0], nodes[1], path)} y1={14} y2={14} stroke={PENCIL[s.id]} strokeWidth={3.5} strokeLinecap="round" />
        {nodes.map((nx, k) => {
          const on = k === 0 ? ramp(f, 24 + i * 4, 28 + i * 4) : k === 1 ? ramp(f, 44 + i * 4, 50 + i * 4) : 1;
          const pulse = k === 1 ? 0.5 + 0.5 * Math.sin((f - 50) / 5) : 0;
          return (
            <g key={k}>
              {k === 1 && f > 50 ? <circle cx={nx} cy={14} r={9 + pulse * 4} fill="none" stroke={PENCIL[s.id]} strokeOpacity={0.3 * (1 - pulse)} strokeWidth={2} /> : null}
              <circle cx={nx} cy={14} r={k === 1 ? 7 : 5.5} fill={k === 0 ? PENCIL[s.id] : k === 1 ? "#FFFFFF" : "#FFFFFF"} stroke={k <= 1 ? PENCIL[s.id] : "#C9CEDA"} strokeWidth={k === 1 ? 3 : 2} opacity={k <= 1 ? on : 1} />
              <text x={nx} y={38} textAnchor="middle" style={t(10, 700, k === 1 ? PENCIL[s.id] : SUB, { lineHeight: 1 })} fill={k === 1 ? PENCIL[s.id] : SUB}>
                {k + 1}주
              </text>
            </g>
          );
        })}
      </svg>
      {/* 어제 테스트 링 */}
      <div style={{ position: "absolute", right: 14, top: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Ring v={s.score} color={st.fg} p={ring} />
        <span style={t(10, 700, SUB, { lineHeight: 1 })}>어제 테스트</span>
      </div>
      {/* 체크 항목 */}
      <div style={{ position: "absolute", left: 16, bottom: 14, display: "flex", gap: 6 }}>
        {CHECKS[s.id].map((c, k) => {
          const cat = 40 + i * 3 + k * 5;
          const p = ramp(f, cat, cat + 6);
          return (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: 999, background: c.warn ? "#FDECEA" : "#F1F3F8", opacity: p, transform: `scale(${lerp(0.7, 1, p)})`, ...t(11.5, 700, c.warn ? "#D8453A" : NAVY, { lineHeight: 1, whiteSpace: "nowrap" }) }}>
              <Icon name={c.icon} size={12} color={c.warn ? "#D8453A" : NAVY} stroke={2.2} round />
              {c.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const AiPanel: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 1250, top: 18, width: 406, height: 556, background: "#FFFFFF", borderRadius: 14, border: `1px solid ${LINE}`, opacity: ramp(f, 30, 40) }}>
    <div style={{ position: "absolute", left: 20, top: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="spark" size={18} color={BRAND.green} round draw={ramp(f, 30, 42)} />
      <span style={t(16, 800, NAVY, { lineHeight: 1 })}>AI 진도 설계 제안</span>
    </div>
    <div style={{ position: "absolute", left: 20, top: 48, ...t(12, 600, SUB, { lineHeight: 1 }) }}>진단 결과 · 어제 테스트 기반</div>
    {AI_ITEMS.map((it, k) => {
      const chars = Array.from(it.text);
      const n = Math.floor(interpolate(f, [it.at + 2, it.at + 14], [0, chars.length], CL));
      const p = ramp(f, it.at, it.at + 6);
      const done = ramp(f, it.at + 14, it.at + 18);
      return (
        <div key={it.who} style={{ position: "absolute", left: 20, right: 20, top: 82 + k * 116, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
          <div style={{ height: 1, background: LINE, marginBottom: 14 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={t(15, 800, NAVY, { lineHeight: 1 })}>{it.who}</span>
            <span style={{ padding: "4px 8px", borderRadius: 6, background: "#F1F3F8", ...t(11, 800, SUB, { lineHeight: 1 }) }}>{it.tag}</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: 999, background: "#E4F6EC", opacity: done, ...t(11, 800, "#1F9D61", { lineHeight: 1 }) }}>
              <Icon name="check" size={12} color="#1F9D61" stroke={2.6} round />
              {k === 3 ? "제안" : "배정됨"}
            </span>
          </div>
          <div style={{ marginTop: 10, ...t(14, 600, NAVY, { lineHeight: 1.45 }) }}>{chars.slice(0, n).join("")}</div>
        </div>
      );
    })}
  </div>
);

const Dashboard: React.FC<{ f: number }> = ({ f }) => {
  const kv = (to: number, a: number) => Math.round(interpolate(f, [a, a + 18], [0, to], { ...CL, easing: eOut }));
  return (
    <div style={{ position: "absolute", left: FR.x, top: FR.y, width: FR.w, height: FR.h, borderRadius: 18, overflow: "hidden", background: BG, boxShadow: "0 36px 80px rgba(28,37,65,0.22), 0 3px 8px rgba(28,37,65,0.1)" }}>
      <TopBar />
      <div style={{ position: "absolute", left: 0, right: 0, top: 64, bottom: 0 }}>
        <Kpi x={24} icon="student" label="학생" value={`${kv(6, 6)}명`} at={4} f={f} />
        <Kpi x={328} icon="route" label="오늘 진도 배정" value={`${kv(6, 10)} / 6`} sub="AI 배정 완료" subColor="#1F9D61" at={8} f={f} />
        <Kpi x={632} icon="flag" label="먼저 볼 학생" value={`${kv(2, 14)}명`} sub="C · E" subColor="#D8453A" at={12} f={f} iconColor="#D8453A" />
        <Kpi x={936} icon="test" label="어제 테스트 평균" value={`${kv(78, 16)}점`} at={16} f={f} />
        {STUDENTS.map((_, i) => (
          <Card key={i} i={i} f={f} />
        ))}
        <AiPanel f={f} />
      </div>
    </div>
  );
};

export const S4Paths: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: f, fps, config: { damping: 20, stiffness: 110 } });
  return (
    <Whip id="s4whip" exit={120}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <PaperBg paper={PAPER.graph} grid={1} gridGap={36} />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - win) * 60}px)`, opacity: interpolate(f, [0, 5], [0, 1], CL) }}>
          <Dashboard f={f} />
        </div>
        {/* 빨간 색연필: 먼저 볼 학생 */}
        <Layer>
          <Pencil d={gradeCircle(FR.x + 632 + 66, FR.y + 64 + 18 + 68, 64, 25, 31)} color={INK.red} width={7} at={70} dur={9} />
        </Layer>
        <KText lines={[[{ t: "진단 결과로," }]]} at={6} size={100} style={{ position: "absolute", left: 116, top: 112 }} />
        <KText lines={[[{ t: "학생마다 " }, { t: "진도 경로", c: BRAND.green }, { t: "를 짜고," }]]} at={22} size={100} style={{ position: "absolute", left: 116, top: 236 }} />
        <Hud page={4} label="AI 진도 설계" />
        <StatusStamp kind="example" at={4} />
      </AbsoluteFill>
    </Whip>
  );
};
