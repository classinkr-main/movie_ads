import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Stamp } from "../../components/Feature";
import type { StampKind } from "../../components/Feature";
import { Burst, TypeText } from "../../components/Flourish";
import { Chip, Pop } from "../../components/Ui";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { Card, CardTop, CineFeature, DisplayNumber, ExampleTag, GiantType, mono, t } from "../Layout";
import { local } from "../timeline";

const L = {
  title: local("grade", "grade.title"),
  card: local("grade", "grade.card"),
  stamps: [local("grade", "grade.stamp1"), local("grade", "grade.stamp2"), local("grade", "grade.stamp3")],
  typeStart: local("grade", "grade.typeStart"),
  typeEnd: local("grade", "grade.typeEnd"),
  score: local("grade", "grade.score"),
};
// 예시 수업(v4와 동일)의 형성평가 중 3문항. 답안·점수는 예시.
const QS: Array<{ type: "객관식" | "서술형"; q: string; a: string; kind: StampKind }> = [
  { type: "객관식", q: "「서시」에서 '별'이 상징하는 것은?", a: "② 이상과 희망", kind: "ok" },
  { type: "객관식", q: "은유법이 쓰인 문장을 고르시오.", a: "③ 선생님의 목소리는 봄바람이다.", kind: "ok" },
  { type: "서술형", q: "'바람'이 상징하는 의미를 쓰시오.", a: "화자가 겪는 시련을 의미한다.", kind: "partial" },
];
const FEEDBACK = "'시련' 해석은 정확해요. 근거 시구를 덧붙이면 만점이에요.";

// 02 — 숙제를 채점하고
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fbIn = sp(frame - (L.typeStart - 6), fps, SMOOTH, 12);
  const cps = Array.from(FEEDBACK).length / (L.typeEnd - L.typeStart);

  return (
    <CineFeature
      index={1}
      titleAt={L.title}
      cardAt={L.card}
      sheenAt={L.score - 4}
      lineA="숙제를"
      lineB="채점하고,"
      sub="서술형까지, 문항별 피드백과 함께"
      beamX={26}
      rest={{ rx: 7, ry: 10 }}
      backdrop={<GiantType text="90" at={L.score} top={250} left={460} />}
    >
      <Card>
        <CardTop title="AI 채점 · 김지민 답안" right={<ExampleTag />} />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {QS.map((q, i) => {
            const d = L.card + 8 + i * 4;
            const partial = q.kind === "partial" && frame >= L.stamps[i];
            return (
              <div key={i} style={{ opacity: interpolate(frame - d, [0, 5], [0, 1], clamp), padding: "14px 18px", borderRadius: 22, background: partial ? C.limeSoft : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ ...mono(24, 700, C.limeInk), width: 40 }}>Q{i + 1}</span>
                  <span style={t(20, 800, q.type === "서술형" ? C.limeInk : C.gray, { background: q.type === "서술형" ? C.limeSoft : C.ivory2, border: `2px solid ${q.type === "서술형" ? C.lime : "transparent"}`, borderRadius: 8, padding: "3px 10px", flexShrink: 0 })}>{q.type}</span>
                  <span style={{ ...t(29, 700, C.ink), flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.q}</span>
                  <div style={{ width: 56, display: "grid", placeItems: "center", flexShrink: 0 }}>{frame >= L.stamps[i] && <Stamp delay={L.stamps[i]} kind={q.kind} size={52} />}</div>
                </div>
                <div style={{ ...t(26, 600, C.gray), marginTop: 8, paddingLeft: 54 }}>
                  <span style={{ color: C.limeInk, fontWeight: 800 }}>답 </span>
                  {q.a}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI 피드백 */}
        <div style={{ marginTop: 14, minHeight: 156 }}>
          <div style={{ opacity: fbIn, transform: `translateY(${(1 - fbIn) * 16}px)`, border: `2.5px solid ${C.lime}`, borderRadius: 26, padding: "18px 22px" }}>
            <span style={mono(19, 700, C.ink, { background: C.lime, borderRadius: 8, padding: "5px 12px", letterSpacing: "0.08em" })}>AI 피드백 · Q3</span>
            <div style={{ ...t(30, 700, C.ink), marginTop: 12, lineHeight: 1.45, wordBreak: "keep-all", minHeight: 87 }}>
              <TypeText text={FEEDBACK} delay={L.typeStart} cps={cps} caretColor={C.limeDeep} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
          <Chip delay={L.score + 6} size={24}>피드백 전송됨</Chip>
          <Chip delay={L.score + 10} size={24}>반 평균 82점</Chip>
        </div>

        {/* 점수 배지 */}
        <div style={{ position: "absolute", right: 30, bottom: -66 }}>
          <Pop delay={L.score} from={0.2} rotate={-14}>
            <div style={{ background: C.forest, borderRadius: 32, padding: "16px 32px 20px", boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,240,90,0.35)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <DisplayNumber to={90} delay={L.score + 2} duration={22} size={112} color={C.lime} />
                <span style={t(36, 800, C.white)}>점</span>
              </div>
              <div style={{ ...t(22, 600, "rgba(255,255,255,0.78)"), marginTop: 2 }}>서술형 부분 점수 반영</div>
            </div>
          </Pop>
          <Burst delay={L.score + 2} size={560} color={C.lime} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
        </div>
      </Card>
    </CineFeature>
  );
};
