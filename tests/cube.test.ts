import { describe, expect, test } from "vitest";
import { createSolvedCube, getAllStickers } from "../src/core/cube";
import { applyMove, applyMoves } from "../src/core/moves";
import type { Move } from "../src/core/types";

function serializeCube(move: ReturnType<typeof createSolvedCube>): string {
  return JSON.stringify(move);
}

describe("cube moves", () => {
  test("solved cube contains 54 unique stickers", () => {
    const stickers = getAllStickers(createSolvedCube());
    expect(stickers).toHaveLength(54);
    expect(new Set(stickers.map((sticker) => sticker.id)).size).toBe(54);
  });

  test("moves preserve sticker identity", () => {
    const cube = createSolvedCube();
    const moved = applyMoves(cube, ["U", "R", "F", "D'", "L", "B'"]);

    expect(getAllStickers(moved).map((sticker) => sticker.id).sort()).toEqual(
      getAllStickers(cube).map((sticker) => sticker.id).sort(),
    );
  });

  test.each(["U", "D", "F", "B", "L", "R"] as Move[])("%s four times returns to solved", (move) => {
    const cube = createSolvedCube();
    const moved = applyMoves(cube, [move, move, move, move]);
    expect(serializeCube(moved)).toBe(serializeCube(cube));
  });

  test.each(
    [
      ["U", "U'"],
      ["D", "D'"],
      ["F", "F'"],
      ["B", "B'"],
      ["L", "L'"],
      ["R", "R'"],
    ] as const,
  )("%s followed by %s returns to solved", (move, inverse) => {
    const cube = createSolvedCube();
    const moved = applyMoves(cube, [move, inverse]);
    expect(serializeCube(moved)).toBe(serializeCube(cube));
  });

  test.each(["U", "D", "F", "B", "L", "R"] as Move[])("%s2 matches two quarter turns", (move) => {
    const cube = createSolvedCube();
    const doubled = applyMove(cube, `${move}2` as Move);
    const repeated = applyMoves(cube, [move, move]);
    expect(serializeCube(doubled)).toBe(serializeCube(repeated));
  });
});
