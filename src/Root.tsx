import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { Brag } from "./brag/Brag";
import { BRAG } from "./brag/timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Brag" component={Brag} durationInFrames={BRAG.frames} fps={BRAG.fps} width={1080} height={1920} />
  </>
);
