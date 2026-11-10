import { B, FPS, TOTAL_FRAMES } from "./beats.ts";

// 장면 ↔ 대본 비트 대응표(순수 데이터). scenes/*.tsx 의 start/end 와 같은 경계를 씁니다.
// OpenMontage scene_plan 과 더빙 대본 시트가 이 표에서 만들어집니다.
export type SceneRow = {
  id: string;
  act: 1 | 2 | 3 | 4;
  name: string;
  beats: string[];
  start: number;
  end: number;
  /** 이 장면의 주 피사체(장면마다 달라야 함 — 아틀리에 장면 구분 점검용) */
  subject: string;
  /** 대사에 걸리는 화면 동작 */
  action: string;
  enter: "cut" | "whip" | "wipe";
  hero?: boolean;
};

export const SCENE_MAP: SceneRow[] = [
  { id: "s01", act: 1, name: "전시대 — 옛날 선생님들", beats: ["b01"], start: 0, end: B.b01.end, subject: "박물관 전시대 위 선생님 피규어 3명", action: "‘멘탈이’에서 나선 눈·식은땀·영혼 가출, 큰 글자 강타", enter: "cut", hero: true },
  { id: "s02", act: 1, name: "교실 — 끝나지 않는 일", beats: ["b02", "b03"], start: B.b02.start, end: B.b03.end, subject: "교실 디오라마와 교탁 위로 떨어지는 일 더미", action: "종이 울리고 학생이 빠지자 교탁에 일 더미 5개 낙하 → 칠판 내용이 카드로 떠서 ‘보존’ 상자로", enter: "whip" },
  { id: "s03", act: 1, name: "교실 — 직접 촬영", beats: ["b04", "b05", "b06"], start: B.b04.start, end: B.b06.end, subject: "삼각대 위 휴대폰", action: "세우기 → 기울기 맞추기 → 저장 공간 97% 경고 → 원본 파일 큐브 낙하", enter: "cut" },
  { id: "s05", act: 1, name: "밤 책상 — 편집", beats: ["b07", "b08", "b09(앞)"], start: B.b07.start, end: B.b09.ph[1].start, subject: "책상 위에 떠 있는 편집 타임라인", action: "칼날로 자르기 → 붙이기 → 프레스로 용량 줄이기 → 자막 띠 → 최종 파일", enter: "whip" },
  { id: "s06", act: 1, name: "업로드 — 구름·폴더·링크", beats: ["b09(뒤)", "b10", "b11"], start: B.b09.ph[1].start, end: B.b11.end, subject: "구름 세 개 사이를 헤매는 파일 큐브", action: "어디에 올릴지 헤맴 → 폴더 4단 → 휴대폰 5대로 링크 → 안 읽음 3명", enter: "cut" },
  { id: "s08", act: 1, name: "시청 체크 — 명단 확인", beats: ["b12", "b13"], start: B.b12.start, end: B.b13.end, subject: "계단석의 학생 12명과 머리 위 표시등", action: "시청/미시청 판별 → 돋보기로 찾기 → 말풍선 안내 → 한 명씩 확인", enter: "whip" },
  { id: "s09", act: 1, name: "에너지 방전", beats: ["b14"], start: B.b14.start, end: B.b14.end, subject: "선생님 머리 위 작업 블록 4단과 배터리", action: "촬영·편집·업로드·시청 체크 블록이 차례로 쌓임 → 배터리 3% → 납작", enter: "whip", hero: true },
  { id: "s10", act: 2, name: "에듀테크 업체 — 첫 번째 계획", beats: ["b15", "b16"], start: B.b15.start, end: B.b16.end, subject: "연구원 2명과 코르크 보드의 할 일 목록", action: "전구 → 목록 중 ‘촬영’만 동그라미 → 설계도 펼침", enter: "wipe" },
  { id: "s11", act: 2, name: "교실 — 장비 3종과 설계도", beats: ["b17", "b18"], start: B.b17.start, end: B.b18.end, subject: "천장 카메라·마이크·저장 장치 탑", action: "카메라 낙하 → 마이크 → 저장 장치 5단 → 화면 전체가 청사진으로", enter: "whip", hero: true },
  { id: "s12", act: 2, name: "교실 — 그래도 전부 선생님 손", beats: ["b19", "b20", "b21"], start: B.b19.start, end: B.b21.end, subject: "스테이션 4곳을 뛰어다니는 선생님", action: "버튼 → 파일 → 업로드 → 체크를 직접 뛰며 처리 → 다시 영혼 가출", enter: "cut" },
  { id: "s13", act: 3, name: "공사팀 — 통째로 시스템이 받자", beats: ["b22", "b23"], start: B.b22.start, end: B.b23.end, subject: "타워 크레인과 ‘시스템’ 상자", action: "크레인이 작업 블록 4단을 통째로 들어 시스템 상자에 넣음", enter: "wipe", hero: true },
  { id: "s14", act: 3, name: "녹화 버튼 하나", beats: ["b24"], start: B.b24.start, end: B.b24.end, subject: "빨간 녹화 버튼", action: "‘누르면’에서 점프해 버튼을 누름 → 바닥 파동", enter: "whip", hero: true },
  { id: "s15", act: 3, name: "자동 네 단계", beats: ["b25"], start: B.b25.start, end: B.b25.end, subject: "레일 위 자동화 기계 4대", action: "펄스가 촬영 → 업로드 → 시청 체크 → 관리 기계를 차례로 켬", enter: "cut" },
  { id: "s16", act: 3, name: "나무 구조 — 흔들릴수록 단단하게", beats: ["b26", "b27"], start: B.b26.start, end: B.b27.end, subject: "땅에서 솟아 수업 받침을 떠받치는 나무", action: "줄기가 솟고 가지·잎·팻말 → 선생님이 흔들리자 뿌리가 넓고 굵어짐", enter: "whip", hero: true },
  { id: "s17", act: 4, name: "수업 후 작업 — 소멸", beats: ["b28"], start: B.b28.start, end: B.b28.end, subject: "나무 옆에 남은 작업 블록 4단", action: "위에서부터 하나씩 터져 사라짐, 할 일 메모가 날아감", enter: "wipe" },
  { id: "s18", act: 4, name: "옛날 방식 전시대", beats: ["b29", "b30", "b31", "b32"], start: B.b29.start, end: B.b32.end, subject: "유리 덮개 속 전시품 4점(장비·밤샘·링크·명단)", action: "전시품마다 유리 덮개가 내려오고 ‘은퇴’ 도장", enter: "whip" },
  { id: "s19", act: 4, name: "교실 — 맘 편한 수업, 진짜 끝", beats: ["b33", "b34"], start: B.b33.start, end: B.b34.end, subject: "영혼이 돌아온 선생님과 빈 교탁", action: "영혼 귀환 → 종 → 이번엔 교탁에 잎 하나만 → 노을 속 퇴근", enter: "whip" },
  { id: "s21", act: 4, name: "엔드카드 — 요즘 선생님", beats: ["b35"], start: B.b35.start, end: TOTAL_FRAMES, subject: "전시대 위 웃는 선생님 3명과 ClassIn 로고", action: "‘요즘 선생님’ 명판, 로고·URL", enter: "whip", hero: true },
];

export const sec = (frames: number) => Math.round((frames / FPS) * 1000) / 1000;
