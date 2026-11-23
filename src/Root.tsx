import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { GBShowreel } from "./gb/GBShowreel";
import { DUR as GB_DUR, FPS as GB_FPS } from "./gb/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Gaebyeol" component={GBShowreel} durationInFrames={GB_DUR} fps={GB_FPS} width={1920} height={1080} />
  </>
);
