import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { GullSheet } from "./gull/Sheet";
import { GullReel } from "./gull/GullReel";
import { GullThumb } from "./gull/Thumb";
import { G_DURATION } from "./gull/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GullReel" component={GullReel} durationInFrames={G_DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="GullThumb" component={GullThumb} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="GullSheet" component={GullSheet} durationInFrames={90} fps={FPS} width={1920} height={1080} />
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
