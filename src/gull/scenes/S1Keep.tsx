import React, { useId, useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { Gull, Pencil } from "../Gull";
import { Label, SArrow, SEllipse, SLine, SPoly, SRect, Stroke, ease, pop, prog, useBoil } from "../Ink";
import { Note } from "../Lettering";
import { hop, mix } from "../motion";
import { Canvas, Paper } from "../Paper";
import { Badge, Burst, Glyph, Motes, PageMark, Sheet, Sticky, TitleLine } from "../parts";
import { roughLine, roughPoly, scribble, star, wave } from "../sketch";
import { GAEGU, JUA, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// 타이밍
const WRITE = 20; // 판서 시작
const ERASE0 = 90;
const ERASE1 = 120;
const FLY = 103; // 알갱이가 날아가기 시작
const CARD_A = 135;
const CARD_B = 143;
const TITLE_B = 120;
const NEXT = 152; // 다음 수업 판서
const STACK = 173;
const STICKY1 = 210;
const STICKY2 = 225;

// 칠판(전자칠판) 화면 영역
const BX = 150;
const BY = 282;
const BW = 760;
const BH = 460;

const GX = 848;
const GY = 1012;

// S1 — 특장점 01: 칠판은 지워져도, 수업은 남습니다
export const S1Keep: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();
  const id = useId().replace(/:/g, "");

  // 지우개가 지나가는 길
  const erasePath = useMemo(() => scribble(BX + 40, BY + 50, BW - 80, BH - 110, "erase", { gap: 118, angle: -3, rough: 0.5, over: 0 }), []);
  const eraseLen = useMemo(() => getLength(erasePath), [erasePath]);
  const eraseP = prog(frame, ERASE0, ERASE1 - ERASE0, ease.inOut);
  const er = getPointAtLength(erasePath, eraseLen * eraseP) ?? { x: BX, y: BY };
  const eraserIn = interpolate(frame, [ERASE0 - 10, ERASE0], [0, 1], CLAMP);
  const eraserOut = interpolate(frame, [ERASE1, ERASE1 + 10], [0, 1], CLAMP);

  // 판서 진행
  const w = (from: number, dur: number) => prog(frame, WRITE + from, dur, ease.out);
  const formula = "y = 2x + 1";
  const n2 = (from: number, dur: number) => prog(frame, NEXT + from, dur, ease.out);
  const formula2 = "a² + b² = c²";
  const typed2 = Math.max(0, Math.min(formula2.length, Math.floor((frame - NEXT - 4) / 1.5)));
  const typed = Math.max(0, Math.min(formula.length, Math.floor((frame - WRITE - 4) / 1.6)));

  // 갈매기 연기
  const land = prog(frame, 2, 16, ease.out);
  const landSq = interpolate(frame, [17, 20, 27], [0, 0.16, 0], CLAMP);
  const shock = frame >= ERASE0 + 2 && frame < ERASE1 + 4;
  const jump1 = hop(frame, ERASE0 + 2, { height: 46, air: 9, ant: 2, land: 6 });
  const cheer = hop(frame, STICKY2 + 6, { height: 70, air: 12 });
  const teaching = (frame >= 22 && frame < ERASE0) || (frame >= NEXT + 6 && frame < STICKY1 - 6);
  const watching = frame >= ERASE1 + 4 && frame < NEXT + 6;
  const happy = (frame >= CARD_B + 4 && frame < CARD_B + 30) || frame >= STICKY1 + 4;
  const talk = teaching ? Math.max(0, Math.sin((frame - 22) * 0.62)) * 0.7 : shock ? 0.9 : 0;
  const lookX = teaching || shock ? -5 : watching ? 5 : frame >= STICKY1 ? 4 : 0;
  let wingL = teaching ? -34 + Math.sin(frame * 0.3) * 7 : shock ? 8 : 68;
  let wingR = shock ? 8 : frame >= STICKY1 + 4 ? -44 + Math.sin(frame * 0.28) * 8 : 34;
  if (frame < 20) {
    wingL = mix(-50, 68, land) + Math.sin(frame * 1.2) * 30 * (1 - land);
    wingR = wingL;
  }
  const gLift = (1 - land) * 760 + jump1.lift + cheer.lift;

  const cardA = pop(frame - CARD_A);
  const cardB = pop(frame - CARD_B);
  const stackN = (k: number) => pop(frame - STACK - k * 7.5);

  const chalk = P.chalk;
  const lime = P.lime;

  return (
    <Paper>
      <Canvas>
        <Badge x={118} y={120} text="01" at={6} />

        {/* ── 전자칠판 ── */}
        {/* 받침대 */}
        <SLine a={[530, 770]} b={[530, 884]} seed="pole" w={7} draw={prog(frame, 8, 8)} />
        <SLine a={[368, 892]} b={[694, 892]} seed="base" w={7} draw={prog(frame, 12, 8)} />
        <SEllipse cx={392} cy={912} rx={15} seed="wh1" fill={P.ink2} draw={prog(frame, 16, 6)} ink={prog(frame, 16, 6)} w={4} />
        <SEllipse cx={670} cy={912} rx={15} seed="wh2" fill={P.ink2} draw={prog(frame, 17, 6)} ink={prog(frame, 17, 6)} w={4} />
        {/* 본체 */}
        <SRect x={BX - 22} y={BY - 22} width={BW + 44} height={BH + 44} r={18} seed="bezel" fill={P.paper2} draw={prog(frame, 2, 14)} ink={prog(frame, 6, 10)} w={6} />
        <SRect x={BX} y={BY} width={BW} height={BH} seed="screen" fill={P.board} draw={prog(frame, 6, 12)} ink={prog(frame, 8, 14)} w={5} twice={false} off={[0, 0]} />
        {/* AI 카메라 */}
        <SRect x={498} y={228} width={64} height={30} r={10} seed="cam" fill={P.ink2} draw={prog(frame, 14, 8)} ink={prog(frame, 14, 8)} w={4} twice={false} />
        {frame >= 22 && <circle cx={530} cy={243} r={7} fill={P.chalk} />}
        {frame >= 24 && (
          <g opacity={interpolate(frame, [24, 28], [0, 1], CLAMP)}>
            <circle cx={596} cy={243} r={9} fill={P.red} opacity={frame % 24 < 14 ? 1 : 0.25} />
            <Label x={614} y={254} size={32} color={P.red} font={GAEGU}>
              REC
            </Label>
            <Label x={486} y={252} size={30} color={P.ink2} anchor="end">
              AI 카메라
            </Label>
          </g>
        )}

        {/* ── 판서(지우개 마스크) ── */}
        <mask id={`${id}er`} maskUnits="userSpaceOnUse" x={BX} y={BY} width={BW} height={BH}>
          <rect x={BX} y={BY} width={BW} height={BH} fill="#fff" />
          {eraseP > 0.001 && <path d={erasePath} fill="none" stroke="#000" strokeWidth={170} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eraseP} />}
        </mask>
        {/* 지운 자국 */}
        {eraseP > 0.001 && (
          <g opacity={0.1}>
            <path d={erasePath} fill="none" stroke={chalk} strokeWidth={150} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eraseP} />
          </g>
        )}
        {eraseP < 0.999 && (
          <g mask={`url(#${id}er)`}>
            <Label x={BX + 40} y={BY + 62} size={38} color={chalk} opacity={0.85} p={w(0, 6)}>
              오늘의 수업 · 일차함수
            </Label>
            <Label x={BX + 44} y={BY + 168} size={92} color={chalk} p={typed > 0 ? 1 : 0}>
              {formula.slice(0, typed)}
            </Label>
            <Stroke d={wave(BX + 44, BY + 196, 340, `ul:${boil}`, { amp: 5, len: 60 })} color={lime} w={6} draw={w(22, 8)} />
            {/* 그래프 */}
            <Stroke d={roughLine([BX + 430, BY + 400], [BX + 720, BY + 400], `ax:${boil}`, 0.6)} color={chalk} w={5} draw={w(26, 8)} />
            <Stroke d={roughLine([BX + 480, BY + 430], [BX + 480, BY + 90], `ay:${boil}`, 0.6)} color={chalk} w={5} draw={w(30, 8)} />
            <Stroke d={roughLine([BX + 440, BY + 420], [BX + 660, BY + 110], `ln:${boil}`, 0.5)} color={lime} w={7} draw={w(38, 10)} />
            {w(46, 4) > 0 && <circle cx={BX + 480} cy={BY + 364} r={9} fill={chalk} />}
            {w(48, 4) > 0 && <circle cx={BX + 573} cy={BY + 232} r={9} fill={chalk} />}
            <Label x={BX + 600} y={BY + 250} size={36} color={lime} p={w(50, 6)}>
              기울기 2
            </Label>
            {/* 필기 줄 */}
            <Stroke d={wave(BX + 48, BY + 262, 300, `t1:${boil}`, { amp: 4, len: 34 })} color={chalk} w={4} opacity={0.75} draw={w(34, 10)} />
            <Stroke d={wave(BX + 48, BY + 304, 230, `t2:${boil}`, { amp: 4, len: 30 })} color={chalk} w={4} opacity={0.75} draw={w(40, 10)} />
            {/* 별표 */}
            <Stroke d={star(BX + 78, BY + 384, 30, `st:${boil}`)} color={lime} w={5} draw={w(52, 8)} />
            <Label x={BX + 122} y={BY + 400} size={48} color={lime} p={w(58, 6)}>
              중요!
            </Label>
          </g>
        )}

        {/* 다음 수업 — 칠판은 다시 쓰이고, 지난 수업은 오른쪽에 쌓인다 */}
        {frame >= NEXT && (
          <g>
            <Label x={BX + 40} y={BY + 62} size={38} color={chalk} opacity={0.85} p={n2(0, 6)}>
              다음 수업 · 피타고라스 정리
            </Label>
            <Label x={BX + 44} y={BY + 168} size={84} color={chalk} p={typed2 > 0 ? 1 : 0}>
              {formula2.slice(0, typed2)}
            </Label>
            <Stroke d={wave(BX + 44, BY + 196, 400, `ul2:${boil}`, { amp: 5, len: 60 })} color={lime} w={6} draw={n2(20, 8)} />
            <Stroke
              d={roughPoly(
                [
                  [BX + 470, BY + 400],
                  [BX + 690, BY + 400],
                  [BX + 690, BY + 230],
                ],
                `tri:${boil}`,
                { closed: true, rough: 0.6 },
              )}
              color={chalk}
              w={5.5}
              draw={n2(18, 16)}
            />
            <Stroke d={roughPoly([[BX + 662, BY + 400], [BX + 662, BY + 372], [BX + 690, BY + 372]], `sq:${boil}`, { rough: 0.4 })} color={lime} w={4} draw={n2(30, 6)} />
            <Label x={BX + 574} y={BY + 440} size={36} color={chalk} anchor="middle" p={n2(32, 5)}>
              a
            </Label>
            <Label x={BX + 712} y={BY + 326} size={36} color={chalk} p={n2(34, 5)}>
              b
            </Label>
            <Label x={BX + 548} y={BY + 300} size={36} color={lime} anchor="middle" p={n2(36, 5)}>
              c
            </Label>
            <Stroke d={wave(BX + 48, BY + 262, 280, `u1:${boil}`, { amp: 4, len: 34 })} color={chalk} w={4} opacity={0.75} draw={n2(24, 10)} />
            <Stroke d={wave(BX + 48, BY + 304, 200, `u2:${boil}`, { amp: 4, len: 30 })} color={chalk} w={4} opacity={0.75} draw={n2(30, 10)} />
          </g>
        )}

        {/* 지우개 */}
        {eraserIn > 0 && eraserOut < 1 && (
          <g transform={`translate(${er.x} ${er.y - (1 - eraserIn) * 420 - eraserOut * 500}) rotate(${-14 + Math.sin(frame * 0.9) * 8})`}>
            <SRect x={-62} y={-34} width={124} height={40} r={10} seed="erT" fill="#C99A6B" w={4.5} twice={false} />
            <SRect x={-66} y={4} width={132} height={32} r={8} seed="erB" fill="#E7E2D4" w={4.5} twice={false} />
          </g>
        )}
        {frame >= ERASE0 + 4 && frame < ERASE1 && frame % 8 < 5 && (
          <Label x={er.x + 96} y={er.y - 50} size={44} color={P.chalk} rotate={-8} opacity={0.9}>
            쓱쓱
          </Label>
        )}

        {/* 판서·수업이 알갱이가 되어 날아간다 */}
        <Motes
          from={[
            [BX + 200, BY + 150],
            [BX + 560, BY + 250],
            [BX + 120, BY + 380],
            [BX + 330, BY + 160],
            [BX + 500, BY + 380],
            [BX + 180, BY + 280],
          ]}
          to={[
            [1210, 430],
            [1610, 430],
          ]}
          at={FLY}
          n={42}
          dur={26}
          seed="keep"
          arc={-150}
          r={10}
          stagger={0.7}
        />
        <SArrow a={[952, 500]} b={[1030, 462]} seed="toCards" draw={prog(frame, CARD_A - 6, 10)} bend={-0.25} w={5} />

        {/* ── 쌓이는 카드 더미 ── */}
        {[2, 1, 0].map((k) => {
          const s = stackN(k);
          if (frame < STACK + k * 7.5) return null;
          const dx = (k + 1) * 15;
          const dy = -(k + 1) * 13;
          return (
            <g key={k} opacity={Math.min(1, (frame - STACK - k * 7.5) / 3)}>
              <g transform={`translate(${dx} ${dy + (1 - s) * -40})`}>
                <Sheet x={1050} y={300} w={320} h={290} seed={`sa${k}`} fold={40} lw={4} />
              </g>
              <g transform={`translate(${dx} ${dy + (1 - s) * -40})`}>
                <SRect x={1440} y={300} width={340} height={290} r={22} seed={`sb${k}`} fill={P.sheet} w={4} twice={false} />
              </g>
            </g>
          );
        })}

        {/* 카드 A — 교안 파일 */}
        {frame >= CARD_A && (
          <g transform={`translate(1210 445) scale(${0.3 + 0.7 * cardA}) rotate(${(1 - cardA) * -14}) translate(-1210 -445)`}>
            <Sheet x={1050} y={300} w={320} h={290} seed="cardA" fold={40}>
              <SRect x={1084} y={338} width={206} height={128} seed="thA" fill={P.board} w={4} twice={false} off={[0, 0]} />
              <Stroke d={wave(1100, 372, 90, "tha1", { amp: 3, len: 24 })} color={chalk} w={3.5} />
              <Stroke d={wave(1100, 396, 60, "tha2", { amp: 3, len: 22 })} color={chalk} w={3.5} opacity={0.7} />
              <Stroke d={roughLine([1206, 448], [1272, 356], "tha3", 0.4)} color={lime} w={4.5} />
              <Stroke d={roughLine([1200, 440], [1280, 440], "tha4", 0.3)} color={chalk} w={3} />
              <Label x={1210} y={548} size={50} font={JUA} anchor="middle" weight={400}>
                교안 파일
              </Label>
            </Sheet>
          </g>
        )}
        <Burst x={1210} y={445} at={CARD_A} r={210} n={11} />

        {/* 카드 B — 수업 녹화 */}
        {frame >= CARD_B && (
          <g transform={`translate(1610 445) scale(${0.3 + 0.7 * cardB}) rotate(${(1 - cardB) * 14}) translate(-1610 -445)`}>
            <path d={`M1448,310 h340 v290 h-340Z`} fill={P.ink} opacity={0.09} />
            <SRect x={1440} y={300} width={340} height={290} r={22} seed="cardB" fill={P.sheet} w={4.5} />
            <SRect x={1470} y={330} width={280} height={150} r={8} seed="thB" fill={P.board} w={4} twice={false} off={[0, 0]} />
            <SPoly
              pts={[
                [1590, 372],
                [1642, 405],
                [1590, 438],
              ]}
              seed="play"
              fill={lime}
              w={4.5}
              rough={0.5}
            />
            <circle cx={1492} cy={352} r={7} fill={P.red} />
            <Stroke d={roughLine([1474, 500], [1746, 500], "bar", 0.3)} color={P.pencil} w={5} />
            <Stroke d={roughLine([1474, 500], [1640, 500], "bar2", 0.3)} color={P.limeDeep} w={6} />
            <circle cx={1640} cy={500} r={9} fill={P.limeDeep} stroke={P.ink} strokeWidth={3} />
            <Label x={1610} y={562} size={50} font={JUA} anchor="middle" weight={400}>
              수업 녹화
            </Label>
          </g>
        )}
        <Burst x={1610} y={445} at={CARD_B} r={215} n={11} />

        {/* 카드 아래 손메모 */}
        <Label x={1210} y={652} size={42} anchor="middle" color={P.ink2} p={pop(frame - (CARD_A + 16))}>
          판서는 → 교안 파일로
        </Label>
        <Label x={1610} y={652} size={42} anchor="middle" color={P.ink2} p={pop(frame - (CARD_B + 16))}>
          수업은 → 녹화로 (자동!)
        </Label>

        {/* ── 포스트잇 두 장 ── */}
        <Sticky x={1062} y={726} w={372} h={214} at={STICKY1} rotate={-3} seed="n1">
          <Label x={186} y={84} size={40} anchor="middle" color={P.ink}>
            결석 보강 · 복습 영상이
          </Label>
          <Label x={186} y={160} size={66} font={JUA} anchor="middle" color={P.forest} weight={400}>
            그날 바로!
          </Label>
        </Sticky>
        <Sticky x={1470} y={740} w={330} h={214} at={STICKY2} rotate={2.5} color={P.limeLight} seed="n2">
          <Label x={165} y={84} size={42} anchor="middle" color={P.ink}>
            누가 들어가도
          </Label>
          <Label x={165} y={160} size={66} font={JUA} anchor="middle" color={P.forest} weight={400}>
            같은 수업
          </Label>
        </Sticky>

        {/* ── 갈매기 ── */}
        <Gull
          x={GX}
          y={GY}
          scale={1.02}
          lift={gLift}
          squash={landSq + jump1.squash + cheer.squash}
          wingL={wingL}
          wingR={wingR}
          wingLen={frame < 18 ? 1.25 : 1}
          feet={frame < 16 ? "tuck" : "stand"}
          eyes={shock ? "wide" : happy ? "happy" : "auto"}
          look={[lookX, shock ? -3 : -1]}
          beak={talk}
          sweat={shock ? 1 : 0}
          tuft={Math.sin(frame / 7) * 3 + (shock ? -10 : 0)}
          hold={<Pencil rotate={-58} />}
          shadow={land}
        />
        <Glyph x={GX + 168} y={GY - 300} at={ERASE0 + 4} until={ERASE1 + 2} text="앗!" size={76} rotate={8} />
      </Canvas>

      <TitleLine a="칠판은 지워져도," b="수업은 남습니다" atA={14} atB={TITLE_B} seed="k" />
      <Note delay={STACK - 6} size={48} style={{ position: "absolute", left: 1056, top: 186 }} rotate={-1.5} color={P.limeInk}>
        수업만 하면, 녹화가 저절로 쌓입니다
      </Note>

      <PageMark page="02" />
    </Paper>
  );
};
