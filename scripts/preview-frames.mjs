// 지정 프레임들을 PNG 스틸로 렌더해 out/preview-<comp>/ 에 저장한다. 번들은 한 번만 만든다.
// 사용: node scripts/preview-frames.mjs TeacherMgmt 60,190,250
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [compId = "TeacherMgmt", framesArg = "0"] = process.argv.slice(2);
const frames = framesArg.split(",").map((f) => Number(f.trim())).filter((n) => Number.isFinite(n));
const outDir = path.resolve("out", `preview-${compId}`);
fs.mkdirSync(outDir, { recursive: true });

const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: compId, browserExecutable, chromiumOptions: { gl: "angle" } });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, chromiumOptions: { gl: "angle" }, imageFormat: "png" });
  console.log("wrote", path.relative(process.cwd(), output));
}
