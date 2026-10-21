import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const frames = process.argv.slice(3).map(Number);
const outDir = process.argv[2];
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const comp = await selectComposition({ serveUrl, id: "GuangzhouVlog", browserExecutable });
for (const f of frames) {
  await renderStill({ serveUrl, composition: comp, frame: f, output: `${outDir}/f${String(f).padStart(3, "0")}.png`, browserExecutable, chromiumOptions: { gl: "angle" } });
  console.log("still", f);
}
