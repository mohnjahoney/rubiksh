import type { Face } from "../core/types";

// import allImageUrl from "../assets/images/cats/all.png";

import bImageUrl from "../assets/images/cats/B.jpg";
import dImageUrl from "../assets/images/cats/D.jpg";
import fImageUrl from "../assets/images/cats/F.jpg";
import lImageUrl from "../assets/images/cats/L.jpg";
import rImageUrl from "../assets/images/cats/R.jpg";
import uImageUrl from "../assets/images/cats/U.jpg";

// const uImageUrl = allImageUrl;
// const dImageUrl = allImageUrl;
// const fImageUrl = allImageUrl;
// const bImageUrl = allImageUrl;
// const lImageUrl = allImageUrl;
// const rImageUrl = allImageUrl;

export type FaceImageMetadata = {
  url: string;
};

export const faceImages: Record<Face, FaceImageMetadata> = {
  U: { url: uImageUrl },
  D: { url: dImageUrl },
  F: { url: fImageUrl },
  B: { url: bImageUrl },
  L: { url: lImageUrl },
  R: { url: rImageUrl },
};
