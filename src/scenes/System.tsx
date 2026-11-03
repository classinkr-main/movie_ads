import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Camera, GraphPaper } from "../components/Stage";
import { Clip, Cutout, Tape } from "../components/Media";
import { HandCircle, HandLine, Highlighter } from "../components/Marks";
import { Caption, MaskUp, Slam } from "../components/Type";
import { IconBoard, IconChart, IconFile, IconPhone, IconRec } from "../components/Icons";
import { C, CUES, FONT, scene } from "../lib/theme";
import { POP, clamp, ease, prog, sp } from "../lib/motion";

// S6 시스템 흐름 (600–840f) — "수업 자동 녹화 · 학습 관리 솔루션": 수업 전·중·후가 한 줄로 이어지는 노선도. 역은 박마다 하나씩 켜진다.
const { from } = scene("system");
const ST = CUES.system.stations.map((f) => f - from);
const LOOP = CUES.system.loop.map((f) => f - from);
const FLOW = CUES.system.flow - from;
const ZOOM = CUES.system.zoom.map((f) => f - from);

const X = [230, 595, 960, 1325, 1690];
const LINE_Y = 610;
// 역 카드 — 안쪽 320×220(목업 2배 캔버스 640×440의 절반) + 흰 테두리 10
const CARD = { w: 340, h: 240, y: 306 };
const BRACKET_Y = 286; // 수업 전·중·후 괄호
const TITLE_END = 1205; // 제목 밑줄 끝(80px 제목 폭에 맞춤)

// 카드 목업은 2배 크기(640×440)로 그린 뒤 반으로 줄여 카드 안(320×220)에 넣는다 — 작은 글자도 선명하게 남는다
const Mock: React.FC<{ children: React.ReactNode; background: string }> = ({ children, background }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 440, transform: "scale(0.5)", transformOrigin: "0 0", background, fontFamily: FONT.sans, overflow: "hidden" }}>
    {children}
  </div>
);

