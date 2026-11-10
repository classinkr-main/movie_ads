import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Gull, Pencil, flap } from "../Gull";
import { Label, SRect, Stroke, ease, handWidth, pop, prog, useBoil } from "../Ink";
import { Hand, Mark, Note } from "../Lettering";
import { hop, mix } from "../motion";
import { Canvas, Paper } from "../Paper";
import { Bubble, Burst, PageMark } from "../parts";
import { spline, rs } from "../sketch";
import { JUA, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const CTA_URL = "classin.co.kr/contact";
const RECAP = ["① 저절로 남는 수업", "② 끝나면 AI 평가", "＋ 쌓이는 데이터"];

const BX = 1130;
const BY = 560;
const BW = 640;
const BH = 136;

// S5 — 엔드카드: 칠판은 지워져도, 수업은 남습니다
export const S5Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();

  // 갈매기: 날아와서 왼쪽 아래에 내려앉아 손을 흔든다
  const land = prog(frame, 6, 22, ease.out);
  const landed = frame >= 28;
  const landSq = interpolate(frame, [27, 30, 38], [0, 0.17, 0], CLAMP);
  const cheer = hop(frame, 86, { height: 70, air: 12, ant: 4 });
  const gx = mix(-160, 300, land);
  const lift = (1 - land) * 420 + cheer.lift;
  const waving = frame >= 40;

  const btn = pop(frame - 60, { damping: 12, stiffness: 190, mass: 0.7 });
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;
  const underline = prog(frame, 92, 12, ease.inOut);

  let recapX = 122;
  const chips = RECAP.map((t) => {
    const w = handWidth(t, 42) + 56;
    const x = recapX;
    recapX += w + 18;
    return { t, x, w };
  });

  return (
    <Paper>
      <Canvas>
        {/* 요약 칩 */}
        {chips.map((c, i) => {
          const at = 37.5 + i * 7.5;
          if (frame < at) return null;
          const s = pop(frame - at);
          return (
            <g key={c.t} transform={`translate(${c.x + c.w / 2} 520) scale(${0.4 + 0.6 * s}) rotate(${(i - 1) * 1.5}) translate(${-c.w / 2} -38)`} opacity={Math.min(1, (frame - at) / 3)}>
              <SRect x={0} y={0} width={c.w} height={76} r={34} seed={`chip${i}`} fill={i === 2 ? P.lime : P.limeSoft} w={4.5} twice={false} />
              <Label x={c.w / 2} y={52} size={42} anchor="middle" color={P.ink}>
                {c.t}
              </Label>
            </g>
          );
        })}

        {/* CTA 버튼 */}
        {frame >= 60 && (
          <g transform={`translate(${BX + BW / 2} ${BY + BH / 2}) scale(${0.4 + 0.6 * btn}) translate(${-BW / 2} ${-BH / 2})`}>
            <SRect x={0} y={0} width={BW} height={BH} r={66} seed="btn" fill={P.forest} w={6} off={[6, 8]} />
            <text x={BW / 2 - 26} y={BH / 2 + 22} textAnchor="middle" fontFamily={JUA} fontSize={64} fill="#fff">
              파일럿 상담 신청
            </text>
            <g transform={`translate(${BW - 96 + nudge} ${BH / 2})`}>
              <Stroke d={spline([[-22, rs(`ar:${boil}`) * 2], [0, 0], [26, rs(`ar2:${boil}`) * 2]])} color="#fff" w={7} />
              <Stroke d={`M8,-18 L28,0 L8,18`} color="#fff" w={7} />
            </g>
          </g>
        )}
        <Burst x={BX + BW / 2} y={BY + BH / 2} at={61} r={360} n={16} w={6} color={P.limeDeep} />

        {/* URL 밑줄 */}
        <Stroke d={spline([[BX + 76, 812 + rs(`u1:${boil}`) * 2], [BX + 250, 806], [BX + 420, 814], [BX + BW - 70, 808 + rs(`u2:${boil}`) * 2]])} color={P.limeDeep} w={8} draw={underline} />

        {/* 말풍선 */}
        {landed && (
          <Bubble cx={764} cy={704} rx={332} ry={76} at={72} tail={[452, 752]} seed="show">
            <Label x={764} y={720} size={44} anchor="middle">
              목동 쇼룸에서 직접 보여 드릴게요!
            </Label>
          </Bubble>
        )}

        {/* 갈매기 */}
        <Gull
          x={gx}
          y={1006}
          scale={1.12}
          lift={lift}
          squash={landSq + cheer.squash}
          rotate={landed ? 0 : 12}
          wingL={landed ? 68 : flap(frame, 1.1)}
          wingR={landed ? (waving ? -40 + Math.sin(frame * 0.3) * 12 : 20) : flap(frame, 1.1)}
          wingLen={landed ? 1 : 1.3}
          feet={landed ? "stand" : "tuck"}
          eyes={frame >= 40 && frame < 66 ? "happy" : frame >= 88 ? "happy" : "auto"}
          look={[5, -2]}
          beak={frame >= 72 && frame < 100 ? Math.max(0, Math.sin(frame * 0.7)) * 0.7 : 0}
          tuft={Math.sin(frame / 7) * 3}
          hold={<Pencil rotate={-58} />}
          shadow={land}
        />
      </Canvas>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 118, top: 150 }}>
        <div>
          <Hand text="칠판은 지워져도," size={124} delay={6} seed="c1" />
        </div>
        <div style={{ marginTop: 6 }}>
          <Mark delay={34} duration={14} seed="cm">
            <Hand text="수업은 남습니다" size={124} delay={18} seed="c2" color={P.forest} />
          </Mark>
        </div>
      </div>

      {/* 로고 */}
      <div style={{ position: "absolute", left: BX, top: 196, width: BW, display: "flex", justifyContent: "center" }}>
        <Img
          src={staticFile("00_공통에셋/brand/classin-logo-stacked.png")}
          style={{
            height: 290,
            width: "auto",
            opacity: interpolate(frame, [30, 35], [0, 1], CLAMP),
            transform: `scale(${0.5 + 0.5 * pop(frame - 30, { damping: 11, stiffness: 200, mass: 0.7 })}) rotate(${(1 - pop(frame - 30)) * -8}deg)`,
          }}
        />
      </div>

      {/* URL · 파일럿 */}
      <div style={{ position: "absolute", left: BX, top: 730, width: BW, textAlign: "center" }}>
        <Hand text={CTA_URL} size={62} delay={70} stagger={1} seed="url" color={P.forest} wobble={0.5} spacing="0" />
      </div>
      <Note delay={98} size={48} style={{ position: "absolute", left: BX, top: 846, width: BW, textAlign: "center" }} rotate={-1}>
        1개 교실 파일럿부터, 함께 설계합니다
      </Note>

      <PageMark page="07" logo={false} label="" />
    </Paper>
  );
};
