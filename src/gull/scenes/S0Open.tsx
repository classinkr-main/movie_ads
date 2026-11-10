import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { GULL_BODY, GULL_GRIP, GULL_SHOULDER, Gull, Pencil, flap } from "../Gull";
import { Label, MarkerReveal, SArrow, SLine, Stroke, ease, pop, prog, useBoil } from "../Ink";
import { Circled, Hand, Mark, Note } from "../Lettering";
import { clamp01, hop, mix, pointOn } from "../motion";
import { Canvas, Paper } from "../Paper";
import { Bubble, Burst, PageMark } from "../parts";
import { roughEllipse, sparkle } from "../sketch";
import type { Pt } from "../sketch";
import { GAEGU, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// 타이밍(로컬 프레임)
const DRAW0 = 5;
const DRAW1 = 36;
const COLOR0 = 33;
const COLOR1 = 48;
const HOP = 54;
const GRAB = 68;
const SLIDE0 = 78;
const SLIDE1 = 98;
const LINE1 = 90;
const LINE2 = 105;
const EXIT = 158;

const GS = 1.5;
const GY = 812;
const X_CENTER = 960;
const X_LEFT = 430;

// S0 — 연필이 갈매기를 그리고, 갈매기가 그 연필을 낚아챈다
export const S0Open: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();

  const draw = prog(frame, DRAW0, DRAW1 - DRAW0, ease.inOut);
  const colorP = prog(frame, COLOR0, COLOR1 - COLOR0, ease.inOut);
  const sketching = frame < COLOR1 + 1;

  // 폴짝 + 왼쪽으로 총총
  const h = hop(frame, HOP, { height: 130, air: 15 });
  const slide = prog(frame, SLIDE0, SLIDE1 - SLIDE0, ease.inOut);
  const steps = slide > 0 && slide < 1 ? Math.abs(Math.sin((frame - SLIDE0) * 0.9)) : 0;
  // 퇴장: 움츠렸다가 오른쪽 위로 날아간다
  const crouch = interpolate(frame, [EXIT - 5, EXIT], [0, 0.16], CLAMP);
  const fly = prog(frame, EXIT, 20, ease.in);
  const flying = frame >= EXIT;

  const gx = mix(X_CENTER, X_LEFT, slide) + fly * 1900;
  const lift = h.lift + steps * 16 + fly * 620;
  const squash = flying ? -0.06 : h.squash + crouch;
  const tilt = (slide > 0 && slide < 1 ? Math.sin((frame - SLIDE0) * 0.9) * 5 : 0) + (flying ? 16 : 0);

  // 날개: 낚아챌 때 번쩍 → 연필 든 채로 인사 → 설명 자세
  const grabUp = prog(frame, HOP + 4, 8, ease.out);
  const settle = prog(frame, SLIDE0, 14, ease.inOut);
  const waveAmt = frame >= LINE1 + 26 && frame < EXIT - 8 ? Math.sin((frame - LINE1) * 0.22) * 9 : 0;
  let wingR = mix(68, -46, grabUp);
  wingR = mix(wingR, -12, settle) + waveAmt;
  let wingL = mix(68, 30, grabUp * (1 - settle));
  if (flying) {
    wingR = flap(frame, 1.1);
    wingL = flap(frame, 1.1);
  }
  const held = frame >= GRAB;

  // 시선: 그려진 직후 연필을 올려다본다
  const lookAtPencil = interpolate(frame, [COLOR1, COLOR1 + 4, HOP + 2, GRAB], [0, 1, 1, 0], CLAMP);
  const lookRight = interpolate(frame, [LINE1 - 4, LINE1 + 4, EXIT - 20, EXIT - 12], [0, 1, 1, 0], CLAMP);
  const look: Pt = [lookAtPencil * 5 + lookRight * 4, lookAtPencil * -4];
  const happy = (frame >= GRAB && frame < GRAB + 16) || flying;
  const talk = frame >= LINE1 - 6 && frame < LINE2 + 30 ? Math.max(0, Math.sin((frame - LINE1) * 0.7)) * 0.75 : frame >= GRAB && frame < GRAB + 12 ? 0.8 : 0;
  const tuft = (h.air ? -h.lift * 0.08 : 0) + Math.sin(frame / 7) * 3 + (flying ? -14 : 0);

  // 떠 있는 연필 — 그리는 위치를 따라다닌다
  const toWorld = (p: Pt): Pt => [X_CENTER + p[0] * GS, GY + p[1] * GS];
  const anchors: Array<readonly [number, Pt]> = [
    [0.42, toWorld(pointOn(GULL_BODY, 0.999))],
    [0.55, toWorld([8, -322])],
    [0.68, toWorld([4, -172])],
    [0.86, toWorld([138, -98])],
    [1, toWorld([40, -4])],
  ];
  let tip: Pt;
  if (draw < 0.42) {
    tip = toWorld(pointOn(GULL_BODY, draw / 0.42));
  } else {
    let i = 1;
    while (i < anchors.length - 1 && draw > anchors[i][0]) i++;
    const [d0, p0] = anchors[i - 1];
    const [d1, p1] = anchors[i];
    const k = ease.inOut(clamp01((draw - d0) / (d1 - d0)));
    tip = [mix(p0[0], p1[0], k), mix(p0[1], p1[1], k)];
  }
  // 그리는 동안의 사각사각 떨림
  if (frame >= DRAW0 && frame < DRAW1) tip = [tip[0] + Math.sin(frame * 2.3) * 5, tip[1] + Math.cos(frame * 2.9) * 5];

  const hover: Pt = [1330 + Math.sin(frame / 6) * 6, 470 + Math.cos(frame / 5) * 10];
  const away = prog(frame, DRAW1, 12, ease.inOut);
  const grabT = prog(frame, HOP + 6, GRAB - HOP - 6, ease.in);
  // 날개 끝(쥐는 지점)의 월드 좌표
  const wa = (wingR * Math.PI) / 180;
  const grip: Pt = [gx + (GULL_SHOULDER[0] + Math.cos(wa) * GULL_GRIP) * GS, GY - lift * GS + (GULL_SHOULDER[1] + Math.sin(wa) * GULL_GRIP) * GS];
  const PEN = 80; // 연필 원점→심 끝
  const drawAngle = 128;
  const penAngle = mix(mix(drawAngle, 96, away), wingR - 62 - 360, grabT);
  // 그릴 때는 심 끝이 tip에 닿도록, 그 뒤에는 원점 기준으로 이동
  const rad = (drawAngle * Math.PI) / 180;
  const origin0: Pt = [tip[0] - Math.cos(rad) * PEN * 1.5, tip[1] - Math.sin(rad) * PEN * 1.5];
  const origin1: Pt = [mix(origin0[0], hover[0], away), mix(origin0[1], hover[1], away)];
  const penPos: Pt = [mix(origin1[0], grip[0], grabT), mix(origin1[1], grip[1], grabT) - Math.sin(grabT * Math.PI) * 60];
  const penIn = prog(frame, 0, 6, ease.out);

  // 밑그림(연필 보조선)
  const guideDraw = prog(frame, 0, 10, ease.out);
  const guideOp = interpolate(frame, [COLOR0 + 2, COLOR1 + 2], [0.75, 0], CLAMP);

  const gull = (mono: boolean) => (
    <Gull
      x={gx}
      y={GY}
      scale={GS}
      mono={mono}
      draw={mono ? draw : 1}
      lift={lift}
      squash={squash}
      rotate={tilt}
      wingL={wingL}
      wingR={wingR}
      wingLen={flying ? 1.3 : 1}
      feet={flying ? "tuck" : "stand"}
      eyes={sketching ? "open" : happy ? "happy" : "auto"}
      look={look}
      beak={talk}
      tuft={tuft}
      bob={!sketching}
      shadow={sketching ? colorP : 1}
      hold={held ? <Pencil rotate={-62} scale={1 / 1} /> : undefined}
    />
  );

  return (
    <Paper>
      <Canvas>
        {/* 밑그림 보조선 */}
        {guideOp > 0 && (
          <g opacity={guideOp}>
            <Stroke d={roughEllipse(X_CENTER, GY - 226, 196, 204, `guide:${boil}`, { overlap: 0.2, rough: 1.3 })} color={P.pencil} w={2.5} draw={guideDraw} />
            <SLine a={[X_CENTER, GY - 470]} b={[X_CENTER, GY + 20]} seed="gv" color={P.pencil} w={2.2} draw={guideDraw} />
            <SLine a={[X_CENTER - 230, GY - 270]} b={[X_CENTER + 230, GY - 270]} seed="gh" color={P.pencil} w={2.2} draw={guideDraw} />
            <SLine a={[X_CENTER - 260, GY + 6]} b={[X_CENTER + 260, GY + 6]} seed="gg" color={P.pencil} w={2.2} draw={guideDraw} />
          </g>
        )}

        {/* 갈매기: 선 → 색 */}
        {sketching ? (
          <>
            {gull(true)}
            <MarkerReveal box={[X_CENTER - 230, GY - 520, 460, 560]} p={colorP} seed="gcolor" gap={64} angle={-14}>
              {gull(false)}
            </MarkerReveal>
          </>
        ) : (
          gull(false)
        )}

        {/* 색이 입혀질 때 반짝 */}
        {frame >= COLOR1 - 2 && frame < COLOR1 + 14 && (
          <g opacity={interpolate(frame, [COLOR1 - 2, COLOR1 + 2, COLOR1 + 14], [0, 1, 0], CLAMP)}>
            <path d={sparkle(X_CENTER - 250, GY - 420, 30, "sp1")} fill={P.limeDeep} stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />
            <path d={sparkle(X_CENTER + 262, GY - 300, 22, "sp2")} fill={P.note} stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />
            <path d={sparkle(X_CENTER - 280, GY - 160, 18, "sp3")} fill={P.note} stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />
          </g>
        )}

        {/* 연필(쥐기 전) */}
        {!held && (
          <g transform={`translate(${penPos[0]} ${penPos[1] - (1 - penIn) * 300})`}>
            <Pencil rotate={penAngle} scale={1.5} />
          </g>
        )}
        <Burst x={grip[0]} y={grip[1]} at={GRAB} r={84} n={9} />
        {frame >= GRAB && frame < GRAB + 22 && (
          <Label x={gx + 250} y={GY - 520} size={74} rotate={-10} color={P.limeInk} p={pop(frame - GRAB)} opacity={interpolate(frame, [GRAB + 14, GRAB + 22], [1, 0], CLAMP)}>
            뿅!
          </Label>
        )}

        {/* 말풍선 */}
        {frame < EXIT + 4 && (
          <Bubble cx={600} cy={236} rx={300} ry={84} at={SLIDE0 + 8} tail={[500, 380]} seed="hello">
            <Label x={600} y={254} size={54} anchor="middle" color={P.ink}>
              안녕하세요, 원장님!
            </Label>
          </Bubble>
        )}

        {/* '하나 더' 화살표 */}
        {frame < EXIT + 12 && (
          <g opacity={interpolate(frame, [EXIT + 4, EXIT + 12], [1, 0], CLAMP)}>
            <SArrow a={[878, 760]} b={[950, 716]} seed="more" draw={prog(frame, 134, 8)} w={5} bend={-0.3} head={18} color={P.ink2} />
          </g>
        )}
      </Canvas>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 836, top: 400, opacity: interpolate(frame, [EXIT + 4, EXIT + 12], [1, 0], CLAMP) }}>
        <div>
          <Hand text="클래스인이 잘하는 것," size={98} delay={LINE1} seed="o1" />
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", whiteSpace: "pre" }}>
          <Hand text="딱 " size={98} delay={LINE2} seed="o2" />
          <Circled delay={LINE2 + 22} duration={12} seed="oc" w={7}>
            <Mark delay={LINE2 + 12} duration={10} seed="om">
              <Hand text="두 가지" size={98} delay={LINE2 + 3} seed="o3" color={P.forest} />
            </Mark>
          </Circled>
          <Hand text="만 그려 볼게요" size={98} delay={LINE2 + 9} seed="o4" />
        </div>
        <Note delay={136} size={58} style={{ marginTop: 40, marginLeft: 130 }} rotate={-2}>
          하나 더! 쌓이는 <span style={{ color: P.limeInk, fontFamily: GAEGU }}>‘데이터’</span> 이야기까지
        </Note>
      </div>

      <PageMark page="01" />
    </Paper>
  );
};
