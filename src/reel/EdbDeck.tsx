import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { ChalkFilter, GrainTiles, Mono, TexImg } from "./fx";
import { R } from "./theme";

/*
 * EDB 교안 카드 덱 — S2 "교안" 비트(비트 로컬 프레임 기준).
 * 같은 Unit 5(현재완료) 교안 파일의 세 페이지가 3D로 날아와 부채꼴로 겹친다. 뒤에서 칠판(S4)이 이 교안으로 수업한다.
 *   8–30   카드 3장 진입(뒤 → 앞), 이후 미세하게 떠 있다
 *   20–64  페이지 내용이 그려진다 — 도입(마인드맵) · 정리(확인 문제, 정답 선택) · 전개(판서 템플릿: 예문 + 타임라인 아크)
 *   44–66  "우수 강사 템플릿으로 저장" 진행 링 → 저장됨 ✓
 * 질감: 칠판 분필 얼룩·그레인, 분필 획 필터, 겹친 페이지 모서리, 광택.
 */

const CW = 540;
const CH = 340;
const pop = (f: number, at: number, fps: number) => sp(f - at, fps, { damping: 18, stiffness: 150, mass: 0.9 });
const draw = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: easeOutExpo });
const chalkLine = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const Clock: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = R.white }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <circle cx={10} cy={10} r={7.5} fill="none" stroke={color} strokeWidth={2} />
    <path d="M10 5.5 L10 10 L13 12" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const Tag: React.FC<{ children: React.ReactNode; on?: boolean }> = ({ children, on }) => (
  <span style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: on ? R.accentInk : "rgba(255,255,255,0.78)", background: on ? R.accent : "rgba(255,255,255,0.08)", border: on ? "none" : "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap" }}>
    {children}
  </span>
);

