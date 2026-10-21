import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeOutExpo } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { LAND_DOTS } from "../data/landDots";
import { Dust, Mono } from "../fx";
import { MaskLine } from "../type";
import { R } from "../theme";

/*
 * S5 스케일 (글로벌 1056–1278f · 3.7s)
 *   0–20    민트 사선 스윕으로 들어온다
 *   12–150  점으로 된 3D 지구본이 서울에서부터 물결처럼 켜지며 천천히 돈다. 대륙을 잇는 아크가 차례로 그어진다
 *   28–140  왼쪽에 EEO 공식 수치 4개가 슬롯처럼 굴러 선다 — 160+ 개국 · 6만+ 교육기관 · 5,000만+ 교사·학습자 · 3,000만+ 월간 수업
 *   206–222 어두워지며 S6 아이리스가 덮는다
 * 수치 출처: classinkr-web docs/active/brand-canon/company-facts.md §3 — 화면 하단에 "EEO 공식 소개 기준" 캡션을 단다.
 * 아크 끝점은 대륙 위치를 잡기 위한 좌표일 뿐 특정 도시·고객을 뜻하지 않아 라벨을 달지 않는다(서울만 표기).
 */

const DEG = Math.PI / 180;
const GX = 1330; // 지구본 중심
const GY = 560;
const GR = 430; // 반지름
const PHI0 = 24 * DEG; // 화면 중심 위도(북반구가 보이게 기울인다)
const SEOUL: [number, number] = [37.57, 126.98];

type Proj = { x: number; y: number; c: number };
const project = (lat: number, lon: number, lam0: number, h = 1): Proj => {
  const p = lat * DEG;
  const l = lon * DEG - lam0;
  const c = Math.sin(PHI0) * Math.sin(p) + Math.cos(PHI0) * Math.cos(p) * Math.cos(l);
  const x = GR * h * Math.cos(p) * Math.sin(l);
  const y = -GR * h * (Math.cos(PHI0) * Math.sin(p) - Math.sin(PHI0) * Math.cos(p) * Math.cos(l));
  return { x, y, c };
};

