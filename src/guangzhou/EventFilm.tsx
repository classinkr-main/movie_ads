import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { C } from "../lib/theme";
import data from "./film.json";
import { SANS_CN, SERIF, SERIF_CN_FILM } from "./fonts";
import { DirBlur, Flash, Grain, LightLeak, RgbSplit, Vignette, clampX, easeIn, easeInOut, easeOut, ramp, shakeAt } from "./fx";
import { PopWords } from "./type";

/* ======================================================================
   2026 글로벌 교육 인사이트 · 광저우 — 행사 하이라이트 (16:9 · 24fps · 90s)
   ====================================================================== */

type FilmShot = { id: string; kind: "video" | "split" | "photo" | "end"; from: number; dur: number; in: string; panels?: string[]; src?: string };
type Bite = { id: string; at: number; lines: [number, number, string][]; who?: string[] };
type Lower = { from: number; to: number; title: string; sub: string };

export const FILM_FPS = data.fps;
export const FILM_FRAMES = data.frames;
const H = data.handle;
const SHOTS = data.shots as FilmShot[];
const BITES = data.bites as Bite[];
const LOWERS = data.lowers as Lower[];
const KR = `${FONT_FAMILY}, "${SANS_CN}"`;

// 들어오는 전환: 컷 이전에 보이는 프레임(dissolve·push·iris)과 나가는 쪽이 컷 이후 남는 프레임(push)
const IN_BEFORE: Record<string, number> = { dissolve: 6, push: 4, iris: 10 };
const OUT_AFTER: Record<string, number> = { push: 5 };

const clip = (id: string) => staticFile(`guangzhou/film/clips/${id}.mp4`);
const photo = (id: string) => (id.startsWith("f_") ? staticFile(`guangzhou/film/photos/${id}.jpg`) : staticFile(`guangzhou/photos/${id}.jpg`));