// EDB 교안 — 칠판 템플릿 파일(.edb). 학원 전자칠판 문제 템플릿(머리글·정답률·문제 상자·직접 풀어보기 칸·다음 문제)을 축소하고,
// 오른쪽 칸에 풀이가 손글씨처럼 써진 뒤 답에 동그라미가 쳐진다. 문제는 연출용 예시다.
const BOARD = "#1E302B";
const CHALK = "rgba(255,255,255,0.92)";
const EdbBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const head = prog(frame, 2, 10);
  const body = prog(frame, 6, 16);
  const lines = ["a² + b² = (a + b)² − 2ab", "= 12² − 2 × 35", "= 144 − 70 = 74"];
  const write = lines.map((_, i) => prog(frame, 18 + i * 16, 32 + i * 16, ease.inOut));
  const dim = "rgba(255,255,255,0.5)";
  return (
    <Mock background={C.white}>
      <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: "2px solid #E4E9DE" }}>
        <div style={{ padding: "3px 12px", borderRadius: 6, background: C.cobalt, color: C.white, fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 }}>EDB</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, color: C.ink }}>심화_3step_02.edb</div>
        <div style={{ padding: "4px 14px", borderRadius: 999, background: C.limeLight, color: C.olive, fontWeight: 700, fontSize: 18 }}>칠판 템플릿</div>
        <div style={{ marginLeft: "auto", fontFamily: FONT.mono, fontWeight: 500, fontSize: 18, color: C.muted }}>2 / 20</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 56, width: 640, height: 384, background: `radial-gradient(ellipse 90% 80% at 30% 0%, rgba(255,255,255,0.07), rgba(255,255,255,0) 70%), ${BOARD}` }}>
        <div style={{ position: "absolute", left: 26, top: 12, fontSize: 13, color: dim, opacity: head }}>중1-1 정수와 유리수 · 심화 3step</div>
        <div style={{ position: "absolute", left: 26, top: 38, right: 26, display: "flex", alignItems: "center", gap: 12, opacity: head }}>
          <div style={{ width: 5, height: 30, borderRadius: 2, background: "#E5484D" }} />
          <span style={{ fontWeight: 700, fontSize: 28, color: "#F2A65A" }}>02</span>
          <span style={{ fontWeight: 700, fontSize: 28, color: CHALK }}>심화 3step 2번</span>
          <span style={{ marginLeft: "auto", fontSize: 16, color: dim }}>3step</span>
          <span style={{ padding: "2px 12px", borderRadius: 999, border: "2px solid #E5484D", fontSize: 16, color: CHALK }}>정답률 42%</span>
          <span style={{ fontSize: 16, color: dim }}>2 / 20</span>
        </div>
        <div style={{ position: "absolute", left: 26, right: 26, top: 86, height: 1.5, background: "rgba(255,255,255,0.2)" }} />
        <div style={{ position: "absolute", left: 330, top: 76, padding: "0 8px", background: BOARD, fontSize: 15, color: dim }}>직접 풀어보기</div>
        <div style={{ position: "absolute", left: 322, top: 88, width: 1.5, height: 232, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: 26, top: 102, width: 276, fontSize: 17, lineHeight: 1.65, color: CHALK, opacity: body }}>
          두 자연수 a, b가 아래 조건을 모두 만족시킬 때, a² + b²의 값을 구하시오.
        </div>
        <div style={{ position: "absolute", left: 26, top: 194, width: 262, padding: "10px 14px", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 3, fontSize: 16, lineHeight: 1.75, color: CHALK, opacity: body }}>
          (가) a + b = 12
          <br />
          (나) a × b = 35
          <br />
          (다) a {">"} b
        </div>
        {[136, 180, 224, 268, 312].map((y) => (
          <div key={y} style={{ position: "absolute", left: 346, right: 26, top: y, height: 1.5, background: "rgba(255,255,255,0.11)" }} />
        ))}
        {lines.map((t, i) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 352 + (i ? 26 : 0),
              top: 102 + i * 44,
              fontFamily: FONT.display,
              fontWeight: 600,
              fontSize: 23,
              letterSpacing: "-0.01em",
              color: "#F4E7A3",
              whiteSpace: "nowrap",
              transform: "rotate(-1.5deg)",
              clipPath: `inset(-10px ${(1 - write[i]) * 100}% -10px -10px)`,
            }}
          >
            {t}
          </div>
        ))}
        <HandCircle cx={540} cy={209} rx={31} ry={23} start={66} dur={12} width={4} seed="edb74" w={640} h={384} />
        <div style={{ position: "absolute", left: 26, right: 26, top: 336, height: 1.5, background: "rgba(255,255,255,0.14)" }} />
        <div style={{ position: "absolute", left: 26, right: 26, top: 346, display: "flex", alignItems: "center", gap: 12, opacity: 0.6 * head }}>
          <div style={{ width: 5, height: 24, borderRadius: 2, background: "#E5484D" }} />
          <span style={{ fontWeight: 700, fontSize: 22, color: "#F2A65A" }}>03</span>
          <span style={{ fontWeight: 700, fontSize: 22, color: CHALK }}>심화 3step 3번</span>
          <span style={{ marginLeft: "auto", padding: "1px 10px", borderRadius: 999, border: "2px solid #E5484D", fontSize: 14, color: CHALK }}>정답률 61%</span>
          <span style={{ fontSize: 14, color: dim }}>3 / 20</span>
        </div>
      </div>
    </Mock>
  );
};

