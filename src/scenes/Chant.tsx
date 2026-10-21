import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Clip, Photo } from "../components/Media";
import { limeGrid } from "../components/Stage";
import { HandCircle, Tag } from "../components/Marks";
import { Flash } from "../components/Fx";
import { Caption, Slam } from "../components/Type";
import { IconRec } from "../components/Icons";
import { C, CUES, FONT, scene } from "../lib/theme";
import { POP, clamp, ease, prog, shake, sp } from "../lib/motion";

// S4 챈트 (270–510f) — 단어 하나에 한 박. "판서는, 파일로. / 설명은, 영상으로. / 복습은, 앱으로. / 운영은, 데이터로."
// A박: 실제 학원 사진·영상 + 첫 단어 / B박: 오른쪽 파스텔 연두 패널이 밀려 들어오며 두 번째 단어와 결과물.

type Pair = {
  a: string;
  b: string;
  photo?: string;
  clip?: string;
  pos: string;
  tag: string;
  btag: string;
  circle?: { cx: number; cy: number; rx: number; ry: number };
  Panel: React.FC;
};

const { from: FROM, to: TO } = scene("chant");
const A_BEATS = CUES.chant.filter((_, i) => i % 2 === 0).map((f) => f - FROM); // 쌍마다 A박(로컬)
const B = CUES.chant[1] - CUES.chant[0]; // 쌍 안에서 B박까지의 거리(30f)
const PANEL_X = 900; // 패널 왼쪽 경계(px)
const PANEL_W = 1920 - PANEL_X;

// ── B 패널 비주얼 ─────────────────────────────

const Check: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12.5l4.8 4.6L19.5 7" />
  </svg>
);

