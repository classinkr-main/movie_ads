import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, IvoryStage } from "../../shared/brand/Backgrounds";
import { CardHeader, Stamp, UiCard } from "../../shared/brand/Card";
import { TypeText } from "../../shared/brand/Flourish";
import { BigType, Caption, Device, InBeat, PhasePills, Seagull } from "../../shared/brand/Narrated";
import type { Beat } from "../../shared/brand/Narrated";
import { C } from "../../shared/brand/theme";
import { Chip, LogoStacked, Pop, Rise } from "../../shared/brand/Ui";
import { FONT_FAMILY } from "../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../shared/motion";

export const FPS = 30;
export const DURATION_FRAMES = 1200; // 40s

// Drive 기획 요약(2026-10-06)의 10개 비트와 녹음 대본. 녹음 전이므로 비트 길이는 기획표의 초 단위를 그대로 쓴다.
export const BEATS: readonly Beat[] = [
  { from: 0, to: 90, line: "수업만 한다고, 공부가 완성될까요?" },
  { from: 90, to: 210, line: "복습이 중요하다는 건 알지만, 혼자 꾸준히 이어가긴 어렵죠." },
  { from: 210, to: 360, line: "학원에 있는 시간을 늘려도, 모든 복습을 챙기기엔 한계가 있습니다." },
  { from: 360, to: 480, line: "수업 밖에서도 이어지는 배움. 클래스인이 연결합니다." },
  { from: 480, to: 600, line: "수업 전엔 클래스인 앱에서 질문하고 과제를 풀며 준비하고," },
  { from: 600, to: 720, line: "수업 중엔 함께 풀고 피드백하며 더 깊이 참여하고," },
  { from: 720, to: 870, line: "수업 후엔 앱으로 수업을 다시 보고, 퀴즈로 배운 내용을 확인합니다." },
  { from: 870, to: 960, line: "준비가 몰입으로, 복습이 성취로 이어지도록." },
  { from: 960, to: 1080, line: "수업 전·중·후를 한곳에서, 하나의 시스템으로 케어합니다." },
  { from: 1080, to: 1200, line: "더 높은 수업의 질과 세심한 관리, 클래스인에서 경험하세요." },
];

// 끝까지 따라가는 하나의 질문 — 09 쇼릴과 같은 예시 수업
const LESSON = "중2 국어 A반 · 윤동주 「서시」";
const QUESTION = "‘별’은 무엇을 상징하나요?";
const STUDENT = "김지민";

const Txt: React.FC<{ size: number; weight?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, weight = 600, color = C.ink, children, style }) => (
  <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.015em", lineHeight: 1.4, wordBreak: "keep-all", ...style }}>{children}</div>
);

// 왼쪽 큰 타이포 + 오른쪽 장면
const Split: React.FC<{ text: string; mark?: string; eyebrow?: string; children: React.ReactNode }> = ({ text, mark, eyebrow, children }) => (
  <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px 120px 150px", gap: 60 }}>
    <div style={{ width: 760, flexShrink: 0 }}>
      {eyebrow && (
        <Rise delay={0} distance={12}>
          <Chip size={24}>{eyebrow}</Chip>
        </Rise>
      )}
      <BigType text={text} mark={mark} size={92} style={{ marginTop: eyebrow ? 24 : 0 }} />
    </div>
    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>{children}</div>
  </AbsoluteFill>
);

/* ---------- 비트 ---------- */

// 0–3초 · 전·중·후 중 ‘중’만 켜짐
const B1: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 70, paddingBottom: 120 }}>
    <PhasePills on={[false, true, false]} size={70} />
    <BigType text="수업만으로 충분할까요?" mark="충분할까요?" align="center" size={104} delay={10} />
  </AbsoluteFill>
);

