import type { Move } from "../core/types";
import type { ProjectionId } from "../projection/registry";
import type { SkinId } from "../skin/registry";

const KEY_TO_FACE: Record<string, Move> = {
  u: "U",
  d: "D",
  f: "F",
  b: "B",
  l: "L",
  r: "R",
};

const KEY_TO_PROJECTION: Record<string, ProjectionId> = {
  "1": "floatingFacesGrid3x2",
  "2": "floatingFacesHex",
  "3": "cubeNetCross",
};

const KEY_TO_SKIN: Record<string, SkinId> = {
  c: "solidColors",
  i: "imageTiles",
};

export type KeyboardAction =
  | {
      kind: "move";
      move: Move;
    }
  | {
      kind: "projection";
      projectionId: ProjectionId;
    }
  | {
      kind: "skin";
      skinId: SkinId;
    }
  | {
      kind: "reset";
    }
  | {
      kind: "scramble";
    }
  | {
      kind: "undo";
    };

export function bindKeyboardInput(onAction: (action: KeyboardAction) => void): () => void {
  const handler = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const projectionId = KEY_TO_PROJECTION[key];
    const skinId = KEY_TO_SKIN[key];

    if (projectionId) {
      event.preventDefault();
      onAction({ kind: "projection", projectionId });
      return;
    }

    if (skinId) {
      event.preventDefault();
      onAction({ kind: "skin", skinId });
      return;
    }

    if (key === "escape") {
      event.preventDefault();
      onAction({ kind: "reset" });
      return;
    }

    if (key === "s") {
      event.preventDefault();
      onAction({ kind: "scramble" });
      return;
    }

    if (key === "z") {
      event.preventDefault();
      onAction({ kind: "undo" });
      return;
    }

    const baseMove = KEY_TO_FACE[key];

    if (!baseMove) {
      return;
    }

    event.preventDefault();
    const move = event.shiftKey ? (`${baseMove}'` as Move) : baseMove;
    onAction({ kind: "move", move });
  };

  window.addEventListener("keydown", handler);

  return () => {
    window.removeEventListener("keydown", handler);
  };
}
