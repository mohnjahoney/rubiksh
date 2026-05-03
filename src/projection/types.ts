import type { CubeState, Face, Sticker } from "../core/types";

export type ProjectionConfig = {
  stickerSize: number;
  stickerGap: number;
  faceGap: number;
  cornerRadius: number;
};

export type StickerLayoutMetadata = {
  stickerSize: number;
  stickerGap: number;
};

export type PositionedSticker = {
  id: string;
  sticker: Sticker;
  face: Face;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  layout: StickerLayoutMetadata;
  rotation: number;
};

export type Projection = (cube: CubeState) => PositionedSticker[];
