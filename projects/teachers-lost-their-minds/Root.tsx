import React from "react";
import { Composition } from "remotion";
import { Film, FilmProps } from "./Film";
import { FPS, TOTAL_FRAMES } from "./story/beats";

const defaults: FilmProps = { captions: true };

export const Root: React.FC = () => (
  <>
    {/* 메인 16:9 */}
    <Composition id="TeachersMental" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={defaults} />
    {/* 세로 9:16 (쇼츠·릴스) */}
    <Composition id="TeachersMentalVertical" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={defaults} />
  </>
);
