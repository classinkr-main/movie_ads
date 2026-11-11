// 시네마틱 커머셜 스틸 추출 — 번들을 한 번만 만들고 여러 프레임을 뽑는다.
//   node scripts/cinematic-stills.mjs 20,50,95 [scale=0.5] [outDir=out/frames]
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const frames = (process.argv[2] ?? "0").split(",").map(Number);
const scale = Number(process.argv[3] ?? 0.5);
const outDir = process.argv[4] ?? "out/frames";
const id = process.env.COMP ?? "Cinematic";
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;

fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, inputProps: { audio: false } });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(3, "0")}.jpg`);
  const t = Date.now();
  await renderStill({ composition, serveUrl, frame, output, scale, imageFormat: "jpeg", jpegQuality: 88, browserExecutable, inputProps: { audio: false }, chromiumOptions: { gl: "angle" } });
  console.log(`f${frame} → ${output} (${Date.now() - t}ms)`);
}
