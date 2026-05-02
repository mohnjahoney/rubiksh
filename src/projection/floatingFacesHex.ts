import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection } from "./types";

type FaceCenter = {
  x: number;
  y: number;
};

const STICKER_SIZE = 48;
const GAP = 5;
const FACE_SPAN = STICKER_SIZE * 3 + GAP * 2;

const CENTER = { x: 460, y: 320 };
const RADIUS = 235;

// Opposite cube faces are deliberately placed opposite each other:
// U-D, F-B, and L-R.
const FACE_LAYOUT: Record<Face, FaceCenter> = {
  U: { x: CENTER.x, y: CENTER.y - RADIUS },
  F: { x: CENTER.x + RADIUS * 0.86, y: CENTER.y - RADIUS * 0.5 },
  R: { x: CENTER.x + RADIUS * 0.86, y: CENTER.y + RADIUS * 0.5 },
  D: { x: CENTER.x, y: CENTER.y + RADIUS },
  B: { x: CENTER.x - RADIUS * 0.86, y: CENTER.y + RADIUS * 0.5 },
  L: { x: CENTER.x - RADIUS * 0.86, y: CENTER.y - RADIUS * 0.5 },
};

function projectFace(cube: CubeState, face: Face): PositionedSticker[] {
  const faceStickers = cube[face];
  const center = FACE_LAYOUT[face];
  const anchor = {
    x: center.x - FACE_SPAN / 2,
    y: center.y - FACE_SPAN / 2,
  };

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

export const floatingFacesHexProjection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
