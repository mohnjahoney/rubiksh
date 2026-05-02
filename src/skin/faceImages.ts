import type { Face } from "../core/types";
import bImageUrl from "../assets/images/cats/B.jpg";
import dImageUrl from "../assets/images/cats/D.jpg";
import fImageUrl from "../assets/images/cats/F.jpg";
import lImageUrl from "../assets/images/cats/L.jpg";
import rImageUrl from "../assets/images/cats/R.jpg";
import uImageUrl from "../assets/images/cats/U.jpg";

export type FaceImageMetadata = {
  url: string;
  width: number;
  height: number;
};

export const faceImages: Record<Face, FaceImageMetadata> = {
  U: { url: uImageUrl, width: 4000, height: 6000 },
  D: { url: dImageUrl, width: 3507, height: 5261 },
  F: { url: fImageUrl, width: 4592, height: 3064 },
  B: { url: bImageUrl, width: 3456, height: 5184 },
  L: { url: lImageUrl, width: 3024, height: 3024 },
  R: { url: rImageUrl, width: 3024, height: 4032 },
};
