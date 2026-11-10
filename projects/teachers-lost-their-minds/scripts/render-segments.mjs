// 장면 단위로 나눠 렌더한 뒤 이어 붙입니다. 한 장면만 고쳤을 때 그 장면만 다시 렌더할 수 있습니다.
//
//   node scripts/render-segments.mjs                       # 16:9 전체 → renders/final.mp4
//   node scripts/render-segments.mjs --vertical            # 9:16 → renders/final-vertical.mp4
//   node scripts/render-segments.mjs --clean               # 자막 없는 버전 → renders/final-clean.mp4
//   node scripts/render-segments.mjs --only s05,s06        # 해당 장면만 다시 렌더하고 다시 이어 붙임
//   node scripts/render-segments.mjs --draft               # 반해상도 초안
//
// 장면 경계는 artifacts/timeline.json 에서 읽습니다(타이밍을 바꿨다면 `npm run mental:timeline` 먼저).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const project = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(project, "..", "..");
const rel = (p) => relative(repo, p);
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : null);

const vertical = flag("vertical");
const clean = flag("clean");
const draft = flag("draft");
const only = value("only")?.split(",") ?? null;
const comp = vertical ? "TeachersMentalVertical" : "TeachersMental";
const name = `final${vertical ? "-vertical" : ""}${clean ? "-clean" : ""}${draft ? "-draft" : ""}`;
const timeline = JSON.parse(readFileSync(join(project, "artifacts", "timeline.json"), "utf-8"));
const segDir = join(project, "renders", "segments", name);
mkdirSync(segDir, { recursive: true });

const run = (cmd, argv) => {
  const r = spawnSync(cmd, argv, { cwd: repo, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(`실패: ${cmd} ${argv.join(" ")}`);
    process.exit(r.status ?? 1);
  }
};

const t0 = Date.now();
for (const s of timeline.scenes) {
  const out = join(segDir, `${s.id}.mp4`);
  if (only ? !only.includes(s.id) : false) {
    if (!existsSync(out)) console.warn(`경고: ${s.id} 세그먼트가 아직 없습니다 — --only 없이 한 번 전체 렌더가 필요합니다.`);
    continue;
  }
  console.log(`\n▶ ${s.id} ${s.name}  (frames ${s.start}–${s.end - 1})`);
  run("npx", [
    "remotion", "render", rel(join(project, "index.tsx")), comp, rel(out),
    `--frames=${s.start}-${s.end - 1}`,
    `--public-dir=${rel(join(project, "public"))}`,
    `--props=${rel(join(project, "artifacts", clean ? "props.clean.json" : "props.json"))}`,
    "--crf=16",
    ...(draft ? ["--scale=0.5"] : []),
    "--log=error",
  ]);
}

// 이어 붙이기(재인코딩 없이) → 납품용 한 번 인코딩
const list = join(segDir, "concat.txt");
writeFileSync(list, timeline.scenes.map((s) => `file '${s.id}.mp4'`).join("\n") + "\n");
const master = join(segDir, "_master.mp4");
run("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", rel(list), "-c", "copy", rel(master)]);
const final = join(project, "renders", `${name}.mp4`);
run("npx", [
  "remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", rel(master),
  "-c:v", "libx264", "-preset", "slow", "-crf", process.env.CRF ?? "20", "-pix_fmt", "yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", "-an",
  rel(final),
]);
console.log(`\n완료: ${rel(final)}  (${((Date.now() - t0) / 60000).toFixed(1)}분)`);