// 3–7초 · 수업은 끝났지만 책상에 남은 복습 문제
const B2: React.FC = () => {
  const local = useCurrentFrame();
  const items = ["「서시」 상징어 3개 정리", "‘부끄럼’의 의미 서술", "비유 표현 2개 찾기"];
  return (
    <Split text={"이어가기\n어려운 복습"} mark="복습" eyebrow="수업 후">
      <UiCard width={640} tilt={1}>
        <CardHeader title="오늘의 복습" right={<Txt size={20} color={C.gray}>21:40</Txt>} />
        {items.map((t, i) => (
          <Rise key={t} delay={10 + i * 6} distance={20}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 0", borderBottom: `1.5px solid ${C.hairline}` }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, border: `2.5px solid ${C.gray300}` }} />
              <Txt size={28} color={C.gray}>{t}</Txt>
            </div>
          </Rise>
        ))}
        <Txt size={22} color={C.gray300} style={{ marginTop: 18, opacity: interpolate(local, [50, 60], [0, 1], clamp) }}>
          0 / 3 완료 · 내일로 미룸
        </Txt>
      </UiCard>
    </Split>
  );
};

// 7–12초 · 학원 시간을 늘려도 앞뒤 빈 구간이 남음
const B3: React.FC = () => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = sp(local - 16, fps, SMOOTH, 40);
  const W = 860;
  const start = 0.36 - grow * 0.1;
  const end = 0.6 + grow * 0.1;
  return (
    <Split text={"오래 머물러도\n남는 빈틈"} mark="빈틈" eyebrow="학원 시간">
      <div style={{ width: W }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          {["월", "화", "수", "목", "금"].map((d) => (
            <Txt key={d} size={22} color={C.gray}>{d}</Txt>
          ))}
        </div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ position: "relative", height: 70, marginBottom: 22, background: C.white, borderRadius: 18, border: `1.5px solid ${C.hairline}` }}>
            <div style={{ position: "absolute", top: 8, bottom: 8, left: `${start * 100}%`, width: `${(end - start) * 100}%`, background: C.forest, borderRadius: 12, display: "grid", placeItems: "center" }}>
              <Txt size={22} weight={700} color={C.white}>수업</Txt>
            </div>
            {[
              [0.02, start - 0.03],
              [end + 0.01, 0.98],
            ].map(([a, b], k) => (
              <div
                key={k}
                style={{
                  position: "absolute",
                  top: 8,
                  bottom: 8,
                  left: `${a * 100}%`,
                  width: `${(b - a) * 100}%`,
                  border: `2.5px dashed ${C.limeDeep}`,
                  borderRadius: 12,
                  opacity: interpolate(local, [60 + r * 6, 72 + r * 6], [0, 1], clamp),
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Txt size={20} weight={700} color={C.limeInk}>{k === 0 ? "수업 전" : "수업 후"}</Txt>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Split>
  );
};

// 12–16초 · 갈매기가 앱을 펼치고 연결선이 앞뒤로 뻗음
const B4: React.FC = () => {
  const local = useCurrentFrame();
  const connect = interpolate(local, [30, 80], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 36, paddingBottom: 130 }}>
      <PhasePills on={[connect > 0.45, true, connect > 0.95]} connect={connect} size={56} />
      <BigType text="수업 밖에서도 이어지는 배움" mark="이어지는" align="center" size={88} delay={8} />
      <Seagull size={300} x={1500} y={600} delay={4} />
    </AbsoluteFill>
  );
};

// 16–20초 · 전 — 앱에서 질문을 남기고 과제를 풂
const B5: React.FC = () => (
  <Split text={"전\n질문과 과제"} mark="질문과 과제" eyebrow="수업 전 · ClassIn 앱">
    <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
      <Pop delay={6} y={40}>
        <Device kind="phone" width={360} height={720}>
          <div style={{ padding: 26 }}>
            <Txt size={18} color={C.gray}>{LESSON}</Txt>
            <Txt size={26} weight={800} style={{ marginTop: 10 }}>질문 남기기</Txt>
            <div style={{ marginTop: 18, background: C.ivory, borderRadius: 18, padding: 18 }}>
              <Txt size={18} color={C.limeInk} weight={700}>{STUDENT}</Txt>
              <Txt size={24} weight={700} style={{ marginTop: 6 }}>
                <TypeText text={QUESTION} delay={16} cps={0.9} />
              </Txt>
            </div>
            <Txt size={26} weight={800} style={{ marginTop: 30 }}>예습 과제</Txt>
            {["시 낭독 듣기", "모르는 낱말 표시", "상징어 찾아오기"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                <Stamp delay={40 + i * 8} kind={i < 2 ? "ok" : "partial"} size={30} />
                <Txt size={22}>{t}</Txt>
              </div>
            ))}
          </div>
        </Device>
      </Pop>
    </div>
  </Split>
);

