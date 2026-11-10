import { B } from "../story/beats";
import { C } from "../lib/theme";
import { ACT1A } from "./act1a";
import { ACT1B } from "./act1b";
import { ACT2 } from "./act2";
import { ACT3 } from "./act3";
import { ACT4 } from "./act4";
import type { SceneDef } from "./types";

export const SCENES: SceneDef[] = [...ACT1A, ...ACT1B, ...ACT2, ...ACT3, ...ACT4];

/** 막이 바뀔 때의 색면 전환 */
export const WIPES: Array<{ at: number; color: string; color2?: string }> = [
  { at: B.b15.start, color: C.cobalt, color2: C.sky },
  { at: B.b22.start, color: C.forest, color2: C.lime },
  { at: B.b28.start, color: C.lime, color2: C.forest },
];
