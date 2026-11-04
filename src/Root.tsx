import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { TeacherMgmt, TM_DURATION_FRAMES } from "./TeacherMgmt";
import { TeacherMgmtDark, TMB_DURATION_FRAMES } from "./TeacherMgmtDark";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="TeacherMgmt" component={TeacherMgmt} durationInFrames={TM_DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="TeacherMgmtDark" component={TeacherMgmtDark} durationInFrames={TMB_DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
