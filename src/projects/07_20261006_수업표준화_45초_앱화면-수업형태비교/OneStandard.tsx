import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, IvoryStage } from "../../shared/brand/Backgrounds";
import { Stamp } from "../../shared/brand/Card";
import { BigType, Caption, Device, InBeat, Seagull } from "../../shared/brand/Narrated";
import type { Beat, DeviceKind } from "../../shared/brand/Narrated";
import { C } from "../../shared/brand/theme";
import { Chip, LogoMark, LogoStacked, Pop, Rise, Sticker } from "../../shared/brand/Ui";
import { FONT_FAMILY } from "../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../shared/motion";

export const FPS = 30;
export const DURATION_FRAMES = 1350; // 45s

// Drive 기획 요약(2026-10-06)의 9개 비트와 녹음 대본. 녹음 전이므로 비트 길이는 기획표의 초 단위를 그대로 쓴다.
export const BEATS: readonly Beat[] = [
  { from: 0, to: 150, line: "수업 방식이 바뀔 때마다, 처음부터 다시 준비하나요?" },
  { from: 150, to: 270, line: "장소가 달라도, 수업의 기준은 같다면?" },
  { from: 270, to: 390, line: "수업의 경계를 넓히는 플랫폼, 클래스인." },
  { from: 390, to: 540, line: "교실에서는, 준비한 교안으로 함께 배우고." },
  { from: 540, to: 690, line: "온라인에서도, 같은 자료로 함께 풀고." },
  { from: 690, to: 870, line: "교실과 집에서도, 같은 수업에 참여합니다." },
  { from: 870, to: 1050, line: "시간이 맞지 않았다면, 녹화로 다시 배웁니다." },
  { from: 1050, to: 1200, line: "교안과 수업 기록을 모아, 우리 학원의 기준으로." },
  { from: 1200, to: 1350, line: "언제 어디서나, 우리 학원답게. 클래스인." },
];

// 교안은 이 자리에 계속 남는다. 기기 프레임만 바뀐다.
const PAGE = { cx: 1300, cy: 470, w: 600, h: 360 };

const Txt: React.FC<{ size: number; weight?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, weight = 600, color = C.ink, children, style }) => (
  <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.015em", lineHeight: 1.35, wordBreak: "keep-all", ...style }}>{children}</div>
);

