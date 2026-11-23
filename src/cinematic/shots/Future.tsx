import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { MONO_FONT } from "../fonts";
import { Dust, cl } from "../fx";
import { camera, path3 } from "../proj";
import type { V3 } from "../proj";
import { FONT, FadeIn, Hairline, LineUp, Roll, SweepText, Tracked } from "../type";
import { BAR_H, H, K, W, rgba } from "../theme";

// 내일 (360–480f) — 보드 속으로 들어가면 판서가 3D 홀로그램이 되어 있다.
// 칠판의 포물선 y = (x − 2)² + 1 은 회전 포물면의 단면으로 다시 나타난다.

const A = 0.5; // y = A·r²
const RMAX = 2;
const FLOOR = -0.62;
const RINGS = 8;
const MERIDIANS = 16;
const TAU = Math.PI * 2;

const ring = (r: number, y: number, seg = 72): V3[] => Array.from({ length: seg + 1 }, (_, i) => [r * Math.cos((i / seg) * TAU), y, r * Math.sin((i / seg) * TAU)] as V3);

/** 홀로그램 공간 — 바닥 그리드 · 회전 포물면 · AI 스캔 링 · 궤도 입자 */
export const HoloSpace: React.FC<{
  t: number; // 내일 구간 시작부터의 프레임
  cx: number;
  cy: number;
  focal?: number;
  build?: number; // 0~1 조립 진행
  dim?: number; // 전체 밝기
  tags?: boolean;
}> = ({ t, cx, cy, focal = 1400, build = 1, dim = 1, tags = true }) => {
  const orbit = -0.9 + t * 0.0075;
  const dist = 7.9 - Math.min(t, 120) * 0.006;
  const cam = camera([Math.sin(orbit) * dist, 2.45, Math.cos(orbit) * dist], [0, 0.82, 0], focal, cx, cy);
  const rot = t * 0.02;
  const flick = 0.93 + noise2D("holo-flick", t * 0.9, 0) * 0.07;
  const line = (pts: V3[]) => path3(cam, pts).d;

  // 바닥 그리드
  const grid: string[] = [];
  for (let i = -9; i <= 9; i++) {
    grid.push(line([[i, FLOOR, -9], [i, FLOOR, 9]]));
    grid.push(line([[-9, FLOOR, i], [9, FLOOR, i]]));
  }
  // 투사대 — 바닥의 동심원
  const base = [0.7, 1.35, 2.1].map((r) => line(ring(r, FLOOR)));

  // 포물면 와이어프레임
  const rings = Array.from({ length: RINGS }, (_, k) => {
    const r = ((k + 1) / RINGS) * RMAX;
    return { d: line(ring(r, A * r * r)), on: interpolate(build * RINGS, [k, k + 1], [0, 1], cl) };
  });
  const meridians = Array.from({ length: MERIDIANS }, (_, j) => {
    const a = rot + (j / MERIDIANS) * TAU;
    return line(Array.from({ length: 21 }, (_, i) => {
      const r = (i / 20) * RMAX;
      return [r * Math.cos(a), A * r * r, r * Math.sin(a)] as V3;
    }));
  });
  // 칠판의 포물선 — 포물면의 단면
  const section = line(
    Array.from({ length: 49 }, (_, i) => {
      const r = -RMAX + (i / 48) * RMAX * 2;
      return [r * Math.cos(rot), A * r * r, r * Math.sin(rot)] as V3;
    }),
  );
  const axis = line([[0, FLOOR, 0], [0, 2.75, 0]]);
  const vertex = cam.project([0, 0, 0]);
  const axisTop = cam.project([0, 2.75, 0]);
  const armA = cam.project([RMAX * Math.cos(rot), A * RMAX * RMAX, RMAX * Math.sin(rot)]);
  const armB = cam.project([-RMAX * Math.cos(rot), A * RMAX * RMAX, -RMAX * Math.sin(rot)]);
  const armTip = armA.x < armB.x ? armA : armB; // 화면 왼쪽 팔 끝

  // AI 스캔 — 링이 아래에서 위로 훑는다
  const scanT = ((t + 6) % 44) / 44;
  const scanY = scanT * A * RMAX * RMAX;
  const scanR = Math.sqrt(scanY / A);
  const scanD = line(ring(scanR, scanY, 64));
  const scanA = Math.sin(Math.PI * scanT) * build;

  // 궤도 입자
  const dots = Array.from({ length: 150 }, (_, i) => {
    const r1 = random(`hp-a${i}`);
    const r2 = random(`hp-b${i}`);
    const r3 = random(`hp-c${i}`);
    const a = r1 * TAU + t * (0.004 + r2 * 0.012) * (i % 2 ? 1 : -1);
    const rad = 2.4 + r2 * 2.6;
    const y = FLOOR + r3 * 3.6 + Math.sin(t / 30 + i) * 0.08;
    const q = cam.project([rad * Math.cos(a), y, rad * Math.sin(a)]);
    if (q.z < 0.5) return null;
    const size = Math.max(1, q.k * (0.012 + r1 * 0.02));
    const al = (0.25 + r3 * 0.6) * (0.6 + 0.4 * Math.sin(t / (8 + r2 * 10) + i)) * Math.min(1, 9 / q.z);
    return <circle key={i} cx={q.x} cy={q.y} r={size / 2} fill={i % 5 === 0 ? K.ice : K.holo} opacity={al * build} />;
  });

  const wire = rgba(K.holo, 0.55);
  const Tag: React.FC<{ x: number; y: number; dx: number; dy: number; children: React.ReactNode; at: number }> = ({ x, y, dx, dy, children, at }) => {
    const o = interpolate(build, [at, at + 0.2], [0, 1], cl);
    return (
      <div style={{ position: "absolute", left: 0, top: 0, opacity: o * dim }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={`M${x} ${y} L${x + dx * 0.55} ${y + dy} H${x + dx}`} stroke={rgba(K.holo, 0.8)} strokeWidth={1.5} fill="none" />
          <circle cx={x} cy={y} r={4} fill={K.holo} />
        </svg>
        <div style={{ position: "absolute", left: dx > 0 ? x + dx + 10 : undefined, right: dx > 0 ? undefined : W - (x + dx) + 10, top: y + dy - 22, fontFamily: MONO_FONT, fontSize: 25, fontWeight: 500, color: K.mintHot, whiteSpace: "nowrap", padding: "5px 12px", border: `1px solid ${rgba(K.holo, 0.55)}`, background: "rgba(3,14,14,0.6)", borderRadius: 6, letterSpacing: "0.02em" }}>{children}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ opacity: dim }}>
      {/* 바닥 그리드 — 멀어질수록 사라진다 */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, WebkitMaskImage: `radial-gradient(ellipse 62% 46% at ${(cx / W) * 100}% ${((cy + 150) / H) * 100}%, #000 0%, rgba(0,0,0,0.5) 46%, transparent 78%)` }}>
        {grid.map((d, i) => (
          <path key={i} d={d} stroke={rgba(K.holo, 0.2)} strokeWidth={1.2} fill="none" />
        ))}
      </svg>
      {/* 투사 빛 */}
      <div style={{ position: "absolute", left: vertex.x - 520, top: vertex.y - 380, width: 1040, height: 760, mixBlendMode: "screen", opacity: 0.9 * build, background: `radial-gradient(ellipse 50% 50% at 50% 56%, ${rgba(K.holo, 0.22)} 0%, ${rgba(K.green, 0.16)} 36%, transparent 70%)` }} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: flick, filter: `drop-shadow(0 0 5px ${rgba(K.holo, 0.9)}) drop-shadow(0 0 20px ${rgba(K.holo, 0.35)})` }}>
        {base.map((d, i) => (
          <path key={`b${i}`} d={d} stroke={rgba(K.holo, 0.75 - i * 0.2)} strokeWidth={i === 0 ? 3 : 1.6} fill={i === 0 ? rgba(K.holo, 0.1) : "none"} opacity={build} />
        ))}
        {meridians.map((d, i) => (
          <path key={`m${i}`} d={d} stroke={wire} strokeWidth={1.3} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, build * 1.15)} />
        ))}
        {rings.map((r, i) => r.on > 0.01 && <path key={`r${i}`} d={r.d} stroke={rgba(K.holo, 0.5 + (i === RINGS - 1 ? 0.4 : 0))} strokeWidth={i === RINGS - 1 ? 2.6 : 1.4} fill="none" opacity={r.on} />)}
        {/* 대칭축 */}
        <path d={axis} stroke={K.holo} strokeWidth={2} strokeDasharray="10 9" fill="none" opacity={build} />
        {/* 단면 포물선 */}
        <path d={section} stroke={K.mintHot} strokeWidth={5} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - interpolate(build, [0.25, 1], [0, 1], cl)} />
        {/* 스캔 링 */}
        {scanA > 0.02 && (
          <>
            <path d={scanD} stroke="#ffffff" strokeWidth={3.2} fill={rgba(K.holo, 0.1)} opacity={scanA} />
            <path d={scanD} stroke={K.ice} strokeWidth={9} fill="none" opacity={scanA * 0.3} />
          </>
        )}
        {/* 꼭짓점 */}
        <circle cx={vertex.x} cy={vertex.y} r={9} fill="#fff" opacity={build} />
        <circle cx={vertex.x} cy={vertex.y} r={12 + ((t % 30) / 30) * 34} stroke={K.holo} strokeWidth={2} fill="none" opacity={(1 - (t % 30) / 30) * build} />
        {dots}
      </svg>
      {/* 홀로그램 주사선 */}
      <div style={{ position: "absolute", left: vertex.x - 520, top: vertex.y - 520, width: 1040, height: 700, opacity: 0.5, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.34) 0 1px, transparent 1px 4px)", WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 60%, #000 30%, transparent 75%)" }} />

      {tags && (
        <>
          <Tag x={vertex.x} y={vertex.y} dx={170} dy={66} at={0.55}>
            꼭짓점 (2, 1)
          </Tag>
          <Tag x={axisTop.x} y={axisTop.y + 14} dx={150} dy={-18} at={0.7}>
            대칭축 x = 2
          </Tag>
          <Tag x={armTip.x} y={armTip.y} dx={90} dy={-78} at={0.85}>
            y = (x − 2)² + 1
          </Tag>
        </>
      )}
    </AbsoluteFill>
  );
};

