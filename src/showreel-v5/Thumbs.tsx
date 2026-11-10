import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { HandCircle } from "./components/Marks";
import { Photo } from "./components/Media";
import { C, FONT } from "./lib/theme";

// 인스타 광고 썸네일(커버) 시안 — 1080×1920. 피드에서 4:5(가운데 y 285–1635), 프로필 그리드에서 3:4로 잘려도
// 읽히도록 핵심(키커·타이틀·브랜드)은 y 330–1600 안에 둔다. 타이틀은 9:16 확정본과 같은 흰 글자 + 검은 테두리.
// 축: 와닿는 이익(A·B) / 궁금증 유발(C·D).
export type ThumbId = "a" | "b" | "c" | "d";

const Outlined: React.FC<{ children: React.ReactNode; width?: number; color?: string }> = ({ children, width = 12, color = C.white }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span aria-hidden style={{ position: "absolute", left: 0, top: 0, color: C.ink, WebkitTextStroke: `${width * 2}px ${C.ink}` }}>
      {children}
    </span>
    <span style={{ position: "relative", color }}>{children}</span>
  </span>
);

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "inline-block", padding: "14px 30px", borderRadius: 999, background: C.lime, color: C.ink, fontFamily: FONT.sans, fontWeight: 700, fontSize: 44, border: `5px solid ${C.ink}` }}>
    {children}
  </div>
);

const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1530, display: "flex", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", borderRadius: 999, background: "rgba(255,255,255,0.94)" }}>
      <Img src={staticFile("brand/classin-mark.png")} style={{ height: 34 }} />
      <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 40 }} />
    </div>
  </div>
);

// 사진 위아래를 어둡게 눌러 글자가 사진 어디에 와도 읽히게 한다
const Shade: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.55, bottom = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(10,11,20,${top}) 0%, rgba(10,11,20,0.08) 38%, rgba(10,11,20,0.08) 58%, rgba(10,11,20,${bottom}) 100%)`,
    }}
  />
);

const Title: React.FC<{ lines: React.ReactNode[]; size: number; top: number; kicker?: React.ReactNode }> = ({ lines, size, top, kicker }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    {kicker && <div style={{ marginBottom: 34 }}>{kicker}</div>}
    <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: size, lineHeight: 1.18, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  </div>
);

// 녹화 중 배지(영상의 REC HUD와 같은 말투)
const Rec: React.FC<{ x: number; y: number; time: string }> = ({ x, y, time }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 12, background: "rgba(10,11,20,0.78)", color: C.white, fontFamily: FONT.mono, fontWeight: 600, fontSize: 34, letterSpacing: "0.1em" }}>
    <span style={{ width: 22, height: 22, borderRadius: 99, background: C.signal }} />
    REC {time}
  </div>
);

// 다시보기 플레이어 카드
const Replay: React.FC<{ x: number; y: number; label: string }> = ({ x, y, label }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 620, padding: "22px 26px", borderRadius: 24, background: C.white, boxShadow: `0 18px 40px rgba(10,11,20,0.35)`, fontFamily: FONT.sans }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: C.cobalt, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: `22px solid ${C.white}`, marginLeft: 6 }} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 34, color: C.ink }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 26, color: C.muted, marginTop: 4 }}>자동 녹화 · 다시보기</div>
      </div>
    </div>
    <div style={{ marginTop: 18, height: 10, borderRadius: 99, background: "#E3E6EE" }}>
      <div style={{ width: "62%", height: "100%", borderRadius: 99, background: C.signal }} />
    </div>
  </div>
);

export const Thumb: React.FC<{ id: ThumbId }> = ({ id }) => {
  if (id === "a")
    // 이익 — 수업이 끝나면 복습 영상이 저절로 생긴다
    return (
      <AbsoluteFill style={{ background: C.ink }}>
        <Photo src="mokdong-point.jpg" pos="88% 50%" />
        <Shade top={0.62} bottom={0.55} />
        <Title
          top={330}
          size={112}
          kicker={<Kicker>수업 자동 녹화</Kicker>}
          lines={[<Outlined key="1">수업 끝나면</Outlined>, <Outlined key="2" color={C.lime}>복습 영상 자동 완성</Outlined>]}
        />
        <Rec x={80} y={1180} time="00:42:17" />
        <Brand />
      </AbsoluteFill>
    );
  if (id === "b")
    // 이익 — 결석생 보강을 다시 수업하지 않고 영상으로
    return (
      <AbsoluteFill style={{ background: C.ink }}>
        <Photo src="case-pyeongtaek.jpg" pos="50% 40%" />
        <Shade top={0.66} bottom={0.5} />
        <Title
          top={330}
          size={140}
          kicker={<Kicker>학원 운영 꿀팁</Kicker>}
          lines={[<Outlined key="1">결석생 보강,</Outlined>, <Outlined key="2" color={C.lime}>영상 하나로 끝</Outlined>]}
        />
        <Replay x={230} y={1210} label="3단원 심화 · 오늘 수업" />
        <Brand />
      </AbsoluteFill>
    );
  if (id === "c")
    // 궁금증 — 영상 첫 질문 그대로. 답은 영상 안에
    return (
      <AbsoluteFill style={{ background: C.ink }}>
        <Photo src="case-daechi.jpg" pos="50% 50%" filter="saturate(0.7) brightness(0.8)" />
        <Shade top={0.7} bottom={0.6} />
        <Title
          top={360}
          size={116}
          kicker={<Kicker>Q. 원장님께 질문</Kicker>}
          lines={[
            <Outlined key="1">수업이 끝나면,</Outlined>,
            <span key="2" style={{ position: "relative", display: "inline-block" }}>
              <Outlined color={C.lime}>수업은 어디로 갈까</Outlined>
              <span style={{ position: "relative", display: "inline-block" }}>
                <Outlined color={C.lime}>?</Outlined>
                <div style={{ position: "absolute", left: "50%", top: "52%", width: 0, height: 0 }}>
                  <div style={{ position: "absolute", left: -95, top: -110 }}>
                    <HandCircle cx={95} cy={110} rx={70} ry={92} start={-30} dur={12} w={190} h={220} width={10} seed="thumb" />
                  </div>
                </div>
              </span>
            </span>,
          ]}
        />
        <Brand />
      </AbsoluteFill>
    );
  // 궁금증 — 판서를 지우기 전에 해야 할 '한 가지'(답: 칠판 파일로 저장)는 영상에서
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Photo src="mokdong-dual.jpg" pos="70% 50%" />
      <Shade top={0.66} bottom={0.55} />
      <Title
        top={330}
        size={140}
        kicker={<Kicker>학원 수업 꿀팁</Kicker>}
        lines={[<Outlined key="1">칠판 지우기 전에</Outlined>, <Outlined key="2" color={C.lime}>꼭 할 한 가지</Outlined>]}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1190, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "18px 34px", borderRadius: 18, background: C.signal, color: C.white, fontFamily: FONT.sans, fontWeight: 700, fontSize: 46, transform: "rotate(-3deg)", boxShadow: "0 14px 30px rgba(10,11,20,0.4)" }}>
          정답은 영상 8초에 ▶
        </div>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};
