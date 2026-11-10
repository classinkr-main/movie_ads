import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { C } from "../lib/theme";
import { clamp, E, rnd, V3 } from "../lib/motion";

// ─────────────────────────────────────────────────────────────────────────────
// 블록 장난감 키트 — 이 영상의 모든 3D 소품은 둥근 모서리 블록·원기둥·구로만 만듭니다.
// 지오메트리는 크기별로 한 번만 만들어 캐시합니다(프레임마다 새로 만들지 않음).
// ─────────────────────────────────────────────────────────────────────────────

const geo = new Map<string, THREE.BufferGeometry>();
const cached = <T extends THREE.BufferGeometry>(key: string, make: () => T): T => {
  let g = geo.get(key);
  if (!g) {
    g = make();
    geo.set(key, g);
  }
  return g as T;
};
const q = (n: number) => Math.round(n * 1000) / 1000;

export const rbox = (w: number, h: number, d: number, r = 0.05) =>
  cached(`rb|${q(w)}|${q(h)}|${q(d)}|${q(r)}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
export const cylG = (rt: number, rb: number, h: number, seg = 28) =>
  cached(`cy|${q(rt)}|${q(rb)}|${q(h)}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
export const ballG = (r: number, seg = 22) => cached(`sp|${q(r)}|${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.7))));
export const halfBallG = (r: number) => cached(`hs|${q(r)}`, () => new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2));
export const coneG = (r: number, h: number, seg = 24) => cached(`co|${q(r)}|${q(h)}|${seg}`, () => new THREE.ConeGeometry(r, h, seg));
export const torusG = (r: number, tube: number, arc = Math.PI * 2) =>
  cached(`to|${q(r)}|${q(tube)}|${q(arc)}`, () => new THREE.TorusGeometry(r, tube, 10, 28, arc));
export const discG = (r: number) => cached(`di|${q(r)}`, () => new THREE.CircleGeometry(r, 28));
export const planeG = (w: number, h: number) => cached(`pl|${q(w)}|${q(h)}`, () => new THREE.PlaneGeometry(w, h));

type MatProps = {
  c: string;
  /** 자체 발광 색 / 세기 */
  em?: string;
  ei?: number;
  /** 불투명도(1 미만이면 투명 처리) */
  op?: number;
  /** 유광 플라스틱 */
  gloss?: boolean;
  /** 조명을 받지 않는 인쇄면 */
  flat?: boolean;
};

const Mat: React.FC<MatProps> = ({ c, em, ei = 1, op = 1, gloss, flat }) => {
  const transparent = op < 1;
  if (flat) return <meshBasicMaterial color={c} transparent={transparent} opacity={op} toneMapped={false} />;
  if (gloss)
    return (
      <meshStandardMaterial color={c} roughness={0.32} metalness={0.05} emissive={em ?? "#000000"} emissiveIntensity={em ? ei : 0} transparent={transparent} opacity={op} />
    );
  return <meshLambertMaterial color={c} emissive={em ?? "#000000"} emissiveIntensity={em ? ei : 0} transparent={transparent} opacity={op} />;
};

type Xf = { p?: V3; r?: V3; sc?: V3 | number; cast?: boolean; recv?: boolean; vis?: boolean };
const xf = ({ p, r, sc, cast = true, recv = true, vis = true }: Xf) => ({
  position: p ?? ([0, 0, 0] as V3),
  rotation: r ?? ([0, 0, 0] as V3),
  scale: sc === undefined ? 1 : sc,
  castShadow: cast,
  receiveShadow: recv,
  visible: vis,
  // 지오메트리는 캐시해서 여러 장면이 나눠 씁니다 — 장면이 바뀌어도 R3F 가 dispose 하지 않게 합니다.
  dispose: null,
});

/** 둥근 모서리 블록 */
export const Bx: React.FC<Xf & MatProps & { s: V3; rad?: number }> = ({ s, rad = 0.05, ...rest }) => (
  <mesh geometry={rbox(s[0], s[1], s[2], rad)} {...xf(rest)}>
    <Mat {...rest} />
  </mesh>
);
/** 원기둥. rr = 반지름 또는 [위, 아래] */
export const Cy: React.FC<Xf & MatProps & { rr: number | [number, number]; h: number; seg?: number }> = ({ rr, h, seg, ...rest }) => {
  const [rt, rb] = Array.isArray(rr) ? rr : [rr, rr];
  return (
    <mesh geometry={cylG(rt, rb, h, seg)} {...xf(rest)}>
      <Mat {...rest} />
    </mesh>
  );
};
export const Sp: React.FC<Xf & MatProps & { rr: number }> = ({ rr, ...rest }) => (
  <mesh geometry={ballG(rr)} {...xf(rest)}>
    <Mat {...rest} />
  </mesh>
);
export const Cone: React.FC<Xf & MatProps & { rr: number; h: number }> = ({ rr, h, ...rest }) => (
  <mesh geometry={coneG(rr, h)} {...xf(rest)}>
    <Mat {...rest} />
  </mesh>
);
export const Torus: React.FC<Xf & MatProps & { rr: number; tube: number; arc?: number }> = ({ rr, tube, arc, ...rest }) => (
  <mesh geometry={torusG(rr, tube, arc)} {...xf(rest)}>
    <Mat {...rest} />
  </mesh>
);
/** 얇은 원판(얼굴 요소·표시등). 그림자를 만들지 않습니다. */
export const Disc: React.FC<Xf & MatProps & { rr: number }> = ({ rr, ...rest }) => (
  <mesh geometry={discG(rr)} {...xf({ ...rest, cast: false, recv: false })}>
    <Mat flat {...rest} />
  </mesh>
);

// ── 캔버스 인쇄면 ─────────────────────────────────────────────────────────────
const texCache = new Map<string, THREE.CanvasTexture>();
const PPU = 240; // 텍스처 해상도: 월드 1단위당 픽셀

export const paintTex = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void) => {
  let t = texCache.get(key);
  if (t) return t;
  const k = Math.min(1, 1536 / (Math.max(w, h) * PPU));
  const W = Math.max(8, Math.round(w * PPU * k));
  const H = Math.max(8, Math.round(h * PPU * k));
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  draw(ctx, W, H);
  t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  texCache.set(key, t);
  return t;
};

/** 직접 그리는 인쇄면. id 가 같으면 텍스처를 재사용합니다. */
export const Paint: React.FC<
  Xf & { id: string; w: number; h: number; draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void; lit?: boolean; op?: number; em?: number; double?: boolean }
> = ({ id, w, h, draw, lit, op = 1, em = 0, double, ...rest }) => {
  const tex = useMemo(() => paintTex(id, w, h, draw), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const side = double ? THREE.DoubleSide : THREE.FrontSide;
  return (
    <mesh geometry={planeG(w, h)} {...xf({ ...rest, cast: false, recv: !!lit })}>
      {lit ? (
        <meshLambertMaterial map={tex} transparent opacity={op} side={side} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={em} />
      ) : (
        <meshBasicMaterial map={tex} transparent opacity={op} side={side} toneMapped={false} />
      )}
    </mesh>
  );
};

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

type SignProps = Xf & {
  text: string;
  w: number;
  h: number;
  /** 글자 크기(월드 단위) */
  size?: number;
  color?: string;
  bg?: string | null;
  weight?: number;
  slam?: boolean;
  radius?: number;
  lit?: boolean;
  op?: number;
  em?: number;
  double?: boolean;
  border?: string;
};

/** 글자가 인쇄된 면(블록 라벨·표지판). 폰트 로드 후에만 마운트됩니다(Film 이 보장). */
export const Sign: React.FC<SignProps> = ({ text, w, h, size = 0.2, color = C.ink, bg = null, weight = 800, slam, radius = 0.06, border, ...rest }) => {
  const id = `sg|${text}|${q(w)}|${q(h)}|${q(size)}|${color}|${bg}|${weight}|${slam ? 1 : 0}|${border ?? ""}`;
  return (
    <Paint
      id={id}
      w={w}
      h={h}
      {...rest}
      draw={(ctx, W, H) => {
        const u = W / w;
        if (bg) {
          ctx.fillStyle = bg;
          roundRect(ctx, 0, 0, W, H, radius * u);
          ctx.fill();
        }
        if (border) {
          ctx.strokeStyle = border;
          ctx.lineWidth = 0.03 * u;
          roundRect(ctx, 0.015 * u, 0.015 * u, W - 0.03 * u, H - 0.03 * u, radius * u);
          ctx.stroke();
        }
        const lines = text.split("\n");
        const px = size * u;
        ctx.font = slam ? `400 ${px}px "Black Han Sans", "Pretendard"` : `${weight} ${px}px "Pretendard"`;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lh = px * 1.18;
        lines.forEach((ln, i) => {
          ctx.fillText(ln, W / 2, H / 2 + (i - (lines.length - 1) / 2) * lh + px * 0.04);
        });
      }}
    />
  );
};

// ── 사람(블록 피규어) ─────────────────────────────────────────────────────────
export type Eyes = "dot" | "wide" | "spiral" | "closed" | "happy" | "tired" | "x";
export type Mouth = "flat" | "open" | "smile" | "frown" | "wavy" | "o" | "none";

export type Pose = {
  /** [옆으로 들기(0 내림 · 1.57 수평 · 3 만세), 앞으로 내밀기] */
  armL?: [number, number];
  armR?: [number, number];
  headYaw?: number;
  headPitch?: number;
  headRoll?: number;
  /** 몸 좌우 / 앞뒤 기울기 */
  lean?: number;
  pitch?: number;
  bounce?: number;
  /** 1 기본, 작을수록 납작 */
  squash?: number;
  eyes?: Eyes;
  /** -1 화남 · 0 · +1 걱정 */
  brow?: number;
  mouth?: Mouth;
  /** 나선 눈 회전각 */
  spin?: number;
  blush?: boolean;
  /** 책상 뒤에 앉은 자세(다리 숨김) */
  sit?: boolean;
};

export type Outfit = {
  top: string;
  bottom?: string;
  hair?: string;
  skin?: string;
  hairStyle?: "short" | "bob" | "bun" | "none";
  glasses?: boolean;
  /** 안전모 색 */
  hat?: string;
  tie?: string;
  /** 조끼(공사팀) */
  vest?: string;
};

const SPIRAL_ID = "eye-spiral";
const drawSpiral = (ctx: CanvasRenderingContext2D, W: number) => {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W / 2, W / 2, W * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1B1A17";
  ctx.lineWidth = W * 0.085;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i <= 150; i++) {
    const t = i / 150;
    const a = t * Math.PI * 2 * 2.6;
    const r = t * W * 0.38;
    const x = W / 2 + Math.cos(a) * r;
    const y = W / 2 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

const INK = "#1B1A17";

const Eye: React.FC<{ x: number; kind: Eyes; spin: number }> = ({ x, kind, spin }) => {
  const y = 0.3;
  const z = 0.253;
  switch (kind) {
    case "wide":
      return (
        <group position={[x, y, z]}>
          <Disc rr={0.088} c="#ffffff" />
          <Disc rr={0.034} c={INK} p={[0, 0, 0.002]} />
        </group>
      );
    case "spiral":
      return <Paint id={SPIRAL_ID} w={0.21} h={0.21} draw={drawSpiral} p={[x, y, z + 0.002]} r={[0, 0, -spin * Math.sign(x || 1)]} />;
    case "closed":
      return <Bx s={[0.12, 0.024, 0.01]} rad={0.004} c={INK} flat p={[x, y, z]} cast={false} />;
    case "happy":
      return <Torus rr={0.055} tube={0.014} arc={Math.PI} c={INK} flat p={[x, y - 0.02, z]} cast={false} />;
    case "tired":
      // -_- : 처진 눈 + 다크서클
      return (
        <group position={[x, y, z]}>
          <Bx s={[0.125, 0.03, 0.01]} rad={0.004} c={INK} flat r={[0, 0, Math.sign(x || 1) * -0.2]} cast={false} />
          <Bx s={[0.12, 0.016, 0.01]} rad={0.002} c="#B4876A" flat p={[0, -0.06, 0.001]} r={[0, 0, Math.sign(x || 1) * -0.12]} cast={false} />
        </group>
      );
    case "x":
      return (
        <group position={[x, y, z]}>
          <Bx s={[0.14, 0.026, 0.01]} rad={0.004} c={INK} flat r={[0, 0, 0.78]} cast={false} />
          <Bx s={[0.14, 0.026, 0.01]} rad={0.004} c={INK} flat r={[0, 0, -0.78]} cast={false} />
        </group>
      );
    default:
      return <Disc rr={0.045} c={INK} p={[x, y, z]} sc={[1, 1.25, 1]} />;
  }
};

const MouthShape: React.FC<{ kind: Mouth }> = ({ kind }) => {
  const y = 0.125;
  const z = 0.253;
  switch (kind) {
    case "none":
      return null;
    case "open":
      return <Disc rr={0.062} c="#5A1F1A" p={[0, y - 0.01, z]} sc={[1, 1.25, 1]} />;
    case "o":
      return <Disc rr={0.036} c="#5A1F1A" p={[0, y, z]} />;
    case "smile":
      return <Torus rr={0.07} tube={0.015} arc={Math.PI} c={INK} flat p={[0, y + 0.035, z]} r={[0, 0, Math.PI]} cast={false} />;
    case "frown":
      return <Torus rr={0.06} tube={0.015} arc={Math.PI} c={INK} flat p={[0, y - 0.04, z]} cast={false} />;
    case "wavy":
      return (
        <group position={[0, y, z]}>
          {[-0.075, -0.025, 0.025, 0.075].map((x, i) => (
            <Bx key={i} s={[0.062, 0.022, 0.01]} rad={0.004} c={INK} flat p={[x, 0, 0]} r={[0, 0, i % 2 ? 0.6 : -0.6]} cast={false} />
          ))}
        </group>
      );
    default:
      return <Bx s={[0.12, 0.024, 0.01]} rad={0.004} c={INK} flat p={[0, y, z]} cast={false} />;
  }
};

export const Person: React.FC<{ p?: V3; yaw?: number; sc?: number; outfit: Outfit; pose?: Pose; vis?: boolean }> = ({ p = [0, 0, 0], yaw = 0, sc = 1, outfit, pose = {}, vis = true }) => {
  const {
    armL = [0.12, 0],
    armR = [0.12, 0],
    headYaw = 0,
    headPitch = 0,
    headRoll = 0,
    lean = 0,
    pitch = 0,
    bounce = 0,
    squash = 1,
    eyes = "dot",
    brow = 0,
    mouth = "flat",
    spin = 0,
    blush,
    sit,
  } = pose;
  const skin = outfit.skin ?? C.skin;
  const hair = outfit.hair ?? C.hair;
  const bottom = outfit.bottom ?? "#3A3F4B";
  const wide = 1 + (1 - squash) * 0.55;
  const style = outfit.hairStyle ?? "short";
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={sc} visible={vis}>
      <group position={[0, bounce, 0]} rotation={[pitch, 0, lean]} scale={[wide, squash, wide]}>
        {!sit && (
          <>
            <Bx s={[0.23, 0.42, 0.25]} c={bottom} p={[-0.145, 0.21, 0]} />
            <Bx s={[0.23, 0.42, 0.25]} c={bottom} p={[0.145, 0.21, 0]} />
            <Bx s={[0.24, 0.1, 0.32]} c="#24262D" p={[-0.145, 0.05, 0.03]} rad={0.04} />
            <Bx s={[0.24, 0.1, 0.32]} c="#24262D" p={[0.145, 0.05, 0.03]} rad={0.04} />
          </>
        )}
        {/* 몸통 */}
        <Bx s={[0.64, 0.64, 0.38]} rad={0.09} c={outfit.top} p={[0, 0.73, 0]} />
        {outfit.vest && <Bx s={[0.66, 0.5, 0.4]} rad={0.08} c={outfit.vest} p={[0, 0.76, 0]} />}
        {outfit.vest && <Bx s={[0.67, 0.07, 0.41]} rad={0.02} c="#F4F1E6" p={[0, 0.66, 0]} />}
        {outfit.tie && <Bx s={[0.09, 0.3, 0.02]} rad={0.01} c={outfit.tie} p={[0, 0.82, 0.195]} cast={false} />}
        {/* 팔 */}
        <group position={[-0.4, 0.99, 0]} rotation={[-armL[1], 0, -armL[0]]}>
          <Bx s={[0.18, 0.36, 0.2]} rad={0.06} c={outfit.vest ? outfit.top : outfit.top} p={[0, -0.17, 0]} />
          <Bx s={[0.16, 0.15, 0.18]} rad={0.06} c={skin} p={[0, -0.41, 0]} />
        </group>
        <group position={[0.4, 0.99, 0]} rotation={[-armR[1], 0, armR[0]]}>
          <Bx s={[0.18, 0.36, 0.2]} rad={0.06} c={outfit.top} p={[0, -0.17, 0]} />
          <Bx s={[0.16, 0.15, 0.18]} rad={0.06} c={skin} p={[0, -0.41, 0]} />
        </group>
        {/* 머리 */}
        <group position={[0, 1.07, 0]} rotation={[headPitch, headYaw, headRoll]}>
          <Bx s={[0.6, 0.54, 0.5]} rad={0.12} c={skin} p={[0, 0.27, 0]} />
          {style !== "none" && !outfit.hat && (
            <>
              <Bx s={[0.64, 0.2, 0.54]} rad={0.09} c={hair} p={[0, 0.5, -0.005]} />
              <Bx s={[0.64, 0.4, 0.12]} rad={0.05} c={hair} p={[0, 0.34, -0.23]} />
              <Bx s={[0.5, 0.09, 0.06]} rad={0.03} c={hair} p={[-0.05, 0.435, 0.245]} r={[0, 0, 0.08]} cast={false} />
            </>
          )}
          {style === "bob" && !outfit.hat && (
            <>
              <Bx s={[0.1, 0.42, 0.44]} rad={0.045} c={hair} p={[-0.3, 0.3, -0.02]} />
              <Bx s={[0.1, 0.42, 0.44]} rad={0.045} c={hair} p={[0.3, 0.3, -0.02]} />
            </>
          )}
          {style === "bun" && !outfit.hat && <Sp rr={0.15} c={hair} p={[0, 0.66, -0.12]} />}
          {outfit.hat && (
            <>
              <mesh geometry={halfBallG(0.34)} position={[0, 0.42, 0]} scale={[1, 0.78, 0.98]} castShadow>
                <meshLambertMaterial color={outfit.hat} />
              </mesh>
              <Cy rr={0.4} h={0.045} c={outfit.hat} p={[0, 0.43, 0.06]} />
              <Bx s={[0.08, 0.2, 0.5]} rad={0.03} c={outfit.hat} p={[0, 0.6, 0]} />
              <Bx s={[0.64, 0.2, 0.12]} rad={0.05} c={hair} p={[0, 0.3, -0.23]} />
            </>
          )}
          {/* 얼굴 */}
          <Eye x={-0.135} kind={eyes} spin={spin} />
          <Eye x={0.135} kind={eyes} spin={spin} />
          {eyes !== "spiral" && (
            <>
              <Bx s={[0.13, 0.03, 0.01]} rad={0.004} c={hair} flat p={[-0.135, 0.405 + Math.abs(brow) * 0.012, 0.253]} r={[0, 0, -brow * 0.42]} cast={false} />
              <Bx s={[0.13, 0.03, 0.01]} rad={0.004} c={hair} flat p={[0.135, 0.405 + Math.abs(brow) * 0.012, 0.253]} r={[0, 0, brow * 0.42]} cast={false} />
            </>
          )}
          <MouthShape kind={mouth} />
          {blush && (
            <>
              <Disc rr={0.05} c="#F59A8B" op={0.7} p={[-0.2, 0.19, 0.253]} sc={[1.2, 0.8, 1]} />
              <Disc rr={0.05} c="#F59A8B" op={0.7} p={[0.2, 0.19, 0.253]} sc={[1.2, 0.8, 1]} />
            </>
          )}
          {outfit.glasses && (
            <group position={[0, 0.3, 0.262]}>
              <Torus rr={0.095} tube={0.014} c={INK} flat p={[-0.135, 0, 0]} cast={false} />
              <Torus rr={0.095} tube={0.014} c={INK} flat p={[0.135, 0, 0]} cast={false} />
              <Bx s={[0.09, 0.02, 0.012]} rad={0.004} c={INK} flat cast={false} />
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

export const OUTFIT = {
  teacher: { top: "#3D7BD9", bottom: "#2E3340", hair: C.hair, hairStyle: "short" } as Outfit,
  teacherB: { top: "#E38B4F", bottom: "#3B3340", hair: C.hairBrown, hairStyle: "bob" } as Outfit,
  teacherC: { top: "#8E6BD6", bottom: "#2E3340", hair: "#3A2C24", hairStyle: "bun" } as Outfit,
  engineer: { top: "#F7F5EE", bottom: "#39404D", hair: "#2A2420", hairStyle: "short", glasses: true, tie: C.cobalt } as Outfit,
  engineerB: { top: "#F7F5EE", bottom: "#39404D", hair: C.hairBrown, hairStyle: "bob", glasses: true, tie: C.cobalt } as Outfit,
  crew: { top: "#3B4352", bottom: "#2B303B", hair: C.hair, hat: "#FFC83D", vest: C.brand } as Outfit,
};

const KID = ["#F2785C", "#F6B73C", "#5BB7E8", "#7BC96F", "#B58BE8", "#F08BB4", "#4FC4B0", "#F29E4C"];
const KID_HAIR = [C.hair, C.hairBrown, "#3A2C24", "#4A3526"];
export const kidOutfit = (i: number): Outfit => ({
  top: KID[i % KID.length],
  bottom: "#3A3F4B",
  hair: KID_HAIR[(i * 3) % KID_HAIR.length],
  hairStyle: (["short", "bob", "bun"] as const)[i % 3],
});

/** 영혼(멘탈). 머리 위로 빠져나가는 흰 유령. 밝은 종이 배경에서도 보이도록 뒤집힌 외곽 껍질로 테두리를 줍니다. */
export const Soul: React.FC<{ p: V3; sc?: number; frame: number; op?: number; face?: "o" | "smile" }> = ({ p, sc = 1, frame, op = 0.96, face = "o" }) => {
  const sway = Math.sin(frame * 0.21) * 0.18;
  const RIM = "#5F7FB8";
  return (
    <group position={p} scale={sc} rotation={[0, 0, sway * 0.5]}>
      <mesh geometry={ballG(0.2)} scale={[1.13, 1.25, 1.03]} dispose={null}>
        <meshBasicMaterial color={RIM} side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <group position={[sway * 0.22, -0.3, 0]} rotation={[0, 0, Math.PI + sway * 0.9]}>
        <mesh geometry={coneG(0.15, 0.38)} scale={[1.22, 1.12, 1.22]} dispose={null}>
          <meshBasicMaterial color={RIM} side={THREE.BackSide} toneMapped={false} />
        </mesh>
      </group>
      <Sp rr={0.2} c="#FFFFFF" em="#EAF2FF" ei={0.7} op={op} sc={[1, 1.12, 0.9]} cast={false} />
      <Cone rr={0.15} h={0.38} c="#FFFFFF" em="#EAF2FF" ei={0.7} op={op} p={[sway * 0.22, -0.3, 0]} r={[0, 0, Math.PI + sway * 0.9]} cast={false} />
      <Disc rr={0.026} c={INK} p={[-0.07, 0.04, 0.185]} sc={[1, 1.3, 1]} />
      <Disc rr={0.026} c={INK} p={[0.07, 0.04, 0.185]} sc={[1, 1.3, 1]} />
      {face === "o" ? <Disc rr={0.032} c={INK} p={[0, -0.055, 0.19]} sc={[1, 1.3, 1]} /> : <Torus rr={0.04} tube={0.011} arc={Math.PI} c={INK} flat p={[0, -0.03, 0.19]} r={[0, 0, Math.PI]} cast={false} />}
    </group>
  );
};

/** 식은땀. t0 이후 계속 튑니다. */
export const Sweat: React.FC<{ frame: number; t0: number; p: V3; n?: number; until?: number }> = ({ frame, t0, p, n = 4, until = 1e9 }) => {
  if (frame < t0 || frame > until) return null;
  return (
    <group position={p}>
      {Array.from({ length: n }).map((_, i) => {
        const ph = ((frame - t0) / 16 + i / n) % 1;
        const side = i % 2 ? 1 : -1;
        const a = 0.5 + rnd(i + 3) * 0.7;
        const x = side * (0.3 + ph * 0.42 * a);
        const y = 0.12 + ph * 0.5 * a - ph * ph * 0.62;
        return <Sp key={i} rr={0.045} c="#7CC4F5" gloss p={[x, y, 0.1 + rnd(i) * 0.2]} sc={[1 - ph * 0.5, 1.5 - ph * 0.6, 1 - ph * 0.5]} cast={false} />;
      })}
    </group>
  );
};

/** 터지는 블록 조각 */
export const Burst: React.FC<{ frame: number; t0: number; p: V3; n?: number; colors: string[]; size?: number; reach?: number; dur?: number; up?: number }> = ({
  frame,
  t0,
  p,
  n = 14,
  colors,
  size = 0.12,
  reach = 1.4,
  dur = 22,
  up = 1,
}) => {
  const t = (frame - t0) / dur;
  if (t < 0 || t > 1) return null;
  const e = E.out(t);
  return (
    <group position={p}>
      {Array.from({ length: n }).map((_, i) => {
        const a = rnd(i * 1.7 + 1) * Math.PI * 2;
        const el = (rnd(i * 2.3 + 5) - 0.25) * 1.3;
        const d = reach * (0.5 + rnd(i * 3.1) * 0.6) * e;
        const s = size * (0.6 + rnd(i * 4.9) * 0.8) * (1 - t * t);
        return (
          <Bx
            key={i}
            s={[1, 1, 1]}
            rad={0.12}
            c={colors[i % colors.length]}
            p={[Math.cos(a) * Math.cos(el) * d, (Math.sin(el) * d + 0.6 * e - 0.9 * t * t) * up, Math.sin(a) * Math.cos(el) * d]}
            r={[t * 5 * rnd(i), t * 4, t * 3 * rnd(i + 9)]}
            sc={s}
            cast={false}
          />
        );
      })}
    </group>
  );
};

// ── 소품 ─────────────────────────────────────────────────────────────────────
export const Desk: React.FC<{ p?: V3; w?: number; d?: number; h?: number; c?: string; yaw?: number }> = ({ p = [0, 0, 0], w = 1.7, d = 0.85, h = 0.74, c = C.wood, yaw = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <Bx s={[w, 0.09, d]} rad={0.035} c={c} p={[0, h, 0]} />
    {[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([sx, sz], i) => (
      <Bx key={i} s={[0.09, h - 0.04, 0.09]} rad={0.02} c={C.woodDark} p={[sx * (w / 2 - 0.1), (h - 0.04) / 2, sz * (d / 2 - 0.1)]} />
    ))}
  </group>
);

export const Clock: React.FC<{ p: V3; r?: V3; hour: number; sc?: number; ring?: string }> = ({ p, r, hour, sc = 1, ring = C.ink }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Cy rr={0.36} h={0.07} c={ring} r={[Math.PI / 2, 0, 0]} />
    <Cy rr={0.31} h={0.075} c="#FFFDF6" r={[Math.PI / 2, 0, 0]} />
    {Array.from({ length: 12 }).map((_, i) => (
      <Bx key={i} s={[0.02, i % 3 === 0 ? 0.07 : 0.035, 0.01]} rad={0.003} c={C.ink} flat p={[Math.sin((i / 12) * Math.PI * 2) * 0.26, Math.cos((i / 12) * Math.PI * 2) * 0.26, 0.04]} r={[0, 0, -(i / 12) * Math.PI * 2]} cast={false} />
    ))}
    <group position={[0, 0, 0.045]} rotation={[0, 0, -((hour % 12) / 12) * Math.PI * 2]}>
      <Bx s={[0.035, 0.16, 0.012]} rad={0.004} c={C.ink} flat p={[0, 0.07, 0]} cast={false} />
    </group>
    <group position={[0, 0, 0.05]} rotation={[0, 0, -(hour % 1) * Math.PI * 2]}>
      <Bx s={[0.022, 0.25, 0.012]} rad={0.004} c={C.red} flat p={[0, 0.115, 0]} cast={false} />
    </group>
    <Disc rr={0.025} c={C.ink} p={[0, 0, 0.058]} />
  </group>
);

export const Tripod: React.FC<{ p?: V3; rise?: number; yaw?: number; children?: React.ReactNode; fold?: number }> = ({ p = [0, 0, 0], rise = 1, yaw = 0, children, fold = 0 }) => {
  const H = 0.55 + rise * 0.6;
  const spread = 0.36 * (1 - fold);
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        const len = Math.hypot(0.62, spread);
        const tilt = Math.atan2(spread, 0.62);
        return (
          <group key={i} position={[0, 0.62, 0]} rotation={[0, -a, 0]}>
            <group rotation={[0, 0, tilt]}>
              <Cy rr={0.028} h={len} c={C.metalDark} p={[0, -len / 2, 0]} />
            </group>
          </group>
        );
      })}
      <Cy rr={0.07} h={0.1} c={C.metalDark} p={[0, 0.62, 0]} />
      <Cy rr={0.024} h={H - 0.6} c={C.metal} p={[0, 0.6 + (H - 0.6) / 2, 0]} />
      <Bx s={[0.2, 0.08, 0.14]} rad={0.02} c={C.metalDark} p={[0, H, 0]} />
      <group position={[0, H + 0.05, 0]}>{children}</group>
    </group>
  );
};

export const Phone: React.FC<{ p?: V3; r?: V3; sc?: number; screen?: React.ReactNode; glow?: number; c?: string }> = ({ p = [0, 0, 0], r, sc = 1, screen, glow = 0.5, c = "#22252E" }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[0.36, 0.7, 0.05]} rad={0.022} c={c} p={[0, 0.35, 0]} />
    <Bx s={[0.31, 0.63, 0.012]} rad={0.004} c="#2D3A55" em="#6FA0FF" ei={glow} p={[0, 0.35, 0.022]} cast={false} />
    <group position={[0, 0.35, 0.031]}>{screen}</group>
  </group>
);

export const Laptop: React.FC<{ p?: V3; yaw?: number; open?: number; glow?: number; screen?: React.ReactNode; c?: string }> = ({ p = [0, 0, 0], yaw = 0, open = 1, glow = 1, screen, c = "#C9CED6" }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <Bx s={[0.95, 0.05, 0.62]} rad={0.02} c={c} p={[0, 0.025, 0]} />
    <Bx s={[0.8, 0.012, 0.3]} rad={0.004} c="#8D949E" p={[0, 0.054, -0.06]} cast={false} />
    <group position={[0, 0.05, -0.3]} rotation={[-0.2 * open - (1 - open) * 1.55 + 0, 0, 0]}>
      <Bx s={[0.95, 0.62, 0.04]} rad={0.02} c={c} p={[0, 0.31, 0]} />
      <Bx s={[0.86, 0.52, 0.01]} rad={0.004} c={C.screen} em="#8FB6FF" ei={0.55 * glow * open} p={[0, 0.31, 0.022]} cast={false} />
      <group position={[0, 0.31, 0.03]} visible={open > 0.6}>
        {screen}
      </group>
    </group>
  </group>
);

/** 파일 큐브. 앞면에 라벨이 인쇄됩니다. */
export const FileCube: React.FC<{ p?: V3; r?: V3; sc?: V3 | number; size?: number; c?: string; label?: string; sub?: string; labelSize?: number }> = ({
  p = [0, 0, 0],
  r,
  sc = 1,
  size = 0.6,
  c = C.amber,
  label = "MP4",
  sub,
  labelSize,
}) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[size, size, size]} rad={size * 0.12} c={c} p={[0, size / 2, 0]} />
    <Sign text={sub ? `${label}\n${sub}` : label} w={size * 0.82} h={size * 0.6} size={labelSize ?? size * (sub ? 0.17 : 0.26)} color={C.ink} bg="#FFFDF6" radius={size * 0.05} p={[0, size / 2, size / 2 + 0.006]} weight={900} />
  </group>
);

export const Cloud: React.FC<{ p?: V3; sc?: number; c?: string; em?: number }> = ({ p = [0, 0, 0], sc = 1, c = C.cloud, em = 0.15 }) => (
  <group position={p} scale={sc}>
    <Sp rr={0.5} c={c} em="#ffffff" ei={em} p={[0, 0.18, 0]} cast={false} />
    <Sp rr={0.38} c={c} em="#ffffff" ei={em} p={[-0.52, 0.02, 0.02]} cast={false} />
    <Sp rr={0.42} c={c} em="#ffffff" ei={em} p={[0.52, 0.06, -0.02]} cast={false} />
    <Sp rr={0.3} c={c} em="#ffffff" ei={em} p={[0.22, 0.42, 0.05]} cast={false} />
    <Bx s={[1.5, 0.34, 0.6]} rad={0.16} c={c} em="#ffffff" ei={em} p={[0, -0.14, 0]} cast={false} />
  </group>
);

export const Folder: React.FC<{ p?: V3; r?: V3; sc?: V3 | number; c?: string; label?: string }> = ({ p = [0, 0, 0], r, sc = 1, c = C.amber, label }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[0.34, 0.1, 0.06]} rad={0.025} c={c} p={[-0.17, 0.5, -0.03]} />
    <Bx s={[0.72, 0.5, 0.06]} rad={0.035} c={c} p={[0, 0.25, -0.03]} />
    <Bx s={[0.72, 0.42, 0.05]} rad={0.035} c="#FFD36B" p={[0, 0.21, 0.02]} />
    {label && <Sign text={label} w={0.6} h={0.2} size={0.12} color={C.ink} p={[0, 0.22, 0.05]} weight={800} />}
  </group>
);

export const Battery: React.FC<{ p?: V3; level: number; yaw?: number; sc?: number; blink?: number }> = ({ p = [0, 0, 0], level, yaw = 0, sc = 1, blink = 0 }) => {
  const lv = clamp(level);
  const col = lv > 0.5 ? C.leaf : lv > 0.22 ? C.amber : C.red;
  const H = 1.5;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={sc}>
      <Bx s={[0.92, H + 0.2, 0.5]} rad={0.1} c="#2A2D36" p={[0, (H + 0.2) / 2, 0]} />
      <Bx s={[0.4, 0.12, 0.3]} rad={0.04} c="#2A2D36" p={[0, H + 0.26, 0]} />
      <Bx s={[0.74, H, 0.02]} rad={0.004} c="#F4F1E6" p={[0, (H + 0.2) / 2, 0.252]} cast={false} />
      <Bx
        s={[0.66, 1, 0.02]}
        rad={0.004}
        c={col}
        em={col}
        ei={0.25 + blink * 0.6}
        p={[0, 0.14 + (H - 0.08) * Math.max(0.02, lv) * 0.5, 0.262]}
        sc={[1, (H - 0.08) * Math.max(0.02, lv), 1]}
        cast={false}
      />
    </group>
  );
};

/** ✓ 표시(막대 두 개) */
export const Check: React.FC<{ p?: V3; r?: V3; sc?: number; c?: string }> = ({ p = [0, 0, 0], r, sc = 1, c = C.leaf }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[0.1, 0.26, 0.08]} rad={0.03} c={c} em={c} ei={0.25} p={[-0.13, -0.04, 0]} r={[0, 0, 0.75]} />
    <Bx s={[0.1, 0.5, 0.08]} rad={0.03} c={c} em={c} ei={0.25} p={[0.1, 0.06, 0]} r={[0, 0, -0.62]} />
  </group>
);
export const Cross: React.FC<{ p?: V3; r?: V3; sc?: number; c?: string }> = ({ p = [0, 0, 0], r, sc = 1, c = C.red }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[0.1, 0.5, 0.08]} rad={0.03} c={c} em={c} ei={0.25} r={[0, 0, 0.78]} />
    <Bx s={[0.1, 0.5, 0.08]} rad={0.03} c={c} em={c} ei={0.25} r={[0, 0, -0.78]} />
  </group>
);

/** 디오라마 받침(섬). */
export const Slab: React.FC<{ w: number; d: number; h?: number; c: string; edge?: string; p?: V3; rad?: number }> = ({ w, d, h = 0.28, c, edge, p = [0, 0, 0], rad = 0.12 }) => (
  <group position={p}>
    <Bx s={[w, h, d]} rad={rad} c={edge ?? c} p={[0, -h / 2 - 0.06, 0]} />
    <Bx s={[w - 0.12, 0.12, d - 0.12]} rad={0.05} c={c} p={[0, -0.06, 0]} />
  </group>
);

export const RecButton: React.FC<{ p?: V3; press?: number; sc?: number; glow?: number }> = ({ p = [0, 0, 0], press = 0, sc = 1, glow = 0.4 }) => (
  <group position={p} scale={sc}>
    <Cy rr={[0.62, 0.7]} h={0.22} c="#2A2D36" p={[0, 0.11, 0]} seg={40} />
    <Cy rr={0.54} h={0.06} c="#F4F1E6" p={[0, 0.24, 0]} seg={40} />
    <Cy rr={[0.42, 0.45]} h={0.26} c={C.red} gloss em="#FF3B1F" ei={glow} p={[0, 0.38 - press * 0.16, 0]} seg={40} />
    <mesh geometry={halfBallG(0.42)} position={[0, 0.51 - press * 0.16, 0]} scale={[1, 0.28, 1]} castShadow>
      <meshStandardMaterial color={C.red} roughness={0.25} emissive="#FF3B1F" emissiveIntensity={glow} />
    </mesh>
  </group>
);

/** 수업 후 작업 블록(앞면에 이름이 인쇄됨) */
export const ChoreBlock: React.FC<{ p?: V3; r?: V3; sc?: V3 | number; label: string; c: string; size?: V3; dim?: number }> = ({ p = [0, 0, 0], r, sc = 1, label, c, size = [1.7, 0.62, 0.95], dim = 0 }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={size} rad={0.1} c={c} p={[0, size[1] / 2, 0]} op={1 - dim} />
    <Sign text={label} w={size[0] * 0.8} h={size[1] * 0.66} size={size[1] * 0.42} color="#FFFFFF" slam p={[0, size[1] / 2, size[2] / 2 + 0.006]} op={1 - dim} />
  </group>
);

export const Mug: React.FC<{ p?: V3; c?: string }> = ({ p = [0, 0, 0], c = "#FFFDF6" }) => (
  <group position={p}>
    <Cy rr={[0.1, 0.085]} h={0.2} c={c} p={[0, 0.1, 0]} />
    <Cy rr={0.082} h={0.02} c="#5A3A22" p={[0, 0.195, 0]} cast={false} />
    <Torus rr={0.06} tube={0.018} c={c} p={[0.12, 0.1, 0]} />
  </group>
);

/** 3D 화살표(+Y 방향). len 은 전체 길이 */
export const Arrow: React.FC<{ p?: V3; r?: V3; len: number; c: string; w?: number }> = ({ p = [0, 0, 0], r, len, c, w = 0.12 }) => (
  <group position={p} rotation={r ?? [0, 0, 0]}>
    <Cy rr={w / 2} h={Math.max(0.01, len - w * 2.4)} c={c} em={c} ei={0.2} p={[0, Math.max(0.01, len - w * 2.4) / 2, 0]} />
    <Cone rr={w * 1.4} h={w * 2.6} c={c} em={c} ei={0.2} p={[0, Math.max(0.01, len - w * 2.4) + w * 1.3, 0]} />
  </group>
);

/** 말풍선 블록 */
export const Bubble: React.FC<{ p?: V3; sc?: number; text: string; c?: string; fg?: string; w?: number }> = ({ p = [0, 0, 0], sc = 1, text, c = "#FFFFFF", fg = C.ink, w = 1.2 }) => (
  <group position={p} scale={sc}>
    <Bx s={[w, 0.46, 0.14]} rad={0.07} c={c} />
    <Cone rr={0.1} h={0.2} c={c} p={[-w * 0.25, -0.3, 0]} r={[0, 0, Math.PI]} />
    <Sign text={text} w={w * 0.9} h={0.36} size={0.17} color={fg} p={[0, 0, 0.074]} weight={900} />
  </group>
);

/** 돋보기 */
export const Magnifier: React.FC<{ p?: V3; sc?: number; r?: V3 }> = ({ p = [0, 0, 0], sc = 1, r }) => (
  <group position={p} scale={sc} rotation={r ?? [0, 0, 0]}>
    <Torus rr={0.42} tube={0.06} c={C.ink} />
    <Cy rr={0.4} h={0.02} c="#CFE8FF" op={0.35} r={[Math.PI / 2, 0, 0]} cast={false} />
    <Cy rr={0.06} h={0.6} c={C.ink} p={[0.5, -0.5, 0]} r={[0, 0, 0.78]} />
  </group>
);