// 20–24초 · 중 — 그 질문을 수업에서 함께 풀고 피드백
const B6: React.FC = () => (
  <Split text={"중\n참여와 피드백"} mark="참여와 피드백" eyebrow="수업 중 · 실시간 수업">
    <Pop delay={6} y={30}>
      <Device kind="board" width={820} height={500}>
        <div style={{ padding: 34, height: "100%", boxSizing: "border-box", background: C.ivory }}>
          <Txt size={34} weight={900}>서시 — 하늘 · 바람 · 별</Txt>
          <Rise delay={14} distance={20}>
            <div style={{ marginTop: 26, background: C.white, border: `2px solid ${C.lime}`, borderRadius: 18, padding: "16px 20px", display: "inline-block" }}>
              <Txt size={18} color={C.limeInk} weight={700}>{STUDENT}의 질문 · 수업 전에 받음</Txt>
              <Txt size={26} weight={800} style={{ marginTop: 4 }}>{QUESTION}</Txt>
            </div>
          </Rise>
          <div style={{ marginTop: 26, display: "flex", gap: 14 }}>
            {[
              ["희망 · 이상", "ok"],
              ["양심", "ok"],
              ["그냥 밤하늘", "wrong"],
            ].map(([t, k], i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, borderRadius: 999, padding: "10px 18px", border: `1.5px solid ${C.hairline}` }}>
                <Stamp delay={36 + i * 8} kind={k as "ok" | "wrong"} size={28} />
                <Txt size={22} weight={700}>{t}</Txt>
              </div>
            ))}
          </div>
          <Rise delay={64} distance={16}>
            <Txt size={22} color={C.forest} weight={700} style={{ marginTop: 22 }}>피드백 · ‘별’은 화자가 지키려는 이상과 희망이에요</Txt>
          </Rise>
        </div>
      </Device>
    </Pop>
  </Split>
);

// 24–29초 · 후 — 같은 설명을 다시 보고 관련 퀴즈로 확인
const B7: React.FC = () => {
  const local = useCurrentFrame();
  const t = Math.min(1, local / 70);
  return (
    <Split text={"후\n다시보기와 퀴즈"} mark="다시보기와 퀴즈" eyebrow="수업 후 · ClassIn 앱">
      <Pop delay={6} y={30}>
        <Device kind="tablet" width={820} height={560}>
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ flex: 1.3, background: C.ink, position: "relative", display: "grid", placeItems: "center" }}>
              <Txt size={28} weight={800} color={C.white}>서시 — 하늘 · 바람 · 별</Txt>
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
                <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 6 }}>
                  <div style={{ width: `${46 + t * 6}%`, height: "100%", background: C.lime, borderRadius: 6 }} />
                </div>
                <Txt size={16} color={C.white} style={{ marginTop: 8 }}>▶ 21:05 · ‘별’의 상징 설명 구간</Txt>
              </div>
            </div>
            <div style={{ flex: 1, padding: 26 }}>
              <Txt size={18} color={C.gray}>확인 퀴즈</Txt>
              <Txt size={24} weight={800} style={{ marginTop: 8 }}>‘바람’과 가장 가까운 의미는?</Txt>
              {["시련", "희망", "계절"].map((o, i) => (
                <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "12px 14px", borderRadius: 14, background: i === 0 ? C.limeSoft : C.ivory }}>
                  {i === 0 ? <Stamp delay={70} kind="ok" size={26} /> : <span style={{ width: 26 }} />}
                  <Txt size={22} weight={700}>{o}</Txt>
                </div>
              ))}
            </div>
          </div>
        </Device>
      </Pop>
    </Split>
  );
};