// 카드 크롬 — 헤더(EDB 배지·제목·페이지) · 본문 · 푸터(태그) + 칠판 질감
const Card: React.FC<{ page: string; title: string; tags: string[]; children: React.ReactNode; ribbon?: string }> = ({ page, title, tags, children, ribbon }) => (
  <div style={{ position: "relative", width: CW, height: CH }}>
    {/* 겹친 페이지 모서리 — 50쪽 교안의 두께 */}
    <div style={{ position: "absolute", left: 12, top: 12, width: CW, height: CH, borderRadius: 22, background: "#0B1F18", border: "1px solid rgba(255,255,255,0.08)" }} />
    <div style={{ position: "absolute", left: 6, top: 6, width: CW, height: CH, borderRadius: 22, background: "#0D2419", border: "1px solid rgba(255,255,255,0.1)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: `radial-gradient(ellipse 90% 90% at 30% 20%, ${R.board2} 0%, ${R.board} 70%)`, border: "1.5px solid rgba(255,255,255,0.16)", boxShadow: "0 34px 70px rgba(0,0,0,0.5)" }}>
      <TexImg file="chalk.png" opacity={0.42} blend="screen" />
      {/* 헤더 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", background: "rgba(0,0,0,0.22)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: 900, color: R.accentInk, background: R.accent, borderRadius: 6, padding: "3px 8px", letterSpacing: "0.04em" }}>EDB</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 700, color: R.white }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", gap: 5 }}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 6, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.35)" }} />
          ))}
        </span>
        <Mono size={12} color="rgba(255,255,255,0.6)">{page}</Mono>
      </div>
      {/* 본문 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 46, bottom: 44 }}>{children}</div>
      {/* 푸터 */}
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
        {tags.map((t, i) => (
          <Tag key={t} on={i === 0 && !!ribbon}>
            {t}
          </Tag>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ width: 22, height: 22, borderRadius: 999, background: "linear-gradient(135deg, #E9D8C8, #A48D78)", boxShadow: "0 0 0 2px rgba(255,255,255,0.25)" }} />
        <Mono size={11} color="rgba(255,255,255,0.55)">강사 교안</Mono>
      </div>
      {ribbon && (
        <div style={{ position: "absolute", right: 16, top: 58, background: R.accent, color: R.accentInk, borderRadius: 8, fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 900, padding: "4px 10px", boxShadow: `0 6px 16px rgba(${R.accentRgb},0.3)` }}>{ribbon}</div>
      )}
      <GrainTiles w={CW} h={CH} opacity={0.3} tile={256} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 28%)" }} />
    </div>
  </div>
);

// 도입 · 개념 — 마인드맵
const PageIntro: React.FC<{ f: number }> = ({ f }) => {
  const lines = draw(f, 22, 46);
  const nodes = draw(f, 30, 52);
  const star = draw(f, 44, 60);
  const N = [
    { x: 110, y: 120, t: "경험", s: "ever · never" },
    { x: 430, y: 120, t: "계속", s: "for · since" },
    { x: 270, y: 222, t: "완료", s: "already · yet" },
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 20, top: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <Mono size={12} color={R.accent}>Warm-up</Mono>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: R.white }}>현재완료란?</span>
      </div>
      <svg width={CW} height={250} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <ChalkFilter id="chalkEdbA" seed={13} rough={2.5} />
        </defs>
        <g filter="url(#chalkEdbA)">
          {N.map((n, i) => (
            <path key={i} d={`M270,150 Q${(270 + n.x) / 2 + (i === 2 ? 30 : 0)},${(150 + n.y) / 2 - 20} ${n.x},${n.y}`} {...chalkLine} stroke="rgba(255,255,255,0.75)" strokeWidth={3.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lines} />
          ))}
          <path d="M486,22 L490,33 L501,34 L492,41 L495,52 L486,46 L477,52 L480,41 L471,34 L482,33 Z" {...chalkLine} stroke={R.accent} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - star} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 270 - 92, top: 150 - 24, width: 184, height: 48, borderRadius: 999, border: `2.5px solid ${R.accent}`, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: R.accent, boxShadow: `0 0 18px rgba(${R.accentRgb},0.3)` }}>have + p.p.</div>
      {N.map((n) => (
        <div key={n.t} style={{ position: "absolute", left: n.x - 70, top: n.y - 26, width: 140, textAlign: "center", opacity: nodes, transform: `translateY(${(1 - nodes) * 8}px)` }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: R.white }}>{n.t}</div>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{n.s}</div>
        </div>
      ))}
    </>
  );
};

// 정리 · 확인 문제 — 보기 선택 + 타이머
const PageQuiz: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const pick = sp(f - 46, fps, { damping: 12, stiffness: 240, mass: 0.6 });
  const left = Math.max(0, 180 - Math.floor(Math.max(0, f - 20) / 60) - (f > 20 ? 1 : 0));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const opts = ["live", "have lived", "lived"];
  return (
    <>
      <div style={{ position: "absolute", left: 20, top: 14, right: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <Mono size={12} color={R.accent}>Check-up</Mono>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Q1 / 5</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: "3px 10px" }}>
          <Clock size={16} />
          <Mono size={12} color={R.white}>{`${mm}:${ss}`}</Mono>
        </span>
      </div>
      <div style={{ position: "absolute", left: 20, top: 52, fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: R.white }}>
        I <span style={{ borderBottom: "2.5px solid rgba(255,255,255,0.7)", padding: "0 34px" }} /> here since 2021.
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 98, display: "flex", flexDirection: "column", gap: 9 }}>
        {opts.map((o, i) => {
          const sel = i === 1;
          const k = sel ? pick : 0;
          return (
            <div key={o} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 12px", borderRadius: 12, background: sel ? `rgba(${R.accentRgb},${0.16 * k})` : "rgba(255,255,255,0.04)", border: `1.5px solid ${sel && k > 0.5 ? `rgba(${R.accentRgb},0.7)` : "rgba(255,255,255,0.1)"}` }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${sel && k > 0.5 ? R.accent : "rgba(255,255,255,0.5)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {sel && <span style={{ width: 12, height: 12, borderRadius: 999, background: R.accent, transform: `scale(${k})` }} />}
              </span>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{["①", "②", "③"][i]}</span>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 19, fontWeight: 700, color: sel && k > 0.5 ? R.accent : R.white }}>{o}</span>
              <span style={{ flex: 1 }} />
              {sel && k > 0.3 && <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 900, color: R.accent, transform: `scale(${k})` }}>✓</span>}
            </div>
          );
        })}
      </div>
    </>
  );
};

