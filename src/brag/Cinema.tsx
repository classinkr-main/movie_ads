import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { MONO } from "../lib/fonts";
import { clamp, sp } from "../lib/motion";
import { C } from "../lib/theme";

// 시네마틱 팔레트 — 밤의 숲(딥 그린 블랙) 위에 연두 빛, 아이보리 종이색 텍스트
export const K = {
  night: "#03110C",
  night2: "#072218",
  night3: "#0E3426",
  moss: "#1A4634",
  paper: "#F4F1E8",
  paperDim: "rgba(244,241,232,0.66)",
  paperFaint: "rgba(244,241,232,0.34)",
  rim: "rgba(200,240,90,0.55)",
} as const;

const easeInOut = Easing.inOut(Easing.cubic);

// 어두운 스테이지 — 방사형 베이스 + 위에서 떨어지는 볼류메트릭 빛줄기 + 먼지·보케
export const NightStage: React.FC<{ children?: React.ReactNode; beamX?: number; beamAngle?: number; seed?: string }> = ({ children, beamX = 70, beamAngle = 18, seed = "n" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const breathe = 0.85 + 0.15 * Math.sin(frame / 22);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 95% 70% at 50% 42%, ${K.night3} 0%, ${K.night2} 48%, ${K.night} 100%)`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `${beamX}%`,
          top: -400,
          width: 520,
          height: height + 800,
          transform: `translateX(-50%) rotate(${beamAngle}deg)`,
          background: "linear-gradient(to bottom, rgba(216,255,92,0.26) 0%, rgba(200,240,90,0.08) 45%, rgba(200,240,90,0) 80%)",
          filter: "blur(60px)",
          opacity: breathe,
          mixBlendMode: "screen",
        }}
      />
      {/* 보케 — 초점이 나간 큰 빛 */}
      {Array.from({ length: 7 }).map((_, i) => {
        const r = 60 + random(`${seed}br${i}`) * 140;
        const x = random(`${seed}bx${i}`) * width;
        const y = random(`${seed}by${i}`) * height - frame * (0.2 + random(`${seed}bv${i}`) * 0.4);
        return <div key={`b${i}`} style={{ position: "absolute", left: x, top: ((y % height) + height) % height, width: r, height: r, borderRadius: 999, background: i % 3 === 0 ? C.lime : K.paper, opacity: 0.05 + random(`${seed}bo${i}`) * 0.06, filter: "blur(10px)" }} />;
      })}
      {/* 먼지 */}
      {Array.from({ length: 34 }).map((_, i) => {
        const r = 2 + random(`${seed}dr${i}`) * 4;
        const x = random(`${seed}dx${i}`) * width + Math.sin(frame / 40 + i) * 14;
        const y = random(`${seed}dy${i}`) * height - frame * (0.3 + random(`${seed}dv${i}`) * 0.9);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / (18 + i) + i));
        return <div key={`d${i}`} style={{ position: "absolute", left: x, top: ((y % height) + height) % height, width: r, height: r, borderRadius: 999, background: K.paper, opacity: 0.35 * tw * random(`${seed}do${i}`) }} />;
      })}
      {children}
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};

// 밝은 스테이지 — 플래시 이후의 빛. 중앙 블룸 + 천천히 도는 빛살
export const DayStage: React.FC<{ children?: React.ReactNode; rays?: boolean }> = ({ children, rays = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 40%, #FFFFFF 0%, ${C.ivory} 55%, ${C.ivory2} 100%)`, overflow: "hidden" }}>
      {rays && (
        <AbsoluteFill
          style={{
            background: `repeating-conic-gradient(from ${frame * 0.25}deg at 50% 38%, rgba(200,240,90,0.16) 0deg 4deg, rgba(200,240,90,0) 4deg 15deg)`,
            maskImage: "radial-gradient(circle at 50% 38%, black 0%, transparent 62%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 38%, black 0%, transparent 62%)",
          }}
        />
      )}
      {children}
      <Vignette strength={0.14} color="8,71,52" />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.6, color = "0,0,0" }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 80% 70% at 50% 45%, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)` }} />
);

// 필름 그레인 — 어두운 장면에서도 보이도록 overlay 블렌드
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`fg${frame}`) * 1000);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: "256px 256px",
      }}
    />
  );
};

// 레터박스 — 스코프 비율 바. open 0→1이면 바가 화면 밖으로 빠진다
export const Letterbox: React.FC<{ top: number; bottom: number; open?: number }> = ({ top, bottom, open = 0 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top, background: "#000", transform: `translateY(${-open * top}px)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bottom, background: "#000", transform: `translateY(${open * bottom}px)` }} />
  </>
);

