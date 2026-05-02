import type { Face } from "../core/types";
import type { PositionedSticker } from "../projection/types";

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Material =
  | { kind: "solid"; color: RGB }
  | { kind: "imageTile"; imageId: Face; sourceRect: Rect };

export type Skin = (positioned: PositionedSticker) => Material;

export const FACE_COLORS: Record<Face, RGB> = {
  U: { r: 245, g: 245, b: 245 },
  D: { r: 255, g: 213, b: 0 },
  F: { r: 0, g: 155, b: 72 },
  B: { r: 0, g: 70, b: 173 },
  L: { r: 255, g: 88, b: 0 },
  R: { r: 183, g: 18, b: 52 },
};