// 관리자 데이터 — 원장용 운영 대시보드. KPI 4개(카운트업·스파크라인) · 주간 출석·참여 추이(선이 그려짐) · 출결 도넛 · 반별 현황 표. 수치는 연출용 예시다.
const KPIS: Array<{ label: string; value: number; unit: string; digits: number; delta: string; up: boolean; spark: number[] }> = [
  { label: "출석률", value: 96.4, unit: "%", digits: 1, delta: "1.2%p", up: true, spark: [0.45, 0.6, 0.55, 0.7, 0.8, 0.88] },
  { label: "수업 참여", value: 87.2, unit: "%", digits: 1, delta: "3.1%p", up: true, spark: [0.3, 0.42, 0.5, 0.46, 0.7, 0.82] },
  { label: "과제 제출", value: 92.0, unit: "%", digits: 1, delta: "0.8%p", up: false, spark: [0.82, 0.76, 0.84, 0.7, 0.66, 0.6] },
  { label: "AI 강의 평가", value: 93, unit: "점", digits: 0, delta: "2점", up: true, spark: [0.55, 0.6, 0.7, 0.66, 0.78, 0.86] },
];
const WEEK = ["월", "화", "수", "목", "금", "토"];
const ATTEND = [94, 95, 97, 96, 98, 97];
const ENGAGE = [78, 82, 85, 84, 89, 88];
const CLASSES: Array<[string, string, string, string, string, boolean]> = [
  ["중2 심화A", "강사 A", "98%", "95%", "93", true],
  ["고1 수학B", "강사 B", "91%", "88%", "86", false],
  ["중3 국어", "강사 C", "95%", "92%", "90", true],
];
const ATTEND_SPLIT: Array<[string, number, string]> = [
  ["출석", 0.92, C.cobalt],
  ["지각", 0.05, C.signal],
  ["결석", 0.03, "rgba(10,11,20,0.45)"],
];

