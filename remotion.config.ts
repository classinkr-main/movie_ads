import { Config } from "@remotion/cli/config";

// 렌더 품질 — 커머셜 납품용 기본값
// PNG 프레임 + bt709 태깅 → 플레이어 호환성이 높은 리미티드 레인지 yuv420p 출력
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");

// 클라우드 세션에는 Playwright Chromium이 미리 설치되어 있다.
// 로컬에서는 REMOTION_BROWSER_EXECUTABLE 를 비워 두면 Remotion이 Chrome Headless Shell을 내려받는다.
const executable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (executable) {
  Config.setBrowserExecutable(executable);
}
// '멘탈' 쇼릴은 실제 3D(WebGL)를 씁니다. GPU 가 없는 리눅스(클라우드·CI)에서는 소프트웨어 GL(swangle)이어야
// WebGL 컨텍스트가 만들어집니다. REMOTION_GL 로 직접 지정할 수 있습니다(angle · angle-egl · swangle · vulkan).
type Gl = Parameters<typeof Config.setChromiumOpenGlRenderer>[0];
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as Gl | undefined) ?? (process.platform === "linux" ? "swangle" : "angle"));