// 전개 · 판서 템플릿 — 예문 + 타임라인 아크(스타일러스가 그린다)
const PageBoard: React.FC<{ f: number }> = ({ f }) => {
  const marker = draw(f, 26, 40);
  const base = draw(f, 22, 40);
  const arc = interpolate(f, [34, 62], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const label = draw(f, 56, 70);
  // 아크(이차 베지어) 위 점
  const at = (u: number) => {
    const x0 = 70;
    const x1 = 470;
    const y0 = 196;
    const cy = 96;
    const x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2) + u * u * x1;
    const y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y0;
    return [x, y] as const;
  };
  let d = "";
  for (let k = 0; k <= 40; k++) {
    const [x, y] = at((k / 40) * arc);
    d += `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  const [px, py] = at(arc);
  const showPen = f > 32 && f < 66;
  return (
    <>
      <div style={{ position: "absolute", left: 20, top: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <Mono size={12} color={R.accent}>Main board</Mono>
      </div>
      <div style={{ position: "absolute", left: 20, top: 38, fontFamily: FONT_FAMILY, fontSize: 25, fontWeight: 800, color: R.white, whiteSpace: "nowrap" }}>
        I{" "}
        <span style={{ position: "relative", color: marker > 0.5 ? R.accent : R.white }}>
          <span style={{ position: "absolute", left: -3, right: -3, bottom: 1, height: 8, borderRadius: 3, background: `rgba(${R.accentRgb},0.3)`, transform: `scaleX(${marker})`, transformOrigin: "0 50%" }} />
          <span style={{ position: "relative" }}>have lived</span>
        </span>{" "}
        in Seoul for five years.
      </div>
      <svg width={CW} height={250} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <ChalkFilter id="chalkEdbB" seed={17} rough={2.5} />
        </defs>
        <g filter="url(#chalkEdbB)">
          <line x1={40} y1={196} x2={40 + 460 * base} y2={196} stroke="rgba(255,255,255,0.75)" strokeWidth={3.5} strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={70 + i * 80} y1={189} x2={70 + i * 80} y2={203} stroke={i === 5 ? R.accent : "rgba(255,255,255,0.65)"} strokeWidth={3} strokeLinecap="round" opacity={base > (i + 1) / 7 ? 1 : 0} />
          ))}
          {arc > 0 && <path d={d} {...chalkLine} stroke={R.accent} strokeWidth={5} />}
        </g>
        {arc > 0 && <path d={d} fill="none" stroke={`rgba(${R.accentRgb},0.35)`} strokeWidth={12} strokeLinecap="round" style={{ filter: "blur(5px)" }} />}
        <circle cx={70} cy={196} r={6 * base} fill={R.white} />
        <circle cx={470} cy={196} r={7 * base} fill={R.accent} />
      </svg>
      {["2021", "", "", "", "", "Now"].map((y, i) =>
        y ? (
          <div key={i} style={{ position: "absolute", left: 70 + i * 80 - 30, width: 60, textAlign: "center", top: 210, opacity: base }}>
            <Mono size={11} color={i === 5 ? R.accent : "rgba(255,255,255,0.65)"}>{y}</Mono>
          </div>
        ) : null,
      )}
      <div style={{ position: "absolute", left: 270 - 100, top: 112, width: 200, textAlign: "center", opacity: label, fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: R.white }}>for five years</div>
      {showPen && (
        <div style={{ position: "absolute", left: px, top: py, transform: "rotate(-35deg)", transformOrigin: "0 0" }}>
          <div style={{ width: 9, height: 84, marginLeft: -4.5, borderRadius: "5px 5px 2px 2px", background: "linear-gradient(90deg, #D9DEDB, #FFFFFF 45%, #AEB6B2)", boxShadow: "4px 6px 10px rgba(0,0,0,0.45)", transform: "translateY(-84px)" }}>
            <div style={{ width: 9, height: 12, borderRadius: 2, background: R.accent, marginTop: 72 }} />
          </div>
        </div>
      )}
    </>
  );
};

// 저장 칩 — 진행 링이 차오르면 저장됨 ✓ 으로 바뀐다
const SaveChip: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const k = sp(f - 44, fps, { damping: 14, stiffness: 210, mass: 0.7 });
  const ring = interpolate(f, [46, 64], [0, 1], clamp);
  const done = f >= 64;
  const doneK = sp(f - 64, fps, { damping: 11, stiffness: 260, mass: 0.6 });
  const C = 2 * Math.PI * 11;
  return (
    <div style={{ position: "absolute", left: 120, top: -78, display: "flex", alignItems: "center", gap: 12, background: done ? R.accent : "rgba(8,26,19,0.75)", border: `1.5px solid ${done ? R.accent : "rgba(255,255,255,0.2)"}`, borderRadius: 999, padding: "10px 22px 10px 12px", transform: `scale(${k})`, transformOrigin: "0 50%", opacity: Math.min(1, k * 1.5), boxShadow: done ? `0 10px 30px rgba(${R.accentRgb},0.35)` : "0 10px 30px rgba(0,0,0,0.35)" }}>
      <svg width={30} height={30} viewBox="0 0 30 30">
        {done ? (
          <>
            <circle cx={15} cy={15} r={13} fill={R.accentInk} transform={`scale(${doneK})`} style={{ transformOrigin: "15px 15px" }} />
            <path d="M9 15.5 L13.5 20 L21 11" fill="none" stroke={R.accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx={15} cy={15} r={11} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
            <circle cx={15} cy={15} r={11} fill="none" stroke={R.accent} strokeWidth={3} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform="rotate(-90 15 15)" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: done ? R.accentInk : R.white }}>{done ? "우수 강사 템플릿으로 저장됨" : "우수 강사 템플릿으로 저장 중…"}</span>
    </div>
  );
};

const LAYOUT = [
  { key: "intro", x: 0, y: 70, r: -7, at: 8 },
  { key: "quiz", x: 250, y: 0, r: 5, at: 14 },
  { key: "board", x: 120, y: 170, r: -1.5, at: 20 },
] as const;

export const EdbDeck: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", right: 120, top: 232, width: 790, height: 530, perspective: 1600 }}>
      {LAYOUT.map((c, i) => {
        const k = pop(f, c.at, fps);
        const float = Math.sin((f + i * 23) / 26) * 4;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              opacity: Math.min(1, k * 1.6),
              transform: `translate3d(${(1 - k) * 260}px, ${(1 - k) * 120 + float}px, ${(1 - k) * -300}px) rotateY(${(1 - k) * -32}deg) rotate(${c.r * k}deg)`,
              transformOrigin: "50% 50%",
              zIndex: i,
            }}
          >
            {c.key === "intro" && (
              <Card page="p.03 / 50" title="Unit 5 · 도입" tags={["개념 정리", "이미지 1"]}>
                <PageIntro f={f} />
              </Card>
            )}
            {c.key === "quiz" && (
              <Card page="p.12 / 50" title="Unit 5 · 정리" tags={["확인 문제", "타이머 3분"]}>
                <PageQuiz f={f} />
              </Card>
            )}
            {c.key === "board" && (
              <Card page="p.07 / 50" title="Unit 5 · 전개" tags={["판서 템플릿", "타임라인", "레이어 3"]} ribbon="★ 우수 템플릿">
                <PageBoard f={f} />
              </Card>
            )}
          </div>
        );
      })}
      <SaveChip f={f} />
    </div>
  );
};
