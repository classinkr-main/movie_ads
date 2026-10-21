import React from "react";
import { Composition, Folder } from "remotion";
import "./shared/fonts";
import { DURATION_FRAMES, FPS } from "./projects/09_20261007_ClassinAI_기능소개_30초_Remotion-모션그래픽/theme";
import { Showreel } from "./projects/09_20261007_ClassinAI_기능소개_30초_Remotion-모션그래픽/Showreel";

// 폴더는 Drive "영상_ai_프로젝트" 번호를 따른다(src/projects/<번호>_<이름>/).
// Remotion의 Folder 이름·컴포지션 id는 한글을 받지 않아 "p<번호>-<영문 이름>"으로 쓴다.
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="p09-classin-ai">
      <Composition id="p09-classin-ai-features-30s" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    </Folder>
  </>
);
