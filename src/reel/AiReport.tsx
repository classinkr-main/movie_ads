import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { GrainTiles } from "./fx";
import { R } from "./theme";

/*
 * AI 강의 분석 리포트(예시 화면) — S2 데이터 비트에 얹는 밝은 카드.
 * 클래스인 다시보기 창의 [AI 강의 분석] 패널과 AI 강의 분석 보고서(종합 점수 · 역량 레이더 · 영역별 점수 · 수업 시간 배분)
 * 레이아웃을 따랐다. 평가 영역은 6.0.9 업데이트 문서의 4대 영역(수업 전달 · 분위기 · 상호작용 · 언어 표현)이고 점수·시간은 예시 수치다.
 * 카드가 3D로 떠오르면 민트 스캔이 한 번 훑고, 종합 점수가 0→93으로 오르며 레이더 · 막대 · 도넛 · 발화 타임라인이 차례로 그려진다.
 */

const C = {
  card: "#FBFCFB",
  sub: "#F3F7F5",
  line: "#E1E8E4",
  grid: "#D3DDD8",
  track: "#E7EEEA",
  ink: "#111614",
  body: "#3B4642",
  gray: "#86918C",
  green: "#0B5E43",
  pale: "#E2F4EA",
  orange: "#EF8A2E",
  teach: "#18A56C",
  talk: "#3B82F6",
  student: "#F2795B",
  etc: "#CDD5D1",
};

const draw = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: easeOutExpo });

// 4대 영역(만점 100) — 예시 점수. 가장 낮은 영역은 개선 포인트(주황)로 표시한다.
const AREAS = [
  { l: "수업 전달", short: "전달", got: 29, max: 30 },
  { l: "수업 분위기", short: "분위기", got: 24, max: 25 },
  { l: "수업 상호작용", short: "상호작용", got: 21, max: 25 },
  { l: "언어 표현", short: "언어 표현", got: 19, max: 20 },
];
const TOTAL = AREAS.reduce((s, a) => s + a.got, 0); // 93
const WEAK = 2;

// 45분 수업의 시간 배분(분)과 발화 타임라인 구간 [행, 시작분, 끝분]
const CLASS_MIN = 45;
const SLICES = [
  { l: "교사 강의", m: 27, c: C.teach },
  { l: "상호 작용", m: 9, c: C.talk },
  { l: "학생 참여", m: 7, c: C.student },
  { l: "기타", m: 2, c: C.etc },
];
const SPANS: [number, number, number][] = [
  [0, 0, 7], [1, 7, 10], [0, 10, 17], [1, 17, 19], [2, 19, 22], [0, 22, 29],
  [1, 29, 31], [2, 31, 34], [1, 34, 36], [0, 36, 42], [2, 42, 43], [3, 43, 45],
];

const Sparkle: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16">
    <path d="M8 0 C8.6 4.6 11.4 7.4 16 8 C11.4 8.6 8.6 11.4 8 16 C7.4 11.4 4.6 8.6 0 8 C4.6 7.4 7.4 4.6 8 0 Z" fill={R.accent} />
  </svg>
);

const Tabs: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    {["AI 강의 분석", "AI 요약", "AI 스크립트"].map((t, i) => (
      <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: i ? "#EDF1EF" : C.ink, color: i ? C.body : "#FFFFFF", fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {i === 0 && <Sparkle />}
        {t}
      </span>
    ))}
    <span style={{ flex: 1 }} />
    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: C.gray, whiteSpace: "nowrap" }}>관리자 · 예시 화면</span>
  </div>
);

// 월계수 가지 — 줄기가 그려지고 잎이 아래부터 돋는다. flip이면 좌우 반전(오른쪽 가지).
const LEAF = "M0 0 C3.6 -3.4 3.8 -10.5 0 -15 C-3.8 -10.5 -3.6 -3.4 0 0 Z";
const LEAVES: [number, number, number][] = [
  [19, 66, -62], [13.6, 54.5, -50], [10.8, 41, -36], [10.8, 25, -20], [12.9, 11, -6], // 바깥쪽
  [16, 60.4, 24], [11.9, 48.3, 30], [10.4, 33.4, 34], // 안쪽
];
const Laurel: React.FC<{ k: number; flip?: boolean }> = ({ k, flip }) => (
  <svg width={34} height={76} viewBox="0 0 34 76" style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
    <path d="M27 74 C12 62 6 40 14 6" fill="none" stroke={C.green} strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    {LEAVES.map(([x, y, a], i) => {
      const s = interpolate(k, [i * 0.07, i * 0.07 + 0.4], [0, 1], clamp);
      return <path key={i} d={LEAF} fill={C.green} transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} />;
    })}
  </svg>
);