const AdminDash: React.FC = () => {
  const frame = useCurrentFrame();
  const n = prog(frame, 4, 22, ease.outQuint);
  const draw = prog(frame, 8, 32, ease.inOut);
  const sweep = prog(frame, 8, 28, ease.outQuint);
  const live = Math.floor(frame / 15) % 2 === 0;
  const panel: React.CSSProperties = { position: "absolute", background: C.white, borderRadius: 12, border: "1.5px solid #E1E6D8", boxShadow: "0 2px 6px rgba(30,44,6,0.05)" };
  const px = (i: number) => 26 + i * 62;
  const py = (v: number) => 124 - ((v - 70) / 30) * 80;
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v).toFixed(1)}`).join("");
  const R = 34;
  const CIRC = 2 * Math.PI * R;
  let acc = 0;
  return (
    <Mock background="#F3F6EE">
      <div style={{ position: "absolute", left: 0, top: 0, width: 56, height: 440, background: C.ink }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: 28, height: 28, borderRadius: 8, background: C.lime }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: "absolute", left: 16, top: 74 + i * 46, width: 24, height: 24, borderRadius: 7, background: i === 1 ? C.cobalt : "rgba(255,255,255,0.16)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 74, top: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 24, color: C.ink }}>운영 대시보드</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: C.muted }}>목동관 · 11월 1주</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "rgba(255,90,31,0.12)", fontFamily: FONT.mono, fontWeight: 600, fontSize: 13, color: C.signal }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: C.signal, opacity: live ? 1 : 0.3 }} />
          LIVE
        </div>
      </div>
      <div style={{ position: "absolute", right: 20, top: 13, width: 26, height: 26, borderRadius: 99, background: C.limeDeep, border: `2px solid ${C.white}`, boxShadow: "0 0 0 1.5px #E1E6D8" }} />
      {KPIS.map((k, i) => (
        <div key={k.label} style={{ ...panel, left: 72 + i * 140, top: 52, width: 128, height: 94 }}>
          <div style={{ position: "absolute", left: 12, top: 9, fontSize: 13, fontWeight: 600, color: C.muted }}>{k.label}</div>
          <div style={{ position: "absolute", left: 12, top: 28, fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink, fontVariantNumeric: "tabular-nums" }}>
            {(k.value * n).toFixed(k.digits)}
            <span style={{ fontSize: 14, marginLeft: 2 }}>{k.unit}</span>
          </div>
          <div style={{ position: "absolute", left: 12, top: 67, fontSize: 12, fontWeight: 700, color: k.up ? C.olive : C.signal }}>
            {k.up ? "▲" : "▼"} {k.delta}
          </div>
          <svg style={{ position: "absolute", right: 10, bottom: 12 }} width={52} height={24} viewBox="0 0 52 24">
            <path
              d={k.spark.map((v, j) => `${j ? "L" : "M"}${1 + j * 10},${(22 - v * 20).toFixed(1)}`).join("")}
              fill="none"
              stroke={k.up ? C.cobalt : C.signal}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          </svg>
        </div>
      ))}
      <div style={{ ...panel, left: 72, top: 158, width: 372, height: 152 }}>
        <div style={{ position: "absolute", left: 16, top: 11, fontSize: 15, fontWeight: 700, color: C.ink }}>주간 출석 · 참여 추이</div>
        <div style={{ position: "absolute", right: 16, top: 14, display: "flex", gap: 12, fontSize: 12, fontWeight: 600, color: C.muted }}>
          {[
            ["출석", C.cobalt],
            ["참여", C.signal],
          ].map(([t, c]) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
              {t}
            </span>
          ))}
        </div>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={372} height={152} viewBox="0 0 372 152">
          {[44, 71, 97, 124].map((y) => (
            <line key={y} x1={20} x2={352} y1={y} y2={y} stroke="#EBEFE4" strokeWidth={1.5} />
          ))}
          <path d={`${line(ATTEND)}L${px(5)},124L${px(0)},124Z`} fill={C.cobalt} opacity={0.1 * draw} />
          <path d={line(ATTEND)} fill="none" stroke={C.cobalt} strokeWidth={3.2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={line(ENGAGE)} fill="none" stroke={C.signal} strokeWidth={3.2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          {draw > 0.98 && (
            <>
              <circle cx={px(5)} cy={py(ATTEND[5])} r={5} fill={C.white} stroke={C.cobalt} strokeWidth={3} />
              <circle cx={px(5)} cy={py(ENGAGE[5])} r={5} fill={C.white} stroke={C.signal} strokeWidth={3} />
            </>
          )}
          {WEEK.map((d, i) => (
            <text key={d} x={px(i)} y={143} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={12} fill={C.muted}>
              {d}
            </text>
          ))}
        </svg>
      </div>
      <div style={{ ...panel, left: 456, top: 158, width: 164, height: 152 }}>
        <div style={{ position: "absolute", left: 14, top: 11, fontSize: 15, fontWeight: 700, color: C.ink }}>출결 현황</div>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={164} height={152} viewBox="0 0 164 152">
          <circle cx={56} cy={92} r={R} fill="none" stroke="#EEF1E8" strokeWidth={13} />
          {ATTEND_SPLIT.map(([t, v, c]) => {
            const seg = v * sweep * CIRC;
            const off = acc * sweep * CIRC;
            acc += v;
            return <circle key={t} cx={56} cy={92} r={R} fill="none" stroke={c} strokeWidth={13} strokeDasharray={`${seg} ${CIRC}`} strokeDashoffset={-off} transform="rotate(-90 56 92)" />;
          })}
          <text x={56} y={98} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={18} fill={C.ink}>
            {Math.round(92 * n)}%
          </text>
          {ATTEND_SPLIT.map(([t, v, c], i) => (
            <g key={t} transform={`translate(106 ${70 + i * 22})`}>
              <rect x={0} y={-8} width={8} height={8} rx={2} fill={c} />
              <text x={13} y={0} fontFamily={FONT.sans} fontWeight={600} fontSize={11} fill={C.ink}>
                {t} {Math.round(v * 100)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ ...panel, left: 72, top: 322, width: 548, height: 108 }}>
        {(["반", "강사", "출석", "과제", "AI 평가", "상태"] as const).map((h, j) => (
          <div key={h} style={{ position: "absolute", left: [16, 150, 252, 322, 392, 466][j], top: 9, fontSize: 12, fontWeight: 600, color: C.muted }}>
            {h}
          </div>
        ))}
        <div style={{ position: "absolute", left: 12, right: 12, top: 30, height: 1.5, background: "#EBEFE4" }} />
        {CLASSES.map((row, i) => {
          const a = prog(frame, 14 + i * 3, 22 + i * 3);
          const ok = row[5];
          return (
            <div key={row[0]} style={{ position: "absolute", left: 0, right: 0, top: 38 + i * 23, height: 22, opacity: a, transform: `translateX(${(1 - a) * 12}px)` }}>
              {row.slice(0, 5).map((cell, j) => (
                <div key={j} style={{ position: "absolute", left: [16, 150, 252, 322, 392][j], top: 2, fontSize: 14, fontWeight: j === 0 ? 700 : 600, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                  {cell}
                </div>
              ))}
              <div style={{ position: "absolute", left: 466, top: 1, padding: "1px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: ok ? C.olive : C.signal, background: ok ? C.limeLight : "rgba(255,90,31,0.12)" }}>
                {ok ? "정상" : "확인 필요"}
              </div>
            </div>
          );
        })}
      </div>
    </Mock>
  );
};

// 수업 녹화 — 미래 교실 컷과 같은 AI 카메라 누끼를 밝은 바탕에 올린다
const CameraCard: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 40%, #FFFFFF 0%, #E6EBDF 100%)" }}>
    <Img src={staticFile("photos/hw-camera-cutout.png")} style={{ position: "absolute", left: "50%", top: "50%", width: "78%", transform: "translate(-50%, -50%) rotate(-4deg)", filter: "drop-shadow(0 10px 12px rgba(30,44,6,0.3))" }} />
  </AbsoluteFill>
);

const STATIONS: Array<{ title: string; sub: string; Icon: React.FC<{ size?: number; color?: string }>; card: React.ReactNode }> = [
  { title: "EDB 교안", sub: "칠판 템플릿 파일", Icon: IconFile, card: <EdbBoard /> },
  { title: "전자칠판", sub: "실시간 판서", Icon: IconBoard, card: <Img src={staticFile("photos/hw-room86.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 40%" }} /> },
  { title: "수업 녹화", sub: "자동 녹화·다시보기", Icon: IconRec, card: <CameraCard /> },
  { title: "복습 · LMS", sub: "과제·복습", Icon: IconPhone, card: <Clip src="phone.mp4" pos="50% 40%" /> },
  { title: "관리자 데이터", sub: "출결·참여·운영", Icon: IconChart, card: <AdminDash /> },
];

const GROUPS: Array<{ label: string; x0: number; x1: number; at: number }> = [
  { label: "수업 전", x0: X[0] - CARD.w / 2, x1: X[0] + CARD.w / 2, at: ST[0] },
  { label: "수업 중", x0: X[1] - CARD.w / 2, x1: X[2] + CARD.w / 2, at: ST[1] },
  { label: "수업 후", x0: X[3] - CARD.w / 2, x1: X[4] + CARD.w / 2, at: ST[3] },
];

const Station: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const at = ST[i];
  if (frame < at - 1) return null;
  const s = sp(frame - at, POP);
  const card = sp(frame - at - 3, POP);
  const label = prog(frame, at + 2, at + 12, ease.outQuint);
  const { Icon, title, sub } = STATIONS[i];
  const rot = i % 2 ? 3 : -3;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - card) * 50}px)`, opacity: Math.min(1, card * 2) }}>
        <Cutout x={X[i] - CARD.w / 2} y={CARD.y} w={CARD.w} h={CARD.h} rotate={rot} border={10} shadow={0.8}>
          <Sequence from={at} layout="none">
            {STATIONS[i].card}
          </Sequence>
        </Cutout>
        <Tape x={X[i] + (i % 2 ? -64 : 64)} y={CARD.y + 4} w={110} rotate={i % 2 ? -14 : 12} color={i % 2 ? "rgba(47,60,255,0.7)" : "rgba(255,90,31,0.78)"} />
      </div>
      <div
        style={{
          position: "absolute",
          left: X[i] - 50,
          top: LINE_Y - 50,
          width: 100,
          height: 100,
          borderRadius: 99,
          background: C.cobalt,
          border: `7px solid ${C.limeLight}`,
          boxSizing: "border-box",
          boxShadow: `0 0 0 4px ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s})`,
        }}
      >
        <Icon size={46} color={C.white} />
      </div>
      <div style={{ position: "absolute", left: X[i] - 200, width: 400, top: LINE_Y + 76, textAlign: "center" }}>
        <MaskUp start={at + 2} dur={10}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{title}</div>
        </MaskUp>
        <Caption size={20} style={{ marginTop: 6, opacity: label, color: C.ink }}>
          {sub}
        </Caption>
      </div>
    </>
  );
};

