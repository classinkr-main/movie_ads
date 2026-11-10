import {
  BEAT_SECONDS,
  COMMA_PAUSE,
  LEAD_IN,
  PACE,
  PHRASE_STARTS,
  SENTENCE_PAUSE,
  TAIL,
} from "./timing.ts";

export const FPS = 30;

export type Act = "problem" | "attempt" | "solution" | "result";

type RawBeat = {
  id: string;
  act: Act;
  /** 쉼표 단위 구절. 구절마다 화면 동작이 하나씩 걸립니다. */
  phrases: string[];
  /** 자막에서 형광펜으로 칠할 단어 */
  mark?: string[];
  /** 대사 뒤 화면을 더 붙잡는 시간(초) */
  hold?: number;
};

// 대본은 의뢰 원문 그대로입니다. 띄어쓰기·어미를 고치지 않았습니다.
const RAW: RawBeat[] = [
  // ── ACT 1 · 문제 ───────────────────────────────────────────────────────────
  { id: "b01", act: "problem", phrases: ["옛날 선생님들은", "완전히 멘탈이 나가 버렸습니다."], mark: ["멘탈이 나가 버렸습니다"], hold: 0.35 },
  { id: "b02", act: "problem", phrases: ["수업을 해야 하는데", "수업이 끝나면", "일이 끝나질 않았거든요."], mark: ["끝나질 않았거든요"] },
  { id: "b03", act: "problem", phrases: ["수업 내용을 보존해야 하니까요."], mark: ["보존"] },
  { id: "b04", act: "problem", phrases: ["그래서 선생님들이", "직접 촬영을 시작했습니다."], mark: ["직접 촬영"] },
  { id: "b05", act: "problem", phrases: ["핸드폰을 세우고,", "각도를 맞추고,", "저장 공간을 확인하고요."] },
  { id: "b06", act: "problem", phrases: ["그런데 이게 문제였습니다."], mark: ["문제"], hold: 0.2 },
  { id: "b07", act: "problem", phrases: ["촬영이 끝나면", "이제 편집을 해야 했거든요."], mark: ["편집"] },
  { id: "b08", act: "problem", phrases: ["자르고,", "붙이고,", "용량을 줄이고,", "자막을 넣고요."] },
  { id: "b09", act: "problem", phrases: ["그렇게 겨우 파일을 만들면", "또 업로드를 해야 했습니다."], mark: ["업로드"] },
  { id: "b10", act: "problem", phrases: ["어디에 올릴지 정하고,", "폴더를 만들고,", "링크를 공유하고요."] },
  { id: "b11", act: "problem", phrases: ["그런데 또", "끝이 아니었습니다."], mark: ["끝이 아니었습니다"], hold: 0.2 },
  { id: "b12", act: "problem", phrases: ["누가 시청했는지", "체크해야 했거든요."], mark: ["체크"] },
  { id: "b13", act: "problem", phrases: ["미시청 학생을 찾고,", "다시 안내하고,", "확인을 받고요."] },
  { id: "b14", act: "problem", phrases: ["결국 선생님들이", "수업하는 시간 외에", "너무 많은 에너지를", "낭비하게 된 겁니다."], mark: ["에너지", "낭비"], hold: 0.45 },

  // ── ACT 2 · 첫 시도 ────────────────────────────────────────────────────────
  { id: "b15", act: "attempt", phrases: ["그래서 똑똑한 에듀테크 업체가", "이 문제를 해결하려고 했습니다."], mark: ["에듀테크 업체"] },
  { id: "b16", act: "attempt", phrases: ["처음에는", "촬영을 쉽게 해 보자고 했죠."], mark: ["촬영을 쉽게"] },
  { id: "b17", act: "attempt", phrases: ["좋은 카메라를 달고,", "마이크를 붙이고,", "저장 장치를 늘렸습니다."] },
  { id: "b18", act: "attempt", phrases: ["그림으로는", "가능해 보였습니다."], mark: ["그림으로는"] },
  { id: "b19", act: "attempt", phrases: ["문제는 선생님이", "계속 신경 써야 했다는 겁니다."], mark: ["계속 신경"] },
  { id: "b20", act: "attempt", phrases: ["버튼을 누르고,", "파일을 옮기고,", "업로드하고,", "체크까지…"] },
  { id: "b21", act: "attempt", phrases: ["결국 멘탈은", "그대로였죠."], mark: ["그대로"], hold: 0.45 },

  // ── ACT 3 · 해결 ───────────────────────────────────────────────────────────
  { id: "b22", act: "solution", phrases: ["그때 공사팀이", "완전히 새로운 방법을 생각했는데요."], mark: ["새로운 방법"] },
  { id: "b23", act: "solution", phrases: ["“선생님이 해야 하는 일을", "통째로 시스템이 받자.”"], mark: ["통째로 시스템이 받자"], hold: 0.3 },
  { id: "b24", act: "solution", phrases: ["그래서 클래스인은", "녹화 버튼 하나만 누르면"], mark: ["녹화 버튼 하나"] },
  { id: "b25", act: "solution", phrases: ["자동으로 촬영하고,", "자동으로 업로드하고,", "자동으로 시청을 체크하고,", "자동으로 관리까지", "해 주게 만든 겁니다."], mark: ["자동으로"] },
  { id: "b26", act: "solution", phrases: ["마치 땅에서 쭉 올라온", "나무처럼 말이죠."], mark: ["나무"] },
  { id: "b27", act: "solution", phrases: ["선생님이 흔들릴수록", "더 단단하게 받쳐 주는", "구조였습니다."], mark: ["더 단단하게"], hold: 0.4 },

  // ── ACT 4 · 결과 ───────────────────────────────────────────────────────────
  { id: "b28", act: "result", phrases: ["이렇게 하니까", "걱정거리였던 ‘수업 후 작업’이", "완벽하게 사라졌습니다."], mark: ["완벽하게 사라졌습니다"] },
  { id: "b29", act: "result", phrases: ["선생님들은 더 이상", "촬영 장비에 신경 쓰지 않아도 됐고,"], mark: ["촬영 장비"] },
  { id: "b30", act: "result", phrases: ["편집 때문에", "밤을 새우지 않아도 됐고,"], mark: ["편집"] },
  { id: "b31", act: "result", phrases: ["업로드 링크를", "찾아 헤매지 않아도 됐고,"], mark: ["업로드 링크"] },
  { id: "b32", act: "result", phrases: ["시청 체크로", "마음 졸이지 않아도 됐습니다."], mark: ["시청 체크"] },
  { id: "b33", act: "result", phrases: ["결국 선생님들은", "맘 편히 수업할 수 있게 됐습니다."], mark: ["맘 편히 수업"] },
  { id: "b34", act: "result", phrases: ["이제 수업은 수업답게,", "수업이 끝나면", "진짜로 끝나게 된 겁니다."], mark: ["진짜로 끝"], hold: 0.3 },
  { id: "b35", act: "result", phrases: ["클래스인 하나로요!"], mark: ["클래스인"] },
];

