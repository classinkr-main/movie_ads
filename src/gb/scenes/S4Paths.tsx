import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { APP, BRAND, COVER, INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { AppWindow, Pill, Sidebar } from "../app";
import { Icon } from "../icons";
import { CL, HandText, Hud, Ink, KText, Layer, PaperBg, StatusStamp, Sticky, Whip, eInOut, eOut, hand, lerp, ramp, roughArrow, roughEllipse, t } from "../kit";

// 모눈종이 위 ClassIn 앱 — AI가 진단 결과로 학생별 4주 진도 경로를 채운다 (방향 예시 · 가상 데이터).
const WIN = { x: 320, y: 392, w: 1480, h: 646 };
const MAIN = { x: 200 }; // 사이드바 폭
const COL0 = 300; // 1주 시작(메인 기준)
const CW = 240;
const ROW0 = 122;
const RH = 74;
const DIAG: Record<string, string> = { A: "표준", B: "앞선 진도", C: "보완", D: "약간 앞섬", E: "표준 · 활용 미달", F: "가장 앞섬" };
const UNITS: Record<string, string[]> = {
  A: ["방정식 복습·진단", "일차방정식 활용", "연립방정식 도입", "연립방정식 활용·평가"],
  B: ["일차방정식 활용", "연립방정식 도입", "연립방정식 활용", "일차부등식·평가"],
  C: ["중1 방정식 개념", "중1 일차방정식 복습", "이항·부호 정리 반복", "일차방정식 활용·평가"],
  D: ["연립방정식 도입", "일차부등식", "부등식 활용", "연립부등식 맛보기·평가"],
  E: ["방정식 복습·진단", "일차방정식 활용", "활용 재도전 → 연립", "연립방정식 기본·평가"],
  F: ["연립방정식 도입", "연립방정식 활용", "일차부등식 심화", "일차함수 도입·평가"],
};
const chipAt = (i: number, k: number) => 30 + i * 3 + k * 11;

const Plan: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const scan = interpolate(f, [8, 24], [ROW0 - 10, ROW0 + 6 * RH], { ...CL, easing: eInOut });
  const go = Math.max(0, 1 - Math.abs(f - 24) / 8);
  return (
    <div style={{ position: "absolute", left: MAIN.x, top: 0, right: 0, bottom: 0 }}>
      {/* 머리 */}
      <div style={{ position: "absolute", left: 28, top: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="spark" size={24} color={BRAND.green} draw={ramp(f, 4, 16)} round />
        <span style={t(22, 800, APP.ink, { lineHeight: 1 })}>AI 진도 설계</span>
        <span style={t(14, 500, APP.sub, { lineHeight: 1 })}>중2 수학 개별진도반 A · 진단 → 4주</span>
      </div>
      <div style={{ position: "absolute", right: 28, top: 14 }}>
        <Pill dark size={14} style={{ transform: `scale(${1 - go * 0.06})`, boxShadow: go > 0 ? `0 0 0 ${go * 6}px rgba(0,169,117,0.25)` : undefined }}>
          <Icon name="spark" size={15} color="#FFFFFF" round />
          경로 만들기
        </Pill>
      </div>
      {/* 오늘 열 */}
      <div style={{ position: "absolute", left: COL0 + CW, top: 76, width: CW, height: 6 * RH + 64, borderRadius: 12, background: "rgba(0,169,117,0.07)", opacity: ramp(f, 14, 24) }} />
      {/* 열 머리 */}
      {[
        ["학생", 28],
        ["진단", 172],
        ["1주", COL0 + 18],
        ["2주 · 오늘", COL0 + CW + 18],
        ["3주", COL0 + 2 * CW + 18],
        ["4주", COL0 + 3 * CW + 18],
      ].map(([l, x]) => (
        <span key={l as string} style={{ position: "absolute", left: x as number, top: 88, ...t(13, 700, l === "2주 · 오늘" ? BRAND.green : APP.sub, { lineHeight: 1 }), opacity: ramp(f, 6, 14) }}>
          {l}
        </span>
      ))}
      {/* 진단 스캔 */}
      {f >= 8 && f <= 26 ? <div style={{ position: "absolute", left: 160, top: scan, width: 130, height: 3, background: BRAND.green, boxShadow: `0 0 14px ${BRAND.green}` }} /> : null}
      {STUDENTS.map((s, i) => {
        const y = ROW0 + i * RH;
        const rowIn = ramp(f, 4 + i * 2, 12 + i * 2);
        const diagOn = ramp(f, 10 + i * 2.4, 16 + i * 2.4);
        const attn = s.id === "C" || s.id === "E";
        const xs = [0, 1, 2, 3].map((k) => COL0 + k * CW + CW / 2);
        const lastShown = [0, 1, 2, 3].filter((k) => f >= chipAt(i, k)).length;
        const lineEnd = lastShown === 0 ? xs[0] : xs[Math.min(3, lastShown - 1)] + ramp(f, chipAt(i, Math.min(3, lastShown)) - 11, chipAt(i, Math.min(3, lastShown)), eOut) * (lastShown < 4 ? CW : 0);
        return (
          <div key={s.id} style={{ position: "absolute", left: 0, right: 0, top: y, height: RH - 8 }}>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: -4, height: 1, background: APP.line }} />
            <div style={{ position: "absolute", left: 28, top: 14, display: "flex", alignItems: "center", gap: 10, opacity: rowIn }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: COVER[s.id][0], display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="student" size={20} color={PENCIL[s.id]} stroke={2.2} round />
              </div>
              <span style={t(16, 800, APP.ink, { lineHeight: 1 })}>학생 {s.id}</span>
            </div>
            <div style={{ position: "absolute", left: 164, top: 18, opacity: diagOn, transform: `scale(${lerp(0.8, 1, diagOn)})` }}>
              <span style={{ display: "inline-block", padding: "7px 11px", borderRadius: 999, background: attn ? "rgba(240,72,62,0.1)" : APP.pill, ...t(13, 700, attn ? APP.badge : APP.ink, { lineHeight: 1, whiteSpace: "nowrap" }) }}>{DIAG[s.id]}</span>
            </div>
            {/* 연결선 */}
            <svg width={COL0 + 4 * CW} height={RH} style={{ position: "absolute", left: 0, top: 0 }}>
              {lastShown > 0 ? <line x1={xs[0]} x2={Math.min(xs[3], lineEnd)} y1={33} y2={33} stroke={PENCIL[s.id]} strokeWidth={3} strokeLinecap="round" opacity={0.7} /> : null}
            </svg>
            {UNITS[s.id].map((u, k) => {
              const at = chipAt(i, k);
              const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 200 } });
              if (f < at) return null;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: COL0 + k * CW + 12,
                    top: 13,
                    width: CW - 24,
                    height: 40,
                    borderRadius: 999,
                    background: k === 1 ? "#FFFFFF" : COVER[s.id][0],
                    border: `1.5px solid ${k === 1 ? PENCIL[s.id] : "rgba(0,0,0,0.04)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${lerp(0.6, 1, p)})`,
                    opacity: interpolate(f - at, [0, 3], [0, 1], CL),
                    ...t(14, k === 1 ? 800 : 600, APP.ink, { lineHeight: 1, whiteSpace: "nowrap" }),
                  }}
                >
                  {u}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const S4Paths: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: f, fps, config: { damping: 20, stiffness: 110 } });
  const cRowY = WIN.y + 54 + ROW0 + 2 * RH + 30;
  const fRowY = WIN.y + 54 + ROW0 + 5 * RH + 30;
  const aC = roughArrow([250, cRowY - 70], [WIN.x + MAIN.x + 150, cRowY - 4], -0.25, 5);
  const aF = roughArrow([250, fRowY + 40], [WIN.x + MAIN.x + 150, fRowY + 2], 0.25, 6);
  return (
    <Whip id="s4whip" exit={120}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <PaperBg paper={PAPER.graph} grid={1} gridGap={36} />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - win) * 60}px)`, opacity: interpolate(f, [0, 5], [0, 1], CL) }}>
          <AppWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} pill="AI 진도 설계 · 예시">
            <Sidebar active="개별진도" extra={{ icon: "route", label: "개별진도", tag: "예시" }} />
            <Plan f={f} />
          </AppWindow>
        </div>
        {/* 선생님 손글씨 메모 */}
        <HandText x={60} y={cRowY - 128} size={44} color={INK.red} at={58} dur={14} rotate={-4}>
          C는 중1 개념부터
        </HandText>
        <HandText x={70} y={fRowY + 36} size={44} color={INK.navy} at={74} dur={14} rotate={3}>
          F는 심화로!
        </HandText>
        <Layer>
          <Ink d={aC.body} color={INK.red} width={4} at={64} dur={10} />
          <Ink d={aC.head} color={INK.red} width={4} at={72} dur={4} />
          <Ink d={aF.body} color={INK.navy} width={4} at={80} dur={10} />
          <Ink d={aF.head} color={INK.navy} width={4} at={88} dur={4} />
          <Ink d={roughEllipse(WIN.x + MAIN.x + COL0 + 120, WIN.y + 54 + ROW0 + 2 * RH + 33, 128, 34, 77)} color={INK.red} width={4} at={66} dur={10} />
        </Layer>
        <Sticky x={1580} y={330} w={260} h={120} color="#FFE479" rot={4} at={92}>
          <div style={{ ...hand(38, "#3A3A3E"), lineHeight: 1.05 }}>AI가 짜고,</div>
          <div style={{ ...hand(38, "#3A3A3E"), lineHeight: 1.05 }}>선생님이 확인</div>
        </Sticky>
        <KText lines={[[{ t: "진단 결과로," }]]} at={6} size={100} style={{ position: "absolute", left: 116, top: 112 }} />
        <KText lines={[[{ t: "학생마다 " }, { t: "진도 경로", c: BRAND.green }, { t: "를 짜고," }]]} at={22} size={100} style={{ position: "absolute", left: 116, top: 236 }} />
        <Hud page={4} label="AI 진도 설계" />
        <StatusStamp kind="example" at={4} />
      </AbsoluteFill>
    </Whip>
  );
};

