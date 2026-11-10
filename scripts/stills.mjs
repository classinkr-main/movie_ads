// 개발용: 여러 프레임을 한 번의 번들로 뽑아 본다.
//   node scripts/stills.mjs <CompositionId> <outDir> <frame,frame,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [, , id = "GullReel", outDir = "out/frames", framesArg = "0", scaleArg = "0.5"] = process.argv;
const frames = framesArg.split(",").map((s) => Number(s.trim()));
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
for (const frame of frames) {
  const output = path.join(outDir, `${id}-${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, scale: Number(scaleArg), puppeteerInstance: browser, imageFormat: "png" });
  process.stdout.write(`${frame} `);
}
await browser.close({ silent: true });
console.log("\ndone");
