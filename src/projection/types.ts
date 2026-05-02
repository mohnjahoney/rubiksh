import type { CubeState, Face, Sticker } from "../core/types";

export type PositionedSticker = {
  id: string;
  sticker: Sticker;
  face: Face;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type Projection = (cube: CubeState) => PositionedSticker[];
