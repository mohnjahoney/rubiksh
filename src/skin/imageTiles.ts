import type { Face } from "../core/types";
import { faceImages } from "./faceImages";
import type { Rect, Skin } from "./types";
import { Texture } from "pixi.js";

const tileRectsByFaceAndGap = new Map<string, Rect[]>();

function computeTileRects(face: Face, gapRatio: number): Rect[] {
  const meta = faceImages[face];
  const texture = Texture.from(meta.url);

  // Wait until texture has valid dimensions
  if (!texture.width || !texture.height) {
    // Return safe fallback (avoids NaN + WebGL crash)
    return Array.from({ length: 9 }, () => ({ x: 0, y: 0, width: 1, height: 1 }));
  }

  // const width = texture.width;
  // const height = texture.height;
  const source = texture.source;

  if (!source.width || !source.height) {
    return Array.from({ length: 9 }, () => ({ x: 0, y: 0, width: 1, height: 1 }));
  }
  
  const width = source.width;
  const height = source.height;
  const cacheKey = `${face}:${gapRatio}:${width}x${height}`;
  const cached = tileRectsByFaceAndGap.get(cacheKey);
  if (cached) return cached;

  const cropSize = Math.min(width, height);
  const cropX = (width - cropSize) / 2;
  const cropY = (height - cropSize) / 2;

  const denominator = 3 + 2 * gapRatio;
  const tileSize = cropSize / denominator;
  const imageGap = tileSize * gapRatio;

  const rects = Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;

    const nominalX = cropX + column * (tileSize + imageGap);
    const nominalY = cropY + row * (tileSize + imageGap);

    return {
      x: Math.floor(nominalX),
      y: Math.floor(nominalY),
      width: Math.max(1, Math.floor(tileSize)),
      height: Math.max(1, Math.floor(tileSize)),
    };
  });

  tileRectsByFaceAndGap.set(cacheKey, rects);
  return rects;
}

export const imageTileSkin: Skin = (positioned) => {
  const imageId = positioned.sticker.homeFace;

  const gapRatio =
    positioned.layout.stickerSize === 0
      ? 0
      : positioned.layout.stickerGap / positioned.layout.stickerSize;

  const rects = computeTileRects(imageId, gapRatio);

  const sourceRect = rects[positioned.sticker.homeIndex];

  return {
    kind: "imageTile",
    imageId,
    sourceRect,
  };
};