import type { CubeState } from "../core/types";
import type { Projection } from "../projection/types";
import type { VisualSticker } from "./types";
import type { Skin } from "../skin/types";

export function buildScene(cube: CubeState, projection: Projection, skin: Skin): VisualSticker[] {
  return projection(cube).map((positioned) => ({
    ...positioned,
    material: skin(positioned),
  }));
}
