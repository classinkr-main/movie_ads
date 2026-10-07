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
Config.setChromiumOpenGlRenderer("angle");