// 가상 카메라 — 키프레임 사이를 달리/팬하고, 그 위에 미세한 핸드헬드 흔들림을 얹는다
type CamKey = { f: number; s: number; x?: number; y?: number; r?: number };
export const Camera: React.FC<{ keys: CamKey[]; drift?: number; origin?: string; children: React.ReactNode }> = ({ keys, drift = 1, origin = "50% 50%", children }) => {
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const pick = (get: (k: CamKey) => number) => (keys.length === 1 ? get(keys[0]) : interpolate(frame, fs, keys.map(get), { ...clamp, easing: easeInOut }));
  const s = pick((k) => k.s);
  const x = pick((k) => k.x ?? 0) + Math.sin(frame / 47) * 4 * drift;
  const y = pick((k) => k.y ?? 0) + Math.cos(frame / 61) * 3 * drift;
  const r = pick((k) => k.r ?? 0) + Math.sin(frame / 83) * 0.12 * drift;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`, transformOrigin: origin }}>{children}</AbsoluteFill>;
};

// 블러 인 — 초점이 맞아 들어오며 자간이 조여진다(트레일러 타이틀)
export const BlurIn: React.FC<{ delay?: number; duration?: number; children: React.ReactNode; track?: [number, number]; rise?: number; blur?: number; style?: React.CSSProperties }> = ({
  delay = 0,
  duration = 20,
  children,
  track = [0.12, -0.02],
  rise = 18,
  blur = 22,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, duration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
        filter: p < 0.99 ? `blur(${(1 - p) * blur}px)` : undefined,
        letterSpacing: `calc(${interpolate(p, [0, 1], track)}em + var(--tadj, 0em))`,
        transform: `translateY(${(1 - p) * rise}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// 어절 단위 블러 인
export const Words: React.FC<{ text: string; delay?: number; stagger?: number; duration?: number; style?: React.CSSProperties; track?: [number, number] }> = ({ text, delay = 0, stagger = 4, duration = 20, style, track }) => (
  <span style={style}>
    {text.split(" ").map((w, i, arr) => (
      <React.Fragment key={i}>
        <BlurIn delay={delay + i * stagger} duration={duration} track={track}>
          {w}
        </BlurIn>
        {i < arr.length - 1 ? " " : null}
      </React.Fragment>
    ))}
  </span>
);

// 아나모픽 플레어 — 가로로 길게 번지는 빛줄기. at에서 최대
export const Flare: React.FC<{ at: number; y: number; duration?: number; color?: string; width?: number }> = ({ at, y, duration = 18, color = "216,255,92", width = 1080 }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  const k = interpolate(f, [-duration * 0.35, 0, duration * 0.65], [0, 1, 0], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: "50%", top: -160, width: width * 1.8, height: 320, transform: "translateX(-50%)", background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${color},${0.45 * k}) 0%, rgba(${color},0) 70%)` }} />
      <div style={{ position: "absolute", left: "50%", top: -3, width: width * 1.6 * (0.6 + 0.4 * k), height: 6, transform: "translateX(-50%)", borderRadius: 6, background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(255,255,255,${k}) 50%, rgba(${color},0) 100%)`, boxShadow: `0 0 30px rgba(${color},${k})` }} />
    </div>
  );
};

// 3D 플로팅 카드 — 깊은 곳에서 회전하며 초점이 맞아 들어오고, 안착하면 유리 광택이 한 번 지나간다
export const Float3D: React.FC<{
  delay: number;
  children: React.ReactNode;
  rest?: { rx: number; ry: number };
  from?: { rx: number; ry: number; z: number };
  sheenAt?: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ delay, children, rest = { rx: 6, ry: -10 }, from = { rx: 26, ry: -38, z: -520 }, sheenAt, radius = 44, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, { damping: 22, stiffness: 90, mass: 1 });
  const rx = interpolate(s, [0, 1], [from.rx, rest.rx]) + Math.sin(frame / 55) * 1.2;
  const ry = interpolate(s, [0, 1], [from.ry, rest.ry]) + Math.cos(frame / 70) * 1.6;
  const z = interpolate(s, [0, 1], [from.z, 0]);
  const blur = interpolate(s, [0, 0.85], [16, 0], clamp);
  const sheen = sheenAt === undefined ? -1 : interpolate(frame - sheenAt, [0, 22], [-0.4, 1.4], clamp);
  return (
    <div style={{ perspective: 2200, perspectiveOrigin: "50% 30%", ...style }}>
      <div
        style={{
          position: "relative",
          transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transformStyle: "preserve-3d",
          opacity: interpolate(frame - delay, [0, 6], [0, 1], clamp),
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
        {sheen > -0.4 && sheen < 1.4 && (
          <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-20%", bottom: "-20%", width: "28%", left: `${sheen * 100}%`, transform: "translateX(-50%) skewX(-18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)", mixBlendMode: "soft-light" }} />
          </div>
        )}
      </div>
    </div>
  );
};

// 상단 HUD — 모노 라벨
export const Hud: React.FC<{ left: React.ReactNode; right: React.ReactNode; top: number; side: number; color?: string; opacity?: number }> = ({ left, right, top, side, color = K.paperDim, opacity = 1 }) => (
  <div style={{ position: "absolute", top, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, fontWeight: 500, color, letterSpacing: "0.14em", textTransform: "uppercase", opacity }}>
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>{left}</span>
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>{right}</span>
  </div>
);

// 영상 자체의 타임코드(HH:MM:SS:FF)
export const timecode = (frame: number, fps = 30) => {
  const f = Math.max(0, Math.floor(frame));
  const ss = Math.floor(f / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(Math.floor(ss / 60))}:${pad(ss % 60)}:${pad(f % fps)}`;
};
