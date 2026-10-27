import React from "react";
import { ForumEdit } from "./ForumEdit";
import highlight from "./edl/highlight.json";
import live from "./edl/live.json";
import type { Edl } from "./types";

export const LIVE_EDL = live as unknown as Edl;
export const HIGHLIGHT_EDL = highlight as unknown as Edl;

// A안 — 실황편: 현장음과 연설 사운드바이트로 흐름을 끌고 가는 2분 33초
export const ForumLive: React.FC = () => <ForumEdit edl={LIVE_EDL} />;

// B안 — 하이라이트편: 오리지널 음악 마디에 맞춰 4.8초 컷으로 엮은 1분 22초
export const ForumHighlight: React.FC = () => <ForumEdit edl={HIGHLIGHT_EDL} />;
