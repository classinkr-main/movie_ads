import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { APP, COVER, PENCIL } from "./theme";
import { Icon, IconName } from "./icons";
import { lerp, ramp, t } from "./kit";

// ClassIn 데스크톱 앱(홈) 화면을 기준으로 다시 그린 부품. 실제 계정·고객 이름은 쓰지 않는다.

export const Pill: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties; hot?: number }> = ({ children, dark = false, size = 14, style, hot = 0 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: `${size * 0.6}px ${size * 1.15}px`,
      borderRadius: 999,
      background: dark ? APP.black : hot > 0 ? `rgba(0,169,117,${0.12 + hot * 0.2})` : APP.pill,
      color: dark ? "#FFFFFF" : APP.ink,
      boxShadow: hot > 0 ? `0 0 0 ${2 * hot}px rgba(0,169,117,0.55)` : undefined,
      ...t(size, 700, dark ? "#FFFFFF" : APP.ink, { lineHeight: 1, whiteSpace: "nowrap" }),
      ...style,
    }}
  >
    {children}
  </span>
);

export const Badge: React.FC<{ n: number | string; size?: number }> = ({ n, size = 20 }) => (
  <span style={{ minWidth: size, height: size, padding: "0 5px", borderRadius: 999, background: APP.badge, display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", ...t(size * 0.55, 800, "#FFFFFF", { lineHeight: 1 }) }}>{n}</span>
);

const Lights: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
      <div key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)" }} />
    ))}
  </div>
);

// 앱 창 틀: 신호등 · 가운데 검색 · 검정 알약 · 더하기 · 오른쪽 새로고침
export const AppWindow: React.FC<{ x: number; y: number; w: number; h: number; pill?: string; children?: React.ReactNode; style?: React.CSSProperties; bar?: boolean }> = ({ x, y, w, h, pill = "수업 중 · 중2 수학 개별진도반 A", children, style, bar = true }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: APP.bg,
      borderRadius: 16,
      boxShadow: "0 34px 80px rgba(40,52,64,0.20), 0 3px 8px rgba(40,52,64,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      overflow: "hidden",
      ...style,
    }}
  >
    {bar ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 54, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <Lights />
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 18 }}>
          <Icon name="search" size={20} color={APP.ink} stroke={2} round />
          <Pill dark size={13}>
            {pill}
          </Pill>
          <Icon name="plusCircle" size={20} color={APP.ink} stroke={1.8} round />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
          <Icon name="refresh" size={19} color="#555" stroke={2} round />
          <Icon name="sideToggle" size={19} color="#B5B5B8" stroke={1.8} round />
        </div>
      </div>
    ) : null}
    <div style={{ position: "absolute", left: 0, right: 0, top: bar ? 54 : 0, bottom: 0 }}>{children}</div>
  </div>
);

export type NavItem = { icon: IconName; label: string; badge?: number; tag?: string; divider?: boolean };
export const NAV: NavItem[] = [
  { icon: "home", label: "홈" },
  { icon: "chat", label: "채팅", badge: 6 },
  { icon: "todo", label: "할 일", badge: 12 },
  { icon: "calendar", label: "캘린더" },
  { icon: "drive", label: "드라이브" },
  { icon: "board", label: "칠판", divider: true },
  { icon: "mirror", label: "미러링" },
];

export const Sidebar: React.FC<{ active?: string; extra?: NavItem; extraHot?: number; w?: number; f?: number }> = ({ active = "홈", extra, extraHot = 0, w = 200 }) => {
  const items = extra ? [...NAV, extra] : NAV;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: w, borderRight: `1px solid ${APP.line}`, background: APP.side }}>
      <div style={{ padding: "18px 26px 22px" }}>
        <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 22, filter: "brightness(0)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 14px" }}>
        {items.map((it) => {
          const on = it.label === active;
          const isExtra = extra && it.label === extra.label;
          return (
            <React.Fragment key={it.label}>
              {it.divider ? <div style={{ height: 1, background: APP.line, margin: "10px 12px" }} /> : null}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "11px 12px",
                  borderRadius: 12,
                  background: on ? APP.hover : isExtra && extraHot > 0 ? `rgba(0,169,117,${0.1 * extraHot})` : "transparent",
                }}
              >
                <Icon name={it.icon} size={21} color={APP.ink} stroke={1.8} round />
                <span style={t(15, on ? 800 : 600, APP.ink, { lineHeight: 1 })}>{it.label}</span>
                {it.tag ? <span style={{ ...t(11, 800, "#C8432F", { lineHeight: 1 }), border: "1.5px solid #C8432F", borderRadius: 4, padding: "3px 5px" }}>{it.tag}</span> : null}
                {it.badge ? (
                  <span style={{ marginLeft: "auto" }}>
                    <Badge n={it.badge} size={19} />
                  </span>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 26, bottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 99, background: "linear-gradient(135deg,#9FD9C2,#4FA88A)" }} />
        <span style={t(14, 700, APP.ink, { lineHeight: 1 })}>원장님</span>
      </div>
    </div>
  );
};

