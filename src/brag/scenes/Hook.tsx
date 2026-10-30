import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark } from "../../components/Ui";
import { clamp, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { BlurIn, Camera, Flare, Hud, K, Letterbox, NightStage, timecode } from "../Cinema";
import { DisplayNumber, mono, SAFE, t } from "../Layout";
import { local } from "../timeline";
import { useType } from "../typeset";

const L = {
  line1: local("hook", "hook.line1"),
  rollStart: local("hook", "hook.rollStart"),
  rollEnd: local("hook", "hook.rollEnd"),
  ended: local("hook", "hook.ended"),
  notify: local("hook", "hook.notify"),
  line2: local("hook", "hook.line2"),
};
const LESSON_MIN = 60;
const BARS = { top: 250, bottom: 330 };

// S1 콜드 오픈 — 어둠 속 1시간이 흘러가고, 수업이 끝나는 순간 리포트 알림이 도착한다
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { title, timer, ts } = useType();
  const { fps } = useVideoConfig();
  const roll = interpolate(frame, [L.rollStart, L.rollEnd], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const secs = Math.round(roll * LESSON_MIN * 60);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const ended = frame >= L.ended;
  const endGlow = interpolate(frame - L.ended, [0, 4, 30], [0, 1, 0.45], clamp);
  // 랙 포커스 — 알림이 오면 뒤쪽(타이틀·타임코드)이 흐려지고 어두워진다
  const rack = interpolate(frame - L.notify, [0, 12], [0, 1], clamp);
  const notif = sp(frame - L.notify, fps, { damping: 16, stiffness: 120, mass: 0.9 });

  return (
    <NightStage beamX={50} beamAngle={0} seed="hook">
      <Camera keys={[{ f: 0, s: 1.0 }, { f: 90, s: 1.07, y: -20 }]} origin="50% 45%" drift={0.6}>
        <div style={{ filter: rack > 0 ? `blur(${rack * 5}px)` : undefined, opacity: 1 - rack * 0.45 }}>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 380 }}>
            <div style={title(108, 400, K.paper, { lineHeight: 1.16, textAlign: "center" })}>
              <BlurIn delay={L.line1} duration={22}>
                1시간 수업이
              </BlurIn>
              <br />
              <BlurIn delay={L.line1 + 8} duration={22} style={{ fontWeight: ts.title.weight(700) }}>
                끝나면,
              </BlurIn>
            </div>
          </AbsoluteFill>

          {/* 타임코드 — 얇은 모노 숫자가 화면의 주인공 */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", opacity: interpolate(frame - L.rollStart + 6, [0, 8], [0, 1], clamp) }}>
            <span style={timer(270, ended ? C.lime : K.paper, { lineHeight: 1, textShadow: ended ? `0 0 ${40 * endGlow}px rgba(200,240,90,${0.8 * endGlow})` : undefined })}>
              {mm}:{ss}
            </span>
          </div>
          <div style={{ position: "absolute", left: 100, right: 100, top: 1010 }}>
            <div style={{ position: "relative", height: 3, background: K.paperFaint }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${roll * 100}%`, background: C.lime, boxShadow: `0 0 18px ${C.lime}` }} />
              <div style={{ position: "absolute", left: `${roll * 100}%`, top: -7, width: 17, height: 17, borderRadius: 999, background: C.limeBright, transform: "translateX(-50%)", boxShadow: `0 0 24px 6px rgba(216,255,92,0.7)`, opacity: frame >= L.rollStart ? 1 : 0 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, ...mono(22, 500, K.paperFaint, { letterSpacing: "0.12em" }) }}>
              <span>00:00</span>
              <span style={{ color: C.lime, opacity: ended ? 1 : 0 }}>SESSION END</span>
              <span>60:00</span>
            </div>
          </div>
        </div>

        <Flare at={L.ended} y={830} duration={20} />

        {/* 리포트 알림 */}
        <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 1110, perspective: 1600 }}>
          <div
            style={{
              opacity: interpolate(frame - L.notify, [0, 4], [0, 1], clamp),
              transform: `translateY(${interpolate(notif, [0, 1], [260, 0])}px) rotateX(${interpolate(notif, [0, 1], [48, 0])}deg)`,
              transformOrigin: "50% 100%",
              filter: notif < 0.9 ? `blur(${(1 - notif) * 14}px)` : undefined,
            }}
          >
            <div style={{ background: "#FBFAF5", borderRadius: 40, padding: "30px 34px", display: "flex", gap: 26, alignItems: "center", boxShadow: `0 0 0 2px ${K.rim}, 0 50px 120px rgba(0,0,0,0.6), 0 0 120px rgba(200,240,90,0.28)` }}>
              <div style={{ width: 112, height: 112, borderRadius: 30, background: C.limeSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <LogoMark height={42} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={mono(22, 700, C.limeInk, { letterSpacing: "0.14em" })}>CLASSIN AI</span>
                  <span style={t(24, 600, C.gray300)}>방금</span>
                </div>
                <div style={{ ...t(40, 800, C.ink, { letterSpacing: "-0.02em" }), marginTop: 6 }}>강의 평가 리포트 도착</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 2 }}>
                  <span style={t(30, 600, C.gray)}>종합</span>
                  <DisplayNumber to={88} delay={L.notify + 6} duration={26} size={58} color={C.forest} />
                  <span style={t(30, 600, C.gray)}>점 · 강점 2 · 개선 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 두 번째 줄 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1392, textAlign: "center", ...title(66, 500, K.paper) }}>
          <BlurIn delay={L.line2} duration={18}>
            리포트는
          </BlurIn>{" "}
          <BlurIn delay={L.line2 + 4} duration={18} style={{ color: C.lime, fontWeight: ts.title.weight(700) }}>
            이미
          </BlurIn>{" "}
          <BlurIn delay={L.line2 + 8} duration={18}>
            와 있습니다.
          </BlurIn>
        </div>
      </Camera>

      <Letterbox top={BARS.top} bottom={BARS.bottom} />
      <Hud
        top={BARS.top + 30}
        side={SAFE.side}
        left={
          <>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#FF5A4E", opacity: frame % 30 < 18 ? 1 : 0.25 }} />
            <span>REC · 중2 국어 A반</span>
          </>
        }
        right={<span>{timecode(frame)}</span>}
      />
    </NightStage>
  );
};
