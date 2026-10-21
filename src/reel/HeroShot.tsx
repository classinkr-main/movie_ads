import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { quadToMatrix3d, type Pt } from "./homography";
import { ChalkFilter, GrainTiles, Mono, TexImg } from "./fx";
import { R } from "./theme";

/*
 * 히어로 샷 — 클래스인 쇼룸의 빈 전자칠판 사진(board-dual-blank) 위에 1920×1080 칠판 화면을 원근 매핑한다.
 * f = HERO_CLOCK 기준 프레임. 그리드 중앙 타일(S3)과 풀스크린(S4)이 같은 f를 넘겨 줌인이 끊기지 않는다.
 *
 * 칠판 화면 타임라인(f) — S4 풀스크린 도착은 f=96
 *   0–24     화면이 켜진다(스캔 라인), 상단 바·좌측 툴바·하단 페이지 스트립이 들어온다
 *   20–90    예문 타이핑 "I have lived in Seoul / for five years."
 *   96–126   have lived 마커 · have + p.p. 주석 · 화살표
 *   80–196   2021→Now 타임라인 — 스타일러스가 아크를 그리고, 점이 아크를 따라 이동 / 어휘 칩 / 동그라미 · 별 낙서 / Tip 메모 / 학생 질문
 *   196–222  지우개가 지나가며 분필 가루가 떨어지고, 지운 자리에 희미한 흔적이 남는다
 *   214–     헤드라인 "좋은 수업을, 강사의 개인기에서 / 학원의 시스템으로."
 * 질감: 분필 가루 얼룩·지운 판서 흔적(chalk.png), 화면 그레인, 분필 획 필터, 교실 유리 반사, 글레어, 가장자리 비네트.
 */

// 사진(2560×1920)을 1920 폭으로 깔았을 때의 칠판 화면 꼭짓점 — scripts/board_corners.py 로 검출한 값에서 2px 안쪽으로 줄였다
const PHOTO_W = 1920;
const PHOTO_H = 1440;
const QUAD: [Pt, Pt, Pt, Pt] = [
  [275, 374],
  [1714, 377],
  [1717, 1192],
  [272, 1201],
];
const SCREEN_W = 1920;
const SCREEN_H = 1080;
const MATRIX = quadToMatrix3d(SCREEN_W, SCREEN_H, QUAD);

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: easeOutExpo });
const smooth = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

/* ---------- 아이콘(선 아이콘, 36×36 기준) ---------- */
type IconName = "cursor" | "pen" | "marker" | "eraser" | "shapes" | "text" | "laser" | "image" | "clock" | "people" | "mic" | "chevL" | "chevR";
const Icon: React.FC<{ name: IconName; size?: number; color?: string; width?: number }> = ({ name, size = 36, color = "rgba(255,255,255,0.85)", width = 2.6 }) => {
  const p = { fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const body: Record<IconName, React.ReactNode> = {
    cursor: <path d="M9 6 L9 28 L15 22 L19 31 L23 29 L19 21 L27 21 Z" {...p} />,
    pen: (
      <>
        <path d="M8 28 L10 21 L24 7 L29 12 L15 26 Z" {...p} />
        <path d="M21 10 L26 15" {...p} />
      </>
    ),
    marker: (
      <>
        <path d="M11 25 L22 9 L28 13 L17 29 Z" {...p} />
        <path d="M8 31 L16 31" {...p} />
      </>
    ),
    eraser: (
      <>
        <path d="M6 22 L18 9 L29 20 L20 29 L11 29 Z" {...p} />
        <path d="M12 16 L23 27" {...p} />
      </>
    ),
    shapes: (
      <>
        <rect x={6} y={6} width={13} height={13} rx={2} {...p} />
        <circle cx={24} cy={24} r={7} {...p} />
      </>
    ),
    text: (
      <>
        <path d="M8 9 L28 9" {...p} />
        <path d="M18 9 L18 29" {...p} />
      </>
    ),
    laser: (
      <>
        <circle cx={18} cy={18} r={4} {...p} />
        <path d="M18 5 L18 9 M18 27 L18 31 M5 18 L9 18 M27 18 L31 18" {...p} />
      </>
    ),
    image: (
      <>
        <rect x={5} y={8} width={26} height={20} rx={3} {...p} />
        <path d="M8 25 L15 17 L21 23 L24 20 L29 25" {...p} />
        <circle cx={24} cy={14} r={2} {...p} />
      </>
    ),
    clock: (
      <>
        <circle cx={18} cy={18} r={12} {...p} />
        <path d="M18 11 L18 18 L23 21" {...p} />
      </>
    ),
    people: (
      <>
        <circle cx={14} cy={13} r={5} {...p} />
        <path d="M5 29 C6 22 22 22 23 29" {...p} />
        <path d="M24 9 C28 9 29 16 24 17 M27 22 C30 23 31 26 31 29" {...p} />
      </>
    ),
    mic: (
      <>
        <rect x={13} y={5} width={10} height={17} rx={5} {...p} />
        <path d="M9 18 C9 26 27 26 27 18 M18 25 L18 31" {...p} />
      </>
    ),
    chevL: <path d="M22 8 L12 18 L22 28" {...p} />,
    chevR: <path d="M14 8 L24 18 L14 28" {...p} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: "block", flexShrink: 0 }}>
      {body[name]}
    </svg>
  );
};

