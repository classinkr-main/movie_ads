import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { HW_DURATION_FRAMES, HW_FPS } from "./lib/hwTheme";
import { Showreel } from "./Showreel";
import { Hardware } from "./Hardware";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Hardware" component={Hardware} durationInFrames={HW_DURATION_FRAMES} fps={HW_FPS} width={1920} height={1080} />
  </>
);
