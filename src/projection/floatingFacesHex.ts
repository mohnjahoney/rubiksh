import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection, ProjectionConfig } from "./types";

type FaceCenter = {
  x: number;
  y: number;
};

export const floatingFacesHexConfig: ProjectionConfig = {
  stickerSize: 60,
  stickerGap: 3,
  faceGap: 85,
  cornerRadius: 8,
};

const FACE_SPAN = floatingFacesHexConfig.stickerSize * 3 + floatingFacesHexConfig.stickerGap * 2;

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
      x: anchor.x + column * (floatingFacesHexConfig.stickerSize + floatingFacesHexConfig.stickerGap),
      y: anchor.y + row * (floatingFacesHexConfig.stickerSize + floatingFacesHexConfig.stickerGap),
      width: floatingFacesHexConfig.stickerSize,
      height: floatingFacesHexConfig.stickerSize,
      cornerRadius: floatingFacesHexConfig.cornerRadius,
      layout: {
        stickerSize: floatingFacesHexConfig.stickerSize,
        stickerGap: floatingFacesHexConfig.stickerGap,
      },
      rotation: 0,
    };
  });
}

export const floatingFacesHexProjection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
