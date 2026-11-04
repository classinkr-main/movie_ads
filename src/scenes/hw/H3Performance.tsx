import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ChapterTag, DarkStage, Fade, Lines, Plate, Spec, t, Vignette } from "../../components/Cine";
import { clamp, SMOOTH, SNAP, sp } from "../../lib/motion";
import { H } from "../../lib/hwTheme";

// 보드 화면 속 데스크톱 — 창 세 개가 또각또각 열린다(반응성), 펜 선이 지연 없이 그려진다.
const WINS = [
  { id: "classin", title: "Classin — 중2 수학 B반 · 수업 중", x: 36, y: 34, w: 600, h: 400, at: 28 },
  { id: "pptx", title: "3단원_교안.pptx", x: 330, y: 120, w: 520, h: 330, at: 46 },
  { id: "web", title: "문제은행 — 브라우저", x: 560, y: 56, w: 400, h: 290, at: 62 },
] as const;
const STROKE_AT = 118;
const CURSOR = [
  { at: 0, x: 500, y: 320 },
  { at: 24, x: 230, y: 230 },
  { at: 44, x: 560, y: 260 },
  { at: 60, x: 760, y: 160 },
  { at: 100, x: 250, y: 300 },
] as const;

const Window: React.FC<{ title: string; x: number; y: number; w: number; h: number; at: number; children: React.ReactNode; accent?: string }> = ({ title, x, y, w, h, at, children, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - at, fps, SNAP);
  const o = interpolate(frame - at, [0, 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, overflow: "hidden", background: "#1B2220", border: `1px solid ${H.line2}`, boxShadow: "0 30px 60px rgba(0,0,0,0.55)", opacity: o, transform: `scale(${0.86 + s * 0.14}) translateY(${(1 - s) * 14}px)`, transformOrigin: "40% 30%" }}>
      <div style={{ height: 34, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "#232B28", borderBottom: `1px solid ${H.line}` }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#FF5F57" }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#FEBC2E" }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#28C840" }} />
        <span style={{ ...t(13, 700, H.muted), marginLeft: 8 }}>{title}</span>
        {accent && <span style={{ marginLeft: "auto", ...t(11, 800, H.bg, { letterSpacing: "0.1em" }), background: accent, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 34, bottom: 0 }}>{children}</div>
    </div>
  );
};

// 03 — 퍼포먼스: Windows 기반 OPS PC 내장, 쓰던 프로그램 그대로, 0.03s 터치 응답
export const H3Performance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boardIn = sp(frame - 8, fps, SMOOTH, 30);
  // 커서 위치 보간
  let cx = CURSOR[0].x;
  let cy = CURSOR[0].y;
  for (let i = 1; i < CURSOR.length; i++) {
    const a = CURSOR[i - 1];
    const b = CURSOR[i];
    if (frame >= a.at) {
      const p = sp(frame - a.at, fps, SMOOTH, Math.max(8, b.at - a.at - 4));
      cx = a.x + (b.x - a.x) * p;
      cy = a.y + (b.y - a.y) * p;
    }
  }
  const strokeP = interpolate(frame, [STROKE_AT, STROKE_AT + 40], [0, 1], { ...clamp, easing: (x) => x });
  const strokeLen = 760;
  const latency = sp(frame - (STROKE_AT + 44), fps, SMOOTH, 22);

  return (
    <DarkStage glow>
      <Plate src="hw/ops-chip.jpg" w={1536} h={1024} zoom={[1.12, 1.2]} focus={[0.3, 0.5]} over={220} opacity={0.5} grade="brightness(0.65) saturate(0.9)" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,9,8,0.92) 0%, rgba(7,9,8,0.6) 45%, rgba(7,9,8,0.2) 100%)" }} />
      <Vignette strength={0.5} />

      {/* 좌: 카피 */}
      <div style={{ position: "absolute", left: 150, top: 170, width: 700 }}>
        <ChapterTag n="03" en="PERFORMANCE" delay={8} />
        <Lines lines={["Windows 기반", "OPS PC 내장"]} delay={18} size={84} style={{ marginTop: 20 }} />
        <Fade delay={44} y={14} style={{ marginTop: 24 }}>
          <div style={t(28, 400, H.muted, { lineHeight: 1.55, wordBreak: "keep-all" })}>
            쓰던 프로그램을 그대로, 케이블 없이. <span style={{ color: H.text, fontWeight: 600 }}>켜는 순간 수업이 시작됩니다.</span>
          </div>
        </Fade>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34, width: 640 }}>
          <Spec value="i5" label="OPS 표준 탑재" delay={70} size={20} />
          <Spec value="16GB" label="RAM" delay={76} size={20} />
          <Spec value="256GB" label="SSD" delay={82} size={20} />
          <Spec value="0.03s" label="터치 응답" delay={STROKE_AT + 46} size={20} />
        </div>
      </div>

      {/* 우: 보드 프레임 속 데스크톱 */}
      <div style={{ position: "absolute", left: 880, top: 180, width: 960, height: 600, opacity: boardIn, transform: `translateX(${(1 - boardIn) * 80}px)` }}>
        <div style={{ position: "absolute", inset: -14, borderRadius: 26, background: "linear-gradient(180deg, #F2F2EF, #D9D9D4)", boxShadow: "0 50px 120px rgba(0,0,0,0.6)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", background: "radial-gradient(ellipse 80% 70% at 30% 20%, #16302A 0%, #0B1512 60%, #070B0A 100%)" }}>
          {/* 바탕화면 아이콘 열 */}
          {["Classin", "교안", "출석부", "문제은행"].map((n, i) => (
            <div key={n} style={{ position: "absolute", left: 16, top: 16 + i * 70, width: 54, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: i === 0 ? H.green : "rgba(255,255,255,0.14)" }} />
              <span style={t(11, 600, H.muted)}>{n}</span>
            </div>
          ))}
          {/* 창 */}
          <Window {...WINS[0]} accent={H.mint}>
            <div style={{ position: "absolute", inset: 0, display: "flex" }}>
              <div style={{ flex: 1, margin: 12, borderRadius: 8, background: "#F7F6F2", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 14, top: 10, ...t(13, 800, "#1C1B17") }}>3단원 이차함수 · 판서</div>
                <svg width="100%" height="100%" viewBox="0 0 420 300" style={{ position: "absolute", inset: 0 }}>
                  <path d="M30 240 L390 240 M60 40 L60 270" stroke="#C9C6BC" strokeWidth={2} fill="none" />
                  <path d="M70 230 C 140 20, 260 20, 380 230" stroke="#1C1B17" strokeWidth={4} fill="none" strokeDasharray={strokeLen} strokeDashoffset={strokeLen * (1 - strokeP)} strokeLinecap="round" />
                  <text x={300} y={70} fontFamily="Pretendard" fontWeight={800} fontSize={18} fill="#1C1B17" opacity={strokeP > 0.95 ? 1 : 0}>
                    y = ax² + bx + c
                  </text>
                </svg>
                {/* 펜 촉 */}
                {strokeP > 0 && strokeP < 1 && (() => {
                  // 베지어 근사 위치
                  const tt = strokeP;
                  const x = (1 - tt) ** 3 * 70 + 3 * (1 - tt) ** 2 * tt * 140 + 3 * (1 - tt) * tt ** 2 * 260 + tt ** 3 * 380;
                  const y = (1 - tt) ** 3 * 230 + 3 * (1 - tt) ** 2 * tt * 20 + 3 * (1 - tt) * tt ** 2 * 20 + tt ** 3 * 230;
                  const sx = 576 / 420;
                  const sy = 366 / 300;
                  return <div style={{ position: "absolute", left: x * sx - 8, top: y * sy - 8, width: 16, height: 16, borderRadius: 999, background: H.mint, boxShadow: `0 0 18px ${H.mint}` }} />;
                })()}
              </div>
              <div style={{ width: 120, display: "flex", flexDirection: "column", gap: 8, padding: "12px 12px 12px 0" }}>
                {["김지민", "박도윤", "이수아"].map((n) => (
                  <div key={n} style={{ height: 68, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: `1px solid ${H.line}`, display: "flex", alignItems: "flex-end", padding: 6 }}>
                    <span style={t(11, 700, H.muted)}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Window>
          <Window {...WINS[1]}>
            <div style={{ position: "absolute", inset: 0, display: "flex", gap: 10, padding: 10 }}>
              <div style={{ width: 90, display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 44, borderRadius: 4, background: i === 1 ? "rgba(110,231,183,0.25)" : "rgba(255,255,255,0.08)", border: `1px solid ${i === 1 ? H.mint : H.line}` }} />
                ))}
              </div>
              <div style={{ flex: 1, borderRadius: 6, background: "#FFFFFF", padding: 16 }}>
                <div style={t(16, 800, "#1C1B17")}>이차함수의 그래프</div>
                <div style={{ marginTop: 10, height: 8, width: "70%", background: "#E4E2DA", borderRadius: 4 }} />
                <div style={{ marginTop: 8, height: 8, width: "55%", background: "#E4E2DA", borderRadius: 4 }} />
                <div style={{ marginTop: 8, height: 8, width: "62%", background: "#E4E2DA", borderRadius: 4 }} />
              </div>
            </div>
          </Window>
          <Window {...WINS[2]}>
            <div style={{ position: "absolute", inset: 0, padding: 10 }}>
              <div style={{ height: 26, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 10px", ...t(11, 600, H.muted) }}>classin.co.kr/…</div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(110,231,183,0.3)" }} />
                  <div style={{ height: 8, flex: 1, background: "rgba(255,255,255,0.14)", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </Window>
          {/* 커서 */}
          <svg width={26} height={30} viewBox="0 0 26 30" style={{ position: "absolute", left: cx, top: cy, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
            <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L21 17 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
          </svg>
          {/* 작업 표시줄 */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 40, background: "rgba(12,16,15,0.85)", borderTop: `1px solid ${H.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            {[H.green, "rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)"].map((c, i) => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: c }} />
            ))}
            <div style={{ position: "absolute", right: 14, ...t(11, 600, H.muted) }}>14:02</div>
          </div>
        </div>
        {/* 지연 비교 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, opacity: latency, transform: `translateY(${(1 - latency) * 14}px)` }}>
          {[
            { l: "일반 전자칠판", v: "80–120ms", w: 1, c: "rgba(255,255,255,0.22)" },
            { l: "Classin Board", v: "30ms", w: 0.27, c: H.mint },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
              <span style={{ ...t(16, 700, r.c === H.mint ? H.text : H.muted), width: 150 }}>{r.l}</span>
              <div style={{ flex: 1, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${r.w * 100 * latency}%`, height: "100%", background: r.c, borderRadius: 999 }} />
              </div>
              <span style={{ ...t(16, 800, r.c === H.mint ? H.mint : H.muted, { fontVariantNumeric: "tabular-nums" }), width: 100, textAlign: "right" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </DarkStage>
  );
};
