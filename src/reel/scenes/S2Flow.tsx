import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../../lib/motion";
import { FONT_FAMILY } from "../../lib/fonts";
import { Clip, Photo } from "../media";
import { Brackets, Flash, LightLeak, Mono, RecDot, Timecode } from "../fx";
import { MaskLine } from "../type";
import { R } from "../theme";

/*
 * S2 수업 흐름 몽타주 (글로벌 168–510f · 5.7s)
 * 5비트 × 66f(1.1s). 각 비트는 12f 겹치며 오른쪽에서 휩 인 → 왼쪽으로 휩 아웃.
 * 비트마다 사진은 초점이 맞아 들어오고(랙 포커스), 컷 순간에 라이트 릭이 번진다.
 * 카피가 이어 읽히도록 썼다: 판서는 EDB로 저장되고 → 카메라가 수업을 그대로 담고 → 좋은 교안은 템플릿이 되고
 *                         → 자동 녹화된 수업으로 복습하고 → 운영은 감이 아니라 기준으로
 */
export const BEAT_LEN = 66;
const OVERLAP = 12;

type Beat = {
  word: string;
  en: string;
  line: string;
  align?: "left" | "right";
  render: () => React.ReactNode;
};

const glass: React.CSSProperties = {
  background: "rgba(8,26,19,0.62)",
  border: "1.5px solid rgba(255,255,255,0.16)",
  borderRadius: 26,
  backdropFilter: "blur(16px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
};

const pop = (f: number, at: number, fps: number) => sp(f - at, fps, { damping: 14, stiffness: 210, mass: 0.7 });
const draw = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: easeOutExpo });

/* ---------- 비트별 오버레이 ---------- */

// 01 판서 — 사진 속 오른쪽 칠판 위에 민트 마커가 그어지고, EDB 저장 칩이 뜬다
const InkStrokes: React.FC = () => {
  const f = useCurrentFrame();
  const a = draw(f, 8, 30);
  const b = draw(f, 22, 40);
  const c = draw(f, 34, 52);
  const stroke = { fill: "none", stroke: R.accent, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, strokeDasharray: 1, style: { filter: `drop-shadow(0 0 8px rgba(${R.accentRgb},0.7))` } };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d="M1080,262 C1040,300 1060,372 1180,380 C1320,388 1400,350 1390,300 C1380,250 1250,236 1120,250" {...stroke} strokeDashoffset={1 - a} />
      <path d="M1420,330 L1560,260 M1520,252 L1564,258 L1548,300" {...stroke} strokeDashoffset={1 - b} />
      <path d="M1068,428 C1180,418 1300,432 1420,420" {...stroke} strokeDashoffset={1 - c} />
    </svg>
  );
};

const EdbChip: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pop(f, 40, fps);
  return (
    <div style={{ position: "absolute", right: 120, top: 210, ...glass, borderRadius: 999, padding: "16px 28px", display: "flex", alignItems: "center", gap: 14, transform: `scale(${k})`, transformOrigin: "100% 50%", opacity: Math.min(1, k * 1.5) }}>
      <span style={{ width: 34, height: 34, borderRadius: 999, background: R.accent, color: R.accentInk, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22 }}>✓</span>
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 700, color: R.white }}>판서 · EDB 저장됨</span>
    </div>
  );
};

