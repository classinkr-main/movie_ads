import React from "react";
import { Composition, Folder } from "remotion";
import "./shared/fonts";
import { FPS } from "./shared/brand/theme";
import { DURATION_FRAMES as P09_FRAMES, FPS as P09_FPS } from "./projects/09_20261007_ClassinAI_기능소개_30초_Remotion-모션그래픽/theme";
import { Showreel } from "./projects/09_20261007_ClassinAI_기능소개_30초_Remotion-모션그래픽/Showreel";
import { CareFlow, DURATION_FRAMES as P06_FRAMES, FPS as P06_FPS } from "./projects/06_20261006_수업전중후케어_40초_앱화면-학습흐름/CareFlow";
import { DURATION_FRAMES as P07_FRAMES, FPS as P07_FPS, OneStandard } from "./projects/07_20261006_수업표준화_45초_앱화면-수업형태비교/OneStandard";
import { GullSheet } from "./gull/Sheet";
import { GullReel } from "./gull/GullReel";
import { GullThumb } from "./gull/Thumb";
import { G_DURATION, G_FPS } from "./gull/theme";
import { BrandReel } from "./reel/BrandReel";
import { DURATION_FRAMES as REEL_FRAMES, FPS as REEL_FPS } from "./reel/theme";
import "./guangzhou/fonts";
import { GuangzhouVlog } from "./guangzhou/GuangzhouVlog";
import { FPS as GZ_FPS, TOTAL as GZ_TOTAL } from "./guangzhou/timeline";
import { FILM_FPS, FILM_FRAMES, GuangzhouEventFilm } from "./guangzhou/EventFilm";
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

// 폴더는 Drive "영상_ai_프로젝트" 번호를 따른다(src/projects/<번호>_<이름>/).
// Remotion의 Folder 이름·컴포지션 id는 한글을 받지 않아 "p<번호>-<영문 이름>"으로 쓴다.
// 번호가 없는 영상은 src/<영상>/에 있고 원래 컴포지션 id를 그대로 쓴다(npm 스크립트·README가 이 id로 렌더한다).
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="p06-care-flow">
      <Composition id="p06-care-flow-40s" component={CareFlow} durationInFrames={P06_FRAMES} fps={P06_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="p07-one-standard">
      <Composition id="p07-one-standard-45s" component={OneStandard} durationInFrames={P07_FRAMES} fps={P07_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="p09-classin-ai">
      <Composition id="p09-classin-ai-features-30s" component={Showreel} durationInFrames={P09_FRAMES} fps={P09_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="gull">
      <Composition id="GullReel" component={GullReel} durationInFrames={G_DURATION} fps={G_FPS} width={1920} height={1080} />
      <Composition id="GullThumb" component={GullThumb} durationInFrames={1} fps={G_FPS} width={1920} height={1080} />
      <Composition id="GullSheet" component={GullSheet} durationInFrames={90} fps={G_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="brand-reel">
      <Composition id="BrandReel" component={BrandReel} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="guangzhou">
      <Composition id="GuangzhouVlog" component={GuangzhouVlog} durationInFrames={GZ_TOTAL} fps={GZ_FPS} width={1080} height={1920} />
      <Composition id="GuangzhouEventFilm" component={GuangzhouEventFilm} durationInFrames={FILM_FRAMES} fps={FILM_FPS} width={1920} height={1080} />
    </Folder>
    <Folder name="forum-shorts">
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
    </Folder>
  </>
);
