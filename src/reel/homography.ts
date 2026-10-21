// 사각형(w×h) → 임의의 사각형(4점)으로 보내는 투영 변환을 CSS matrix3d로 만든다.
// 사진 속 빈 전자칠판 화면에 1920×1080 콘텐츠를 원근에 맞춰 얹을 때 쓴다(스크린 리플레이스).
export type Pt = [number, number];

// 8×8 선형계 가우스 소거
const solve = (A: number[][], b: number[]): number[] => {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
};

// dst: [좌상, 우상, 우하, 좌하]
export const quadToMatrix3d = (w: number, h: number, dst: [Pt, Pt, Pt, Pt]): string => {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const [a, b2, c, d, e, f, g, h2] = solve(A, b);
  // 열 우선(column-major) 4×4
  const m = [a, d, 0, g, b2, e, 0, h2, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((x) => x.toFixed(10)).join(",")})`;
};
