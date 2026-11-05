import React from "react";
import { AbsoluteFill } from "remotion";
import { Highlighter } from "./components/Marks";
import TITLES from "./data/social-titles.json";
import { C, FONT } from "./lib/theme";

// 인스타 9:16(1080×1920) 타이틀 프레임 — tools/social.mjs가 이 Still을 PNG로 뽑아 바탕에 깔고,
// 16:9 마스터를 폭 1080으로 줄여 세로 가운데(videoTop)에 얹는다. 영상 칸은 영상이 덮으므로 비워 둔다.
// 위 타이틀은 src/data/social-titles.json의 시안(titleId)에서 온다. 2줄이고 둘째 줄에 형광펜을 긋는다.
// 영상 안에 같은 문구가 나오는 동안에는 social.mjs가 해당 요소를 뺀 판(hide)으로 넘어가 한 화면에 같은 말이 두 번 보이지 않게 한다
// (시스템 장면 = 솔루션 문구, 엔드 카드 = 솔루션 문구·CTA, 타이틀이 피날레 문장과 같으면 피날레부터 타이틀).
// 배치 기준(메타 릴스·스토리 광고 가이드 "위 14% · 아래 35% · 좌우 6%를 비워 두라", 2025 GSI Reels Deck 도면):
//   위 타이틀 영상 위 62px에 아래를 맞춘다 → 위 14%(269px)와 피드에서 9:16을 4:5로 가운데만 보일 때의 위끝(285px) 아래
//   아래 블록 영상 바로 밑 : 영상이 가운데라 아래 35%(1248px~)는 피할 수 없다. 릴스 프로필 줄(아바타 위끝 약 y 1490)과
//                           오른쪽 아이콘 열(약 x 944~)보다 위·안쪽에 들도록 짧게 두고 CTA 그림자도 얕게 했다.
export type SocialPart = "title" | "tagline" | "cta";
export type TitleId = keyof typeof TITLES.titles;
export type SocialFrameProps = { videoTop: number; videoHeight: number; titleId: TitleId; hide?: SocialPart[] };

export const SOCIAL_FRAME = { width: 1080, height: 1920 } as const;

// 줄 끝 문장부호를 글자 폭 밖으로 걸어(hanging) 한글 덩어리가 가운데(x 540)에 오게 한다
const Hung: React.FC<{ text: string }> = ({ text }) => {
  const m = /^(.*?)([,.]?)$/.exec(text);
  const [body, punct] = m ? [m[1], m[2]] : [text, ""];
  return (
    <>
      {body}
      {punct && <span style={{ marginRight: "-0.28em" }}>{punct}</span>}
    </>
  );
};

export const SocialFrame916: React.FC<SocialFrameProps> = ({ videoTop, videoHeight, titleId, hide = [] }) => {
  const shown = (part: SocialPart) => !hide.includes(part);
  const below = videoTop + videoHeight;
  const title = TITLES.titles[titleId];
  const [first, second] = title.lines;
  const hangs = /[,.]$/.test(second); // 둘째 줄이 문장부호로 끝나면 형광펜을 오른쪽으로 그만큼 늘려 가운데를 맞춘다
  return (
    <AbsoluteFill style={{ background: C.lime }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 1920 - videoTop + 62,
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: title.size,
          lineHeight: 1.16,
          letterSpacing: "-0.05em",
          color: C.ink,
          textAlign: "center",
          whiteSpace: "nowrap",
          opacity: shown("title") ? 1 : 0,
        }}
      >
        <div>
          <Hung text={first} />
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Highlighter x={hangs ? -41 : -24} y="29%" w={hangs ? "calc(100% + 84px)" : "calc(100% + 48px)"} h="52%" start={-30} />
          <span style={{ position: "relative" }}>
            <Hung text={second} />
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: below + 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 46, letterSpacing: "0.01em", color: C.ink, whiteSpace: "nowrap", opacity: shown("tagline") ? 1 : 0 }}>
          수업 자동 녹화 · 학습 관리 솔루션
        </div>
        <div
          style={{
            padding: "18px 36px",
            borderRadius: 999,
            background: C.ink,
            color: C.white,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            boxShadow: `0 6px 14px ${C.shadow}`,
            opacity: shown("cta") ? 1 : 0,
          }}
        >
          목동 쇼룸에서 실제 수업 흐름 보기 <span style={{ color: C.signal }}>→</span>
        </div>
      </div>
      {/* 영상 칸 — 최종본에서는 영상이 정확히 덮는다(스튜디오 미리보기용 자리 표시) */}
      <div style={{ position: "absolute", left: 4, right: 4, top: videoTop + 4, height: videoHeight - 8, background: C.ink, opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 26, letterSpacing: "0.12em", color: C.lime }}>16:9 MASTER · 1080×{videoHeight}</span>
      </div>
    </AbsoluteFill>
  );
};
