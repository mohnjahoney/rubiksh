import { imageTileSkin } from "./imageTiles";
import { solidColorSkin } from "./solidColors";
import type { Skin } from "./types";

export type SkinId = "solidColors" | "imageTiles";

export const skins: Record<SkinId, Skin> = {
  solidColors: solidColorSkin,
  imageTiles: imageTileSkin,
};

export const skinNames: Record<SkinId, string> = {
  solidColors: "Solid Colors",
  imageTiles: "Image Tiles",
};