const Track: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [ST[0], ST[4]], [0, 1], clamp);
  const x1 = X[0] + (X[4] - X[0]) * p;
  // 되돌아오는 점선 루프: 마지막 역 → 아래로 → 왼쪽 → 첫 역
  const loopP = prog(frame, LOOP[0], LOOP[1], ease.inOut);
  const yB = 800;
  const loopD = `M${X[4]},${LINE_Y} C${X[4] + 170},${LINE_Y} ${X[4] + 170},${yB} ${X[4] - 40},${yB} L${X[0] + 40},${yB} C${X[0] - 170},${yB} ${X[0] - 170},${LINE_Y + 90} ${X[0] - 64},${LINE_Y + 34}`;
  const loopLen = 2 * 330 + (X[4] - X[0] - 80) + 60;
  const head = prog(frame, LOOP[1] - 4, LOOP[1] + 2);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={X[0]} x2={x1} y1={LINE_Y} y2={LINE_Y} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      {loopP > 0 && (
        <path d={loopD} fill="none" stroke={C.signal} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${loopLen * loopP} ${loopLen}`} />
      )}
      {head > 0 && (
        <g transform={`translate(${X[0] - 64},${LINE_Y + 34}) rotate(-38)`} opacity={head}>
          <path d="M0,0 L-30,-14 M0,0 L-30,14" stroke={C.signal} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

const Groups: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {GROUPS.map((g) => {
        const a = prog(frame, g.at, g.at + 10);
        return (
          <React.Fragment key={g.label}>
            <HandLine from={[g.x0, BRACKET_Y]} to={[g.x1, BRACKET_Y]} start={g.at} dur={10} color={C.ink} width={3} wobble={2} seed={g.label} />
            <div style={{ position: "absolute", left: g.x0, top: BRACKET_Y, width: 3, height: 16, background: C.ink, opacity: a }} />
            <div style={{ position: "absolute", left: g.x1 - 3, top: BRACKET_Y, width: 3, height: 16, background: C.ink, opacity: a }} />
            <div style={{ position: "absolute", left: (g.x0 + g.x1) / 2 - 100, width: 200, top: BRACKET_Y - 40, textAlign: "center", opacity: a }}>
              <span style={{ background: C.limeLight, padding: "0 14px", fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: C.cobalt }}>{g.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export const System: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, ZOOM[0]], [1, 1.03], clamp);
  const zoom = interpolate(frame, [ZOOM[0], ZOOM[1]], [1, 3.4], { ...clamp, easing: ease.inExpo });
  const blur = interpolate(frame, [ZOOM[0] + 10, ZOOM[1]], [0, 14], clamp);
  const toLime = interpolate(frame, [ZOOM[1] - 12, ZOOM[1]], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.limeLight, overflow: "hidden" }}>
      <Camera scale={drift * zoom} blur={blur} originX={960} originY={900}>
        <GraphPaper>
          <div style={{ position: "absolute", left: 120, top: 84 }}>
            <Caption size={22} color={C.cobalt} style={{ fontWeight: 600, letterSpacing: "0.24em" }}>
              HOW IT WORKS
            </Caption>
            <MaskUp start={0} dur={12} style={{ marginTop: 8 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 820, fontSize: 80, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1.05, whiteSpace: "nowrap" }}>수업 자동 녹화 · 학습 관리 솔루션</div>
            </MaskUp>
          </div>
          <HandLine from={[124, 222]} to={[TITLE_END, 216]} start={6} dur={16} width={9} wobble={4} hook seed="title" />
          <Groups />
          <Track />
          {STATIONS.map((_, i) => (
            <Station key={i} i={i} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 838, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              {frame >= FLOW && <Highlighter x={-24} y="22%" w="calc(100% + 48px)" h="70%" start={FLOW + 2} dur={9} />}
              <Slam start={FLOW} from={1.4} rgb={false} style={{ position: "relative", fontFamily: FONT.display, fontWeight: 900, fontSize: 132, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1.05 }}>
                한 흐름으로.
              </Slam>
            </div>
          </div>
        </GraphPaper>
      </Camera>
      <AbsoluteFill style={{ background: C.lime, opacity: toLime }} />
    </AbsoluteFill>
  );
};