// 29–32초 · 준비→참여→복습의 흐름을 모음
const B8: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 130 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {["준비", "참여", "복습"].map((t, i) => (
        <React.Fragment key={t}>
          <Chip delay={4 + i * 6} size={40} bg={C.lime} color={C.ink}>
            {t}
          </Chip>
          {i < 2 && <Txt size={40} weight={900} color={C.limeDeep}>→</Txt>}
        </React.Fragment>
      ))}
    </div>
    <BigType text={"준비가 몰입으로\n복습이 성취로"} mark="성취로" align="center" size={96} delay={16} />
  </AbsoluteFill>
);

// 32–36초 · 선생님이 학생 기록과 필요한 부분을 확인
const B9: React.FC = () => {
  const rows: [string, boolean, boolean, boolean][] = [
    [STUDENT, true, true, true],
    ["박도윤", true, true, false],
    ["이하린", false, true, true],
    ["최서준", true, true, true],
  ];
  return (
    <Split text={"한곳에서\n전·중·후 케어"} mark="한곳에서" eyebrow="선생님 화면">
      <UiCard width={760} tilt={1}>
        <CardHeader title={`${LESSON} · 학생 기록`} />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1.3fr", rowGap: 6, marginTop: 14, alignItems: "center" }}>
          {["학생", "전", "중", "후", ""].map((h) => (
            <Txt key={h} size={18} color={C.gray} weight={700}>{h}</Txt>
          ))}
          {rows.map(([n, a, b, c], r) => (
            <React.Fragment key={n}>
              <Txt size={24} weight={700} style={{ padding: "12px 0" }}>{n}</Txt>
              {[a, b, c].map((v, k) => (
                <div key={k}>
                  <Stamp delay={12 + r * 6 + k * 2} kind={v ? "ok" : "wrong"} size={28} />
                </div>
              ))}
              <div>
                {!(a && b && c) && (
                  <Chip delay={40 + r * 4} size={18} bg={C.lime} color={C.ink}>
                    {!a ? "예습 미제출" : "복습 확인"}
                  </Chip>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </UiCard>
    </Split>
  );
};

// 36–40초 · 처음 구도로 복귀, 세 구간이 모두 연결 + 로고
const B10: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44, paddingBottom: 140 }}>
    <PhasePills on={[true, true, true]} connect={1} size={60} />
    <BigType text="수업의 전·중·후, 모두 케어하는 ClassIn" mark="모두 케어하는" align="center" size={76} delay={6} />
    <Pop delay={24}>
      <LogoStacked height={150} />
    </Pop>
  </AbsoluteFill>
);

const SCENES = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];

// 제품 화면 비트(16–36초)에는 갈매기를 작게 둔다
const SmallGull: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [480, 492, 1072, 1080], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ opacity: o }}>
      <Seagull size={150} x={1700} y={40} delay={480} />
    </div>
  );
};

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 44, left: 150, display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ width: 10, height: 10, borderRadius: 999, background: C.limeDeep }} />
    <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "0.18em" }}>CLASSIN · 수업 전·중·후 케어</span>
    <span style={{ marginLeft: 18, fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 6, padding: "2px 8px" }}>애니매틱 · 화면은 콘셉트 목업</span>
  </div>
);

export const CareFlow: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <IvoryStage>
      {BEATS.map((b, i) => {
        const S = SCENES[i];
        return (
          <InBeat key={i} beat={b}>
            <S />
          </InBeat>
        );
      })}
    </IvoryStage>
    <Header />
    <SmallGull />
    <Caption beats={BEATS} />
    <Grain opacity={0.035} />
  </AbsoluteFill>
);
