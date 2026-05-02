import type { Move } from "../core/types";

const KEY_TO_FACE: Record<string, Move> = {
  u: "U",
  d: "D",
  f: "F",
  b: "B",
  l: "L",
  r: "R",
};

export function bindKeyboardInput(onMove: (move: Move) => void): () => void {
  const handler = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const baseMove = KEY_TO_FACE[key];

    if (!baseMove) {
      return;
    }

    event.preventDefault();
    const move = event.shiftKey ? (`${baseMove}'` as Move) : baseMove;
    onMove(move);
  };

  window.addEventListener("keydown", handler);

  return () => {
    window.removeEventListener("keydown", handler);
  };
}
