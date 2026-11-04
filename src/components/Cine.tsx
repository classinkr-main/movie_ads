import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { quadToMatrix3d, type Pt } from "../lib/homography";
import { H } from "../lib/hwTheme";

/* ───────────────────────────── 텍스트 ───────────────────────────── */

export const t = (size: number, weight: number, color: string = H.text, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.015em",
  lineHeight: 1.2,
  ...extra,
});

// 한 줄씩 아래에서 마스크로 올라오는 헤드라인
export const Lines: React.FC<{ lines: React.ReactNode[]; delay?: number; gap?: number; size?: number; weight?: number; color?: string; stagger?: number; style?: React.CSSProperties }> = ({
  lines,
  delay = 0,
  gap = 0,
  size = 84,
  weight = 600,
  color = H.text,
  stagger = 7,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {lines.map((l, i) => {
        const f = frame - delay - i * stagger;
        const s = sp(f, fps, SMOOTH, 26);
        const o = interpolate(f, [0, 10], [0, 1], clamp);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
            <div style={{ ...t(size, weight, color, { letterSpacing: "-0.035em", lineHeight: 1.12, wordBreak: "keep-all" }), transform: `translateY(${(1 - s) * 110}%)`, opacity: o }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Fade: React.FC<{ delay?: number; duration?: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; out?: number }> = ({ delay = 0, duration = 14, children, style, y = 16, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, duration + 10);
  let o = interpolate(frame - delay, [0, duration], [0, 1], clamp);
  if (out !== undefined) o *= interpolate(frame, [out - 10, out], [1, 0], clamp);
  return <div style={{ opacity: o, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};

// 챕터 라벨: "01 — DESIGN" + 가는 그린 라인
export const ChapterTag: React.FC<{ n: string; en: string; delay?: number; style?: React.CSSProperties }> = ({ n, en, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, 20);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, ...style }}>
      <span style={{ width: 54 * s, height: 2, background: H.mint }} />
      <span style={{ ...t(20, 700, H.mint, { letterSpacing: "0.26em" }), opacity: s }}>
        {n} — {en}
      </span>
    </div>
  );
};

// 스펙 칩 — 다크 유리 배경, 민트 수치
export const Spec: React.FC<{ value: string; label?: string; delay?: number; size?: number; style?: React.CSSProperties }> = ({ value, label, delay = 0, size = 22, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, { damping: 16, stiffness: 220, mass: 0.7 });
  const o = interpolate(frame - delay, [0, 5], [0, 1], clamp);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 10,
        padding: `${size * 0.5}px ${size * 0.9}px`,
        borderRadius: 12,
        background: "rgba(10,14,12,0.55)",
        border: `1px solid ${H.line2}`,
        backdropFilter: "blur(10px)",
        opacity: o,
        transform: `translateY(${(1 - s) * 18}px) scale(${0.9 + s * 0.1})`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={t(size * 1.15, 800, H.mint, { letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" })}>{value}</span>
      {label && <span style={t(size * 0.82, 600, H.muted)}>{label}</span>}
    </div>
  );
};

/* ───────────────────────────── 스테이지 ───────────────────────────── */

export const DarkStage: React.FC<{ children?: React.ReactNode; glow?: boolean; grid?: boolean }> = ({ children, glow = true, grid = false }) => {
  const frame = useCurrentFrame();
  const gx = 70 + Math.sin(frame / 110) * 10;
  const gy = 40 + Math.cos(frame / 130) * 8;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${H.bg3} 0%, ${H.bg} 75%)` }}>
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${H.line} 1px, transparent 1px), linear-gradient(90deg, ${H.line} 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
            opacity: 0.35,
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 80%)",
          }}
        />
      )}
      {glow && <AbsoluteFill style={{ background: `radial-gradient(ellipse 36% 40% at ${gx}% ${gy}%, rgba(0,163,108,0.22) 0%, rgba(0,163,108,0) 70%)` }} />}
      {children}
    </AbsoluteFill>
  );
};

// 제품 사진 플레이트. 이미지를 1920×1080 에 cover 로 깔고, 자식은 "이미지 픽셀 좌표계" 에 놓인다(화면 합성용).
// zoom/focus 로 느린 푸시인(켄 번즈)을 만들고, grade 로 CSS 필터 그레이딩을 건다.
export const Plate: React.FC<{
  src: string;
  w: number;
  h: number;
  children?: React.ReactNode;
  focus?: [number, number]; // 0–1, 줌 중심
  zoom?: [number, number]; // 시작·끝 배율
  pan?: [number, number]; // 끝 시점 추가 이동(px)
  offset?: [number, number]; // 상시 이동(px) — 피사체를 화면 한쪽으로 치우치게 할 때
  over?: number; // 줌 지속 프레임
  grade?: string; // CSS filter
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ src, w, h, children, focus = [0.5, 0.5], zoom = [1.04, 1.12], pan = [0, 0], offset = [0, 0], over = 240, grade, opacity = 1, style }) => {
  const frame = useCurrentFrame();
  const W = 1920;
  const Hh = 1080;
  const s = Math.max(W / w, Hh / h);
  const rw = w * s;
  const rh = h * s;
  const ox = (W - rw) / 2;
  const oy = (Hh - rh) / 2;
  const p = interpolate(frame, [0, over], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  const z = zoom[0] + (zoom[1] - zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity, ...style }}>
      <AbsoluteFill style={{ transform: `translate(${offset[0] + pan[0] * p}px, ${offset[1] + pan[1] * p}px) scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: grade }}>
        <div style={{ position: "absolute", left: ox, top: oy, width: rw, height: rh }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${s})`, transformOrigin: "0 0" }}>
            <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "block" }} />
            {children}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 사진 속 화면 사변형에 콘텐츠를 투영한다. 좌표는 Plate 의 이미지 픽셀 좌표계.
export const Screen: React.FC<{ quad: [Pt, Pt, Pt, Pt]; w?: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({ quad, w = 1600, h = 900, children, style, glow = 0 }) => {
  const m = quadToMatrix3d(w, h, quad);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: m, transformOrigin: "0 0", overflow: "hidden", boxShadow: glow > 0 ? `0 0 ${60 * glow}px rgba(110,231,183,${0.25 * glow})` : undefined, ...style }}>
      {children}
    </div>
  );
};

// 하단 그라데이션(로어서드 텍스트 가독성)
export const BottomShade: React.FC<{ height?: number; opacity?: number }> = ({ height = 620, opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height, background: `linear-gradient(180deg, rgba(7,9,8,0) 0%, rgba(7,9,8,0.55) 45%, rgba(7,9,8,0.92) 100%)`, opacity, pointerEvents: "none" }} />
);
export const LeftShade: React.FC<{ width?: number; opacity?: number }> = ({ width = 1100, opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width, background: `linear-gradient(90deg, rgba(7,9,8,0.94) 0%, rgba(7,9,8,0.7) 45%, rgba(7,9,8,0) 100%)`, opacity, pointerEvents: "none" }} />
);

export const TopShade: React.FC<{ height?: number; opacity?: number }> = ({ height = 260, opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height, background: `linear-gradient(180deg, rgba(7,9,8,0.8) 0%, rgba(7,9,8,0.35) 50%, rgba(7,9,8,0) 100%)`, opacity, pointerEvents: "none" }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

// 시네마 레터박스. visible 0–1 로 바가 들어오고 나간다.
export const Letterbox: React.FC<{ visible: number; bar?: number }> = ({ visible, bar = 96 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar * visible, background: H.black }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar * visible, background: H.black }} />
  </>
);

// 사선으로 지나가는 빛줄기 — 오프닝·전환 포인트
export const LightSweep: React.FC<{ delay?: number; duration?: number; width?: number; opacity?: number; angle?: number }> = ({ delay = 0, duration = 40, width = 260, opacity = 0.5, angle = -18 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, duration], [-0.4, 1.4], clamp);
  const o = interpolate(frame - delay, [0, 6, duration - 8, duration], [0, opacity, opacity, 0], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: "-30%", bottom: "-30%", left: `${p * 100}%`, width, transform: `skewX(${angle}deg)`, background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${o}) 50%, rgba(255,255,255,0) 100%)`, filter: "blur(18px)" }} />
    </AbsoluteFill>
  );
};

// 필름 그레인(다크 배경용 — overlay 블렌드)
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`fg${frame}`) * 1000);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: "260px 260px",
      }}
    />
  );
};

