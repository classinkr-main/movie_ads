// 사각형(w×h) → 임의 사변형 투영 변환을 CSS matrix3d 로 만든다.
// 제품 사진 속 화면 영역에 UI 콘텐츠를 "끼워 넣는" 데 쓴다. transformOrigin 은 반드시 "0 0".
export type Pt = [number, number];

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c] || 1e-12;
    for (let k = c; k <= n; k++) M[c][k] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row) => row[n]);
}

/** (0,0),(w,0),(w,h),(0,h) 를 각각 tl,tr,br,bl 로 보내는 matrix3d 문자열 */
export function quadToMatrix3d(w: number, h: number, [tl, tr, br, bl]: [Pt, Pt, Pt, Pt]): string {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const dst: Pt[] = [tl, tr, br, bl];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
    b.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
    b.push(Y);
  }
  const [a, bb, c, d, e, f, g, hh] = solve(A, b);
  // CSS matrix3d 는 열 우선. 2D 투영 행렬 [a bb c; d e f; g hh 1] 을 4×4 에 배치.
  const m = [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(6))).join(",")})`;
}
