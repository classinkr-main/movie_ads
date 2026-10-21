import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS, H, W } from "./lib/theme";
import { Showreel } from "./Showreel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
