import { useVideoConfig } from "remotion";

// 16:9(1920x1080) 기준으로 설계된 치수를 다른 캔버스로 환산하는 단위.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  const u = isPortrait ? width / 1080 : Math.min(width / 1920, height / 1080);
  return { width, height, isPortrait, u };
};