const Score: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.round(TOTAL * draw(f, 14, 50));
  const lk = draw(f, 34, 58);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Laurel k={lk} />
        <span style={{ minWidth: 116, textAlign: "center", fontSize: 100, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.green, fontVariantNumeric: "tabular-nums" }}>{n}</span>
        <Laurel k={lk} flip />
      </div>
      <span style={{ marginTop: 8, fontSize: 18, fontWeight: 600, letterSpacing: "0.04em", color: C.gray }}>AI Eval.</span>
    </div>
  );
};

const Header: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", alignItems: "flex-start", marginTop: 22 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ padding: "5px 12px", borderRadius: 7, background: C.pale, color: C.green, fontSize: 16, fontWeight: 800 }}>영어</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.gray, whiteSpace: "nowrap" }}>English B반 · 강사 A · 45분 수업</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 34, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.2, color: C.ink }}>
        Unit 5 현재완료
        <br />
        have + p.p. 이해와 활용
      </div>
    </div>
    <Score f={f} />
  </div>
);

// 역량 레이더 — 4대 영역 마름모. 위(전달) → 오른쪽(분위기) → 아래(상호작용) → 왼쪽(언어 표현)
const RW = 296;
const RH = 236;
const RCX = 148;
const RCY = 120;
const RR = 70;
const AX = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
const RLABEL: React.CSSProperties[] = [
  { left: RCX - 60, width: 120, top: 10 },
  { left: RCX + RR + 8, width: 64, top: RCY - 18 },
  { left: RCX - 60, width: 120, top: RCY + RR + 6 },
  { left: RCX - RR - 72, width: 64, top: RCY - 18 },
];
const Radar: React.FC<{ f: number }> = ({ f }) => {
  const g = draw(f, 18, 52);
  const lab = interpolate(f, [26, 40], [0, 1], clamp);
  const xy = (i: number, v: number) => [RCX + AX[i][0] * RR * v, RCY + AX[i][1] * RR * v];
  const ring = (v: number) => [0, 1, 2, 3].map((i) => xy(i, v).join(",")).join(" ");
  const vals = AREAS.map((a) => (a.got / a.max) * g);
  return (
    <div style={{ position: "relative", width: RW, height: RH, flexShrink: 0, borderRadius: 14, background: C.sub, border: `1px solid ${C.line}` }}>
      <svg width={RW} height={RH} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0.25, 0.5, 0.75, 1].map((v) => (
          <polygon key={v} points={ring(v)} fill="none" stroke={C.grid} strokeWidth={1} />
        ))}
        {[0, 1, 2, 3].map((i) => {
          const [x, y] = xy(i, 1);
          return <line key={i} x1={RCX} y1={RCY} x2={x} y2={y} stroke={C.grid} strokeWidth={1} />;
        })}
        <polygon points={vals.map((v, i) => xy(i, v).join(",")).join(" ")} fill="rgba(11,94,67,0.16)" stroke={C.green} strokeWidth={2.5} strokeLinejoin="round" />
        {vals.map((v, i) => {
          const [x, y] = xy(i, v);
          return <circle key={i} cx={x} cy={y} r={4.5} fill="#FFFFFF" stroke={i === WEAK ? C.orange : C.green} strokeWidth={2.5} />;
        })}
      </svg>
      {AREAS.map((a, i) => (
        <div key={a.l} style={{ position: "absolute", ...RLABEL[i], textAlign: "center", lineHeight: 1.2, opacity: lab }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.body, whiteSpace: "nowrap" }}>{a.short}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: i === WEAK ? C.orange : C.green, fontVariantNumeric: "tabular-nums" }}>{Math.round((a.got / a.max) * 100)}%</div>
        </div>
      ))}
    </div>
  );
};