// 코스 카드 형식의 학생 카드
export const StudentCard: React.FC<{ id: string; title: string; sub: string; badge?: number; w?: number; h?: number; hot?: number; dim?: number; style?: React.CSSProperties }> = ({ id, title, sub, badge, w = 212, h = 246, hot = 0, dim = 1, style }) => {
  const [c1, c2] = COVER[id];
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 16,
        background: "#FFFFFF",
        border: `1px solid ${hot > 0 ? "rgba(240,72,62,0.6)" : APP.line}`,
        boxShadow: hot > 0 ? `0 0 0 ${3 * hot}px rgba(240,72,62,0.18), 0 10px 24px rgba(0,0,0,0.06)` : "0 1px 2px rgba(0,0,0,0.03)",
        padding: 8,
        boxSizing: "border-box",
        opacity: dim,
        ...style,
      }}
    >
      <div style={{ height: 108, borderRadius: 11, background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, position: "relative", overflow: "hidden" }}>
        <svg width={w - 16} height={108} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
          <path d={`M 16 ${78} C 60 30, 110 96, 160 46 S 230 30, 260 60`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          <text x={w - 70} y={40} style={{ fontFamily: "Nanum Pen Script", fontSize: 30 }} fill="#FFFFFF">
            x+3
          </text>
        </svg>
      </div>
      <div style={{ position: "absolute", left: 18, top: 92, width: 40, height: 40, borderRadius: 11, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="student" size={24} color={PENCIL[id]} stroke={2.1} round />
        <div style={{ position: "absolute", right: -3, bottom: -3, width: 12, height: 12, borderRadius: 99, background: APP.online, border: "2px solid #FFFFFF" }} />
      </div>
      <div style={{ padding: "30px 8px 0" }}>
        <div style={t(17, 800, APP.ink, { lineHeight: 1.2 })}>{title}</div>
        <div style={{ marginTop: 6, ...t(13, 500, APP.sub, { lineHeight: 1.3 }) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 12, display: "flex", alignItems: "center" }}>
        {badge ? <Badge n={badge} size={20} /> : <span />}
        <span style={{ marginLeft: "auto" }}>
          <Icon name="dots" size={18} color="#9A9A9E" stroke={2.2} round />
        </span>
      </div>
    </div>
  );
};

// 진행 막대(앱의 지표 카드)
export const Meter: React.FC<{ label: string; v: number; color?: string; f: number; at: number }> = ({ label, v, color = APP.teal, f, at }) => {
  const p = ramp(f, at, at + 18);
  return (
    <div style={{ border: `1px solid ${APP.line}`, borderRadius: 14, padding: "16px 18px", background: "#FFFFFF", opacity: ramp(f, at - 4, at + 2) }}>
      <div style={t(14, 600, APP.sub, { lineHeight: 1 })}>{label}</div>
      <div style={{ marginTop: 12, ...t(30, 800, APP.ink, { lineHeight: 1 }) }}>{Math.round(v * p)}%</div>
      <div style={{ marginTop: 12, height: 5, borderRadius: 9, background: "#EFEFF1" }}>
        <div style={{ width: `${v * p}%`, height: 5, borderRadius: 9, background: color }} />
      </div>
    </div>
  );
};

// 월계관 점수 (AI 평가)
export const LaurelScore: React.FC<{ v: number; f: number; at: number; label?: string }> = ({ v, f, at, label = "AI Eval." }) => {
  const p = ramp(f, at, at + 20);
  const leaf = (flip: boolean) => (
    <svg width={22} height={40} viewBox="0 0 22 40" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M 16 38 C 6 30, 4 18, 12 4" fill="none" stroke={APP.ink} strokeWidth={2.4} strokeLinecap="round" />
      {[8, 15, 22, 29].map((y, i) => (
        <path key={i} d={`M ${12 - i * 1.4} ${y} q -7 -2 -9 -7 q 6 0 9 7 Z`} fill={APP.ink} />
      ))}
    </svg>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: ramp(f, at - 2, at + 4) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {leaf(false)}
        <span style={t(48, 800, APP.ink, { lineHeight: 1, letterSpacing: "-0.03em" })}>{Math.round(lerp(0, v, p))}</span>
        {leaf(true)}
      </div>
      <span style={t(12, 500, APP.sub, { lineHeight: 1, marginTop: 4 })}>{label}</span>
    </div>
  );
};

export const useF = () => useCurrentFrame();
