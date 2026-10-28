import React from "react";
import { ForumEdit } from "./ForumEdit";
import highlight from "./edl/highlight.json";
import live from "./edl/live.json";
import speakers from "./edl/speakers.json";
import type { Edl } from "./types";

export const LIVE_EDL = live as unknown as Edl;
export const HIGHLIGHT_EDL = highlight as unknown as Edl;
export const SPEAKERS_EDL = speakers as unknown as Edl;

// A안 — 실황편: 현장음과 연설 사운드바이트로 흐름을 끌고 가는 2분 33초
export const ForumLive: React.FC = () => <ForumEdit edl={LIVE_EDL} />;

// B안 — 하이라이트편: 오리지널 음악 마디에 맞춰 4.8초 컷으로 엮은 1분 22초
export const ForumHighlight: React.FC = () => <ForumEdit edl={HIGHLIGHT_EDL} />;

// C안 — 하이라이트편(연사): 사회·축사와 세션 01–06을 짧게 한 컷씩 담고 몽타주·단체 사진으로 맺는 2분
export const ForumSpeakers: React.FC = () => <ForumEdit edl={SPEAKERS_EDL} />;
