import { FACES, type CubeState, type Face } from "../core/types";
import type { PositionedSticker, Projection, ProjectionConfig } from "./types";

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

export const cubeNetCrossConfig: ProjectionConfig = {
  stickerSize: 52,
  stickerGap: 2,
  faceGap: 4,
  cornerRadius: 8,
};

const FACE_SPAN = cubeNetCrossConfig.stickerSize * 3 + cubeNetCrossConfig.stickerGap * 2;
const ORIGIN = { x: 110, y: 80 };

function projectFace(cube: CubeState, face: Face): PositionedSticker[] {
  const faceStickers = cube[face];
  const facePosition = FACE_LAYOUT[face];
  const anchor = {
    x: ORIGIN.x + facePosition.column * (FACE_SPAN + cubeNetCrossConfig.faceGap),
    y: ORIGIN.y + facePosition.row * (FACE_SPAN + cubeNetCrossConfig.faceGap),
  };

  return faceStickers.map((sticker, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;

    return {
      id: sticker.id,
      sticker,
      face,
      index,
      x: anchor.x + column * (cubeNetCrossConfig.stickerSize + cubeNetCrossConfig.stickerGap),
      y: anchor.y + row * (cubeNetCrossConfig.stickerSize + cubeNetCrossConfig.stickerGap),
      width: cubeNetCrossConfig.stickerSize,
      height: cubeNetCrossConfig.stickerSize,
      cornerRadius: cubeNetCrossConfig.cornerRadius,
      layout: {
        stickerSize: cubeNetCrossConfig.stickerSize,
        stickerGap: cubeNetCrossConfig.stickerGap,
      },
      rotation: 0,
    };
  });
}

export const cubeNetCrossProjection: Projection = (cube) => {
  return FACES.flatMap((face) => projectFace(cube, face));
};