const AreaBars: React.FC<{ f: number }> = ({ f }) => {
  const tag = interpolate(f, [50, 58], [0, 1], clamp);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 0" }}>
      {AREAS.map((a, i) => {
        const p = draw(f, 20 + i * 6, 56 + i * 6);
        const pct = Math.round((a.got / a.max) * 100);
        const weak = i === WEAK;
        const col = weak ? C.orange : C.green;
        return (
          <div key={a.l}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{a.l}</span>
              {weak && <span style={{ marginLeft: 10, padding: "3px 9px", borderRadius: 6, background: "#FDEEDD", color: "#B4560F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", opacity: tag, transform: `scale(${0.8 + 0.2 * tag})` }}>개선 포인트</span>}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 19, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct * p)}%</span>
              <span style={{ width: 56, textAlign: "right", fontSize: 16, fontWeight: 600, color: C.gray, fontVariantNumeric: "tabular-nums" }}>
                {a.got}/{a.max}
              </span>
            </div>
            <div style={{ marginTop: 9, height: 10, borderRadius: 10, background: C.track, overflow: "hidden" }}>
              <div style={{ width: `${pct * p}%`, height: "100%", borderRadius: 10, background: col }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Donut: React.FC<{ p: number }> = ({ p }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
      <svg width={92} height={92} viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={46} cy={46} r={r} fill="none" stroke={C.track} strokeWidth={13} />
        {SLICES.map((s) => {
          const share = s.m / CLASS_MIN;
          const start = acc;
          acc += share;
          const vis = Math.max(0, Math.min(share, p - start));
          return vis > 0 ? <circle key={s.l} cx={46} cy={46} r={r} fill="none" stroke={s.c} strokeWidth={13} strokeDasharray={`${vis * c} ${c}`} strokeDashoffset={-start * c} /> : null;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: C.ink }}>
          45<span style={{ fontSize: 13, fontWeight: 700 }}>분</span>
        </span>
        <span style={{ marginTop: 3, fontSize: 11, fontWeight: 600, color: C.gray }}>총 수업</span>
      </div>
    </div>
  );
};

// 수업 시간 배분 — 도넛 + 45분 발화 분포 타임라인(색 구간이 왼쪽부터 채워진다) + 범례
const TimeSplit: React.FC<{ f: number }> = ({ f }) => {
  const p = draw(f, 26, 66);
  const now = p * CLASS_MIN;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16 }}>
      <Donut p={p} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>수업 시간 배분</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.gray }}>발화 분포 타임라인</span>
        </div>
        <div style={{ position: "relative", marginTop: 10, height: 16, borderRadius: 5, background: C.track, overflow: "hidden" }}>
          {SPANS.map(([row, a, b]) => {
            const end = Math.min(b, now);
            if (end <= a) return null;
            return <div key={`${row}-${a}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${(a / CLASS_MIN) * 100}%`, width: `${((end - a) / CLASS_MIN) * 100}%`, background: SLICES[row].c, boxShadow: "inset -1.5px 0 0 #FBFCFB" }} />;
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {SLICES.map((s) => (
            <span key={s.l} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: C.body, whiteSpace: "nowrap" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: s.c }} />
              {s.l}
              <span style={{ fontWeight: 800, color: C.ink }}>{s.m}분</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AiReport: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = sp(f - 4, fps, { damping: 16, stiffness: 120, mass: 0.9 });
  const float = Math.sin(f / 26) * 4;
  const scan = interpolate(f, [12, 46], [-0.25, 1.25], clamp);
  return (
    <div style={{ position: "absolute", right: 104, top: 150, width: 780, perspective: 1800 }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          transformOrigin: "60% 50%",
          transform: `translate3d(${(1 - k) * 220}px, ${(1 - k) * 70 + float}px, ${(1 - k) * -280}px) rotateY(${(1 - k) * -26 - 5 + f * 0.025}deg) rotateX(${2 - (1 - k) * 4}deg)`,
          opacity: Math.min(1, k * 1.6),
        }}
      >
        <div style={{ position: "relative", overflow: "hidden", background: C.card, borderRadius: 24, padding: "28px 32px", boxShadow: "0 50px 110px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.6)" }}>
          <Tabs />
          <Header f={f} />
          <div style={{ marginTop: 20, height: 3, background: C.ink, transformOrigin: "0 50%", transform: `scaleX(${draw(f, 12, 40)})` }} />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>수업 점수</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.gray }}>4대 영역 · 11개 지표</span>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 12 }}>
            <Radar f={f} />
            <AreaBars f={f} />
          </div>
          <div style={{ marginTop: 18, height: 1, background: C.line }} />
          <TimeSplit f={f} />
          {/* AI 스캔 — 민트 띠가 카드를 한 번 훑는다 */}
          {scan > -0.25 && scan < 1.25 && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: "24%", marginLeft: "-12%", background: `linear-gradient(90deg, rgba(${R.accentRgb},0) 0%, rgba(${R.accentRgb},0.26) 50%, rgba(${R.accentRgb},0) 100%)`, mixBlendMode: "multiply", pointerEvents: "none" }} />
          )}
          <GrainTiles w={780} h={760} opacity={0.2} blend="soft-light" />
        </div>
      </div>
    </div>
  );
};
