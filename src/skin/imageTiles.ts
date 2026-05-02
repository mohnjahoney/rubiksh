import type { Face } from "../core/types";
import { faceImages } from "./faceImages";
import type { Rect, Skin } from "./types";

const tileRectsByFace = new Map<Face, Rect[]>();

function computeTileRects(face: Face): Rect[] {
  const cached = tileRectsByFace.get(face);

  if (cached) {
    return cached;
  }

  const image = faceImages[face];
  const cropSize = Math.min(image.width, image.height);
  const cropX = (image.width - cropSize) / 2;
  const cropY = (image.height - cropSize) / 2;
  const tileSize = cropSize / 3;
  const rects = Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;

    return {
      x: cropX + column * tileSize,
      y: cropY + row * tileSize,
      width: tileSize,
      height: tileSize,
    };
  });

  tileRectsByFace.set(face, rects);
  return rects;
}

export const imageTileSkin: Skin = (positioned) => {
  const imageId = positioned.sticker.homeFace;
  const sourceRect = computeTileRects(imageId)[positioned.sticker.homeIndex];

  return {
    kind: "imageTile",
    imageId,
    sourceRect,
  };
};
