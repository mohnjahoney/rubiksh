import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection } from "./types";

type FaceAnchor = {
  x: number;
  y: number;
};

const FACE_LAYOUT: Record<Face, FaceAnchor> = {
  U: { x: 100, y: 80 },
  D: { x: 360, y: 80 },
  F: { x: 620, y: 80 },
  B: { x: 100, y: 340 },
  L: { x: 360, y: 340 },
  R: { x: 620, y: 340 },
};

const STICKER_SIZE = 58;
const GAP = 6;

function projectFace(cube: CubeState, face: Face): PositionedSticker[] {
  const faceStickers = cube[face];
  const anchor = FACE_LAYOUT[face];

  return faceStickers.map((sticker, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;

    return {
      id: sticker.id,
      sticker,
      face,
      index,
      x: anchor.x + column * (STICKER_SIZE + GAP),
      y: anchor.y + row * (STICKER_SIZE + GAP),
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      rotation: 0,
    };
  });
}

export const floatingFacesProjection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