// 02 녹화 — 뷰파인더, REC, 타임코드, 레벨 미터(카피가 오른쪽이라 HUD는 왼쪽 위)
const sec2f = (s: number) => s * 60;
const RecHud: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [6, 16], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Brackets inset={150} len={70} thick={4} opacity={0.9} />
      <div style={{ position: "absolute", left: 200, top: 196, display: "flex", alignItems: "center", gap: 30 }}>
        <RecDot size={26} />
        <Timecode offset={sec2f(42 * 60 + 17)} size={26} color={R.white} />
      </div>
      <div style={{ position: "absolute", left: 200, top: 250, display: "flex", alignItems: "flex-end", gap: 7, height: 70 }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const h = 18 + Math.abs(Math.sin(f / 5 + i * 0.9) * Math.cos(f / 11 + i * 0.4)) * 52;
          return <span key={i} style={{ width: 8, height: h, borderRadius: 3, background: i > 10 ? R.accent : "rgba(255,255,255,0.8)" }} />;
        })}
      </div>
      {/* 화면 중앙 크로스헤어 */}
      <div style={{ position: "absolute", left: 1180, top: 470, width: 60, height: 60 }}>
        <div style={{ position: "absolute", left: 29, top: 0, width: 2, height: 60, background: "rgba(255,255,255,0.7)" }} />
        <div style={{ position: "absolute", top: 29, left: 0, height: 2, width: 60, background: "rgba(255,255,255,0.7)" }} />
      </div>
    </AbsoluteFill>
  );
};
// 03 교안 — EDB 페이지 카드가 부채꼴로 펼쳐진다
const PageStack: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { t: "도입 · 개념 정리", r: -10, x: -170, y: 40 },
    { t: "전개 · 판서 템플릿", r: -2, x: -60, y: -10 },
    { t: "정리 · 확인 문제", r: 7, x: 60, y: 30 },
  ];
  return (
    <div style={{ position: "absolute", right: 300, top: 250, width: 420, height: 300 }}>
      {cards.map((c, i) => {
        const k = pop(f, 10 + i * 6, fps);
        return (
          <div
            key={c.t}
            style={{
              position: "absolute",
              inset: 0,
              ...glass,
              background: `linear-gradient(160deg, ${R.board2} 0%, ${R.board} 100%)`,
              transform: `translate(${c.x * k}px, ${c.y * k + (1 - k) * 80}px) rotate(${c.r * k}deg)`,
              opacity: Math.min(1, k * 1.5),
              padding: 26,
            }}
          >
            <Mono size={16} color={R.accent}>{`EDB · 0${i + 1}`}</Mono>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 700, color: R.white, marginTop: 12 }}>{c.t}</div>
            <svg width={360} height={150} style={{ marginTop: 14 }}>
              <path d={i === 0 ? "M10,110 C80,20 160,20 230,90 S330,120 350,40" : i === 1 ? "M10,30 L340,30 M10,70 L260,70 M10,110 L300,110" : "M30,40 L80,40 M30,90 L80,90 M120,40 L330,40 M120,90 L300,90"} fill="none" stroke={i === 1 ? R.accent : "rgba(255,255,255,0.75)"} strokeWidth={6} strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 40, top: -84, transform: `scale(${pop(f, 34, fps)})`, transformOrigin: "0 50%" }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 800, color: R.accentInk, background: R.accent, borderRadius: 999, padding: "10px 22px" }}>우수 강사 템플릿으로 저장</span>
      </div>
    </div>
  );
};

