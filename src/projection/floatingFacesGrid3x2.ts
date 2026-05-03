import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection, ProjectionConfig } from "./types";

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

export const floatingFacesGrid3x2Config: ProjectionConfig = {
  stickerSize: 58,
  stickerGap: 6,
  faceGap: 74,
  cornerRadius: 8,
};

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
      x: anchor.x + column * (floatingFacesGrid3x2Config.stickerSize + floatingFacesGrid3x2Config.stickerGap),
      y: anchor.y + row * (floatingFacesGrid3x2Config.stickerSize + floatingFacesGrid3x2Config.stickerGap),
      width: floatingFacesGrid3x2Config.stickerSize,
      height: floatingFacesGrid3x2Config.stickerSize,
      cornerRadius: floatingFacesGrid3x2Config.cornerRadius,
      layout: {
        stickerSize: floatingFacesGrid3x2Config.stickerSize,
        stickerGap: floatingFacesGrid3x2Config.stickerGap,
      },
      rotation: 0,
    };
  });
}

export const floatingFacesGrid3x2Projection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
