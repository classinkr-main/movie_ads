import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOutExpo } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { Mono } from "../fx";
import { MaskLine } from "../type";
import { R } from "../theme";

/*
 * S5 스케일 (글로벌 900–1062f · 2.7s)
 * 연두 사선 스윕으로 들어와, 왼쪽에 EEO 공식 수치(160+ 개국 · 6만+ 교육기관 · 5,000만+ 교사·학습자)를
 * 슬롯처럼 굴려 세우고, 오른쪽엔 학원·쇼룸 사진 두 줄이 반대 방향으로 흐른다.
 * 수치 출처: classinkr-web docs/active/brand-canon/company-facts.md §3 — 화면 하단에 "EEO 공식 소개 기준" 캡션을 단다.
 */

// 슬롯 숫자 — 각 자리가 몇 바퀴 돌고 제자리에 선다
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
        const p = interpolate(f - at - k * 4, [0, 34], [0, 1], { ...clamp, easing: easeOutExpo });
        const turns = 2 + k;
        const pos = (turns * 10 + d) * p; // 0 → 최종 자리
        return (
          <span key={i} style={{ display: "inline-block", height: "1em", overflow: "hidden", position: "relative" }}>
            <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-pos}em)` }}>
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
  { v: "160", unit: "+", label: "개국 서비스" },
  { v: "6", unit: "만+", label: "교육기관" },
  { v: "5,000", unit: "만+", label: "교사 · 학습자" },
];

type Card = { k: "photo" | "video"; src: string };
const COL_A: Card[] = [
  { k: "photo", src: "academy-teacher" },
  { k: "photo", src: "showroom-presenter" },
  { k: "video", src: "greenboard" },
  { k: "photo", src: "academy-blue" },
  { k: "photo", src: "showroom-board" },
  { k: "photo", src: "academy-room2" },
];
const COL_B: Card[] = [
  { k: "video", src: "classroom" },
  { k: "photo", src: "academy-lecture" },
  { k: "photo", src: "showroom-tablet" },
  { k: "photo", src: "board-written" },
  { k: "photo", src: "academy-talk" },
  { k: "photo", src: "academy-dualboard" },
];
const CW = 380;
const CH = 470;
const CG = 22;

const Column: React.FC<{ cards: Card[]; x: number; dir: 1 | -1 }> = ({ cards, x, dir }) => {
  const f = useCurrentFrame();
  const travel = f * 2.6 * dir;
  const base = dir === 1 ? -(CH + CG) * 2.2 : -(CH + CG) * 0.6;
  return (
    <div style={{ position: "absolute", left: x, top: base + travel, display: "flex", flexDirection: "column", gap: CG }}>
      {cards.map((c, i) => (
        <div key={i} style={{ width: CW, height: CH, borderRadius: 26, overflow: "hidden", position: "relative", background: R.night2, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
          {c.k === "photo" ? (
            <Img src={staticFile(`reel/photos/${c.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85) contrast(1.06) brightness(0.88)" }} />
          ) : (
            <OffthreadVideo src={staticFile(`reel/video/${c.src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) brightness(0.9)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: R.forest, mixBlendMode: "soft-light", opacity: 0.45 }} />
        </div>
      ))}
    </div>
  );
};

export const S5Proof: React.FC = () => {
  const f = useCurrentFrame();
  // 진입 — 사선 스윕(연두 띠가 앞장선다)
  const p = interpolate(f, [0, 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const edge = -8 + p * 116;
  const clip = `polygon(0 0, ${edge + 8}% 0, ${edge - 8}% 100%, 0 100%)`;
  // 퇴장 — 살짝 밀려 들어가며 어두워진다(S6 아이리스가 덮는다)
  const exit = interpolate(f, [146, 162], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: p < 1 ? clip : undefined, transform: `scale(${1 - exit * 0.06})`, filter: `brightness(${1 - exit * 0.5})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 80% at 22% 50%, ${R.deep} 0%, ${R.night} 80%)` }} />
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${R.hair} 1px, transparent 1px), linear-gradient(90deg, ${R.hair} 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
            backgroundPosition: `${-f * 0.4}px 0`,
            opacity: 0.35,
          }}
        />
        {/* 오른쪽 사진 기둥 */}
        <div style={{ position: "absolute", left: 1010, top: -120, width: 1100, height: 1320, transform: "rotate(-7deg)", transformOrigin: "50% 50%" }}>
          <Column cards={COL_A} x={0} dir={1} />
          <Column cards={COL_B} x={CW + 30} dir={-1} />
        </div>
        <AbsoluteFill style={{ background: `linear-gradient(90deg, ${R.night} 0%, ${R.night} 46%, rgba(3,11,8,0.7) 56%, rgba(3,11,8,0) 70%)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(3,11,8,0.9) 0%, rgba(3,11,8,0) 18%, rgba(3,11,8,0) 82%, rgba(3,11,8,0.9) 100%)" }} />

        {/* 왼쪽 수치 */}
        <div style={{ position: "absolute", left: 130, top: 176, fontFamily: FONT_FAMILY, color: R.white }}>
          <MaskLine at={12} dur={22}>
            <Mono size={22} color={R.lime}>Classin worldwide</Mono>
          </MaskLine>
          <MaskLine at={16} dur={24} style={{ marginTop: 14 }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.035em" }}>전 세계 교실이 쓰는 수업 플랫폼</div>
          </MaskLine>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 26 }}>
            {STATS.map((s, i) => {
              const at = 24 + i * 12;
              const o = interpolate(f - at, [0, 10], [0, 1], clamp);
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 30, opacity: o }}>
                  <span style={{ minWidth: 580, display: "inline-flex", alignItems: "flex-end" }}>
                    <Roll text={s.v} at={at} size={150} />
                    {s.unit && <span style={{ fontSize: 96, fontWeight: 900, letterSpacing: "-0.04em", color: R.lime, marginLeft: 6, lineHeight: 1.05 }}>{s.unit}</span>}
                  </span>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "rgba(255,255,255,0.78)", letterSpacing: "-0.02em" }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 44, opacity: interpolate(f, [60, 76], [0, 1], clamp) }}>
            <Mono size={18} color={R.faint}>전 세계 누적 수치 · EEO 공식 소개 기준</Mono>
          </div>
        </div>
      </AbsoluteFill>
      {p < 1 && p > 0 && (
        <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${edge - 6}%`, width: "7%", background: R.lime, transform: "skewX(-9deg)", boxShadow: "0 0 80px rgba(200,240,90,0.7)" }} />
      )}
    </AbsoluteFill>
  );
};