const toVec = (lat: number, lon: number) => [Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG)];
const angDist = (a: [number, number], b: [number, number]) => {
  const va = toVec(...a);
  const vb = toVec(...b);
  return Math.acos(Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
};

// 대권 위 점(구면 선형 보간) → [위도, 경도]
const slerp = (a: [number, number], b: [number, number], t: number): [number, number] => {
  const va = toVec(...a);
  const vb = toVec(...b);
  const om = angDist(a, b);
  const s = Math.sin(om) || 1;
  const k1 = Math.sin((1 - t) * om) / s;
  const k2 = Math.sin(t * om) / s;
  const v = [k1 * va[0] + k2 * vb[0], k1 * va[1] + k2 * vb[1], k1 * va[2] + k2 * vb[2]];
  return [Math.asin(v[2]) / DEG, Math.atan2(v[1], v[0]) / DEG];
};

// 대륙을 잇는 아크(서울 기점 + 대륙 간). 좌표는 위치 잡기용이다.
const P = {
  seoul: SEOUL,
  beijing: [39.9, 116.4] as [number, number],
  tokyo: [35.7, 139.7] as [number, number],
  singapore: [1.35, 103.8] as [number, number],
  sydney: [-33.9, 151.2] as [number, number],
  jakarta: [-6.2, 106.8] as [number, number],
  dubai: [25.2, 55.3] as [number, number],
  mumbai: [19.1, 72.9] as [number, number],
  london: [51.5, -0.1] as [number, number],
  la: [34.05, -118.24] as [number, number],
  honolulu: [21.3, -157.8] as [number, number],
  moscow: [55.75, 37.6] as [number, number],
};
const ARCS: Array<[[number, number], [number, number]]> = [
  [P.seoul, P.beijing],
  [P.seoul, P.tokyo],
  [P.seoul, P.singapore],
  [P.seoul, P.la],
  [P.beijing, P.dubai],
  [P.singapore, P.sydney],
  [P.seoul, P.jakarta],
  [P.beijing, P.london],
  [P.singapore, P.mumbai],
  [P.tokyo, P.honolulu],
  [P.beijing, P.moscow],
];

const DOT_COUNT = LAND_DOTS.length / 2;
const DOT_DIST = Array.from({ length: DOT_COUNT }, (_, i) => angDist(SEOUL, [LAND_DOTS[i * 2], LAND_DOTS[i * 2 + 1]]));

const Globe: React.FC = () => {
  const f = useCurrentFrame();
  const lam0 = interpolate(f, [0, 222], [104, 138], clamp) * DEG;
  const halo = interpolate(f, [6, 44], [0, 1], { ...clamp, easing: easeOutExpo });

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const pr = project(LAND_DOTS[i * 2], LAND_DOTS[i * 2 + 1], lam0);
    if (pr.c < 0.02) continue;
    const a = interpolate(f - 12 - DOT_DIST[i] * 40, [0, 12], [0, 1], clamp);
    if (a <= 0) continue;
    const wave = interpolate(f - 12 - DOT_DIST[i] * 40, [0, 6, 24], [0, 1, 0], clamp); // 켜지는 순간 반짝
    dots.push(<circle key={i} cx={GX + pr.x} cy={GY + pr.y} r={1.5 + 1.7 * pr.c + wave * 1.6} fill={wave > 0.05 ? R.white : R.accent} opacity={a * (0.22 + 0.7 * pr.c)} />);
  }

  const arcs = ARCS.map(([a, b], i) => {
    const start = 40 + i * 9;
    const p = interpolate(f - start, [0, 38], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    if (p <= 0) return null;
    const om = angDist(a, b);
    const lift = 0.06 + 0.16 * (om / Math.PI);
    const N = 44;
    let d = "";
    let pen = false;
    let head: Proj | null = null;
    for (let k = 0; k <= N; k++) {
      const t = (k / N) * p;
      const [lat, lon] = slerp(a, b, t);
      const h = 1 + lift * Math.sin(Math.PI * t);
      const pr = project(lat, lon, lam0, h);
      const vis = pr.c > 0 || pr.x * pr.x + pr.y * pr.y > GR * GR;
      if (vis) {
        d += `${pen ? "L" : "M"}${(GX + pr.x).toFixed(1)},${(GY + pr.y).toFixed(1)} `;
        pen = true;
        head = pr;
      } else {
        pen = false;
        head = null;
      }
    }
    const fade = interpolate(f - start, [44, 100], [1, 0.45], clamp);
    const end = project(b[0], b[1], lam0);
    const landed = p >= 1 && end.c > 0;
    return (
      <g key={i} opacity={fade}>
        <path d={d} fill="none" stroke={R.accent} strokeWidth={2.4} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px rgba(${R.accentRgb},0.8))` }} />
        {head && p < 1 && <circle cx={GX + head.x} cy={GY + head.y} r={5} fill={R.white} style={{ filter: `drop-shadow(0 0 10px rgba(${R.accentRgb},1))` }} />}
        {landed && <circle cx={GX + end.x} cy={GY + end.y} r={4 + 10 * interpolate(f - start - 38, [0, 20], [1, 0], clamp)} fill="none" stroke={R.white} strokeWidth={2} opacity={interpolate(f - start - 38, [0, 20], [1, 0.2], clamp)} />}
      </g>
    );
  });

  const seoul = project(SEOUL[0], SEOUL[1], lam0);
  const pulses = [0, 20].map((o) => ((f + o) % 40) / 40);
  return (
    <AbsoluteFill style={{ opacity: halo, transform: `scale(${0.94 + 0.06 * halo})`, transformOrigin: `${GX}px ${GY}px` }}>
      {/* 대기권 글로우 */}
      <div style={{ position: "absolute", left: GX - GR * 1.5, top: GY - GR * 1.5, width: GR * 3, height: GR * 3, borderRadius: "50%", background: `radial-gradient(circle, rgba(${R.accentRgb},0.16) 0%, rgba(${R.accentRgb},0.06) 38%, rgba(${R.accentRgb},0) 62%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="globeBody" cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#0E3828" />
            <stop offset="70%" stopColor="#06180F" />
            <stop offset="100%" stopColor="#030B08" />
          </radialGradient>
        </defs>
        <circle cx={GX} cy={GY} r={GR} fill="url(#globeBody)" />
        <circle cx={GX} cy={GY} r={GR} fill="none" stroke={`rgba(${R.accentRgb},0.45)`} strokeWidth={2} style={{ filter: `drop-shadow(0 0 18px rgba(${R.accentRgb},0.6))` }} />
        {dots}
        {arcs}
        {seoul.c > 0 && (
          <g>
            {pulses.map((q, i) => (
              <circle key={i} cx={GX + seoul.x} cy={GY + seoul.y} r={6 + q * 40} fill="none" stroke={R.accent} strokeWidth={2.5} opacity={(1 - q) * 0.9} />
            ))}
            <circle cx={GX + seoul.x} cy={GY + seoul.y} r={8} fill={R.white} style={{ filter: `drop-shadow(0 0 12px rgba(${R.accentRgb},1))` }} />
          </g>
        )}
      </svg>
      {seoul.c > 0 && (
        <div style={{ position: "absolute", left: GX + seoul.x + 24, top: GY + seoul.y - 52, display: "flex", alignItems: "center", gap: 10, opacity: interpolate(f, [28, 44], [0, 1], clamp) }}>
          <span style={{ width: 36, height: 2, background: R.accent }} />
          <Mono size={18} color={R.white}>Seoul · Classin Korea</Mono>
        </div>
      )}
    </AbsoluteFill>
  );
};

// 슬롯 숫자 — 각 자리가 몇 바퀴 돌고 제자리에 선다(돌 때는 세로 모션 블러)
const Roll: React.FC<{ text: string; at: number; size: number }> = ({ text, at, size }) => {
  const f = useCurrentFrame();
  let digitIndex = 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
      {Array.from(text).map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          return (
            <span key={i} style={{ opacity: interpolate(f - at, [10, 22], [0, 1], clamp) }}>
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        const k = digitIndex++;
        const p = interpolate(f - at - k * 4, [0, 40], [0, 1], { ...clamp, easing: easeOutExpo });
        const turns = 2 + k;
        const pos = (turns * 10 + d) * p;
        const speed = interpolate(f - at - k * 4, [0, 2, 34], [0, 1, 0], clamp);
        return (
          <span key={i} style={{ display: "inline-block", height: "1em", overflow: "hidden", position: "relative" }}>
            <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-pos}em)`, filter: speed > 0.15 ? `blur(${speed * 3}px)` : undefined }}>
              {Array.from({ length: turns * 10 + 10 }).map((_, n) => (
                <span key={n} style={{ height: "1em", lineHeight: 1 }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

const STATS = [
  { v: "160", unit: "+", label: "개국 서비스", en: "Countries" },
  { v: "6", unit: "만+", label: "교육기관", en: "Institutions" },
  { v: "5,000", unit: "만+", label: "교사 · 학습자", en: "Educators & learners" },
  { v: "3,000", unit: "만+", label: "월간 수업", en: "Sessions / month" },
];

export const S5Proof: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const edge = -8 + p * 116;
  const clip = `polygon(0 0, ${edge + 8}% 0, ${edge - 8}% 100%, 0 100%)`;
  const exit = interpolate(f, [206, 222], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const push = interpolate(f, [0, 222], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: p < 1 ? clip : undefined, transform: `scale(${1 + push * 0.03 - exit * 0.05})`, filter: `brightness(${1 - exit * 0.5})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 75% at 70% 52%, ${R.deep} 0%, ${R.night} 78%)` }} />
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${R.hair} 1px, transparent 1px), linear-gradient(90deg, ${R.hair} 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
            backgroundPosition: `${-f * 0.4}px 0`,
            opacity: 0.22,
          }}
        />
        <Globe />
        <Dust count={30} seed="proof" opacity={0.45} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,11,8,0.92) 0%, rgba(3,11,8,0.7) 36%, rgba(3,11,8,0) 56%)" }} />

        {/* 왼쪽 수치 */}
        <div style={{ position: "absolute", left: 130, top: 112, fontFamily: FONT_FAMILY, color: R.white }}>
          <MaskLine at={12} dur={26}>
            <Mono size={22} color={R.accent}>Classin worldwide</Mono>
          </MaskLine>
          <MaskLine at={16} dur={28} style={{ marginTop: 12 }}>
            <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.035em" }}>전 세계 교실이 쓰는 수업 플랫폼</div>
          </MaskLine>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column" }}>
            {STATS.map((s, i) => {
              const at = 28 + i * 18;
              const o = interpolate(f - at, [0, 10], [0, 1], clamp);
              const line = interpolate(f - at, [6, 40], [0, 1], { ...clamp, easing: easeOutExpo });
              return (
                <div key={s.label} style={{ opacity: o, paddingTop: 14, paddingBottom: 16, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
                    <span style={{ minWidth: 470, display: "inline-flex", alignItems: "flex-end" }}>
                      <Roll text={s.v} at={at} size={118} />
                      <span style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.04em", color: R.accent, marginLeft: 6, lineHeight: 1.08 }}>{s.unit}</span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 10 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>{s.label}</span>
                      <Mono size={15} color={R.faint}>{s.en}</Mono>
                    </span>
                  </div>
                  {i < STATS.length - 1 && <div style={{ position: "absolute", left: 0, bottom: 0, height: 1.5, width: 760 * line, background: `linear-gradient(90deg, rgba(${R.accentRgb},0.7), rgba(${R.accentRgb},0))` }} />}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 22, opacity: interpolate(f, [96, 112], [0, 1], clamp) }}>
            <Mono size={17} color={R.faint}>전 세계 누적 수치 · EEO 공식 소개 기준</Mono>
          </div>
        </div>
      </AbsoluteFill>
      {p < 1 && p > 0 && (
        <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${edge - 6}%`, width: "7%", background: R.accent, transform: "skewX(-9deg)", boxShadow: `0 0 80px rgba(${R.accentRgb},0.7)` }} />
      )}
    </AbsoluteFill>
  );
};
