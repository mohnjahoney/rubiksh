import type { PositionedSticker } from "../projection/types";
import type { Material } from "../skin/types";

export type VisualSticker = PositionedSticker & {
  material: Material;
};
