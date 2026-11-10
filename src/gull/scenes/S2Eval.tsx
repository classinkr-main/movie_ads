import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Gull, Pencil } from "../Gull";
import { Label, SArrow, SEllipse, SLine, SRect, Stroke, ease, pop, prog, useBoil } from "../Ink";
import { Note, Under } from "../Lettering";
import { hop } from "../motion";
import { Canvas, Paper } from "../Paper";
import { Badge, Burst, Glyph, Motes, PageMark, Sheet, TitleLine } from "../parts";
import { check, roughEllipse, roughLine, sparkle, wave } from "../sketch";
import type { Pt } from "../sketch";
import { JUA, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// 타이밍
const BELL = 60;
const FLOW = 66;
const TITLE_B = 90;
const SHEET = 105;
const TAGS = 150;
const RULER = 195;
const NOTE2 = 210;
const CLOCK = 225;
const CHEER = 250;

// 교실 창 6개
const CW = 196;
const CH = 150;
const ROOMS = [
  { name: "수학 A반", score: 88 },
  { name: "영어 B반", score: 91 },
  { name: "국어 A반", score: 84 },
  { name: "과학 A반", score: 93 },
  { name: "수학 B반", score: 76 },
  { name: "영어 A반", score: 89 },
].map((r, i) => ({ ...r, x: 120 + (i % 3) * 218, y: 286 + Math.floor(i / 3) * 216 }));

const AI: Pt = [900, 470];

// 리포트 종이
const SX = 1100;
const SY = 248;
const SW = 566;
const SH = 700;
const AREAS = [
  { label: "수업 전달", score: 92 },
  { label: "수업 분위기", score: 88 },
  { label: "수업 상호작용", score: 81 },
  { label: "언어 표현", score: 90 },
];

const GX = 936;
const GY = 1014;

// S2 — 특장점 02: 수업이 끝나면, AI가 바로 평가합니다
export const S2Eval: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();

  const sheetP = pop(frame - SHEET, { damping: 16, stiffness: 150, mass: 0.8 });
  const sx = AI[0] + (SX + SW / 2 - AI[0]) * sheetP;
  const sy = AI[1] + (SY + SH / 2 - AI[1]) * sheetP;
  const c = (from: number, dur: number) => prog(frame, SHEET + from, dur, ease.out);
  const scoreP = c(21, 24);
  const score = Math.round(88 * scoreP);

  // 갈매기 연기
  const puzzled = frame < BELL;
  const processing = frame >= BELL && frame < SHEET + 10;
  const reading = frame >= SHEET + 10 && frame < TAGS + 10;
  const happy = frame >= TAGS + 30;
  const cheer = hop(frame, CHEER, { height: 80, air: 13 });
  const startle = hop(frame, BELL, { height: 34, air: 8, ant: 2, land: 5 });
  const lookX = puzzled ? Math.sin(frame * 0.16) * 6 : processing ? 0 : reading ? 6 : frame < RULER + 20 ? -6 : 3;
  const lookY = processing ? -5 : -1;
  const shrug = puzzled ? 36 + Math.sin(frame * 0.3) * 6 : 68;
  const wingR = frame >= CHEER ? -46 + Math.sin(frame * 0.3) * 8 : reading ? -8 : puzzled ? shrug : 40;
  const wingL = puzzled ? shrug : frame >= RULER && frame < CLOCK ? -20 : 68;

  const aiP = pop(frame - (BELL + 2));
  const aiSpin = processing ? (frame - BELL) * 7 : 0;
  const aiPulse = processing ? 1 + Math.sin((frame - BELL) * 0.6) * 0.05 : 1;

  return (
    <Paper>
      <Canvas>
        <Badge x={118} y={120} text="02" at={6} seed="b2" />

        {/* ── 교실 6곳 ── */}
        {ROOMS.map((r, i) => {
          const d = prog(frame, 4 + i * 3, 12);
          const ink = prog(frame, 8 + i * 3, 12);
          const tag = pop(frame - (TAGS + i * 7.5));
          const low = r.score < 80;
          return (
            <g key={r.name}>
              <SRect x={r.x} y={r.y} width={CW} height={CH} r={10} seed={`rm${i}`} fill={P.sheet} draw={d} ink={ink} w={4.5} />
              {/* 작은 칠판 */}
              <SRect x={r.x + 18} y={r.y + 18} width={104} height={58} seed={`rb${i}`} fill={P.board} draw={d} ink={ink} w={3.5} twice={false} off={[0, 0]} />
              <Stroke d={wave(r.x + 30, r.y + 40, 60, `rw${i}`, { amp: 2.5, len: 18 })} color={P.chalk} w={3} draw={ink} />
              <Stroke d={wave(r.x + 30, r.y + 58, 40, `rv${i}`, { amp: 2.5, len: 18 })} color={P.lime} w={3} draw={ink} />
              {/* 선생님 */}
              {d > 0.8 && (
                <g>
                  <circle cx={r.x + 156} cy={r.y + 42} r={13} fill={P.limeLight} stroke={P.ink} strokeWidth={3.5} />
                  <Stroke d={roughLine([r.x + 156, r.y + 56], [r.x + 156, r.y + 92], `rt${i}:${boil}`, 0.4)} w={4} />
                  <Stroke d={roughLine([r.x + 156, r.y + 66], [r.x + 130, r.y + 54 + Math.sin(frame * 0.3 + i) * 5], `ra${i}:${boil}`, 0.4)} w={4} />
                </g>
              )}
              {/* 학생들 */}
              {[0, 1, 2, 3].map((k) => (ink > 0.5 + k * 0.1 ? <circle key={k} cx={r.x + 36 + k * 34} cy={r.y + 118} r={11} fill={P.paper2} stroke={P.ink} strokeWidth={3.5} /> : null))}
              <Label x={r.x + CW / 2} y={r.y + CH + 36} size={32} anchor="middle" color={P.ink2} p={ink}>
                {r.name}
              </Label>
              {/* 점수 태그 */}
              {frame >= TAGS + i * 7.5 && (
                <g transform={`translate(${r.x + CW - 8} ${r.y + 6}) scale(${0.2 + 0.8 * tag}) rotate(${8 + (1 - tag) * 40})`}>
                  <path d={`${roughEllipse(0, 0, 38, 38, `tg${i}f`, { overlap: 0, rough: 0.5 })}Z`} fill={low ? P.note : P.lime} transform="translate(3 3)" />
                  <Stroke d={roughEllipse(0, 0, 38, 38, `tg${i}:${boil}`, { overlap: 0.12, rough: 0.8 })} w={4.5} />
                  <text x={0} y={14} textAnchor="middle" fontFamily={JUA} fontSize={40} fill={P.ink}>
                    {r.score}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 수업 끝! */}
        {frame >= BELL && frame < SHEET + 24 && (
          <g opacity={interpolate(frame, [SHEET + 14, SHEET + 24], [1, 0], CLAMP)}>
            <Label x={436} y={250} size={58} font={JUA} anchor="middle" color={P.forest} rotate={-3} p={pop(frame - BELL)} weight={400}>
              딩동— 수업 끝!
            </Label>
          </g>
        )}
        <Burst x={436} y={230} at={BELL} r={190} n={12} color={P.limeDeep} />

        {/* 수업 → AI */}
        <Motes from={ROOMS.map((r) => [r.x + CW / 2, r.y + CH / 2] as const)} to={[AI]} at={FLOW} n={30} dur={22} seed="ev" arc={-70} r={9} spread={30} stagger={1.1} colors={[P.lime, P.chalk, P.limeDeep]} />

        {/* AI 배지 */}
        {frame >= BELL + 2 && (
          <g transform={`translate(${AI[0]} ${AI[1]}) scale(${(0.2 + 0.8 * aiP) * aiPulse})`}>
            <g transform={`rotate(${aiSpin})`}>
              {[0, 1, 2].map((k) => {
                const a = (k / 3) * Math.PI * 2;
                return <path key={k} d={sparkle(Math.cos(a) * 112, Math.sin(a) * 112, 20, `aisp${k}`)} fill={P.note} stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />;
              })}
            </g>
            <path d={`${roughEllipse(0, 0, 78, 78, "aif", { overlap: 0, rough: 0.5 })}Z`} fill={P.lime} transform="translate(4 5)" />
            <Stroke d={roughEllipse(0, 0, 78, 78, `ai:${boil}`, { overlap: 0.14 })} w={5.5} />
            <text x={0} y={24} textAnchor="middle" fontFamily={JUA} fontSize={70} fill={P.ink}>
              AI
            </text>
          </g>
        )}

        {/* ── 리포트 한 장 ── */}
        {frame >= SHEET && (
          <g transform={`translate(${sx} ${sy}) rotate(${2 - (1 - sheetP) * 30}) scale(${0.12 + 0.88 * sheetP}) translate(${-SW / 2} ${-SH / 2})`}>
            <Sheet x={0} y={0} w={SW} h={SH} seed="rep" fold={54} lw={5}>
              <Label x={42} y={84} size={50} font={JUA} weight={400} p={c(12, 6)}>
                AI 강의 평가 리포트
              </Label>
              <Label x={44} y={130} size={34} color={P.ink2} p={c(16, 6)}>
                수학 A반 · 60분 수업 (예시)
              </Label>
              <Stroke d={wave(40, 156, 480, `rdiv:${boil}`, { amp: 3, len: 70 })} color={P.pencil} w={3.5} draw={c(18, 10)} />

              {/* 종합 점수 링 */}
              <Stroke d={roughEllipse(140, 290, 88, 88, "ringbase", { overlap: 0.04, rough: 0.6 })} color={P.paper2} w={22} draw={c(20, 8)} />
              <Stroke d={roughEllipse(140, 290, 88, 88, `ring:${boil}`, { overlap: 0, rough: 0.7, start: -Math.PI / 2 })} color={P.limeDeep} w={20} draw={scoreP * 0.88} />
              <text x={140} y={312} textAnchor="middle" fontFamily={JUA} fontSize={84} fill={P.forest} opacity={c(20, 4)}>
                {score}
              </text>
              <Label x={140} y={424} size={34} anchor="middle" color={P.ink2} p={c(24, 6)}>
                종합 점수
              </Label>

              {/* 영역 4개 */}
              {AREAS.map((a, i) => {
                const y = 214 + i * 60;
                const bp = c(30 + i * 7, 16);
                return (
                  <g key={a.label}>
                    <Label x={270} y={y} size={32} color={P.ink} p={c(28 + i * 7, 6)}>
                      {a.label}
                    </Label>
                    <Stroke d={roughLine([272, y + 20], [520, y + 20], `ab${i}`, 0.3)} color={P.paper2} w={13} draw={c(28 + i * 7, 8)} />
                    <Stroke d={roughLine([272, y + 20], [272 + 248 * (a.score / 100), y + 20], `af${i}:${boil}`, 0.3)} color={a.score < 85 ? P.noteDeep : P.limeDeep} w={13} draw={bp} />
                    <text x={524} y={y} textAnchor="end" fontFamily={JUA} fontSize={30} fill={P.ink} opacity={bp}>
                      {Math.round(a.score * bp)}
                    </text>
                  </g>
                );
              })}

              <Stroke d={wave(40, 462, 480, `rdiv2:${boil}`, { amp: 3, len: 70 })} color={P.pencil} w={3.5} draw={c(54, 10)} />

              {/* 강점 · 개선 */}
              <Stroke d={check(46, 496, 30, `ck:${boil}`)} color={P.limeDeep} w={7} draw={c(60, 8)} />
              <Label x={98} y={524} size={36} p={c(62, 6)}>
                강점 · 생활 예시로 개념을 쉽게
              </Label>
              <SArrow a={[44, 578]} b={[80, 578]} seed="imp" color={P.orangeDeep} draw={c(70, 8)} bend={0} head={13} w={6} />
              <Label x={98} y={590} size={36} p={c(72, 6)}>
                개선 · 발문이 앞줄에 집중
              </Label>

              {/* 수업 흐름 */}
              <Stroke d={roughLine([44, 644], [150, 644], "f1", 0.3)} color={P.lime} w={16} draw={c(80, 6)} />
              <Stroke d={roughLine([160, 644], [420, 644], "f2", 0.3)} color={P.limeDeep} w={16} draw={c(84, 8)} />
              <Stroke d={roughLine([430, 644], [520, 644], "f3", 0.3)} color={P.forest} w={16} draw={c(90, 6)} />
              <Label x={96} y={684} size={28} anchor="middle" color={P.ink2} p={c(84, 6)}>
                도입
              </Label>
              <Label x={290} y={684} size={28} anchor="middle" color={P.ink2} p={c(88, 6)}>
                전개
              </Label>
              <Label x={476} y={684} size={28} anchor="middle" color={P.ink2} p={c(92, 6)}>
                정리
              </Label>
            </Sheet>
          </g>
        )}
        <Burst x={SX + SW / 2} y={SY + SH / 2} at={SHEET + 8} r={420} n={14} w={6} />

        {/* 60분 → 한 장 */}
        {frame >= CLOCK && (
          <g>
            <SEllipse cx={1790} cy={338} rx={56} seed="clk" fill={P.sheet} draw={prog(frame, CLOCK, 10)} ink={prog(frame, CLOCK, 10)} w={5} />
            <SLine a={[1790, 338]} b={[1790, 300]} seed="ch1" w={5} draw={prog(frame, CLOCK + 6, 5)} />
            <SLine a={[1790, 338]} b={[1816, 352]} seed="ch2" w={5} draw={prog(frame, CLOCK + 9, 5)} />
            <Label x={1792} y={448} size={40} anchor="middle" color={P.ink2} p={pop(frame - (CLOCK + 8))}>
              60분 수업을
            </Label>
            <Label x={1794} y={514} size={54} font={JUA} anchor="middle" color={P.forest} rotate={-4} p={pop(frame - (CLOCK + 14))} weight={400}>
              한 장으로
            </Label>
            <SArrow a={[1800, 540]} b={[1690, 624]} seed="toSheet" draw={prog(frame, CLOCK + 18, 10)} bend={-0.3} w={5} />
          </g>
        )}

        {/* ── 같은 기준(자) ── */}
        {frame >= RULER && (
          <g>
            <SRect x={116} y={736} width={640} height={46} seed="ruler" fill={P.note} draw={prog(frame, RULER, 14)} ink={prog(frame, RULER + 2, 14)} w={4.5} twice={false} />
            {Array.from({ length: 25 }).map((_, k) => {
              const x = 136 + k * 25;
              const tall = k % 4 === 0;
              return prog(frame, RULER + 6 + k * 0.5, 3) > 0 ? <line key={k} x1={x} y1={738} x2={x + (k % 3) - 1} y2={738 + (tall ? 24 : 13)} stroke={P.ink} strokeWidth={3} strokeLinecap="round" /> : null;
            })}
          </g>
        )}

        {/* 갈매기 */}
        <Gull
          x={GX}
          y={GY}
          scale={1}
          lift={cheer.lift + startle.lift}
          squash={cheer.squash + startle.squash}
          wingL={wingL}
          wingR={wingR}
          eyes={happy ? "happy" : processing && frame < BELL + 14 ? "wide" : "auto"}
          look={[lookX, lookY]}
          beak={frame >= BELL && frame < BELL + 12 ? 0.8 : happy && frame < CHEER + 20 && frame >= CHEER ? 0.8 : 0}
          sweat={puzzled && frame > 16 ? 1 : 0}
          tuft={Math.sin(frame / 7) * 3}
          hold={<Pencil rotate={-58} />}
          blinkOffset={30}
        />
        <Glyph x={GX - 96} y={GY - 330} at={16} until={BELL - 2} text="?" size={92} rotate={-14} color={P.ink2} />
        <Glyph x={GX + 90} y={GY - 350} at={26} until={BELL - 2} text="?" size={70} rotate={12} color={P.pencil} />
      </Canvas>

      <TitleLine a="수업이 끝나면," b="AI가 바로 평가합니다" atA={14} atB={TITLE_B} markTo={6} seed="e" />

      {/* 아래 손메모 */}
      <Note delay={24} size={46} style={{ position: "absolute", left: 124, top: 800, opacity: interpolate(frame, [BELL - 2, BELL + 6], [1, 0], CLAMP) }} rotate={-1.5}>
        교실마다 다 들어가 볼 수는 없으니까…
      </Note>
      {frame >= NOTE2 && (
        <div style={{ position: "absolute", left: 124, top: 808 }}>
          <Note delay={NOTE2} size={46} color={P.ink} rotate={-1}>
            참관하지 않아도, 강사별 수업 품질을
          </Note>
          <Note delay={NOTE2 + 8} size={46} color={P.ink} rotate={-1} style={{ marginTop: 4 }}>
            <Under delay={NOTE2 + 20} duration={10} w={7}>
              <span style={{ fontFamily: JUA, fontWeight: 400, fontSize: 56, color: P.forest, letterSpacing: "-0.02em", wordSpacing: "0" }}>같은 기준</span>
            </Under>
            으로 봅니다
          </Note>
        </div>
      )}

      <PageMark page="03" />
    </Paper>
  );
};
