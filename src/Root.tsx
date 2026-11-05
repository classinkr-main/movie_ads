import React from "react";
import { Composition, Still } from "remotion";
import "./lib/fonts";
import { FPS, H, W } from "./lib/theme";
import { TimingProvider, VERSIONS, type VersionId } from "./lib/timing";
import { Showreel } from "./Showreel";
import { SOCIAL_FRAME, SocialFrame916, type SocialFrameProps } from "./SocialFrame";

// 버전 = cues JSON + 사운드트랙. 장면 코드는 같고 타이밍만 다르다.
const Version: React.FC<{ version: VersionId }> = ({ version }) => (
  <TimingProvider value={VERSIONS[version].cues}>
    <Showreel audio={VERSIONS[version].audio} />
  </TimingProvider>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Version} defaultProps={{ version: "v22" as VersionId }} durationInFrames={VERSIONS.v22.cues.durationInFrames} fps={FPS} width={W} height={H} />
    <Composition id="Showreel30" component={Version} defaultProps={{ version: "v30" as VersionId }} durationInFrames={VERSIONS.v30.cues.durationInFrames} fps={FPS} width={W} height={H} />
    {/* 인스타 9:16 타이틀 프레임 — tools/social.mjs가 영상 칸 위치·타이틀 시안(titleId)·숨길 요소를 inputProps로 넘긴다 */}
    <Still id="SocialFrame916" component={SocialFrame916} defaultProps={{ videoTop: 656, videoHeight: 608, titleId: "a", hide: [] } satisfies SocialFrameProps} width={SOCIAL_FRAME.width} height={SOCIAL_FRAME.height} />
  </>
);