// EDB 교안 카드 — 판서가 파일로 저장된다
const EdbCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sp(frame, POP);
  const check = prog(frame, 10, 18, ease.outBack);
  return (
    <div style={{ position: "absolute", left: 140, top: 150, transform: `rotate(${-4 + (1 - s) * 8}deg) scale(${0.7 + 0.3 * s})`, transformOrigin: "50% 60%", opacity: Math.min(1, s * 2) }}>
      {[2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: k * 18, top: k * -16, width: 640, height: 420, background: C.white, opacity: 0.35 + 0.2 * (2 - k), borderRadius: 14 }} />
      ))}
      <div style={{ position: "relative", width: 640, height: 420, background: C.white, borderRadius: 14, boxShadow: `0 30px 60px ${C.shadow}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 24, top: 24, width: 592, height: 270, borderRadius: 8, overflow: "hidden", background: "#22252B" }}>
          <Img src={staticFile("photos/mokdong-point.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "30% 22%", transform: "scale(1.9)", transformOrigin: "30% 22%", filter: "contrast(1.1)" }} />
        </div>
        <div style={{ position: "absolute", left: 28, top: 318, fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, color: C.ink }}>심화_3step_02.edb</div>
        <div style={{ position: "absolute", left: 28, top: 364, fontFamily: FONT.mono, fontWeight: 500, fontSize: 20, color: C.muted, letterSpacing: "0.06em" }}>EDB · 판서 12p · 교안 포함</div>
        <div
          style={{
            position: "absolute",
            right: 26,
            top: 326,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 999,
            background: C.cobalt,
            color: C.white,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 26,
            transform: `scale(${check})`,
          }}
        >
          저장됨 <Check />
        </div>
      </div>
    </div>
  );
};

// 녹화 플레이어 — 수업이 영상으로 남는다
const VideoPlayer: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sp(frame, POP);
  const bar = interpolate(frame, [0, 30], [0.18, 0.62], { ...clamp, easing: ease.out });
  return (
    <div style={{ position: "absolute", left: 100, top: 150, width: 820, height: 461, transform: `scale(${0.75 + 0.25 * s}) rotate(${2 - 2 * s}deg)`, opacity: Math.min(1, s * 2), borderRadius: 18, overflow: "hidden", boxShadow: `0 30px 60px ${C.shadow}`, background: C.ink }}>
      <Clip src="class.mp4" style={{ filter: "contrast(1.05) saturate(0.9)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,20,0.45) 0%, rgba(10,11,20,0) 30%, rgba(10,11,20,0) 65%, rgba(10,11,20,0.7) 100%)" }} />
      <div style={{ position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, color: C.white, letterSpacing: "0.1em" }}>
        <IconRec size={30} />
        녹화 · 3단원 심화
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 30, height: 8, borderRadius: 8, background: "rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 8, background: C.signal }} />
        <div style={{ position: "absolute", left: `calc(${bar * 100}% - 11px)`, top: -7, width: 22, height: 22, borderRadius: 99, background: C.white }} />
      </div>
      <div style={{ position: "absolute", right: 24, bottom: 52, fontFamily: FONT.mono, fontWeight: 500, fontSize: 20, color: C.white, opacity: 0.85 }}>
        {`${String(Math.floor(bar * 45)).padStart(2, "0")}:${String(Math.floor((bar * 45 * 60) % 60)).padStart(2, "0")} / 45:00`}
      </div>
      <div style={{ position: "absolute", left: 24, bottom: 52, padding: "6px 14px", borderRadius: 999, background: C.white, color: C.ink, fontFamily: FONT.sans, fontWeight: 700, fontSize: 20 }}>다시보기</div>
    </div>
  );
};

// 복습 앱 — 휴대폰 화면
const PhoneApp: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sp(frame, POP);
  const rows: Array<[string, string, boolean]> = [
    ["3단원 다시보기", "45:00", false],
    ["판서 교안 (EDB)", "12p", false],
    ["오늘 과제", "제출", true],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 120,
        width: 330,
        height: 650,
        borderRadius: 52,
        background: C.ink,
        padding: 14,
        boxSizing: "border-box",
        boxShadow: `0 40px 70px ${C.shadow}`,
        transform: `translateY(${(1 - s) * 140}px) rotate(${-6 + (1 - s) * -6}deg)`,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 40, background: C.limeLight, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 24, top: 40, fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.ink }}>오늘의 복습</div>
        <div style={{ position: "absolute", left: 16, right: 16, top: 96, height: 170, borderRadius: 16, overflow: "hidden" }}>
          <Img src={staticFile("photos/hw-room86.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 58, height: 58, marginLeft: -29, marginTop: -29, borderRadius: 99, background: "rgba(255,255,255,0.92)" }}>
            <div style={{ position: "absolute", left: 22, top: 17, width: 0, height: 0, borderLeft: "20px solid #2F3CFF", borderTop: "12px solid transparent", borderBottom: "12px solid transparent" }} />
          </div>
        </div>
        {rows.map(([t, v, done], i) => {
          const a = prog(frame, 6 + i * 4, 14 + i * 4);
          return (
            <div
              key={t}
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 290 + i * 104,
                height: 88,
                borderRadius: 16,
                background: C.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                boxSizing: "border-box",
                opacity: a,
                transform: `translateX(${(1 - a) * 40}px)`,
                boxShadow: "0 4px 12px rgba(10,11,20,0.06)",
              }}
            >
              <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 21, color: C.ink }}>{t}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, color: done ? C.white : C.cobalt, background: done ? C.cobalt : "transparent", padding: done ? "4px 10px" : 0, borderRadius: 8 }}>
                {v}
                {done && <Check size={16} />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 운영 리포트 — 막대가 자라고 추세선이 그려진다(수치는 표시하지 않는 개념도)
const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sp(frame, POP);
  const bars = [0.78, 0.6, 0.72, 0.55, 0.68];
  const labels = ["출결", "참여", "과제", "녹화 시청", "복습"];
  const line = prog(frame, 8, 26, ease.inOut);
  const pts = bars.map((b, i) => [70 + i * 130, 330 - b * 230 - 30] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  return (
    <div style={{ position: "absolute", left: 110, top: 150, width: 800, height: 470, borderRadius: 18, background: C.white, boxShadow: `0 30px 60px ${C.shadow}`, transform: `scale(${0.75 + 0.25 * s})`, opacity: Math.min(1, s * 2), overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 32, top: 26, fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.ink }}>수업 운영 리포트</div>
      <Caption size={18} style={{ position: "absolute", right: 32, top: 36 }}>
        관리자 · 이번 주
      </Caption>
      <svg width={800} height={470} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={40} x2={760} y1={400} y2={400} stroke={C.ink} strokeOpacity={0.2} strokeWidth={2} />
        {bars.map((b, i) => {
          const g = prog(frame, 2 + i * 3, 14 + i * 3, ease.outBack);
          const h = Math.max(0, b * 230 * g);
          return <rect key={i} x={40 + i * 145} y={400 - h} width={86} height={h} rx={8} fill={i === 1 ? C.signal : C.cobalt} />;
        })}
        <path d={d} transform="translate(13,40)" fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray={900} strokeDashoffset={900 * (1 - line)} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {labels.map((l, i) => (
        <div key={l} style={{ position: "absolute", left: 40 + i * 145, width: 86, top: 412, textAlign: "center", fontFamily: FONT.sans, fontWeight: 600, fontSize: 19, color: C.ink, whiteSpace: "nowrap", marginLeft: l.length > 3 ? -20 : 0, marginRight: l.length > 3 ? -20 : 0 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const PAIRS: Pair[] = [
  { a: "판서는,", b: "파일로.", photo: "mokdong-point.jpg", pos: "62% 40%", tag: "전자칠판 판서", btag: "EDB 교안", circle: { cx: 575, cy: 150, rx: 345, ry: 112 }, Panel: EdbCard },
  { a: "설명은,", b: "영상으로.", photo: "case-daegu.jpg", pos: "55% 40%", tag: "수업 중 설명", btag: "자동 녹화 · 다시보기", circle: { cx: 1545, cy: 480, rx: 165, ry: 285 }, Panel: VideoPlayer },
  { a: "복습은,", b: "앱으로.", clip: "quad-tablet.mp4", pos: "50% 45%", tag: "수업 후 복습", btag: "LMS · 과제", Panel: PhoneApp },
  { a: "운영은,", b: "데이터로.", photo: "mokdong-wide.jpg", pos: "50% 45%", tag: "학원 운영", btag: "관리자 데이터", Panel: Dashboard },
];

const PairShot: React.FC<{ pair: Pair; index: number }> = ({ pair, index }) => {
  const frame = useCurrentFrame();
  const punch = interpolate(frame, [0, 8], [1.16, 1.08], { ...clamp, easing: ease.outExpo });
  const drift = interpolate(frame, [8, 60], [0, 0.04], clamp);
  const panel = prog(frame, B, B + 8, ease.outExpo);
  const dim = interpolate(frame, [B, B + 6], [1, 0.5], clamp);
  const sh = shake(frame, B, 10, 12, `p${index}`);
  const { Panel } = pair;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${-panel * 260}px)` }}>
        {pair.clip ? (
          <Clip src={pair.clip} pos={pair.pos} scale={punch + drift} filter={`contrast(1.12) saturate(0.82) brightness(${dim})`} />
        ) : (
          <Photo src={pair.photo ?? ""} pos={pair.pos} scale={punch + drift} filter={`contrast(1.12) saturate(0.82) brightness(${dim})`} />
        )}
        <AbsoluteFill style={{ background: "linear-gradient(20deg, rgba(10,11,20,0.82) 0%, rgba(10,11,20,0.35) 42%, rgba(10,11,20,0) 70%)" }} />
        {pair.circle && <HandCircle {...pair.circle} start={3} dur={12} width={8} seed={`pc${index}`} />}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 110, bottom: 130, transform: `translateX(${-panel * 40}px)` }}>
        <Slam start={0} from={1.45} origin="0% 100%" style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 230, lineHeight: 1, letterSpacing: "-0.05em", color: C.white }}>
          {pair.a}
        </Slam>
      </div>
      <Tag x={118} y={700} start={2} index={`0${index + 1}`} text={pair.tag} size={34} rotate={-1.5} />
      {frame >= B && (
        <div style={{ position: "absolute", left: PANEL_X, top: 0, width: PANEL_W, height: 1080, transform: `translateX(${(1 - panel) * PANEL_W}px) translate(${sh.x}px, ${sh.y}px)` }}>
          <div style={{ position: "absolute", inset: 0, background: C.lime, clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%)" }}>
            <div style={{ position: "absolute", inset: 0, ...limeGrid(40) }} />
          </div>
          <Sequence from={B} layout="none">
            <Panel />
          </Sequence>
          <Tag x={160} y={96} start={B + 2} index="→" text={pair.btag} size={30} rotate={1.5} dark />
          <div style={{ position: "absolute", left: 150, bottom: 130 }}>
            <Slam start={B} from={1.5} origin="0% 100%" style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 200, lineHeight: 1, letterSpacing: "-0.05em", color: C.ink }}>
              {pair.b}
            </Slam>
          </div>
        </div>
      )}
      <Flash at={0} dur={5} max={0.35} />
    </AbsoluteFill>
  );
};

export const Chant: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    {PAIRS.map((pair, i) => (
      <Sequence key={pair.a} from={A_BEATS[i]} durationInFrames={(A_BEATS[i + 1] ?? TO - FROM) - A_BEATS[i]}>
        <PairShot pair={pair} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