// 하나의 교안 — 09 쇼릴과 같은 예시 수업
const LessonPage: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div
    style={{
      width: PAGE.w,
      height: PAGE.h,
      background: C.white,
      borderRadius: 18,
      border: `1.5px solid ${C.hairline}`,
      boxShadow: "0 18px 40px rgba(28,27,23,0.10)",
      padding: 28,
      boxSizing: "border-box",
      transform: `scale(${scale})`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Txt size={18} color={C.limeInk} weight={800}>공통 교안 · 3단원 비유와 상징</Txt>
      <Txt size={16} color={C.gray300} weight={700}>p.42</Txt>
    </div>
    <Txt size={32} weight={900} style={{ marginTop: 12 }}>윤동주 「서시」</Txt>
    <Txt size={22} color={C.gray} style={{ marginTop: 10, lineHeight: 1.6 }}>
      죽는 날까지 하늘을 우러러
      <br />한 점 부끄럼이 없기를
    </Txt>
    <div style={{ marginTop: 18, background: C.limeSoft, borderRadius: 14, padding: "12px 16px" }}>
      <Txt size={22} weight={800}>Q. ‘별’은 무엇을 상징할까?</Txt>
    </div>
  </div>
);

// 교안 둘레의 기기 — 화면 중심이 교안 중심과 같도록 놓는다
const Frame: React.FC<{ kind: DeviceKind; w: number; h: number; children?: React.ReactNode }> = ({ kind, w, h, children }) => (
  <div style={{ position: "absolute", left: PAGE.cx - w / 2, top: PAGE.cy - h / 2 }}>
    <Pop delay={0} from={0.9} config={SMOOTH}>
      <Device kind={kind} width={w} height={h}>
        <div style={{ position: "absolute", inset: 0, background: C.ivory }}>{children}</div>
      </Device>
    </Pop>
  </div>
);

const Left: React.FC<{ text: string; mark?: string; eyebrow?: string }> = ({ text, mark, eyebrow }) => (
  <div style={{ position: "absolute", left: 150, top: 280, width: 640 }}>
    {eyebrow && (
      <Rise distance={12}>
        <Chip size={24}>{eyebrow}</Chip>
      </Rise>
    )}
    <BigType text={text} mark={mark} size={92} style={{ marginTop: eyebrow ? 24 : 0 }} />
  </div>
);

// 화면 가장자리에 붙는 작은 참여자 타일
const Tile: React.FC<{ label: string; x: number; y: number; delay: number; home?: boolean }> = ({ label, x, y, delay, home }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <Pop delay={delay}>
      <div style={{ width: 120, height: 84, borderRadius: 12, background: home ? C.limeSoft : C.white, border: `2px solid ${home ? C.limeDeep : C.hairline}`, display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(28,27,23,0.10)" }}>
        <Txt size={16} weight={800} color={home ? C.limeInk : C.gray}>{label}</Txt>
      </div>
    </Pop>
  </div>
);

/* ---------- 비트 ---------- */

// 0–5초 · 완성된 교안 옆에 온라인·복습 요청이 붙고 새 문서를 꺼냄
const B1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copies = ["교안_온라인용", "교안_복습용", "교안_보강용"];
  return (
    <>
      <Left text={"준비도\n처음부터?"} mark="처음부터?" />
      <div style={{ position: "absolute", left: PAGE.cx + 150, top: PAGE.cy - 260 }}>
        <Sticker delay={20} rotate={6}>온라인으로도 해 주세요</Sticker>
      </div>
      <div style={{ position: "absolute", left: PAGE.cx - 520, top: PAGE.cy + 40 }}>
        <Sticker delay={34} rotate={-5} bg={C.white}>복습용도 필요해요</Sticker>
      </div>
      {copies.map((c, i) => {
        const s = sp(f - 60 - i * 8, fps, SMOOTH);
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: PAGE.cx - 130 + (i - 1) * 240 * s,
              top: PAGE.cy + 230 + s * 20,
              width: 260,
              padding: "14px 18px",
              background: C.white,
              border: `2px dashed ${C.gray300}`,
              borderRadius: 14,
              opacity: s,
              transform: `rotate(${(i - 1) * 6 * s}deg)`,
            }}
          >
            <Txt size={20} weight={800} color={C.gray}>+ {c}</Txt>
          </div>
        );
      })}
    </>
  );
};

// 5–9초 · 새 문서들이 원래 교안 아래로 모임
const B2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - 6, fps, SMOOTH, 30);
  return (
    <>
      <Left text={"장소가 달라도\n같은 기준"} mark="같은 기준" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: PAGE.cx - 130 + (i - 1) * 240 * (1 - s),
            top: PAGE.cy + 250 - s * 120,
            width: 260,
            height: 50,
            background: C.white,
            border: `2px dashed ${C.gray300}`,
            borderRadius: 14,
            opacity: 1 - s,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: PAGE.cx - 90, top: PAGE.cy + PAGE.h / 2 + 36 }}>
        <Chip delay={36} size={26} bg={C.lime} color={C.ink}>
          기준 교안 1개
        </Chip>
      </div>
    </>
  );
};

// 9–13초 · ClassIn 프레임이 교안 주변으로 넓어짐
const B3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - 4, fps, SMOOTH, 36);
  const w = PAGE.w + 60 + s * 320;
  const h = PAGE.h + 60 + s * 200;
  return (
    <>
      <Left text={"수업의 경계를\n넓히는 ClassIn"} mark="넓히는" />
      <div style={{ position: "absolute", left: PAGE.cx - w / 2, top: PAGE.cy - h / 2, width: w, height: h, border: `4px solid ${C.lime}`, borderRadius: 36, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: "50%", top: 18, transform: "translateX(-50%)", opacity: s }}>
          <LogoMark height={40} />
        </div>
        {["교실", "온라인", "집", "다른 시간"].map((t, i) => (
          <div key={t} style={{ position: "absolute", [i < 2 ? "top" : "bottom"]: -22, [i % 2 === 0 ? "left" : "right"]: 60, opacity: interpolate(f, [30 + i * 6, 40 + i * 6], [0, 1], clamp) }}>
            <Chip size={22} bg={C.white} color={C.limeInk} shadow>
              {t}
            </Chip>
          </div>
        ))}
      </div>
    </>
  );
};