const Backdrop: React.FC<{ children?: React.ReactNode; gx: number }> = ({ children, gx }) => (
  <AbsoluteFill style={{ background: "#020608" }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 70% at ${gx * 100}% 52%, rgba(10,70,66,0.5) 0%, rgba(6,36,40,0.3) 40%, transparent 74%)` }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(4,30,30,0.35) 80%, rgba(0,0,0,0.6) 100%)" }} />
    {children}
  </AbsoluteFill>
);

const EraEyebrow: React.FC<{ ko: string; en: string; at?: number }> = ({ ko, en, at = 2 }) => (
  <FadeIn at={at} y={0} x={-14} dur={10}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
      <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: K.holo, letterSpacing: "0.02em" }}>{ko}</span>
      <Hairline at={at + 1} width={56} dur={14} color={K.holo} />
      <Tracked size={21} color={K.dim} spacing={0.26}>
        {en}
      </Tracked>
    </div>
  </FadeIn>
);

/* ───────── 내일 ① — 홀로그램 수업 ───────── */

export const Tomorrow: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const build = interpolate(f, [1, 30], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const chips = ["AI 칠판", "AI 에이전트", "AI 강의 평가"];
  return (
    <Backdrop gx={0.33}>
      <Dust count={70} seed="tm" px={-f * 0.5} opacity={0.6} color={K.ice} near={0.14} />
      <HoloSpace t={f} cx={610} cy={600} build={build} />

      <div style={{ position: "absolute", left: 1168, top: 0, height: H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <EraEyebrow ko="내일" en="Tomorrow" at={3} />
        <FadeIn at={5} y={10}>
          <div style={{ fontFamily: FONT, fontSize: 50, fontWeight: 500, color: "rgba(244,246,242,0.8)", letterSpacing: "-0.015em", marginBottom: 10 }}>내일의 수업은,</div>
        </FadeIn>
        <div style={{ fontFamily: FONT, fontSize: 164, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1.06, textShadow: "0 10px 60px rgba(0,0,0,0.6)" }}>
          <LineUp at={8} dur={18}>
            AI가
          </LineUp>
          <LineUp at={16} dur={18}>
            <SweepText at={20} dur={30} from={K.holo} to={K.ice}>
              돕습니다.
            </SweepText>
          </LineUp>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 34 }}>
          {chips.map((c, i) => {
            const s = spring({ frame: f - 30 - i * 4, fps, config: { damping: 16, stiffness: 200, mass: 0.7 } });
            return (
              <span key={c} style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 16}px)`, fontFamily: FONT, fontSize: 28, fontWeight: 700, color: K.mintHot, padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${rgba(K.holo, 0.7)}`, background: "rgba(4,18,18,0.6)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                {c}
              </span>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
};

/* ───────── 내일 ② — AI 강의 평가(홀로그램 리포트) ───────── */

// 실제 리포트 화면(1062×700)의 오른쪽 분석 패널만 잘라 쓴다
const SRC = { w: 1062, h: 700 };
const CROP = { x: 532, y: 116, w: 530, h: 500 };
const CARDS: Array<[number, number, number, number]> = [
  [556, 383, 233, 105],
  [799, 383, 232, 105],
  [556, 498, 233, 105],
  [799, 498, 232, 105],
];

export const TomorrowAi: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(f, [0, 60], [0, 1]);
  const k = 1.42;
  const pw = CROP.w * k;
  const ph = CROP.h * k;
  const on = interpolate(f, [2, 10], [0, 1], cl);
  const scan = interpolate(f, [6, 32], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const scanOn = interpolate(f, [6, 9, 30, 34], [0, 1, 1, 0], cl);
  const ringP = interpolate(f, [10, 38], [0, 0.83], { ...cl, easing: Easing.out(Easing.cubic) });
  const badge = spring({ frame: f - 7, fps, config: { damping: 16, stiffness: 190, mass: 0.8 } });
  const R = 92;
  const CIRC = 2 * Math.PI * R;
  const flick = 0.92 + noise2D("rep-flick", f * 0.8, 3) * 0.08;

  return (
    <Backdrop gx={0.7}>
      <Dust count={60} seed="ta" px={push * 50} opacity={0.6} color={K.ice} near={0.14} />
      <HoloSpace t={60 + f} cx={1560} cy={640} focal={980} dim={0.42} tags={false} />

      <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "58% 50%" }}>
        <div style={{ position: "absolute", left: 960, top: (H - ph) / 2 - 2, width: pw, height: ph, transformStyle: "preserve-3d", transform: `translate3d(${push * 16}px, 0, ${push * 44}px) rotateY(${-18 + push * 3}deg) rotateX(2deg)` }}>
          {/* 홀로그램 패널 — 실제 UI를 반전·단색화해 빛으로 띄운다 */}
          <div style={{ position: "absolute", inset: 0, opacity: on * flick, borderRadius: 14, overflow: "hidden", border: `1.5px solid ${rgba(K.holo, 0.75)}`, boxShadow: `0 0 60px ${rgba(K.holo, 0.22)}, inset 0 0 60px ${rgba(K.holo, 0.1)}`, background: "rgba(2,16,16,0.72)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${staticFile("cinematic/ai-report.webp")})`, backgroundSize: `${SRC.w * k}px ${SRC.h * k}px`, backgroundPosition: `${-CROP.x * k}px ${-CROP.y * k}px`, filter: "invert(1) grayscale(1) contrast(1.35) brightness(1.05)", mixBlendMode: "screen" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${K.holo}, ${K.ice})`, mixBlendMode: "multiply" }} />
            {CARDS.map(([x, y, w, h], i) => {
              const hl = interpolate(f, [18 + i * 4, 23 + i * 4], [0, 1], cl);
              return <div key={i} style={{ position: "absolute", left: (x - CROP.x) * k, top: (y - CROP.y) * k, width: w * k, height: h * k, borderRadius: 12 * k, border: `2.5px solid ${K.mintHot}`, opacity: hl, boxShadow: `0 0 26px ${rgba(K.holo, 0.6)}, inset 0 0 22px ${rgba(K.holo, 0.2)}` }} />;
            })}
            <div style={{ position: "absolute", left: 0, top: scan * ph - 130, width: pw, height: 130, opacity: scanOn, background: `linear-gradient(180deg, transparent, ${rgba(K.holo, 0.28)} 85%, #ffffff 100%)` }} />
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 1px, transparent 1px 4px)" }} />
          </div>

          {/* 점수 — 패널 앞으로 떠오른다 */}
          <div style={{ position: "absolute", left: -214, top: ph - 318, width: 300, transform: `translateZ(${90 + badge * 60}px) scale(${0.7 + badge * 0.3})`, opacity: Math.min(1, badge * 1.6) }}>
            <div style={{ borderRadius: 26, background: "rgba(3,14,14,0.9)", border: `1.5px solid ${rgba(K.holo, 0.7)}`, boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 60px ${rgba(K.holo, 0.25)}`, padding: "26px 26px 22px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", width: 220, height: 220 }}>
                <svg width={220} height={220} viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={110} cy={110} r={R} stroke={rgba(K.white, 0.12)} strokeWidth={12} fill="none" />
                  <circle cx={110} cy={110} r={R} stroke={K.holo} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC * ringP} ${CIRC}`} style={{ filter: `drop-shadow(0 0 10px ${rgba(K.holo, 0.85)})` }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1 }}>
                    <Roll to={83} at={10} dur={28} />
                  </span>
                  <span style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 500, color: K.dim, letterSpacing: "0.14em", marginTop: 4 }}>AI EVAL.</span>
                </div>
              </div>
              <div style={{ marginTop: 14, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: K.holo, letterSpacing: "-0.01em" }}>4개 영역 · 11개 항목</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 150, top: 0, width: 760, height: H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <EraEyebrow ko="내일" en="AI Lecture Report" at={2} />
        <div style={{ fontFamily: FONT, fontSize: 128, fontWeight: 800, color: K.white, letterSpacing: "-0.05em", lineHeight: 1.08, whiteSpace: "nowrap", textShadow: "0 10px 50px rgba(0,0,0,0.6)" }}>
          <LineUp at={4} dur={18}>
            AI 강의 평가
          </LineUp>
        </div>
        <FadeIn at={13} y={12} dur={12} style={{ marginTop: 24 }}>
          <div style={{ fontFamily: FONT, fontSize: 37, fontWeight: 500, color: "rgba(244,246,242,0.76)", letterSpacing: "-0.02em", lineHeight: 1.45 }}>
            수업이 끝나면,
            <br />
            <b style={{ color: K.white, fontWeight: 700 }}>AI가 바로 평가합니다.</b>
          </div>
        </FadeIn>
      </div>
      <FadeIn at={20} y={0} dur={10} style={{ position: "absolute", left: 150, bottom: BAR_H + 40 }}>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, color: K.faint, letterSpacing: "0.04em" }}>* 실제 리포트 화면을 바탕으로 한 연출</div>
      </FadeIn>
    </Backdrop>
  );
};
