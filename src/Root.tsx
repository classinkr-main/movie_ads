import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import "./guangzhou/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { GuangzhouVlog } from "./guangzhou/GuangzhouVlog";
import { FPS as GZ_FPS, TOTAL as GZ_TOTAL } from "./guangzhou/timeline";
import { FILM_FPS, FILM_FRAMES, GuangzhouEventFilm } from "./guangzhou/EventFilm";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="GuangzhouVlog" component={GuangzhouVlog} durationInFrames={GZ_TOTAL} fps={GZ_FPS} width={1080} height={1920} />
    <Composition id="GuangzhouEventFilm" component={GuangzhouEventFilm} durationInFrames={FILM_FRAMES} fps={FILM_FPS} width={1920} height={1080} />
  </>
);
