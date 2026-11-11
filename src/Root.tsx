import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { Cinematic } from "./cinematic/Cinematic";
import { T } from "./cinematic/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Cinematic" component={Cinematic} durationInFrames={T.total} fps={30} width={1920} height={1080} defaultProps={{ audio: true }} />
  </>
);
