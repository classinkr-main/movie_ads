import React from "react";
import { ForumEdit } from "./ForumEdit";
import highlight from "./edl/highlight.json";
import live from "./edl/live.json";
import people from "./edl/people.json";
import short from "./edl/short.json";
import sketch from "./edl/sketch.json";
import speakers from "./edl/speakers.json";
import style from "./edl/style.json";
import type { Edl } from "./types";

export const LIVE_EDL = live as unknown as Edl;
export const HIGHLIGHT_EDL = highlight as unknown as Edl;
export const SPEAKERS_EDL = speakers as unknown as Edl;
export const SKETCH_EDL = sketch as unknown as Edl;
export const STYLE_EDL = style as unknown as Edl;
export const SHORT_EDL = short as unknown as Edl;
export const PEOPLE_EDL = people as unknown as Edl;

// A안 — 실황편: 현장음과 연설 사운드바이트로 흐름을 끌고 가는 2분 33초
export const ForumLive: React.FC = () => <ForumEdit edl={LIVE_EDL} />;

// B안 — 하이라이트편: 오리지널 음악 마디에 맞춰 4.8초 컷으로 엮은 1분 22초
export const ForumHighlight: React.FC = () => <ForumEdit edl={HIGHLIGHT_EDL} />;

// C안 — 하이라이트편(연사): 사회·축사와 세션 01–06을 짧게 한 컷씩 담고 몽타주·단체 사진으로 맺는 2분
export const ForumSpeakers: React.FC = () => <ForumEdit edl={SPEAKERS_EDL} />;

// D안 — 1분 스케치: 5.28 학원 탐방(사진·현장 영상)에서 5.29 포럼으로, 연사는 한 컷씩 이름만 남기는 57.6초
export const ForumSketch60: React.FC = () => <ForumEdit edl={SKETCH_EDL} />;

// E안 — 스타일편: 레터박스·박자 타이포·분할 화면으로 다시 엮은 58초(120 BPM)
export const ForumStyle: React.FC = () => <ForumEdit edl={STYLE_EDL} />;

// F안 — 30초편: 스타일편 문법으로 탐방·포럼·단체 사진만 남긴 30초
export const ForumShort30: React.FC = () => <ForumEdit edl={SHORT_EDL} />;

// G안 — 사람편: 입장·만남(네트워킹)·함께, 사진과 현장 영상에 로비 웅성거림을 깔아 사람 위주로 엮은 1분 2초
export const ForumPeople: React.FC = () => <ForumEdit edl={PEOPLE_EDL} />;
