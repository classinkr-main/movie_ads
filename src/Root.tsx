import React from "react";
import { Composition } from "remotion";
import "./lib/fonts";
import { FPS, H, W } from "./lib/theme";
import { TimingProvider, VERSIONS, type VersionId } from "./lib/timing";
import { Showreel } from "./Showreel";

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
  </>
);
