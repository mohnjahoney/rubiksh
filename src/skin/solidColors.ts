import { FACE_COLORS, type Skin } from "./types";

export const solidColorSkin: Skin = (positioned) => {
  return {
    kind: "solid",
    color: FACE_COLORS[positioned.sticker.homeFace],
  };
};
