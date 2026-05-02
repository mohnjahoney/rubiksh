import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection } from "./types";

type FaceGridPosition = {
  column: number;
  row: number;
};

const FACE_LAYOUT: Record<Face, FaceGridPosition> = {
  U: { column: 1, row: 0 },
  L: { column: 0, row: 1 },
  F: { column: 1, row: 1 },
  R: { column: 2, row: 1 },
  B: { column: 3, row: 1 },
  D: { column: 1, row: 2 },
};

const STICKER_SIZE = 52;
const STICKER_GAP = 2;
const FACE_GAP = 4;
const FACE_SPAN = STICKER_SIZE * 3 + STICKER_GAP * 2;
const ORIGIN = { x: 110, y: 80 };

function projectFace(cube: CubeState, face: Face): PositionedSticker[] {
  const faceStickers = cube[face];
  const facePosition = FACE_LAYOUT[face];
  const anchor = {
    x: ORIGIN.x + facePosition.column * (FACE_SPAN + FACE_GAP),
    y: ORIGIN.y + facePosition.row * (FACE_SPAN + FACE_GAP),
  };

  return faceStickers.map((sticker, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;

    return {
      id: sticker.id,
      sticker,
      face,
      index,
      x: anchor.x + column * (STICKER_SIZE + STICKER_GAP),
      y: anchor.y + row * (STICKER_SIZE + STICKER_GAP),
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      rotation: 0,
    };
  });
}

export const cubeNetCrossProjection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
