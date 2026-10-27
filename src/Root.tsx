import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { edlFrames } from "./forum/ForumEdit";
import { ForumHighlight, ForumLive, HIGHLIGHT_EDL, LIVE_EDL } from "./forum/ForumSketch";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumLive" component={ForumLive} durationInFrames={edlFrames(LIVE_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumHighlight" component={ForumHighlight} durationInFrames={edlFrames(HIGHLIGHT_EDL)} fps={FPS} width={1920} height={1080} />
  </>
);