const Bars: React.FC<{ n?: number; color?: string }> = ({ n = 3, color = "rgba(255,255,255,0.85)" }) => (
  <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, height: 22 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <span key={i} style={{ width: 5, height: 6 + i * 5, borderRadius: 2, background: i < n ? color : "rgba(255,255,255,0.22)" }} />
    ))}
  </span>
);

/* ---------- 예시 영어 수업(현재완료) ---------- */
const LINE1: Array<{ t: string; key?: boolean }> = [{ t: "I " }, { t: "have lived", key: true }, { t: " in Seoul" }];
const LINE2 = "for five years.";
const LINE1_LEN = LINE1.reduce((n, s) => n + s.t.length, 0);
const LX = 190; // 본문 왼쪽 여백(좌측 툴바 오른쪽)
const TL_Y = 790; // 타임라인 기준선
const TL_X0 = 290;
const TL_X1 = 1090;
const ARC_H = 170;
// 3차 베지어 위 점과 접선 각도 — 아크를 이 점들로 그려서 스타일러스가 획 끝과 정확히 맞물린다
const arcAt = (u: number): [number, number, number] => {
  const p = [
    [TL_X0, TL_Y],
    [TL_X0 + 180, TL_Y - ARC_H],
    [TL_X1 - 180, TL_Y - ARC_H],
    [TL_X1, TL_Y],
  ];
  const a = (1 - u) ** 3;
  const b = 3 * (1 - u) ** 2 * u;
  const c = 3 * (1 - u) * u * u;
  const d = u ** 3;
  const x = a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0];
  const y = a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1];
  const dx = 3 * (1 - u) ** 2 * (p[1][0] - p[0][0]) + 6 * (1 - u) * u * (p[2][0] - p[1][0]) + 3 * u * u * (p[3][0] - p[2][0]);
  const dy = 3 * (1 - u) ** 2 * (p[1][1] - p[0][1]) + 6 * (1 - u) * u * (p[2][1] - p[1][1]) + 3 * u * u * (p[3][1] - p[2][1]);
  return [x, y, Math.atan2(dy, dx)];
};
const arcPath = (upTo: number) => {
  let d = "";
  const n = 64;
  for (let k = 0; k <= n; k++) {
    const [x, y] = arcAt((k / n) * upTo);
    d += `${k === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d;
};
const WORDS = ["for", "since", "already", "yet", "ever"];
const YEARS = ["2021", "2022", "2023", "2024", "2025", "Now"];

type Student = { n: string; c: string; hair: string; speak?: boolean; hand?: boolean };
const STUDENTS: Student[] = [
  { n: "지민", c: "#3FD39A", hair: "#16302A", speak: true },
  { n: "도윤", c: "#A7F3D0", hair: "#1D2B27", hand: true },
  { n: "서아", c: "#D6D3CC", hair: "#2A2420" },
];

const StudentTile: React.FC<{ s: Student; i: number; f: number }> = ({ s, i, f }) => {
  const { fps } = useVideoConfig();
  const k = sp(f - 30 - i * 8, fps, { damping: 15, stiffness: 200, mass: 0.7 });
  const hand = !!s.hand && f > 150;
  const speak = !!s.speak && f > 40 && f < 150;
  return (
    <div
      style={{
        width: 360,
        height: 200,
        borderRadius: 22,
        position: "relative",
        overflow: "hidden",
        transform: `translateX(${(1 - k) * 120}%)`,
        opacity: Math.min(1, k * 1.4),
        background: "linear-gradient(180deg, #26332E 0%, #18211E 100%)",
        boxShadow: hand ? `0 0 0 3px ${R.accent}, 0 0 26px rgba(${R.accentRgb},0.45)` : speak ? `0 0 0 3px rgba(${R.accentRgb},0.75)` : "0 0 0 2px rgba(255,255,255,0.1)",
      }}
    >
      {/* 방 — 창문 빛과 책장 */}
      <div style={{ position: "absolute", right: 22, top: 18, width: 96, height: 86, borderRadius: 8, background: "linear-gradient(160deg, rgba(255,246,226,0.35), rgba(255,246,226,0.06))", filter: "blur(3px)" }} />
      <div style={{ position: "absolute", left: 18, top: 30, width: 70, height: 110, display: "flex", gap: 5, opacity: 0.35 }}>
        {[30, 44, 26, 38].map((h, j) => (
          <span key={j} style={{ width: 12, height: h, marginTop: 110 - h, borderRadius: 2, background: ["#6B5B4A", "#3F5A4E", "#7A6A55", "#4E5A63"][j] }} />
        ))}
      </div>
      {/* 사람 */}
      <div style={{ position: "absolute", left: "50%", top: 124, width: 172, height: 110, marginLeft: -86, borderRadius: "86px 86px 0 0", background: `linear-gradient(180deg, ${s.c} 0%, rgba(0,0,0,0.25) 140%)`, opacity: 0.72 }} />
      <div style={{ position: "absolute", left: "50%", top: 40, width: 92, height: 98, marginLeft: -46, borderRadius: "46px 46px 42px 42px", background: "radial-gradient(circle at 40% 35%, #E9D8C8 0%, #C9B19C 70%, #A48D78 100%)" }} />
      <div style={{ position: "absolute", left: "50%", top: 34, width: 100, height: 44, marginLeft: -50, borderRadius: "50px 50px 18px 18px", background: s.hair }} />
      {/* 이름 · 마이크 · 신호 */}
      <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.45)", borderRadius: 999, padding: "4px 12px 4px 6px" }}>
        <Icon name="mic" size={24} color={speak ? R.accent : "rgba(255,255,255,0.85)"} width={3} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700, color: R.white }}>{s.n}</span>
        {speak && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
            {[0, 1, 2, 3].map((j) => (
              <span key={j} style={{ width: 4, height: 6 + Math.abs(Math.sin(f / 4 + j * 1.3)) * 12, borderRadius: 2, background: R.accent }} />
            ))}
          </span>
        )}
      </div>
      <div style={{ position: "absolute", left: 14, top: 12 }}>
        <Bars n={i === 2 ? 2 : 3} />
      </div>
      {hand && (
        <div style={{ position: "absolute", right: 14, top: 14, background: R.accent, color: R.accentInk, borderRadius: 999, padding: "4px 14px", fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, transform: `scale(${sp(f - 150, fps, { damping: 10, stiffness: 260, mass: 0.6 })})` }}>
          ✋ 질문
        </div>
      )}
      <GrainTiles w={360} h={200} opacity={0.35} tile={256} />
    </div>
  );
};

const Lesson: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const n1 = Math.round(interpolate(f, [20, 64], [0, LINE1_LEN], clamp));
  const n2 = Math.round(interpolate(f, [62, 90], [0, LINE2.length], clamp));
  const marker = ease(f, 96, 116);
  const note = sp(f - 104, fps, { damping: 13, stiffness: 220, mass: 0.6 });
  const noteArrow = ease(f, 108, 126);
  const base = ease(f, 80, 110);
  const arc = smooth(f, 112, 148);
  const arcLabel = ease(f, 140, 158);
  const dotU = smooth(f, 148, 196);
  const [dx, dy] = arcAt(dotU);
  const [sx, sy, sa] = arcAt(arc);
  const stylus = interpolate(f, [108, 114, 148, 156], [0, 1, 1, 0], clamp);
  const circ = ease(f, 152, 178);
  const star = ease(f, 160, 176);
  const sticky = sp(f - 164, fps, { damping: 12, stiffness: 150, mass: 0.8 });
  const bubble = f > 158 ? sp(f - 158, fps, { damping: 12, stiffness: 240, mass: 0.6 }) : 0;
  const caret = Math.floor(f / 15) % 2 === 0;
  let left = n1;
  const chalk = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <>
      <div style={{ position: "absolute", left: LX, top: 136, display: "flex", alignItems: "center", gap: 16 }}>
        <Mono size={22} color={R.accent}>{`Today's grammar · Present perfect`}</Mono>
      </div>
      {/* 예문 */}
      <div style={{ position: "absolute", left: LX, top: 268, fontFamily: FONT_FAMILY, fontSize: 96, fontWeight: 800, color: R.white, letterSpacing: "-0.02em", lineHeight: 1.12, whiteSpace: "pre", textShadow: "0 0 18px rgba(255,255,255,0.12)" }}>
        <div>
          {LINE1.map((seg) => {
            const shown = seg.t.slice(0, Math.max(0, Math.min(seg.t.length, left)));
            left -= seg.t.length;
            if (!seg.key) return <span key={seg.t}>{shown}</span>;
            return (
              <span key={seg.t} style={{ position: "relative", display: "inline-block", color: marker > 0.5 ? R.accent : R.white }}>
                <span style={{ position: "absolute", left: -6, right: -6, bottom: 6, height: 24, borderRadius: 6, background: `rgba(${R.accentRgb},0.26)`, transform: `scaleX(${marker})`, transformOrigin: "0 50%" }} />
                <span style={{ position: "relative" }}>{shown}</span>
              </span>
            );
          })}
          {n1 < LINE1_LEN && f > 20 && <span style={{ opacity: caret ? 1 : 0, color: R.accent }}>|</span>}
        </div>
        <div>
          {LINE2.slice(0, n2)}
          {n1 >= LINE1_LEN && n2 < LINE2.length && <span style={{ opacity: caret ? 1 : 0, color: R.accent }}>|</span>}
        </div>
      </div>
      {/* have + p.p. 주석 */}
      <div style={{ position: "absolute", left: 712, top: 192, transform: `scale(${note}) rotate(-2deg)`, transformOrigin: "0% 100%", opacity: Math.min(1, note * 1.5) }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 800, color: R.accentInk, background: R.accent, borderRadius: 999, padding: "8px 22px", boxShadow: `0 8px 24px rgba(${R.accentRgb},0.25)` }}>have + p.p.</span>
      </div>
      {/* 분필 획 — 화살표 · 동그라미 · 별 · 타임라인 */}
      <svg width={SCREEN_W} height={SCREEN_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <ChalkFilter id="chalkLesson" seed={5} />
        </defs>
        <g filter="url(#chalkLesson)">
          <path d="M700,224 C640,232 566,250 536,290" {...chalk} stroke={R.accent} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - noteArrow} />
          <path d="M522,274 L536,294 L554,280" {...chalk} stroke={R.accent} strokeWidth={6} opacity={noteArrow > 0.9 ? 1 : 0} />
          <ellipse cx={578} cy={434} rx={248} ry={64} transform="rotate(-3 578 434)" {...chalk} stroke="rgba(255,255,255,0.9)" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} />
          <path d="M890,122 L898,144 L920,146 L903,160 L909,182 L890,169 L871,182 L877,160 L860,146 L882,144 Z" {...chalk} stroke="rgba(255,255,255,0.85)" strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - star} />
          {/* 타임라인 기준선 · 눈금 */}
          <line x1={LX} y1={TL_Y} x2={LX + 1000 * base} y2={TL_Y} stroke="rgba(255,255,255,0.78)" strokeWidth={5} strokeLinecap="round" />
          {YEARS.map((y, i) => {
            const x = TL_X0 + (i * (TL_X1 - TL_X0)) / 5;
            return <line key={y} x1={x} y1={TL_Y - 14} x2={x} y2={TL_Y + 14} stroke={i === 5 ? R.accent : "rgba(255,255,255,0.7)"} strokeWidth={4} strokeLinecap="round" opacity={base > (i + 1) / 7 ? 1 : 0} />;
          })}
          {arc > 0 && <path d={arcPath(arc)} {...chalk} stroke={R.accent} strokeWidth={9} />}
        </g>
        {arc > 0 && <path d={arcPath(arc)} fill="none" stroke={`rgba(${R.accentRgb},0.35)`} strokeWidth={22} strokeLinecap="round" style={{ filter: "blur(8px)" }} />}
        <circle cx={TL_X0} cy={TL_Y} r={12 * base} fill={R.white} />
        <circle cx={TL_X1} cy={TL_Y} r={15 * base} fill={R.accent} />
        {f > 148 && f < 200 && <circle cx={dx} cy={dy} r={14} fill={R.white} style={{ filter: `drop-shadow(0 0 14px rgba(${R.accentRgb},0.9))` }} />}
      </svg>
      {YEARS.map((y, i) => (
        <div key={y} style={{ position: "absolute", left: TL_X0 + (i * (TL_X1 - TL_X0)) / 5 - 60, width: 120, textAlign: "center", top: TL_Y + 26, opacity: base > (i + 1) / 7 ? 1 : 0 }}>
          <Mono size={20} color={i === 5 ? R.accent : "rgba(255,255,255,0.7)"}>{y}</Mono>
        </div>
      ))}
      <div style={{ position: "absolute", left: (TL_X0 + TL_X1) / 2 - 170, top: TL_Y - ARC_H - 56, width: 340, textAlign: "center", opacity: arcLabel, transform: `translateY(${(1 - arcLabel) * 16}px)`, fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 700, color: R.white }}>
        for five years
      </div>
      {/* 스타일러스 — 아크 끝을 따라간다 */}
      {stylus > 0 && (
        <div style={{ position: "absolute", left: sx, top: sy, opacity: stylus, transform: `rotate(${(sa * 180) / Math.PI - 135}deg)`, transformOrigin: "0 0" }}>
          <div style={{ width: 16, height: 150, marginLeft: -8, borderRadius: "8px 8px 3px 3px", background: "linear-gradient(90deg, #D9DEDB 0%, #FFFFFF 45%, #AEB6B2 100%)", boxShadow: "6px 10px 18px rgba(0,0,0,0.45)", transform: "translateY(-150px)" }}>
            <div style={{ width: 16, height: 22, borderRadius: 3, background: R.accent, marginTop: 128 }} />
          </div>
        </div>
      )}
      {/* 어휘 칩 */}
      <div style={{ position: "absolute", left: LX, top: 890, display: "flex", gap: 18 }}>
        {WORDS.map((w, i) => {
          const k = sp(f - 124 - i * 7, fps, { damping: 14, stiffness: 230, mass: 0.6 });
          const on = i === 0;
          return (
            <span
              key={w}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 36,
                fontWeight: 700,
                color: on ? R.accentInk : R.white,
                background: on ? R.accent : "rgba(255,255,255,0.07)",
                border: on ? "none" : "2px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "8px 28px",
                transform: `scale(${k})`,
                opacity: Math.min(1, k * 1.5),
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {/* Tip 메모 — 종이 질감 + 테이프 */}
      {sticky > 0.01 && (
        <div style={{ position: "absolute", left: 1150, top: 500, width: 290, height: 196, transform: `translateY(${(1 - sticky) * -40}px) rotate(${-4 + (1 - sticky) * 10}deg)`, opacity: Math.min(1, sticky * 1.6), transformOrigin: "50% 0%" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(170deg, #F3EDD5 0%, #E6DDBE 100%)", boxShadow: "0 20px 34px rgba(0,0,0,0.42), inset 0 -14px 24px rgba(120,100,60,0.12)", overflow: "hidden" }}>
            <GrainTiles w={290} h={196} opacity={0.5} blend="multiply" tile={256} />
            <div style={{ position: "absolute", left: 24, top: 22, fontFamily: FONT_FAMILY, color: R.ink }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: R.forest }}>Tip!</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, lineHeight: 1.35 }}>
                for + 기간
                <br />
                since + 시점
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 92, top: -16, width: 110, height: 34, background: "rgba(255,255,255,0.5)", transform: "rotate(3deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
        </div>
      )}
      {/* 학생 타일 */}
      <div style={{ position: "absolute", right: 60, top: 150, display: "flex", flexDirection: "column", gap: 22 }}>
        {STUDENTS.map((s, i) => (
          <StudentTile key={s.n} s={s} i={i} f={f} />
        ))}
      </div>
      {bubble > 0 && (
        <div style={{ position: "absolute", right: 440, top: 392, background: R.white, color: R.ink, borderRadius: "22px 22px 4px 22px", padding: "14px 24px", fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 700, transform: `scale(${bubble})`, transformOrigin: "100% 100%", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          since랑 for, 언제 써요?
        </div>
      )}
    </>
  );
};

const Headline: React.FC<{ f: number }> = ({ f }) => {
  const l1 = ease(f, 214, 244);
  const l2 = ease(f, 230, 262);
  const und = interpolate(f, [252, 284], [0, 1], { ...clamp, easing: easeOutExpo });
  const sign = ease(f, 272, 298);
  return (
    <div style={{ position: "absolute", left: LX, top: 300, fontFamily: FONT_FAMILY, color: R.white }}>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: "-0.03em", transform: `translateY(${(1 - l1) * 110}%)` }}>좋은 수업을, 강사의 개인기에서</div>
      </div>
      <div style={{ overflow: "hidden", marginTop: 6, paddingBottom: 24 }}>
        <div style={{ fontSize: 172, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05, color: R.accent, transform: `translateY(${(1 - l2) * 110}%)`, textShadow: `0 0 40px rgba(${R.accentRgb},0.35)` }}>학원의 시스템으로.</div>
      </div>
      <svg width={1320} height={70} style={{ display: "block", marginTop: -30 }}>
        <defs>
          <ChalkFilter id="chalkHead" seed={9} />
        </defs>
        <path d="M8,36 C260,16 520,50 820,28 S1180,32 1300,22" fill="none" stroke={R.white} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - und} opacity={0.92} filter="url(#chalkHead)" />
      </svg>
      <div style={{ marginTop: 34, opacity: sign, transform: `translateY(${(1 - sign) * 20}px)` }}>
        <Mono size={30} color="rgba(255,255,255,0.7)">Classin · 수업 시스템 OS</Mono>
      </div>
    </div>
  );
};

// 지우개 — 펠트 지우개 블록 + 분필 가루 낙하
const WIPE_A = 196;
const WIPE_B = 222;
const wipeXAt = (f: number) => interpolate(f, [WIPE_A, WIPE_B], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }) * (SCREEN_W + 200) - 100;
const ChalkDust: React.FC<{ f: number }> = ({ f }) => {
  if (f < WIPE_A || f > WIPE_B + 40) return null;
  return (
    <>
      {Array.from({ length: 70 }).map((_, i) => {
        const t0 = WIPE_A + random(`dust-t${i}`) * (WIPE_B - WIPE_A);
        const age = f - t0;
        if (age < 0 || age > 40) return null;
        const x0 = wipeXAt(t0) + (random(`dust-x${i}`) - 0.5) * 50;
        const y0 = 150 + random(`dust-y${i}`) * 820;
        const y = y0 + age * 2.2 + age * age * 0.09;
        const x = x0 + age * (random(`dust-v${i}`) - 0.3) * 1.5;
        const size = 2 + random(`dust-s${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: 999, background: "rgba(240,246,242,0.85)", opacity: (1 - age / 40) * 0.8 }} />;
      })}
    </>
  );
};

const PAGES = 7;
const PageStrip: React.FC<{ bar: number }> = ({ bar }) => (
  <div style={{ position: "absolute", left: "50%", bottom: 24, transform: `translate(-50%, ${(1 - bar) * 160}%)`, display: "flex", gap: 16, alignItems: "center", background: "rgba(0,0,0,0.32)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: "12px 22px" }}>
    {["#FFFFFF", R.accent, "#FF6B5A", "#F5D28A"].map((c) => (
      <span key={c} style={{ width: 26, height: 26, borderRadius: 999, background: c, boxShadow: c === R.accent ? "0 0 0 4px rgba(255,255,255,0.9)" : "none" }} />
    ))}
    <span style={{ width: 2, height: 40, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
    <Icon name="chevL" size={28} />
    {Array.from({ length: PAGES }).map((_, i) => {
      const cur = i === 3;
      return (
        <div key={i} style={{ width: 92, height: 54, borderRadius: 8, background: R.board, border: `2px solid ${cur ? R.accent : "rgba(255,255,255,0.18)"}`, boxShadow: cur ? `0 0 16px rgba(${R.accentRgb},0.5)` : "none", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", left: 8, top: 9, width: 40 + ((i * 13) % 30), height: 4, borderRadius: 2, background: "rgba(255,255,255,0.55)" }} />
          <span style={{ position: "absolute", left: 8, top: 19, width: 26 + ((i * 17) % 40), height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }} />
          {cur ? (
            <svg width={92} height={54} style={{ position: "absolute", inset: 0 }}>
              <path d="M10,44 C30,24 60,24 80,44" fill="none" stroke={R.accent} strokeWidth={3} />
            </svg>
          ) : (
            <span style={{ position: "absolute", left: 8, top: 30, width: 50, height: 14, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
          )}
          <span style={{ position: "absolute", right: 5, bottom: 3, fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: 700, color: cur ? R.accent : "rgba(255,255,255,0.5)" }}>{4 + i}</span>
        </div>
      );
    })}
    <Icon name="chevR" size={28} />
    <span style={{ width: 2, height: 40, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
    <Mono size={20} color="rgba(255,255,255,0.75)">EDB 07 / 50</Mono>
  </div>
);

const TOOLS: IconName[] = ["cursor", "pen", "marker", "eraser", "shapes", "text", "laser", "image"];
const Toolbar: React.FC<{ bar: number }> = ({ bar }) => (
  <div style={{ position: "absolute", left: 30, top: 150, display: "flex", flexDirection: "column", gap: 14, alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 44, padding: "18px 14px", transform: `translateX(${(1 - bar) * -160}%)` }}>
    {TOOLS.map((t) => (
      <span key={t} style={{ width: 58, height: 58, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: t === "pen" ? R.accent : "transparent" }}>
        <Icon name={t} size={34} color={t === "pen" ? R.accentInk : "rgba(255,255,255,0.82)"} width={t === "pen" ? 3 : 2.6} />
      </span>
    ))}
  </div>
);

const TopBar: React.FC<{ f: number; bar: number }> = ({ f, bar }) => {
  const elapsed = 24 * 60 + 18 + Math.max(0, Math.floor(f / 60));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", padding: "0 44px", gap: 22, background: "linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.18))", borderBottom: "1.5px solid rgba(255,255,255,0.08)", transform: `translateY(${(1 - bar) * -100}%)` }}>
      <Img src={staticFile("brand/classin-mark.png")} style={{ height: 30, width: "auto" }} />
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 32, fontWeight: 800, color: R.white }}>Classin</span>
      <span style={{ width: 2, height: 30, background: "rgba(255,255,255,0.2)" }} />
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>English B반 · Unit 5 현재완료</span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: "6px 16px" }}>
        <Icon name="chevL" size={24} />
        <Mono size={20} color={R.white}>p.07 / 50</Mono>
        <Icon name="chevR" size={24} />
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name="clock" size={28} />
        <Mono size={22} color={R.white}>{`${mm}:${ss}`}</Mono>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name="people" size={30} />
        <Mono size={22} color={R.white}>12</Mono>
      </span>
      <Bars n={4} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 700, color: R.white, background: "rgba(255,77,61,0.14)", border: "1.5px solid rgba(255,77,61,0.45)", borderRadius: 999, padding: "6px 18px" }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: "#FF4D3D", opacity: Math.floor(f / 30) % 2 ? 0.35 : 1, boxShadow: "0 0 12px rgba(255,77,61,0.8)" }} />
        자동 녹화 중
      </span>
    </div>
  );
};

const BoardScreen: React.FC<{ f: number; push: number }> = ({ f, push }) => {
  const on = ease(f, 0, 24);
  const wipeX = wipeXAt(f);
  const bar = ease(f, 8, 36);
  const scan = interpolate(f, [0, 20], [0, 1], clamp);
  const wiping = f >= WIPE_A;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: SCREEN_W,
        height: SCREEN_H,
        transformOrigin: "0 0",
        transform: MATRIX,
        overflow: "hidden",
        background: `radial-gradient(ellipse 90% 80% at 40% 40%, ${R.board2} 0%, ${R.board} 60%, #0A1E17 100%)`,
        opacity: on,
        boxShadow: "0 0 160px rgba(63,211,154,0.22)",
      }}
    >
      {/* 칠판 질감 — 분필 가루 얼룩 · 지운 판서 흔적 */}
      <TexImg file="chalk.png" opacity={0.5} blend="screen" />
      {/* 판서 — 지우개 오른쪽은 선명, 왼쪽은 희미한 흔적만 남는다 */}
      <div style={{ position: "absolute", inset: 0, clipPath: wiping ? `inset(0 0 0 ${Math.max(0, wipeX)}px)` : undefined }}>
        <Lesson f={f} />
      </div>
      {wiping && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${Math.max(0, SCREEN_W - wipeX)}px 0 0)`, opacity: 0.075, filter: "blur(2px)" }}>
          <Lesson f={WIPE_A} />
        </div>
      )}
      {f >= WIPE_A && f <= WIPE_B + 2 && (
        <>
          <div style={{ position: "absolute", top: 96, bottom: 0, left: wipeX - 220, width: 240, background: "linear-gradient(90deg, rgba(240,246,242,0) 0%, rgba(240,246,242,0.1) 70%, rgba(240,246,242,0.2) 100%)" }} />
          <div style={{ position: "absolute", left: wipeX - 40, top: 330 + Math.sin(f / 3) * 30, width: 80, height: 250, borderRadius: 14, background: "linear-gradient(90deg, #3B3F3D, #5A5F5C)", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ position: "absolute", right: -8, top: 8, bottom: 8, width: 16, borderRadius: 6, background: R.accent, opacity: 0.9 }} />
          </div>
        </>
      )}
      <ChalkDust f={f} />
      {f >= 210 && <Headline f={f} />}
      {/* 화면 크롬 */}
      <TopBar f={f} bar={bar} />
      <Toolbar bar={bar} />
      <PageStrip bar={bar} />
      {/* 화면 그레인 · 교실 유리 반사 · 글레어 · 가장자리 */}
      <GrainTiles w={SCREEN_W} h={SCREEN_H} opacity={0.28} />
      <TexImg file="reflection.jpg" opacity={0.1} blend="screen" style={{ transform: `translateX(${-push * 60}px) scale(1.08)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.05) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 140px rgba(0,0,0,0.45)" }} />
      {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: scan * SCREEN_H - 120, height: 120, background: `linear-gradient(180deg, rgba(${R.accentRgb},0) 0%, rgba(${R.accentRgb},0.35) 80%, rgba(255,255,255,0.6) 100%)` }} />}
    </div>
  );
};

