// 검수용 스틸 일괄 렌더 — 번들은 한 번만 만들고 지정한 프레임들을 JPEG로 뽑는다.
//   node tools/stills.mjs 30 120 245 ...        → out/preview-0030.jpg …
//   node tools/stills.mjs --every 30            → 0, 30, 60 … 전 구간
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const every = args[0] === "--every" ? Number(args[1]) : 0;

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? null, chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id: "Showreel", puppeteerInstance: browser });
const frames = every ? Array.from({ length: Math.ceil(composition.durationInFrames / every) }, (_, i) => i * every) : args.map(Number);

for (const frame of frames) {
  const output = path.join(root, `out/preview-${String(frame).padStart(4, "0")}.jpg`);
  await renderStill({
    serveUrl,
    composition,
    frame,
    output,
    imageFormat: "jpeg",
    jpegQuality: 88,
    puppeteerInstance: browser,
    overwrite: true,
    // STILLS_LOG=1 이면 브라우저 콘솔(React 경고 등)을 함께 출력한다
    onBrowserLog: process.env.STILLS_LOG ? (log) => console.log(`  [${frame} ${log.type}]`, log.text) : undefined,
  });
  console.log("still", frame);
}
await browser.close({ silent: true });