// 04 복습 — 다시보기 플레이어
const Player: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pop(f, 8, fps);
  const prog = interpolate(f, [10, 84], [0.22, 0.48], clamp);
  return (
    <div style={{ position: "absolute", right: 120, top: 190, width: 620, ...glass, padding: "26px 30px", transform: `translateY(${(1 - k) * 60}px)`, opacity: Math.min(1, k * 1.4) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 52, height: 52, borderRadius: 999, background: R.accent, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 0, height: 0, borderLeft: "18px solid #111110", borderTop: "11px solid transparent", borderBottom: "11px solid transparent", marginLeft: 5 }} />
        </span>
        <div>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 800, color: R.white }}>오늘 수업 다시보기</div>
          <Mono size={15}>LMS · 수업 끝나면 바로</Mono>
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "8px 16px", background: "rgba(255,77,61,0.16)", border: "1.5px solid rgba(255,77,61,0.5)" }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#FF4D3D" }} />
          <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: R.white }}>자동 녹화</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 8, background: "rgba(255,255,255,0.18)", marginTop: 24 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, borderRadius: 8, background: R.accent }} />
        <div style={{ position: "absolute", left: `${prog * 100}%`, top: -7, width: 22, height: 22, marginLeft: -11, borderRadius: 999, background: R.white }} />
        {[0.3, 0.55, 0.78].map((m) => (
          <span key={m} style={{ position: "absolute", left: `${m * 100}%`, top: -4, width: 4, height: 16, background: "rgba(255,255,255,0.6)", borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
};

// 05 데이터 — 수업 리포트 카드(예시 막대, 수치 없음)
const Report: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pop(f, 6, fps);
  const rows = [
    { l: "출석", v: 0.94 },
    { l: "수업 참여", v: 0.78 },
    { l: "과제 제출", v: 0.86 },
    { l: "다시보기", v: 0.64 },
  ];
  return (
    <div style={{ position: "absolute", right: 120, top: 180, width: 560, ...glass, padding: "28px 32px", transform: `translateX(${(1 - k) * 90}px)`, opacity: Math.min(1, k * 1.4) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 800, color: R.white }}>수업 리포트</span>
        <Mono size={14}>관리자 · 예시 화면</Mono>
      </div>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
        {rows.map((r, i) => {
          const p = draw(f, 14 + i * 6, 50 + i * 6);
          return (
            <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ width: 120, fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 600, color: R.mute }}>{r.l}</span>
              <div style={{ flex: 1, height: 16, borderRadius: 16, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                <div style={{ width: `${r.v * p * 100}%`, height: "100%", borderRadius: 16, background: i === 1 ? R.accent : `linear-gradient(90deg, ${R.brand}, ${R.brandSoft})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BEATS: Beat[] = [
  {
    word: "판서",
    en: "Interactive Board",
    line: "판서는 EDB로 저장되고",
    render: () => (
      <Photo src="academy-dualboard" from={{ s: 1.14, x: 1.5 }} to={{ s: 1.04, x: -1 }} dur={BEAT_LEN + OVERLAP}>
        <InkStrokes />
        <EdbChip />
      </Photo>
    ),
  },
  {
    word: "녹화",
    en: "Class Recording",
    line: "카메라가 수업을 그대로 담고",
    align: "right",
    render: () => (
      <Photo src="academy-rec" from={{ s: 1.03, x: 1 }} to={{ s: 1.13, x: -1, y: -1 }} dur={BEAT_LEN + OVERLAP} position="50% 52%">
        <RecHud />
      </Photo>
    ),
  },
  {
    word: "교안",
    en: "EDB Lesson",
    line: "좋은 교안은 템플릿이 되고",
    render: () => (
      <Photo src="academy-edb" from={{ s: 1.16, x: -2 }} to={{ s: 1.05, x: 1 }} dur={BEAT_LEN + OVERLAP} position="50% 30%">
        <PageStack />
      </Photo>
    ),
  },
  {
    word: "복습",
    en: "Auto-recorded Review",
    line: "자동 녹화된 수업으로 복습하고",
    render: () => (
      <Clip src="laptop" from={{ s: 1.04 }} to={{ s: 1.14, x: -1.5 }} dur={BEAT_LEN + OVERLAP}>
        <Player />
      </Clip>
    ),
  },
  {
    word: "데이터",
    en: "Admin Insight",
    line: "운영은 감이 아니라 기준으로",
    render: () => (
      <Photo src="showroom-class2" from={{ s: 1.12, x: 2 }} to={{ s: 1.02 }} dur={BEAT_LEN + OVERLAP} position="50% 40%">
        <Report />
      </Photo>
    ),
  },
];

const BeatShot: React.FC<{ i: number; beat: Beat; last: boolean }> = ({ i, beat, last }) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 16], [1, 0], { ...clamp, easing: easeOutExpo });
  const exit = last ? 0 : interpolate(f, [BEAT_LEN, BEAT_LEN + OVERLAP], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x = enter * 46 - exit * 30;
  const blur = enter * 18 + exit * 14;
  // 랙 포커스 — 사진만 흐릿하게 시작해 초점이 맞아 들어온다(카피는 처음부터 선명)
  const focus = interpolate(f, [2, 24], [9, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const right = beat.align === "right";
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}%) scale(${1 + enter * 0.04})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, boxShadow: "-40px 0 80px rgba(0,0,0,0.5)" }}>
      <AbsoluteFill style={{ filter: focus > 0.2 ? `blur(${focus}px)` : undefined }}>{beat.render()}</AbsoluteFill>
      {/* 상단 스크림(흐름 레일 가독) · 하단 스크림(카피) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,11,8,0.6) 0%, rgba(3,11,8,0) 18%)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(${right ? -20 : 20}deg, rgba(3,11,8,0.92) 0%, rgba(3,11,8,0.55) 32%, rgba(3,11,8,0) 58%)` }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: 120, bottom: 112, fontFamily: FONT_FAMILY, color: R.white, textAlign: right ? "right" : "left" }}>
        <MaskLine at={4} dur={20}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: right ? "flex-end" : "flex-start" }}>
            <Mono size={22} color={R.accent}>{`0${i + 1}`}</Mono>
            <span style={{ width: 56, height: 2, background: R.accent }} />
            <Mono size={20}>{beat.en}</Mono>
          </div>
        </MaskLine>
        <MaskLine at={6} dur={24} style={{ marginTop: 6 }}>
          <div style={{ fontSize: 236, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.02 }}>{beat.word}</div>
        </MaskLine>
        <MaskLine at={14} dur={24}>
          <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.92)" }}>{beat.line}</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

// 상단 흐름 레일 — 5개 노드가 차례로 켜지며 선이 이어진다
const FlowRail: React.FC = () => {
  const f = useCurrentFrame();
  const total = BEAT_LEN * 5 + OVERLAP;
  const visible = interpolate(f, [8, 22, total - 22, total], [0, 1, 1, 0], clamp);
  const progress = interpolate(f, [OVERLAP, OVERLAP + BEAT_LEN * 4 + 30], [0, 1], clamp);
  const W = 1000;
  return (
    <div style={{ position: "absolute", top: 70, left: "50%", width: W, marginLeft: -W / 2, opacity: visible }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 9, height: 2, background: "rgba(255,255,255,0.22)" }} />
      <div style={{ position: "absolute", left: 0, top: 9, height: 2, width: W * progress, background: R.accent, boxShadow: `0 0 12px rgba(${R.accentRgb},0.8)` }} />
      {BEATS.map((b, i) => {
        const on = f >= OVERLAP + i * BEAT_LEN - 4;
        return (
          <div key={b.word} style={{ position: "absolute", left: (W * i) / 4, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: 999, background: on ? R.accent : R.night, border: `2px solid ${on ? R.accent : "rgba(255,255,255,0.4)"}`, boxShadow: on ? `0 0 16px rgba(${R.accentRgb},0.9)` : "none" }} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700, color: on ? R.white : "rgba(255,255,255,0.5)", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{b.word}</span>
          </div>
        );
      })}
    </div>
  );
};

export const S2Flow: React.FC = () => (
  <AbsoluteFill>
    {BEATS.map((b, i) => (
      <Sequence key={b.word} from={i * BEAT_LEN} durationInFrames={BEAT_LEN + OVERLAP} layout="none">
        <BeatShot i={i} beat={b} last={i === BEATS.length - 1} />
      </Sequence>
    ))}
    <FlowRail />
    {BEATS.map((b, i) => (
      <React.Fragment key={b.word}>
        <Flash at={i * BEAT_LEN + 6} len={10} peak={0.24} />
        <LightLeak at={i * BEAT_LEN} len={34} side={i % 2 ? "left" : "right"} peak={0.42} />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