/* ───────────────────────────── 장치 ───────────────────────────── */

// 트래킹 레티클 — 모서리 브래킷 + 중앙 십자 + 라벨
export const Reticle: React.FC<{ x: number; y: number; w: number; h: number; label?: string; color?: string; opacity?: number; thickness?: number; labelPos?: "top" | "bottom" }> = ({ x, y, w, h, label, color = H.mint, opacity = 1, thickness = 3, labelPos = "top" }) => {
  const frame = useCurrentFrame();
  const L = Math.min(w, h) * 0.18;
  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <>
      <div style={{ position: "absolute", left: cx - (sx < 0 ? L : 0), top: cy - (sy < 0 ? thickness : 0), width: L, height: thickness, background: color }} />
      <div style={{ position: "absolute", left: cx - (sx < 0 ? thickness : 0), top: cy - (sy < 0 ? L : 0), width: thickness, height: L, background: color }} />
    </>
  );
  const blink = frame % 24 < 14;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity }}>
      {corner(0, 0, 1, 1)}
      {corner(w, 0, -1, 1)}
      {corner(0, h, 1, -1)}
      {corner(w, h, -1, -1)}
      <div style={{ position: "absolute", left: w / 2 - 14, top: h / 2, width: 28, height: 2, background: color, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: w / 2, top: h / 2 - 14, width: 2, height: 28, background: color, opacity: 0.8 }} />
      {label && (
        <div style={{ position: "absolute", left: 0, top: labelPos === "top" ? -40 : h + 12, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(7,9,8,0.7)", border: `1px solid ${color}`, borderRadius: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: color, opacity: blink ? 1 : 0.25 }} />
          <span style={t(16, 800, color, { letterSpacing: "0.16em" })}>{label}</span>
        </div>
      )}
    </div>
  );
};

// 지문 자국 SVG — 동심 타원 호
export const Fingerprint: React.FC<{ size?: number; rotate?: number; opacity?: number; style?: React.CSSProperties }> = ({ size = 120, rotate = 0, opacity = 0.5, style }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ position: "absolute", transform: `rotate(${rotate}deg)`, opacity, ...style }}>
    {Array.from({ length: 8 }).map((_, i) => {
      const rx = 8 + i * 5.2;
      const ry = 12 + i * 6.6;
      return <ellipse key={i} cx={50} cy={65} rx={rx} ry={ry} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} strokeDasharray={`${18 + i * 7} ${6 + i * 2}`} strokeDashoffset={i * 9} />;
    })}
  </svg>
);

// 작은 로고 워드마크(상단 좌측 고정용)
export const Brand: React.FC<{ height?: number; style?: React.CSSProperties }> = ({ height = 26, style }) => (
  <Img src={staticFile("brand/classin-wordmark.png")} style={{ height, width: "auto", display: "block", ...style }} />
);
