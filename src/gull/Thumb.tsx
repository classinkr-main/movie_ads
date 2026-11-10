import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Gull, Pencil } from "./Gull";
import { Label, SRect, Stroke, useBoil } from "./Ink";
import { Circled, Hand, Mark } from "./Lettering";
import { Canvas, Paper, PaperFinish } from "./Paper";
import { Badge, Bubble } from "./parts";
import { roughEllipse, roughLine, sparkle, wave } from "./sketch";
import { JUA, P } from "./theme";

// 섬네일(1920×1080) — 오프닝 프레임의 느낌 그대로, 글자는 훨씬 크게.
// 작게 줄여도 "딱 두 가지"와 갈매기가 먼저 읽히도록 요소를 셋으로 줄였다: 갈매기 · 큰 문구 · 물음표 카드.

const GX = 414;
const GY = 1014;
const GS = 2.16;
const HALO = { x: 414, y: 656, r: 388 };

const CARD_W = 316;
const CARD_H = 284;
const CARD_Y = 716;
const CARD_X = [836, 1182, 1528];

const still = -90; // 모든 등장 애니메이션이 끝난 상태로 그린다

export const GullThumb: React.FC = () => {
  const boil = useBoil();

  return (
    <AbsoluteFill>
      <Paper>
        <Canvas>
          {/* ── 햇살 후광 ── */}
          <path d={`${roughEllipse(HALO.x, HALO.y, HALO.r, HALO.r, "halof", { overlap: 0, rough: 0.45, n: 20 })}Z`} fill={P.note} />
          <path d={`${roughEllipse(HALO.x, HALO.y, HALO.r - 58, HALO.r - 58, "halof2", { overlap: 0, rough: 0.5, n: 18 })}Z`} fill="#FFEFA8" />

          {/* ── 갈매기 ── */}
          <Gull
            x={GX}
            y={GY}
            scale={GS}
            rotate={3}
            wingL={46}
            wingR={-22}
            eyes="wide"
            look={[3, -1]}
            beak={0.85}
            tuft={10}
            bob={false}
            hold={<Pencil rotate={-66} scale={1.08} />}
          />

          {/* 반짝이 */}
          <path d={sparkle(92, 402, 46, "sp1")} fill={P.sheet} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={sparkle(744, 892, 36, "sp2")} fill={P.sheet} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={sparkle(66, 906, 26, "sp3")} fill={P.sheet} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={sparkle(690, 318, 28, "sp4")} fill={P.note} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={sparkle(1852, 640, 30, "sp5")} fill={P.note} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />

          {/* ── 말풍선 ── */}
          <Bubble cx={404} cy={136} rx={366} ry={100} at={still} tail={[318, 322]} seed="thumbHello">
            <Label x={404} y={168} size={90} anchor="middle" color={P.ink}>
              원장님, 49초만요!
            </Label>
          </Bubble>

          {/* ── 물음표 카드 세 장 ── */}
          {/* 01 — 칠판 */}
          <g transform={`rotate(-3 ${CARD_X[0] + CARD_W / 2} ${CARD_Y + CARD_H / 2})`}>
            <path d={`M${CARD_X[0] + 12},${CARD_Y + 16} h${CARD_W} v${CARD_H} h${-CARD_W}Z`} fill={P.ink} opacity={0.12} />
            <SRect x={CARD_X[0]} y={CARD_Y} width={CARD_W} height={CARD_H} r={26} seed="tc1" fill={P.sheet} w={8} />
            <SRect x={CARD_X[0] + 40} y={CARD_Y + 62} width={236} height={172} seed="tc1b" fill={P.board} w={6} twice={false} off={[0, 0]} />
            <Stroke d={wave(CARD_X[0] + 62, CARD_Y + 100, 74, "tc1w", { amp: 4, len: 24 })} color={P.chalk} w={5} opacity={0.8} />
            <text x={CARD_X[0] + 170} y={CARD_Y + 214} textAnchor="middle" fontFamily={JUA} fontSize={158} fill={P.chalk}>
              ?
            </text>
          </g>
          {/* 02 — AI */}
          <g transform={`rotate(2.5 ${CARD_X[1] + CARD_W / 2} ${CARD_Y + CARD_H / 2})`}>
            <path d={`M${CARD_X[1] + 12},${CARD_Y + 16} h${CARD_W} v${CARD_H} h${-CARD_W}Z`} fill={P.ink} opacity={0.12} />
            <SRect x={CARD_X[1]} y={CARD_Y} width={CARD_W} height={CARD_H} r={26} seed="tc2" fill={P.sheet} w={8} />
            <path d={`${roughEllipse(CARD_X[1] + 134, CARD_Y + 152, 88, 88, "tc2f", { overlap: 0, rough: 0.5 })}Z`} fill={P.lime} transform="translate(5 6)" />
            <Stroke d={roughEllipse(CARD_X[1] + 134, CARD_Y + 152, 88, 88, `tc2:${boil}`, { overlap: 0.12 })} w={7} />
            <text x={CARD_X[1] + 134} y={CARD_Y + 184} textAnchor="middle" fontFamily={JUA} fontSize={92} fill={P.ink}>
              AI
            </text>
            <text x={CARD_X[1] + 258} y={CARD_Y + 254} textAnchor="middle" fontFamily={JUA} fontSize={128} fill={P.forest} transform={`rotate(10 ${CARD_X[1] + 258} ${CARD_Y + 214})`}>
              ?
            </text>
            <path d={sparkle(CARD_X[1] + 250, CARD_Y + 70, 26, "tc2s")} fill={P.note} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          </g>
          {/* +1 — 데이터 */}
          <g transform={`rotate(-2 ${CARD_X[2] + CARD_W / 2} ${CARD_Y + CARD_H / 2})`}>
            <path d={`M${CARD_X[2] + 12},${CARD_Y + 16} h${CARD_W} v${CARD_H} h${-CARD_W}Z`} fill={P.ink} opacity={0.12} />
            <SRect x={CARD_X[2]} y={CARD_Y} width={CARD_W} height={CARD_H} r={26} seed="tc3" fill={P.limeLight} w={8} />
            {[0, 1, 2, 3].map((k) => (
              <Stroke key={k} d={roughLine([CARD_X[2] + 84 + k * 52, CARD_Y + 176], [CARD_X[2] + 84 + k * 52, CARD_Y + 176 - [40, 62, 56, 104][k]], `tc3b${k}`, 0.3)} color={k === 3 ? P.forest : P.limeDeep} w={34} cap="butt" />
            ))}
            <Stroke d={roughLine([CARD_X[2] + 48, CARD_Y + 180], [CARD_X[2] + 276, CARD_Y + 180], "tc3l", 0.4)} w={6} />
            <text x={CARD_X[2] + 158} y={CARD_Y + 256} textAnchor="middle" fontFamily={JUA} fontSize={68} fill={P.ink}>
              데이터
            </text>
          </g>
          <Badge x={CARD_X[0] + 16} y={CARD_Y + 14} text="01" at={still} r={50} seed="tb1" />
          <Badge x={CARD_X[1] + 22} y={CARD_Y + 6} text="02" at={still} r={50} seed="tb2" />
          <Badge x={CARD_X[2] + 14} y={CARD_Y + 16} text="+1" at={still} r={50} seed="tb3" />

        </Canvas>

        {/* ── 큰 문구 ── */}
        <div style={{ position: "absolute", left: 846, top: 150 }}>
          <div>
            <Hand text="클래스인이 잘하는 것," size={112} delay={still} seed="t1" wobble={0.8} />
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", whiteSpace: "pre" }}>
            <Hand text="딱 " size={252} delay={still} seed="t2" wobble={0.7} />
            <Circled delay={still} seed="tcir" w={14} padX={0.1} padY={0.02}>
              <Mark delay={still} seed="tmark">
                <Hand text="두 가지" size={252} delay={still} seed="t3" color={P.forest} wobble={0.7} />
              </Mark>
            </Circled>
          </div>
        </div>

        <Img src={staticFile("brand/classin-wordmark.png")} style={{ position: "absolute", right: 60, top: 48, height: 62, width: "auto" }} />
      </Paper>
      <PaperFinish />
    </AbsoluteFill>
  );
};
