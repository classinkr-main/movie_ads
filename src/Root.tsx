import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { BrandReel } from "./reel/BrandReel";
import { DURATION_FRAMES as REEL_FRAMES, FPS as REEL_FPS } from "./reel/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="BrandReel" component={BrandReel} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={1920} height={1080} />
  </>
);
