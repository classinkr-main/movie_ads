import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { DURATION_FRAMES, FPS } from "./lib/theme";
import { Showreel } from "./Showreel";
import { SHORT_H, SHORT_W, ShortForm } from "./shorts/ShortForm";
import { clipFrames } from "./shorts/timeline";
import type { ShortSpec } from "./shorts/types";
import short01 from "./shorts/specs/short-01-ai-teacher.json";
import short02 from "./shorts/specs/short-02-institution.json";
import short03 from "./shorts/specs/short-03-learning.json";
import short04 from "./shorts/specs/short-04-teacher-pay.json";
import short05 from "./shorts/specs/short-05-first-year.json";
import short06 from "./shorts/specs/short-06-ai-kpi.json";

const SHORTS = [short01, short02, short03, short04, short05, short06] as ShortSpec[];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    {SHORTS.map((spec) => (
      <Composition
        key={spec.id}
        id={spec.id}
        component={ShortForm}
        durationInFrames={clipFrames(spec.segments)}
        fps={FPS}
        width={SHORT_W}
        height={SHORT_H}
        defaultProps={{ spec, clip: `shorts/${spec.id}.mp4` }}
      />
    ))}
  </>
);
