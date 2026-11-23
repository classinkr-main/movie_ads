// 아주 작은 3D 투영 도우미 — WebGL 없이 SVG로 와이어프레임 홀로그램을 그린다(프레임 결정론적).
export type V3 = readonly [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export type Projected = { x: number; y: number; z: number; k: number };
export type Camera = { project: (p: V3) => Projected };

/** pos 에서 target 을 바라보는 카메라. focal 은 px 단위 초점거리, (cx, cy) 는 target 이 맺히는 화면 좌표 */
export const camera = (pos: V3, target: V3, focal: number, cx: number, cy: number): Camera => {
  const fwd = norm(sub(target, pos));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  return {
    project: (p) => {
      const d = sub(p, pos);
      const z = dot(d, fwd);
      const k = focal / Math.max(0.05, z);
      return { x: cx + dot(d, right) * k, y: cy - dot(d, up) * k, z, k };
    },
  };
};

/** 3D 폴리라인 → SVG path. 카메라 뒤로 넘어가는 점에서는 선을 끊는다 */
export const path3 = (cam: Camera, pts: V3[], near = 0.3): { d: string; z: number } => {
  let d = "";
  let pen = false;
  let zs = 0;
  let n = 0;
  for (const p of pts) {
    const q = cam.project(p);
    if (q.z < near) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    pen = true;
    zs += q.z;
    n++;
  }
  return { d, z: n ? zs / n : 0 };
};