// 13–18초 · 대면 수업 — 전자칠판
const B4: React.FC = () => (
  <>
    <Left text="대면 수업" mark="대면" eyebrow="교실 · 전자칠판" />
    <Frame kind="board" w={820} h={500}>
      <div style={{ position: "absolute", left: 18, bottom: 14 }}>
        <Txt size={16} weight={800} color={C.gray}>3층 2강의실</Txt>
      </div>
    </Frame>
    <div style={{ position: "absolute", left: PAGE.cx - 290, top: PAGE.cy + 320, display: "flex", gap: 12 }}>
      {["학생 12", "판서", "모둠 토의"].map((t, i) => (
        <Chip key={t} delay={20 + i * 6} size={22}>
          {t}
        </Chip>
      ))}
    </div>
  </>
);

// 18–23초 · 온라인 수업 — 문제 위치를 유지하며 노트북으로
const B5: React.FC = () => (
  <>
    <Left text="온라인 수업" mark="온라인" eyebrow="집 · 노트북" />
    <Frame kind="laptop" w={760} h={470} />
    {["학생 1", "학생 2", "학생 3"].map((t, i) => (
      <Tile key={t} label={t} x={PAGE.cx + 330} y={PAGE.cy - 200 + i * 96} delay={18 + i * 6} home />
    ))}
  </>
);

// 23–29초 · 하이브리드 — 교실과 집의 학생이 동시에
const B6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Left text="하이브리드 수업" mark="하이브리드" eyebrow="교실 + 집 · 동시 참여" />
      <Frame kind="board" w={820} h={500} />
      {["교실 1", "교실 2", "교실 3"].map((t, i) => (
        <Tile key={t} label={t} x={PAGE.cx - 470} y={PAGE.cy - 200 + i * 96} delay={14 + i * 5} />
      ))}
      {["집 1", "집 2"].map((t, i) => (
        <Tile key={t} label={t} x={PAGE.cx + 350} y={PAGE.cy - 150 + i * 96} delay={30 + i * 5} home />
      ))}
      <div style={{ position: "absolute", left: PAGE.cx - 40, top: PAGE.cy - 300, opacity: f % 30 < 20 ? 1 : 0.4 }}>
        <Chip size={22} bg={C.forest} color={C.white}>
          ● LIVE
        </Chip>
      </div>
    </>
  );
};

// 29–35초 · 녹화 다시보기 — 다른 시간에 태블릿으로 재생·정지
const B7: React.FC = () => {
  const f = useCurrentFrame();
  const paused = f > 90 && f < 130;
  const t = Math.min(f, 90) + Math.max(0, f - 130);
  return (
    <>
      <Left text="녹화 다시보기" mark="다시보기" eyebrow="다른 시간 · 태블릿" />
      <Frame kind="tablet" w={760} h={500}>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 16 }}>
          <div style={{ height: 6, background: C.hairline, borderRadius: 6 }}>
            <div style={{ width: `${30 + t * 0.25}%`, height: "100%", background: C.limeDeep, borderRadius: 6 }} />
          </div>
        </div>
      </Frame>
      <div style={{ position: "absolute", left: PAGE.cx - 300, top: PAGE.cy + 300, display: "flex", gap: 12, alignItems: "center" }}>
        <Chip size={24} bg={C.ink} color={C.white}>
          {paused ? "❚❚ 일시정지" : "▶ 재생 중"}
        </Chip>
        <Chip delay={10} size={22}>
          밤 10:40 · 수업은 오후 5시
        </Chip>
      </div>
    </>
  );
};

