import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Blueprint } from "../components/Stage";
import { Caption, MaskUp } from "../components/Type";
import { C, CUES, FONT, scene } from "../lib/theme";
import { POP, clamp, ease, prog, sp } from "../lib/motion";
import geo from "../data/geo.json";

// S7 지도 (840–960f) — 8분음표마다 핀이 하나씩 꽂히고, 같은 박에 그 학원의 사진이 붙는다.
const { from } = scene("map");
const PINS = CUES.map.pins.map((f) => f - from);

const PLACES: Array<{ key: keyof typeof geo.korea.pins; name: string; photo: string; pos?: string }> = [
  { key: "daechi", name: "서울 대치", photo: "case-daechi.jpg", pos: "50% 45%" },
  { key: "mokdong", name: "서울 목동", photo: "mokdong-point.jpg", pos: "60% 40%" },
  { key: "pyeongtaek", name: "평택", photo: "case-pyeongtaek.jpg", pos: "50% 30%" },
  { key: "cheonan", name: "천안", photo: "case-cheonan.jpg" },
  { key: "cheongju", name: "청주", photo: "case-cheongju.jpg", pos: "50% 40%" },
  { key: "daegu", name: "대구", photo: "case-daegu.jpg", pos: "50% 40%" },
  { key: "ulsan", name: "울산", photo: "ulsan-room.jpg" },
  { key: "busan", name: "부산", photo: "case-busan.jpg" },
];

const MAP = { x: 1010, y: 46, scale: 0.98 };

const Polaroid: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const at = PINS[i];
  if (frame < at) return null;
  const s = sp(frame - at, POP);
  const col = i % 4;
  const row = Math.floor(i / 4);
  const rot = [-3, 2, -1.5, 3, 2.5, -2.5, 1.5, -3][i];
  const p = PLACES[i];
  return (
    <div
      style={{
        position: "absolute",
        left: 120 + col * 212,
        top: 440 + row * 262,
        width: 196,
        padding: "10px 10px 0",
        background: C.white,
        boxShadow: "0 16px 34px rgba(7,10,60,0.45)",
        transform: `rotate(${rot}deg) scale(${0.5 + 0.5 * s}) translateY(${(1 - s) * 40}px)`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <div style={{ width: 176, height: 140, overflow: "hidden", background: C.ink }}>
        <Img src={staticFile(`photos/${p.photo}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "50% 50%" }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "10px 2px 12px" }}>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 16, color: C.signal }}>{String(i + 1).padStart(2, "0")}</span>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, color: C.ink, letterSpacing: "-0.02em" }}>{p.name}</span>
      </div>
    </div>
  );
};

const KoreaMap: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = prog(frame, 0, 18, ease.out);
  return (
    <div style={{ position: "absolute", left: MAP.x, top: MAP.y, transform: `scale(${MAP.scale})`, transformOrigin: "0 0" }}>
      <svg width={geo.korea.width} height={geo.korea.height} style={{ overflow: "visible" }}>
        {geo.korea.provinces.map((p) => (
          <path key={p.name} d={p.d} pathLength={1} fill="rgba(255,255,255,0.07)" stroke={C.white} strokeWidth={2.4} strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - draw} fillOpacity={draw} />
        ))}
        {PLACES.map((pl, i) => {
          const at = PINS[i];
          if (frame < at) return null;
          const [x, y] = geo.korea.pins[pl.key];
          const s = sp(frame - at, POP);
          const ring = interpolate(frame - at, [0, 22], [0, 1], clamp);
          const labelLeft = pl.key === "mokdong";
          return (
            <g key={pl.key} transform={`translate(${x},${y})`}>
              <circle r={14 + ring * 60} fill="none" stroke={C.signal} strokeWidth={4 * (1 - ring)} opacity={1 - ring} />
              <g transform={`translate(0,${(1 - s) * -40}) scale(${s})`}>
                <circle r={13} fill={C.signal} stroke={C.white} strokeWidth={4} />
              </g>
              <g opacity={Math.min(1, s * 1.5)}>
                <rect x={labelLeft ? -62 : 20} y={-15} width={42} height={30} rx={6} fill={C.white} />
                <text x={labelLeft ? -41 : 41} y={6} textAnchor="middle" fontFamily={FONT.mono} fontWeight={600} fontSize={18} fill={C.ink}>
                  {String(i + 1).padStart(2, "0")}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const MapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [1.14, 1], { ...clamp, easing: ease.outExpo });
  const push = interpolate(frame, [16, 120], [1, 1.035], clamp);
  return (
    <Blueprint>
      <AbsoluteFill style={{ transform: `scale(${enter * push})` }}>
        <div style={{ position: "absolute", left: 120, top: 110 }}>
          <Caption size={22} color={C.white} style={{ opacity: 0.75, letterSpacing: "0.24em", fontWeight: 600 }}>
            FIELD MAP · 학원 현장
          </Caption>
          <MaskUp start={0} dur={12} style={{ marginTop: 14 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", color: C.white, lineHeight: 1.08 }}>서울에서 부산까지,</div>
          </MaskUp>
          <MaskUp start={6} dur={12} distance={1.6}>
            <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 92, letterSpacing: "-0.04em", color: C.white, lineHeight: 1.08 }}>
              학원의 <span style={{ display: "inline-block", lineHeight: 1.04, background: C.signal, padding: "0 12px" }}>교실</span>에서.
            </div>
          </MaskUp>
        </div>
        {PLACES.map((_, i) => (
          <Polaroid key={i} i={i} />
        ))}
        <KoreaMap />
      </AbsoluteFill>
    </Blueprint>
  );
};
