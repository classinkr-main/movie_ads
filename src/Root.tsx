import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { edlFrames } from "./forum/ForumEdit";
import {
  ForumHighlight,
  ForumLive,
  ForumPeople,
  ForumShort30,
  ForumSketch60,
  ForumSpeakers,
  ForumStyle,
  HIGHLIGHT_EDL,
  LIVE_EDL,
  PEOPLE_EDL,
  SHORT_EDL,
  SKETCH_EDL,
  SPEAKERS_EDL,
  STYLE_EDL,
} from "./forum/ForumSketch";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumLive" component={ForumLive} durationInFrames={edlFrames(LIVE_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumHighlight" component={ForumHighlight} durationInFrames={edlFrames(HIGHLIGHT_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumSpeakers" component={ForumSpeakers} durationInFrames={edlFrames(SPEAKERS_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumSketch60" component={ForumSketch60} durationInFrames={edlFrames(SKETCH_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumStyle" component={ForumStyle} durationInFrames={edlFrames(STYLE_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumShort30" component={ForumShort30} durationInFrames={edlFrames(SHORT_EDL)} fps={FPS} width={1920} height={1080} />
    <Composition id="ForumPeople" component={ForumPeople} durationInFrames={edlFrames(PEOPLE_EDL)} fps={FPS} width={1920} height={1080} />
  </>
);
