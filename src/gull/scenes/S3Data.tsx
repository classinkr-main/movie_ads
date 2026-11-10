import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { Gull, Pencil, flap } from "../Gull";
import { Label, SEllipse, SLine, SPoly, SRect, Scribble, Stroke, ease, handWidth, pop, prog, useBoil } from "../Ink";
import { Hand, Mark, Note } from "../Lettering";
import { hop, mix } from "../motion";
import { Canvas, Paper } from "../Paper";
import { Badge, Motes, PageMark, Sheet, TitleLine } from "../parts";
import { blob, roughEllipse, roughLine, roughPoly, spline, wave } from "../sketch";
import type { Pt } from "../sketch";
import { JUA, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// 타이밍
const TILE0 = 37.5;
const TILE_GAP = 7.5;
const CAPTION = 90;
const CARD0 = 105;
const CARD_GAP = 15;
const UP0 = 240; // 날아오르기 시작
const UP1 = 266;
const HEAD = 268;
const TRAIL0 = 272;
const TRAIL1 = 360;
const Q = [300, 323, 345];

// ── 데이터 타일 5개 ──
const TW = 284;
const TH = 236;
const TY = 286;
const TILES = ["수업 시간", "출석 · 참여", "특이사항", "네트워크 상태", "녹화 · 수업 데이터"].map((label, i) => ({ label, x: 350 + i * 306 }));

// ── 가치 카드 3장 ──
const VW = 492;
const VH = 276;
const VY = 664;
const VALUES = [
  { who: "원장님", head: "감이 아니라 기준으로", sub: "지점 · 반 · 학생까지 한눈에" },
  { who: "상담 선생님", head: "인상이 아니라 근거로", sub: "학부모 상담에 근거가 생깁니다" },
  { who: "시스템 담당자", head: "API로 우리 시스템과", sub: "데이터 구독 · 수업 정보 조회" },
].map((v, i) => ({ ...v, x: 336 + i * 514 }));

// ── 바다 위 상승 곡선 ──
const CURVE: Pt[] = [
  [130, 742],
  [420, 712],
  [700, 660],
  [980, 572],
  [1250, 446],
  [1480, 330],
  [1640, 262],
];

const TileDoodle: React.FC<{ i: number; p: number }> = ({ i, p }) => {
  const boil = useBoil();
  const d = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  if (i === 0) {
    // 시계 + 막대
    return (
      <g>
        <SEllipse cx={82} cy={94} rx={48} seed="tc" fill={P.limeSoft} draw={d(0, 0.5)} ink={d(0, 0.5)} w={4.5} />
        <SLine a={[82, 94]} b={[82, 62]} seed="tc1" w={4.5} draw={d(0.4, 0.6)} />
        <SLine a={[82, 94]} b={[106, 104]} seed="tc2" w={4.5} draw={d(0.5, 0.7)} />
        {[0, 1, 2].map((k) => (
          <Stroke key={k} d={roughLine([170 + k * 34, 140], [170 + k * 34, 140 - (36 + k * 26) * d(0.5 + k * 0.12, 0.8 + k * 0.1)], `tb${k}:${boil}`, 0.3)} color={P.limeDeep} w={20} cap="butt" draw={d(0.5 + k * 0.12, 0.6 + k * 0.12) > 0 ? 1 : 0} />
        ))}
        <SLine a={[152, 144]} b={[258, 144]} seed="tbl" w={4} draw={d(0.4, 0.7)} />
      </g>
    );
  }
  if (i === 1) {
    // 출석 점 격자
    return (
      <g>
        {Array.from({ length: 15 }).map((_, k) => {
          const cx = 54 + (k % 5) * 44;
          const cy = 52 + Math.floor(k / 5) * 44;
          const on = k !== 7 && k !== 13;
          const s = d(k * 0.05, k * 0.05 + 0.25);
          return s > 0 ? <circle key={k} cx={cx} cy={cy} r={15 * s} fill={on ? P.lime : P.sheet} stroke={P.ink} strokeWidth={3.5} strokeDasharray={on ? undefined : "5 5"} /> : null;
        })}
      </g>
    );
  }
  if (i === 2) {
    // 메모 + 느낌표
    return (
      <g>
        <SRect x={56} y={36} width={120} height={112} seed="tn" fill={P.note} draw={d(0, 0.5)} ink={d(0, 0.5)} w={4.5} twice={false} />
        <Stroke d={wave(72, 70, 84, `tn1:${boil}`, { amp: 3, len: 22 })} w={3.5} draw={d(0.4, 0.7)} color={P.ink2} />
        <Stroke d={wave(72, 96, 60, `tn2:${boil}`, { amp: 3, len: 22 })} w={3.5} draw={d(0.5, 0.8)} color={P.ink2} />
        <Stroke d={wave(72, 122, 72, `tn3:${boil}`, { amp: 3, len: 22 })} w={3.5} draw={d(0.6, 0.9)} color={P.ink2} />
        {d(0.6, 1) > 0 && (
          <g transform={`translate(214 92) scale(${d(0.6, 1)})`}>
            <path d={`${roughEllipse(0, 0, 34, 34, "tnb", { overlap: 0, rough: 0.5 })}Z`} fill={P.orange} />
            <Stroke d={roughEllipse(0, 0, 34, 34, `tnc:${boil}`, { overlap: 0.1, rough: 0.8 })} w={4} />
            <text x={0} y={17} textAnchor="middle" fontFamily={JUA} fontSize={48} fill={P.ink}>
              !
            </text>
          </g>
        )}
      </g>
    );
  }
  if (i === 3) {
    // 와이파이
    const arc = (r: number) => {
      const pts: Pt[] = [];
      for (let k = 0; k <= 6; k++) {
        const a = -Math.PI * 0.78 + (k / 6) * Math.PI * 0.56;
        pts.push([142 + Math.cos(a) * r, 150 + Math.sin(a) * r]);
      }
      return spline(pts);
    };
    return (
      <g>
        {d(0, 0.3) > 0 && <circle cx={142} cy={146} r={11 * d(0, 0.3)} fill={P.limeDeep} stroke={P.ink} strokeWidth={3.5} />}
        <Stroke d={arc(46)} color={P.limeDeep} w={11} draw={d(0.2, 0.5)} />
        <Stroke d={arc(82)} color={P.limeDeep} w={11} draw={d(0.4, 0.7)} />
        <Stroke d={arc(118)} color={P.lime} w={11} draw={d(0.6, 0.9)} />
      </g>
    );
  }
  // 녹화 화면
  return (
    <g>
      <SRect x={64} y={42} width={166} height={104} r={8} seed="tv2" fill={P.sheet} draw={d(0.2, 0.6)} ink={d(0.2, 0.6)} w={4} twice={false} />
      <SRect x={48} y={56} width={166} height={104} r={8} seed="tv" fill={P.board} draw={d(0, 0.5)} ink={d(0, 0.5)} w={4.5} twice={false} off={[0, 0]} />
      <SPoly
        pts={[
          [114, 84],
          [158, 108],
          [114, 132],
        ]}
        seed="tvp"
        fill={P.lime}
        w={4}
        rough={0.5}
        draw={d(0.5, 0.8)}
        ink={d(0.5, 0.8)}
      />
    </g>
  );
};

const ValueDoodle: React.FC<{ i: number; p: number }> = ({ i, p }) => {
  const boil = useBoil();
  const d = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  if (i === 0) {
    return (
      <g>
        {[0, 1, 2, 3].map((k) => (
          <Stroke key={k} d={roughLine([24 + k * 26, 92], [24 + k * 26, 92 - [30, 46, 38, 66][k]], `vb${k}:${boil}`, 0.3)} color={k === 3 ? P.limeDeep : P.lime} w={17} cap="butt" draw={d(k * 0.15, 0.4 + k * 0.15)} />
        ))}
        <SLine a={[8, 96]} b={[118, 96]} seed="vbl" w={4} draw={d(0, 0.4)} />
      </g>
    );
  }
  if (i === 1) {
    return (
      <g>
        <path d={`${roughEllipse(60, 50, 56, 40, "vsf", { overlap: 0, rough: 0.5 })}Z`} fill={P.sheet} transform="translate(3 3)" opacity={d(0, 0.3)} />
        <Stroke d={roughEllipse(60, 50, 56, 40, `vs:${boil}`, { overlap: 0.1, rough: 0.8 })} w={4.5} draw={d(0, 0.5)} />
        <Stroke d={roughPoly([[36, 84], [22, 106], [58, 90]], `vst:${boil}`, { rough: 0.5 })} w={4.5} draw={d(0.3, 0.6)} />
        <Stroke d={spline([[28, 62], [46, 52], [62, 58], [92, 34]])} color={P.limeDeep} w={6} draw={d(0.5, 0.9)} />
      </g>
    );
  }
  return (
    <g>
      <SRect x={2} y={30} width={44} height={44} r={8} seed="vp1" fill={P.lime} w={4} twice={false} draw={d(0, 0.4)} ink={d(0, 0.4)} />
      <SRect x={76} y={30} width={44} height={44} r={8} seed="vp2" fill={P.sheet} w={4} twice={false} draw={d(0.2, 0.6)} ink={d(0.2, 0.6)} />
      <Stroke d={wave(46, 52, 30, `vpw:${boil}`, { amp: 4, len: 14 })} color={P.limeDeep} w={5} draw={d(0.5, 0.9)} />
      <Label x={-14} y={62} size={28} anchor="end" color={P.ink2} p={d(0.6, 1)}>
        {"{ API }"}
      </Label>
    </g>
  );
};

// S3 — 그리고 하나 더: 쌓인 수업은, 데이터가 됩니다
export const S3Data: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();

  const curve = useMemo(() => spline(CURVE, false, 0.9), []);
  const curveLen = useMemo(() => getLength(curve), [curve]);

  // 날아오르기 — 세상이 아래로 내려간다
  const up = interpolate(frame, [UP0, UP1], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const boardY = up * 1240;
  const seaY = (up - 1) * 1240;

  // 궤적
  const trail = prog(frame, TRAIL0, TRAIL1 - TRAIL0, ease.inOut);
  const head = getPointAtLength(curve, curveLen * trail) ?? { x: CURVE[0][0], y: CURVE[0][1] };

  // 갈매기
  const crouch = interpolate(frame, [UP0 - 6, UP0], [0, 0.16], CLAMP);
  const flying = frame >= UP0;
  const landIn = prog(frame, 4, 16, ease.out);
  const startX = 176;
  const startY = 1004;
  // 날 때는 몸 한가운데가 곡선 끝에 오도록(선이 갈매기 뒤에서 뻗어 나온다)
  const bob = flying ? Math.sin(frame * 0.35) * 8 : 0;
  const gx = flying ? mix(startX, head.x + 10, prog(frame, UP0, TRAIL0 - UP0, ease.inOut)) : startX;
  const gy = flying ? mix(startY, head.y + 104, prog(frame, UP0, TRAIL0 - UP0, ease.inOut)) + bob : startY;
  const presenting = frame >= CARD0 && frame < UP0 - 8;
  const cheer = hop(frame, CARD0 + CARD_GAP * 2 + 10, { height: 56, air: 11 });
  const arrived = frame >= TRAIL1;

  return (
    <Paper>
      {/* ───────── 1부: 데이터 보드 ───────── */}
      {up < 1 && (
        <AbsoluteFill style={{ transform: `translateY(${boardY}px)` }}>
          <Canvas>
            <Badge x={118} y={120} text="+1" at={6} seed="b3" r={52} />

            {/* 매일의 수업 더미 */}
            <g opacity={prog(frame, 10, 8)}>
              <g transform="rotate(-5 200 400)">
                <Sheet x={120} y={318} w={164} h={128} seed="pl1" fold={22} lw={4} />
              </g>
              <g transform="rotate(4 200 420)">
                <SRect x={128} y={356} width={164} height={118} r={12} seed="pl2" fill={P.sheet} w={4} twice={false} />
                <SRect x={144} y={372} width={132} height={68} seed="pl2b" fill={P.board} w={3.5} twice={false} off={[0, 0]} />
                <SPoly
                  pts={[
                    [198, 392],
                    [226, 406],
                    [198, 420],
                  ]}
                  seed="pl2p"
                  fill={P.lime}
                  w={3.5}
                  rough={0.4}
                />
              </g>
              <Label x={206} y={520} size={36} anchor="middle" color={P.ink2}>
                매일의 수업
              </Label>
            </g>
            <Motes
              from={[
                [210, 400],
                [230, 430],
                [190, 380],
              ]}
              to={TILES.map((t) => [t.x + TW / 2, TY + TH / 2] as const)}
              at={TILE0 - 12}
              n={46}
              dur={24}
              seed="dt"
              arc={-110}
              r={9}
              stagger={1.25}
              colors={[P.lime, P.limeDeep, P.note]}
            />

            {/* 데이터 타일 */}
            {TILES.map((t, i) => {
              const at = TILE0 + i * TILE_GAP;
              if (frame < at) return null;
              const s = pop(frame - at);
              const dp = prog(frame, at + 4, 22, ease.linear);
              return (
                <g key={t.label} transform={`translate(${t.x + TW / 2} ${TY + TH / 2}) scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * (i % 2 ? 10 : -10) + (i % 2 ? 1 : -1)}) translate(${-TW / 2} ${-TH / 2})`}>
                  <SRect x={0} y={0} width={TW} height={TH} r={20} seed={`tile${i}`} fill={P.sheet} w={5} />
                  <TileDoodle i={i} p={dp} />
                  <Label x={TW / 2} y={TH - 22} size={i === 4 ? 36 : 40} font={JUA} anchor="middle" weight={400} p={prog(frame, at + 6, 6)}>
                    {t.label}
                  </Label>
                </g>
              );
            })}

            {/* 열쇠(권한) */}
            {frame >= CAPTION && (
              <g transform={`translate(372 594) rotate(-18) scale(${pop(frame - CAPTION)})`}>
                <SEllipse cx={0} cy={0} rx={17} seed="key" fill={P.note} w={4.5} />
                <SLine a={[17, 0]} b={[62, 0]} seed="key1" w={5} />
                <SLine a={[48, 0]} b={[48, 14]} seed="key2" w={5} />
                <SLine a={[60, 0]} b={[60, 12]} seed="key3" w={5} />
              </g>
            )}

            {/* 가치 카드 */}
            {VALUES.map((v, i) => {
              const at = CARD0 + i * CARD_GAP;
              if (frame < at) return null;
              const s = pop(frame - at, { damping: 13, stiffness: 190, mass: 0.7 });
              const dp = prog(frame, at + 8, 20, ease.linear);
              return (
                <g key={v.who} transform={`translate(${v.x + VW / 2} ${VY + VH / 2 + (1 - s) * 90}) rotate(${(i - 1) * 1.2}) translate(${-VW / 2} ${-VH / 2})`} opacity={Math.min(1, (frame - at) / 4)}>
                  <path d={`${roughPoly([[8, 12], [VW + 8, 12], [VW + 8, VH + 12], [8, VH + 12]], `vsh${i}`, { closed: true, rough: 0.4 })}Z`} fill={P.ink} opacity={0.09} />
                  <SRect x={0} y={0} width={VW} height={VH} r={24} seed={`val${i}`} fill={i === 1 ? P.limeSoft : P.sheet} w={5.5} />
                  {/* 누구에게 */}
                  <Scribble box={[34, 40, handWidth(v.who, 40) + 8, 26]} seed={`vw${i}`} gap={16} w={30} color={P.lime} draw={prog(frame, at + 4, 8)} />
                  <Label x={38} y={70} size={40} color={P.ink} p={prog(frame, at + 4, 6)}>
                    {v.who}
                  </Label>
                  <g transform={`translate(${VW - 150} 6)`}>
                    <ValueDoodle i={i} p={dp} />
                  </g>
                  <Label x={34} y={164} size={52} font={JUA} color={P.forest} weight={400} p={prog(frame, at + 10, 6)}>
                    {v.head}
                  </Label>
                  <Label x={36} y={226} size={36} color={P.ink2} p={prog(frame, at + 16, 6)}>
                    {v.sub}
                  </Label>
                </g>
              );
            })}
          </Canvas>

          <TitleLine a="쌓인 수업은," b="데이터가 됩니다" atA={16} atB={30} markTo={3} seed="d" />
          <Note delay={CAPTION} size={44} style={{ position: "absolute", left: 456, top: 566 }} rotate={-1}>
            관리자 권한이 허용된 범위에서, 수업마다 남는 기록
          </Note>
          <PageMark page="04" label="" />
        </AbsoluteFill>
      )}

      {/* ───────── 2부: 갈매기의 시선으로 ───────── */}
      {up > 0 && (
        <AbsoluteFill style={{ transform: `translateY(${seaY}px)` }}>
          <Canvas>
            {/* 해 */}
            <g>
              <path d={`${roughEllipse(1700, 806, 96, 96, "sunf", { overlap: 0, rough: 0.5 })}Z`} fill={P.note} />
              <Stroke d={roughEllipse(1700, 806, 96, 96, `sun:${boil}`, { overlap: 0.1 })} w={5} />
              {[-150, -120, -90, -60, -30].map((a, k) => {
                const r = (a * Math.PI) / 180;
                const pulse = 1 + Math.sin(frame * 0.2 + k) * 0.08;
                return <Stroke key={a} d={roughLine([1700 + Math.cos(r) * 122, 806 + Math.sin(r) * 122], [1700 + Math.cos(r) * 160 * pulse, 806 + Math.sin(r) * 160 * pulse], `ray${k}:${boil}`, 0.4)} w={5} color={P.noteDeep} />;
              })}
            </g>

            {/* 바다 */}
            <path d={`M-20,812 ${wave(-20, 812, 1960, "seaTop", { amp: 9, len: 150, phase: frame * 0.06 }).slice(1)} L1940,1100 L-20,1100Z`} fill={P.mint} />
            <Stroke d={wave(-20, 812, 1960, `seaTop`, { amp: 9, len: 150, phase: frame * 0.06 })} w={5} />
            {[0, 1, 2].map((k) => (
              <Stroke key={k} d={wave(60 + k * 220, 874 + k * 58, 1500 - k * 160, `sw${k}`, { amp: 7, len: 110, phase: frame * 0.08 + k * 2 })} color={P.sea} w={6} />
            ))}

            {/* 지점 섬들 */}
            {[
              { x: 330, y: 930, name: "본원" },
              { x: 880, y: 968, name: "A지점" },
              { x: 1380, y: 936, name: "B지점" },
            ].map((isl, k) => {
              const s = pop(frame - (UP1 - 8 + k * 6));
              const bobY = Math.sin(frame * 0.07 + k * 1.7) * 3;
              return (
                <g key={isl.name} transform={`translate(${isl.x} ${isl.y + bobY}) scale(${s})`}>
                  <path d={blob([[-104, 8], [-70, -18], [0, -28], [70, -18], [104, 8], [60, 24], [-60, 24]], `isl${k}`, 2)} fill={P.lime} />
                  <Stroke d={spline([[-104, 8], [-70, -18], [0, -28], [70, -18], [104, 8]])} w={4.5} />
                  <SRect x={-34} y={-78} width={68} height={54} seed={`ib${k}`} fill={P.sheet} w={4} twice={false} />
                  <SPoly
                    pts={[
                      [-44, -76],
                      [0, -112],
                      [44, -76],
                    ]}
                    seed={`ir${k}`}
                    fill={P.forest}
                    w={4}
                    rough={0.5}
                  />
                  <rect x={-9} y={-52} width={18} height={28} fill={P.limeDeep} stroke={P.ink} strokeWidth={3} />
                  <Label x={0} y={62} size={34} anchor="middle" color={P.ink2}>
                    {isl.name}
                  </Label>
                </g>
              );
            })}
            <Stroke d={spline([[440, 934], [620, 990], [770, 968]])} color={P.ink2} w={3.5} dash="4 13" opacity={0.7} />
            <Stroke d={spline([[990, 964], [1140, 906], [1270, 936]])} color={P.ink2} w={3.5} dash="4 13" opacity={0.7} />

            {/* 상승 곡선(갈매기가 지나간 자리) */}
            <path d={curve} fill="none" stroke={P.lime} strokeWidth={30} strokeLinecap="round" opacity={0.55} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trail} />
            <path d={curve} fill="none" stroke={P.limeDeep} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trail} />
            {CURVE.slice(0, -1).map((p, k) => {
              const at = k / (CURVE.length - 1);
              if (trail < at + 0.01) return null;
              const s = pop(frame - (TRAIL0 + (TRAIL1 - TRAIL0) * ease.inOut(at)) - 2);
              return <circle key={k} cx={p[0]} cy={p[1]} r={13 * Math.min(1.2, s)} fill={P.sheet} stroke={P.ink} strokeWidth={4.5} />;
            })}

            {/* 데이터가 답해 줄 질문들 */}
            {[
              { p: CURVE[2], x: 730, y: 752, text: "어느 반의 참여가 줄고 있을까?" },
              { p: CURVE[3], x: 1030, y: 664, text: "어떤 수업 방식이 잘 통할까?" },
              { p: CURVE[4], x: 1300, y: 572, text: "누구를 먼저 챙겨야 할까?" },
            ].map((q, k) => {
              const at = Q[k];
              if (frame < at) return null;
              return (
                <g key={k}>
                  <SLine a={[q.p[0] + 6, q.p[1] + 16]} b={[q.x + 20, q.y - 44]} seed={`ql${k}`} w={3.5} color={P.ink2} draw={prog(frame, at, 6)} />
                  <Scribble box={[q.x + 4, q.y - 30, handWidth(q.text, 46) - 8, 26]} seed={`qs${k}`} gap={15} w={28} color={P.limeLight} draw={prog(frame, at + 3, 9)} />
                  <Label x={q.x} y={q.y} size={46} color={P.ink} p={pop(frame - (at + 3))}>
                    {q.text}
                  </Label>
                </g>
              );
            })}
          </Canvas>

          <div style={{ position: "absolute", left: 118, top: 86 }}>
            <div>
              <Hand text="쌓일수록," size={112} delay={HEAD} seed="s1" />
            </div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", whiteSpace: "pre" }}>
              <Mark delay={HEAD + 22} duration={12} seed="sm">
                <Hand text="더 멀리" size={112} delay={HEAD + 10} seed="s2" color={P.forest} />
              </Mark>
              <Hand text=" 보입니다" size={112} delay={HEAD + 16} seed="s3" color={P.forest} />
            </div>
            <Note delay={HEAD + 40} size={50} style={{ marginTop: 26, marginLeft: 6 }} rotate={-1.5}>
              오늘의 수업 기록이, 내일의 운영 기준으로
            </Note>
          </div>
          <PageMark page="05" />
        </AbsoluteFill>
      )}

      {/* 갈매기(두 화면을 이어서 난다) */}
      <Canvas>
        <Gull
          x={gx}
          y={gy}
          scale={0.8}
          lift={(1 - landIn) * 700 + cheer.lift}
          squash={crouch * (flying ? 0 : 1) + cheer.squash + (flying ? -0.04 : 0)}
          rotate={flying ? (arrived ? 4 : 14) : 0}
          wingL={flying || frame < 18 ? flap(frame, 1.05) : 68}
          wingR={flying || frame < 18 ? flap(frame, 1.05) : presenting ? -30 + Math.sin(frame * 0.26) * 7 : 40}
          wingLen={flying || frame < 18 ? 1.32 : 1}
          feet={flying || frame < 16 ? "tuck" : "stand"}
          eyes={arrived || (frame >= CARD0 + CARD_GAP * 2 + 10 && frame < UP0 - 10) ? "happy" : "auto"}
          look={[flying ? 5 : 5, flying ? -3 : -3]}
          beak={presenting ? Math.max(0, Math.sin(frame * 0.6)) * 0.6 : 0}
          tuft={Math.sin(frame / 7) * 3 + (flying ? -12 : 0)}
          hold={<Pencil rotate={-58} />}
          shadow={flying ? 0 : landIn}
          blinkOffset={50}
        />
      </Canvas>
    </Paper>
  );
};