/* ---------- 컷 내용 ---------- */
const VideoLayer: React.FC<{ id: string; from: number; dur: number; local: number; push?: number }> = ({ id, from, dur, local, push = 0.04 }) => {
  const s = 1 + push * interpolate(local, [0, dur], [0, 1], clampX);
  return (
    <Sequence from={from - H} durationInFrames={dur + 2 * H + 12} layout="none">
      <AbsoluteFill style={{ transform: `scale(${s})` }}>
        <OffthreadVideo src={clip(id)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

const PHOTO_MOVES: Record<string, { s0: number; s1: number; x0: number; x1: number; y0?: number; y1?: number }> = {
  f_airport: { s0: 1.06, s1: 1.16, x0: 1.5, x1: -2.5, y0: 0, y1: -1 },
  f_hall: { s0: 1.1, s1: 1.03, x0: -1, x1: 1 },
  f_class: { s0: 1.03, s1: 1.1, x0: 1, x1: -1 },
  f_group: { s0: 1.14, s1: 1.04, x0: 0, x1: 0, y0: -1, y1: 0 },
};
const PhotoLayer: React.FC<{ id: string; local: number; dur: number }> = ({ id, local, dur }) => {
  const m = PHOTO_MOVES[id] ?? { s0: 1.04, s1: 1.1, x0: 0, x1: 0 };
  const p = interpolate(local, [0, dur], [0, 1], { ...clampX, easing: easeInOut });
  const s = m.s0 + (m.s1 - m.s0) * p;
  const x = m.x0 + (m.x1 - m.x0) * p;
  const y = (m.y0 ?? 0) + ((m.y1 ?? 0) - (m.y0 ?? 0)) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={photo(id)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}%, ${y}%) scale(${s})` }} />
    </AbsoluteFill>
  );
};

// 분할 화면 — 세로 소재를 가로 프레임에 2·3분할로 배치, 패널이 박자에 맞춰 차례로 올라온다
const SplitLayer: React.FC<{ shot: FilmShot; local: number }> = ({ shot, local }) => {
  const panels = shot.panels ?? [];
  const n = panels.length;
  const gap = 10;
  const w = (1920 - gap * (n - 1)) / n;
  return (
    <AbsoluteFill style={{ background: "#0B0B0A" }}>
      {panels.map((p, i) => {
        const [kind, id] = p.split(":");
        // 첫 프레임부터 모든 패널이 보이고(검은 화면 없이), 박자 안에서 엇갈려 자리를 잡는다
        const k = interpolate(local - i * 2, [0, 9], [0, 1], { ...clampX, easing: easeOut });
        const drift = interpolate(local, [0, shot.dur], [1.04, 1.1], clampX) + (1 - k) * 0.1;
        return (
          <div key={p} style={{ position: "absolute", left: i * (w + gap), top: 0, width: w, height: 1080, overflow: "hidden", transform: `translateY(${(1 - k) * (i % 2 ? -46 : 46)}px)` }}>
            {kind === "v" ? (
              <Sequence from={shot.from - H} durationInFrames={shot.dur + 2 * H + 12} layout="none">
                <OffthreadVideo src={clip(id)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${drift})` }} />
              </Sequence>
            ) : (
              <Img src={photo(id)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${drift})` }} />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 전환 ---------- */
const pushP = (t: number) => interpolate(t, [-4, 5], [0, 1], { ...clampX, easing: easeInOut });
const pushV = (t: number) => Math.min(1, (pushP(t + 0.5) - pushP(t - 0.5)) * 4.5);

const ShotStack: React.FC = () => {
  const frame = useCurrentFrame();
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((shot, j) => {
    const next = SHOTS[j + 1];
    const visFrom = shot.from - (IN_BEFORE[shot.in] ?? 0);
    const visTo = shot.from + shot.dur + (next ? OUT_AFTER[next.in] ?? 0 : 0);
    if (frame < visFrom || frame >= visTo) return;
    const local = frame - shot.from;
    let transform = "";
    let opacity = 1;
    let blurX = 0;
    let rgb = 0;
    let clipPath: string | undefined;
    // 들어오는 쪽
    if (shot.in === "fade") opacity = ramp(local, 0, 14);
    if (shot.in === "dissolve") opacity = interpolate(local, [-6, 0], [0, 1], clampX);
    if (shot.in === "impact") {
      transform += ` scale(${interpolate(local, [0, 12], [1.08, 1], { ...clampX, easing: easeOut })})`;
      rgb = interpolate(local, [0, 7], [14, 0], clampX);
    }
    if (shot.in === "dip") transform += ` scale(${interpolate(local, [0, 16], [1.06, 1], { ...clampX, easing: easeOut })})`;
    if (shot.in === "push") {
      transform += ` translateX(${(1 - pushP(local)) * 100}%)`;
      blurX += pushV(local) * 60;
    }
    if (shot.in === "iris") clipPath = `circle(${interpolate(local, [-10, 6], [0, 1150], { ...clampX, easing: easeInOut })}px at 50% 50%)`;
    // 나가는 쪽
    if (next && next.in === "push" && frame >= next.from - 4) {
      const t = frame - next.from;
      transform += ` translateX(${-pushP(t) * 100}%)`;
      blurX += pushV(t) * 60;
    }
    if (next && next.in === "iris" && frame >= next.from - 10) transform += ` scale(${interpolate(frame - next.from, [-10, 0], [1, 1.06], clampX)})`;

    let content: React.ReactNode;
    if (shot.kind === "video") content = <VideoLayer id={shot.id} from={shot.from} dur={shot.dur} local={local} />;
    else if (shot.kind === "split") content = <SplitLayer shot={shot} local={local} />;
    else if (shot.kind === "photo") content = <PhotoLayer id={shot.src ?? shot.id} local={local} dur={shot.dur} />;
    else content = <EndCard16 t={local} />;

    layers.push(
      <AbsoluteFill key={shot.id} style={{ opacity, clipPath, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: transform || undefined }}>
          <DirBlur id={`fmb-${shot.id}`} x={blurX} y={0} style={{ transform: blurX > 0.3 ? "scale(1.05)" : undefined }}>
            <RgbSplit id={`frgb-${shot.id}`} amount={rgb}>
              {content}
            </RgbSplit>
          </DirBlur>
        </AbsoluteFill>
      </AbsoluteFill>,
    );
  });
  return <>{layers}</>;
};

/* ======================================================================
   그래픽
   ====================================================================== */
const SHADOW = "0 3px 16px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";

const OpeningText: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 100) return null;
  const a = ramp(f, 8, 22) * interpolate(f, [86, 96], [1, 0], clampX);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 0 96px 110px", opacity: a }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: "#fff", textShadow: SHADOW }}>Guangzhou, January 2026</div>
      <div style={{ marginTop: 6, fontFamily: KR, fontWeight: 700, fontSize: 24, letterSpacing: "0.42em", color: C.lime }}>2026. 01. 22 — 24</div>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f - 96;
  if (t < 0 || t > 96) return null;
  const out = interpolate(t, [86, 96], [1, 0], clampX);
  const big = spring({ frame: t - 6, fps, config: { damping: 13, stiffness: 150, mass: 0.8 } });
  const cn = spring({ frame: t - 12, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const line = ramp(t, 2, 18);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,20,14,0.86) 0%, rgba(4,20,14,0.62) 40%, rgba(4,20,14,0) 72%)" }} />
      <div style={{ position: "absolute", left: 120, top: 250 }}>
        <div style={{ fontFamily: KR, fontWeight: 700, fontSize: 26, letterSpacing: "0.42em", color: C.lime, clipPath: `inset(0 ${(1 - line) * 100}% 0 0)` }}>2026 GLOBAL EDUCATION INSIGHT</div>
        <div style={{ marginTop: 18 }}>
          <PopWords text="글로벌 교육 인사이트" at={4} to={999} t={t} size={86} weight={900} stagger={3} style={{ justifyContent: "flex-start" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 4 }}>
          <div style={{ fontFamily: KR, fontWeight: 900, fontSize: 168, lineHeight: 1, letterSpacing: "-0.055em", color: "#fff", transform: `translateY(${(1 - big) * 60}px)`, opacity: Math.min(1, big * 1.4), textShadow: "0 10px 40px rgba(0,0,0,0.45)" }}>광저우</div>
          <div style={{ fontFamily: SERIF_CN_FILM, fontWeight: 900, fontSize: 118, lineHeight: 1.12, color: C.lime, transform: `translateY(${(1 - cn) * 40}px)`, opacity: Math.min(1, cn * 1.4) }}>广州</div>
        </div>
        <div style={{ marginTop: 26, opacity: ramp(t, 20, 32), fontFamily: SERIF_CN_FILM, fontWeight: 900, fontSize: 28, letterSpacing: "0.08em", color: "rgba(255,255,255,0.72)" }}>韩国教育领袖访华团 · 遇见数智化课堂的未来</div>
        <div style={{ marginTop: 10, opacity: ramp(t, 24, 36), fontFamily: KR, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.92)" }}>한국 교육 리더 방문단 · 수업의 미래를 만나다</div>
      </div>
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{ at: number; day: string; date: string; title: string }> = ({ at, day, date, title }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < -2 || t > 80) return null;
  const rise = interpolate(t, [2, 14], [1, 0], { ...clampX, easing: easeOut });
  const side = ramp(t, 8, 20);
  const out = interpolate(t, [66, 80], [1, 0], { ...clampX, easing: easeIn });
  const bar = ramp(t, 4, 16);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 45%)" }} />
      <div style={{ position: "absolute", left: 110, bottom: 110, display: "flex", alignItems: "flex-end", gap: 34 }}>
        <div style={{ overflow: "hidden", height: 150 }}>
          <div style={{ fontFamily: KR, fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: "-0.05em", color: "#fff", transform: `translateY(${rise * 100}%)`, textShadow: SHADOW }}>{day}</div>
        </div>
        <div style={{ width: 5, height: 118 * bar, background: C.lime, marginBottom: 14, borderRadius: 3 }} />
        <div style={{ marginBottom: 16, opacity: side, transform: `translateX(${(1 - side) * -24}px)` }}>
          <div style={{ fontFamily: KR, fontWeight: 700, fontSize: 30, letterSpacing: "0.22em", color: C.lime }}>{date}</div>
          <div style={{ marginTop: 6, fontFamily: KR, fontWeight: 800, fontSize: 58, letterSpacing: "-0.03em", color: "#fff", textShadow: SHADOW }}>{title}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 하단 자막(이름·장소) — 왼쪽 아래, 연두 바 + 반투명 패널
const LowerThird: React.FC<{ from: number; to: number; title: string; sub: string }> = ({ from, to, title, sub }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const k = ramp(f, from, from + 10);
  const out = interpolate(f, [to - 8, to], [1, 0], clampX);
  return (
    <div style={{ position: "absolute", left: 96, bottom: 196, opacity: out, display: "flex", alignItems: "stretch", gap: 0 }}>
      <div style={{ width: 6, background: C.lime, borderRadius: 3, transform: `scaleY(${k})`, transformOrigin: "50% 100%" }} />
      <div style={{ padding: "12px 26px 14px 20px", background: "rgba(10,14,12,0.62)", backdropFilter: "blur(8px)", borderRadius: "0 10px 10px 0", clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
        <div style={{ fontFamily: KR, fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em", color: "#fff", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ marginTop: 3, fontFamily: KR, fontWeight: 600, fontSize: 23, letterSpacing: "0.02em", color: "rgba(255,255,255,0.78)", whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    </div>
  );
};

// 발언 자막 — 하단 중앙, 문장 단위로 교차
const BiteSubs: React.FC<{ bite: Bite }> = ({ bite }) => {
  const f = useCurrentFrame();
  const t = (f - bite.at) / FILM_FPS;
  const lastEnd = bite.lines[bite.lines.length - 1][1];
  if (t < -0.2 || t > lastEnd + 0.3) return null;
  const band = interpolate(t, [-0.2, 0.1, lastEnd, lastEnd + 0.3], [0, 1, 1, 0], clampX);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 32%)", opacity: band }} />
      {bite.lines.map(([a, b, text], i) => {
        if (t < a - 0.1 || t > b + 0.12) return null;
        const o = interpolate(t, [a - 0.1, a + 0.06, b, b + 0.12], [0, 1, 1, 0], clampX);
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: 84, textAlign: "center", opacity: o, transform: `translateY(${(1 - Math.min(1, o * 1.4)) * 10}px)` }}>
            <span style={{ fontFamily: KR, fontWeight: 700, fontSize: 50, letterSpacing: "-0.02em", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)" }}>{text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const RecapWords: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = data.recapWords as [number, string][];
  return (
    <>
      {words.map(([at, w], i) => {
        const end = i < words.length - 1 ? words[i + 1][0] : 1920;
        if (f < at || f >= end) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
        const last = i === words.length - 1;
        return (
          <AbsoluteFill key={w} style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: KR, fontWeight: 900, fontSize: last ? 170 : 190, letterSpacing: "-0.05em", color: last ? C.lime : "#fff", transform: `scale(${0.75 + 0.25 * s})`, opacity: Math.min(1, s * 1.5), textShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>{w}</div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const GroupText: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - 1920;
  if (t < 0 || t > 72) return null;
  const k = ramp(t, 10, 26);
  return (
    <AbsoluteFill style={{ opacity: interpolate(t, [62, 72], [1, 0], clampX) }}>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 38%)", opacity: k }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
        <div style={{ fontFamily: KR, fontWeight: 800, fontSize: 56, letterSpacing: "-0.02em", color: "#fff", textShadow: SHADOW }}>함께여서 더 깊었던 3일</div>
        <div style={{ marginTop: 8, fontFamily: KR, fontWeight: 600, fontSize: 24, letterSpacing: "0.3em", color: C.lime }}>2026 GLOBAL EDUCATION INSIGHT · GUANGZHOU</div>
      </div>
    </AbsoluteFill>
  );
};

const Message: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - 1992;
  if (t < -8 || t > 64) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(4,24,17,0.5)", opacity: ramp(t, -8, 4) }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
        <PopWords text="광저우에서 만난" at={2} to={999} t={t} size={70} weight={800} stagger={4} />
        <PopWords text="수업의 미래," at={12} to={999} t={t} size={150} weight={900} stagger={5} highlight={[1]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 엔드카드 (16:9) ---------- */
const EndCard16: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  const logo = spring({ frame: t - 10, fps, config: { damping: 11, stiffness: 140, mass: 0.9 } });
  const btn = spring({ frame: t - 26, fps, config: { damping: 13, stiffness: 190, mass: 0.7 } });
  const ring = (i: number) => {
    const period = 22;
    const g = t - 34 - i * (period / 2);
    if (g < 0) return null;
    const k = (g % period) / period;
    return <div key={i} style={{ position: "absolute", inset: 0, borderRadius: 999, border: `3px solid ${C.limeDeep}`, opacity: (1 - k) * 0.5, transform: `scale(${1 + k * 0.12}, ${1 + k * 0.5})` }} />;
  };
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(8,71,52,0.12) 2px, transparent 2.4px)", backgroundSize: "34px 34px", backgroundPosition: `${t * 0.3}px 0px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 55% at ${68 + Math.sin(t / 16) * 4}% 48%, rgba(200,240,90,0.5) 0%, rgba(200,240,90,0) 70%)` }} />
      <div style={{ position: "absolute", left: 140, top: 300, width: 900 }}>
        <PopWords text="이제, 우리 학원에서." at={2} to={999} t={t} size={92} weight={900} color={C.ink} stagger={4} highlight={[1, 2]} hlTextColor={C.forest} style={{ justifyContent: "flex-start" }} />
        <div style={{ marginTop: 26, opacity: ramp(t, 16, 26), fontFamily: KR, fontWeight: 600, fontSize: 30, color: C.gray, lineHeight: 1.5 }}>
          광저우에서 확인한 수업의 변화,
          <br />
          Classin이 우리 학원의 수업 시스템으로 함께합니다.
        </div>
        <div style={{ position: "relative", marginTop: 46, width: 520, height: 108, transform: `scale(${0.75 + 0.25 * btn})`, transformOrigin: "0 50%", opacity: Math.min(1, btn * 1.4) }}>
          {[0, 1].map(ring)}
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 999, background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, boxShadow: "0 16px 36px rgba(8,71,52,0.3)" }}>
            <span style={{ fontFamily: KR, fontWeight: 800, fontSize: 44, letterSpacing: "-0.02em", color: "#fff" }}>지금 문의하기</span>
            <span style={{ fontFamily: KR, fontWeight: 800, fontSize: 44, color: C.lime, transform: `translateX(${Math.max(0, Math.sin(t / 4)) * 7}px)` }}>→</span>
          </div>
        </div>
        <div style={{ marginTop: 22, opacity: ramp(t, 34, 42), fontFamily: KR, fontWeight: 700, fontSize: 36, color: C.ink }}>classin.co.kr</div>
      </div>
      <div style={{ position: "absolute", right: 210, top: 540, transform: `translate(0,-50%) scale(${0.6 + 0.4 * logo})`, opacity: Math.min(1, logo * 1.5), textAlign: "center" }}>
        <Img src={staticFile("brand/classin-logo-stacked.png")} style={{ width: 470, display: "block" }} />
        <div style={{ marginTop: 26, fontFamily: KR, fontWeight: 800, fontSize: 46, letterSpacing: "0.02em", color: C.forest, opacity: ramp(t, 20, 30) }}>수업 시스템 OS</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center", opacity: ramp(t, 44, 56) * 0.9, fontFamily: KR, fontWeight: 600, fontSize: 24, letterSpacing: "0.04em", color: C.gray }}>
        2026 글로벌 교육 인사이트 · 광저우 — 함께해 주신 모든 분께 감사드립니다
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 전환 오버레이 ---------- */
const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  let white = 0;
  for (const s of SHOTS) {
    const t = f - s.from;
    if (s.in === "impact" && t >= 0) white = Math.max(white, interpolate(t, [0, 1, 6], [0.8, 0.65, 0], clampX));
    if (s.in === "dip") white = Math.max(white, interpolate(t, [-5, 0, 10], [0, 0.9, 0], clampX));
  }
  return (
    <>
      <LightLeak start={88} len={34} from="right" />
      <LightLeak start={570} len={30} from="left" hue="lime" />
      <LightLeak start={1338} len={30} from="right" />
      <LightLeak start={1816} len={34} from="left" />
      <LightLeak start={1914} len={34} from="right" hue="lime" />
      <Flash opacity={white} />
    </>
  );
};

const BrandBug: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 200 || f > 2044) return null;
  const o = ramp(f, 200, 214) * interpolate(f, [2034, 2044], [1, 0], clampX);
  return (
    <div style={{ position: "absolute", right: 64, top: 52, opacity: o * 0.85 }}>
      <Img src={staticFile("brand/classin-wordmark.png")} style={{ width: 150, filter: "brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }} />
    </div>
  );
};

/* ======================================================================
   메인
   ====================================================================== */
export const GuangzhouEventFilm: React.FC = () => {
  const f = useCurrentFrame();
  const s1 = shakeAt(f, 96, 12, 12, "fa");
  const s2 = shakeAt(f, 1824, 14, 12, "fb");
  const s3 = shakeAt(f, 1920, 8, 10, "fc");
  const sx = s1.x + s2.x + s3.x;
  const sy = s1.y + s2.y + s3.y;
  const shaking = Math.abs(sx) + Math.abs(sy) > 0.01;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: shaking ? `translate(${sx}px, ${sy}px) scale(1.03)` : undefined }}>
        <ShotStack />
      </AbsoluteFill>
      <OpeningText />
      <TitleCard />
      {data.chapters.map((c) => (
        <Chapter key={c.day} {...c} />
      ))}
      {BITES.filter((b) => b.who).map((b) => (
        <LowerThird key={b.id} from={b.at + 6} to={b.at + 6 + 84} title={b.who![0]} sub={b.who![1]} />
      ))}
      {LOWERS.map((l) => (
        <LowerThird key={l.from} {...l} />
      ))}
      {BITES.map((b) => (
        <BiteSubs key={b.id} bite={b} />
      ))}
      <RecapWords />
      <GroupText />
      <Message />
      <Overlays />
      <BrandBug />
      <Grain opacity={f >= 2046 ? 0.035 : 0.07} />
      <Vignette strength={f >= 2052 ? 0.1 : 0.3} />
      <Audio src={staticFile("guangzhou/film/audio/mix.wav")} />
    </AbsoluteFill>
  );
};

