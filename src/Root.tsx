import React from "react";
import { Composition, Folder } from "remotion";
import "./shared/fonts";
import { DURATION_FRAMES, FPS } from "./projects/classin-ai/showreel/theme";
import { Showreel } from "./projects/classin-ai/showreel/Showreel";

// 프로젝트별 <Folder>, 영상별 <Composition>.
// 컴포지션 id는 "<프로젝트>-<영상>" — 렌더 경로 out/<프로젝트>/<영상>.mp4 와 맞춘다.
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="classin-ai">
      <Composition id="classin-ai-showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    </Folder>
  </>
);