export const HeroShot: React.FC<{ f: number; push?: number; dim?: number }> = ({ f, push = 0, dim = 0 }) => {
  // 칠판 중앙(사진 좌표 995, 787 → 화면 995, 607)을 향해 밀고 들어간다
  const s = 1 + push * 0.12;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: R.night }}>
      <div style={{ position: "absolute", left: 0, top: -180, width: PHOTO_W, height: PHOTO_H, transform: `scale(${s})`, transformOrigin: "995px 787px" }}>
        <Img src={staticFile("reel/photos/board-dual-blank.jpg")} style={{ position: "absolute", inset: 0, width: PHOTO_W, height: PHOTO_H, filter: "saturate(0.8) contrast(1.06) brightness(0.8)" }} />
        <div style={{ position: "absolute", inset: 0, background: R.forest, mixBlendMode: "soft-light", opacity: 0.5 }} />
        {/* 화면 빛이 벽에 번진다 */}
        <div style={{ position: "absolute", left: 120, top: 260, width: 1740, height: 1060, borderRadius: "50%", background: `radial-gradient(ellipse at center, rgba(${R.accentRgb},${0.1 * ease(f, 0, 24)}) 0%, rgba(${R.accentRgb},0) 65%)`, mixBlendMode: "screen" }} />
        <BoardScreen f={f} push={push} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 52%, rgba(0,0,0,0) 55%, rgba(2,10,7,0.6) 100%)" }} />
      {dim > 0 && <AbsoluteFill style={{ background: R.night, opacity: dim }} />}
    </AbsoluteFill>
  );
};
