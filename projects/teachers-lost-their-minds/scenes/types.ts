import type React from "react";
import type { Cam } from "../lib/motion";
import type { Look, Projector } from "../three/Stage";

export type OverProps = { f: number; pr: Projector; w: number; h: number; u: number; tall: boolean };

export type SceneDef = {
  id: string;
  /** 사람이 읽는 장면 이름(scene_plan 과 같은 이름) */
  name: string;
  start: number;
  end: number;
  cam: (f: number, tall: boolean) => Cam;
  look: Look | ((f: number) => Look);
  /** 종이 배경색 */
  bg: string | ((f: number) => string);
  World: React.FC<{ f: number }>;
  Over?: React.FC<OverProps>;
  /** 장면 진입/이탈 방식. whip = 카메라가 옆으로 채이며 넘어감 */
  enter?: "cut" | "whip";
  exit?: "cut" | "whip";
  /** 세로 영상에서 카메라를 뒤로 빼는 배율(기본 1.75) */
  tallK?: number;
  dark?: boolean;
  /** 3D 화면 전체에 거는 후처리(0..1). 지금은 설계도(청사진) 모드만 있습니다. */
  blueprint?: (f: number) => number;
};