// 35–40초 · 네 형태를 2×2로 모으고 공통 기준선으로 연결
const B8: React.FC = () => {
  const f = useCurrentFrame();
  const forms = ["대면", "온라인", "하이브리드", "녹화 다시보기"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", justifyContent: "center" }}>
        <BigType text="공통 교안 · 진행 기준 · 수업 기록" mark="진행 기준" align="center" size={70} />
      </div>
      <div style={{ position: "absolute", left: 460, top: 310, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {forms.map((t, i) => (
          <Pop key={t} delay={10 + i * 5}>
            <div style={{ width: 470, height: 230, background: C.white, borderRadius: 24, border: `1.5px solid ${C.hairline}`, boxShadow: "0 20px 50px rgba(28,27,23,0.08)", padding: 22, boxSizing: "border-box", position: "relative" }}>
              <Txt size={26} weight={900}>{t}</Txt>
              <div style={{ marginTop: 14, background: C.limeSoft, borderRadius: 12, padding: "10px 14px" }}>
                <Txt size={18} weight={800}>윤동주 「서시」 · p.42</Txt>
              </div>
              <div style={{ position: "absolute", right: 22, bottom: 20, display: "flex", gap: 8 }}>
                {[0, 1, 2].map((k) => (
                  <Stamp key={k} delay={30 + i * 4 + k * 3} kind="ok" size={26} />
                ))}
              </div>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", left: 460, top: 830, height: 6, width: 970 * interpolate(f, [40, 80], [0, 1], clamp), background: C.limeDeep, borderRadius: 6 }} />
    </AbsoluteFill>
  );
};

// 40–45초 · 하나의 교안 주변에 네 장면이 모임 + 로고
const B9: React.FC = () => {
  const forms = ["대면", "온라인", "하이브리드", "녹화"];
  const pos = [
    [-430, -170],
    [330, -170],
    [-430, 110],
    [330, 110],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - PAGE.w * 0.35, top: 260 }}>
        <div style={{ transformOrigin: "0 0" }}>
          <LessonPage scale={0.7} />
        </div>
      </div>
      {forms.map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 960 + pos[i][0], top: 380 + pos[i][1] }}>
          <Chip delay={6 + i * 4} size={30} bg={C.white} color={C.ink} shadow>
            {t}
          </Chip>
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <BigType text="언제 어디서나, 우리 학원답게" mark="우리 학원답게" align="center" size={80} delay={14} />
        <Pop delay={30}>
          <LogoStacked height={110} />
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

const SCENES = [B1, B2, B3, B4, B5, B6, B7, B8, B9];

// 교안 — 0–35초 동안 같은 자리에 남는다
const FixedPage: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10, 1050, 1062], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: PAGE.cx - PAGE.w / 2, top: PAGE.cy - PAGE.h / 2, opacity: o }}>
      <LessonPage />
    </div>
  );
};

// 갈매기의 지시봉 대신 — 장면이 바뀔 때 교안 옆에서 다음 장면을 가리킨다
const Guide: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [270, 282, 1040, 1050], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ opacity: o }}>
      <Seagull size={160} x={1720} y={800} delay={270} flip />
    </div>
  );
};

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 44, left: 150, display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ width: 10, height: 10, borderRadius: 999, background: C.limeDeep }} />
    <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "0.18em" }}>CLASSIN · 수업 표준화</span>
    <span style={{ marginLeft: 18, fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 6, padding: "2px 8px" }}>애니매틱 · 화면은 콘셉트 목업</span>
  </div>
);

export const OneStandard: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <IvoryStage>
      {/* 기기 프레임은 교안 아래, 그 밖의 요소는 교안 위 */}
      {BEATS.map((b, i) => {
        const S = SCENES[i];
        return (
          <InBeat key={i} beat={b}>
            <S />
          </InBeat>
        );
      })}
      <FixedPage />
    </IvoryStage>
    <Header />
    <Guide />
    <Caption beats={BEATS} />
    <Grain opacity={0.035} />
  </AbsoluteFill>
);
