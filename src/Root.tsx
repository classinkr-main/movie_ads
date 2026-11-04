import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { TeacherMgmt, TM_DURATION_FRAMES } from "./TeacherMgmt";
import { TeacherMgmtValue, TMV_DURATION_FRAMES } from "./TeacherMgmtValue";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="TeacherMgmt" component={TeacherMgmt} durationInFrames={TM_DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="TeacherMgmtValue" component={TeacherMgmtValue} durationInFrames={TMV_DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