const HANGUL = /[가-힣]/g;
export const syllables = (s: string) => (s.match(HANGUL) ?? []).length;

export type Phrase = {
  text: string;
  /** 영상 전체 기준 시작/끝 프레임 */
  start: number;
  end: number;
};

export type Beat = {
  id: string;
  index: number;
  act: Act;
  text: string;
  mark: string[];
  /** 영상 전체 기준 시작 프레임 */
  start: number;
  /** 다음 비트 시작 프레임 */
  end: number;
  dur: number;
  /** 대사가 실제로 끝나는 프레임(쉼·홀드 제외) */
  speechEnd: number;
  ph: Phrase[];
  seconds: number;
};

const f = (sec: number) => Math.round(sec * FPS);

const build = (): Beat[] => {
  let cursor = LEAD_IN;
  return RAW.map((raw, index) => {
    // 자동 추정: 구절별 음절 수 / PACE + 쉼표 쉼
    const est: number[] = [];
    let t = 0;
    raw.phrases.forEach((p, i) => {
      est.push(t);
      t += syllables(p) / PACE;
      const isLast = i === raw.phrases.length - 1;
      if (!isLast) t += /[,，…]$/.test(p.trim()) ? COMMA_PAUSE : 0.04;
    });
    const speech = t;
    const auto = speech + SENTENCE_PAUSE + (raw.hold ?? 0);
    const seconds = BEAT_SECONDS[raw.id] ?? auto;
    const scale = BEAT_SECONDS[raw.id] ? seconds / auto : 1;
    const starts = PHRASE_STARTS[raw.id] ?? est.map((x) => x * scale);
    const start = f(cursor);
    const end = f(cursor + seconds);
    const speechEnd = Math.min(end, f(cursor + speech * scale));
    const ph: Phrase[] = raw.phrases.map((text, i) => ({
      text,
      start: f(cursor + starts[i]),
      end: i < raw.phrases.length - 1 ? f(cursor + starts[i + 1]) : speechEnd,
    }));
    cursor += seconds;
    return {
      id: raw.id,
      index,
      act: raw.act,
      text: raw.phrases.join(" "),
      mark: raw.mark ?? [],
      start,
      end,
      dur: end - start,
      speechEnd,
      ph,
      seconds,
    };
  });
};

export const BEATS: Beat[] = build();
export const B: Record<string, Beat> = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const LAST = BEATS[BEATS.length - 1];
export const TOTAL_FRAMES = LAST.end + f(TAIL);
export const TOTAL_SECONDS = TOTAL_FRAMES / FPS;
