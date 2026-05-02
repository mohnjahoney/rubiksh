# Codex Prompt — Next Implementation Pass

You are continuing implementation of the modular Rubik’s Cube visualization app.

Before making changes, read these docs again:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- `IdeaBank.md` for context only
- current codebase

This pass should expand the visual/debug sandbox while preserving the existing architecture.

---

## Goals

Implement the following changes:

1. Add a debug flag for sticker ID labels.
2. Rename the current floating-face projection.
3. Add projection registry + projection switching.
4. Add two new projections.
5. Add reset, scramble, move history, and undo.
6. Add cube logic tests/invariant tests.

Keep the implementation simple and modular.

---

## 1. Debug Flag + Sticker ID Labels

Add a debug flag such as:

```ts
const DEBUG_SHOW_STICKER_IDS = true;
```

or a centralized debug config if that fits the current code structure better.

When enabled:

- render each sticker’s stable `id` centered on the tile;
- keep labels legible over tile colors;
- make sure labels move with the sticker during animation.

This is for verifying cube move correctness.

Do not hardcode debug rendering into the cube model.

---

## 2. Rename Existing Projection

Rename the existing `FloatingFaces` projection to:

```txt
FloatingFacesGrid3x2
```

The name should reflect that the six faces are arranged in a 3-by-2 rectangular grid.

Update imports, registry names, and references accordingly.

---

## 3. Projection Registry + Switching

Add a projection registry so projections can be selected by ID.

Example shape:

```ts
type ProjectionId =
  | "floatingFacesGrid3x2"
  | "floatingFacesHex"
  | "cubeNetCross";

const projections: Record<ProjectionId, Projection> = {
  floatingFacesGrid3x2,
  floatingFacesHex,
  cubeNetCross,
};
```

Add keyboard projection switching:

```txt
1 -> FloatingFacesGrid3x2
2 -> FloatingFacesHex
3 -> CubeNetCross
```

Move state should not reset when switching projections.

The same current cube state should simply be reprojected.

---

## 4. New Projection: FloatingFacesHex

Create a new projection:

```txt
FloatingFacesHex
```

Arrange the six 3×3 faces around a hexagon.

Important layout requirement:

- opposing cube faces should be placed on opposite sides of the hexagon.

Use the cube’s opposite-face pairs:

```txt
U opposite D
F opposite B
L opposite R
```

Exact screen orientation is flexible, but the opposite-pair relationship should be clear in the code.

Keep the layout simple and readable.

---

## 5. New Projection: CubeNetCross

Create a new projection:

```txt
CubeNetCross
```

This is a contiguous unfolded cube net in a cross / T-like shape.

Use this layout:

```txt
      U
L     F     R     B
      D
```

Equivalent grid coordinates:

```txt
U: column 1, row 0
L: column 0, row 1
F: column 1, row 1
R: column 2, row 1
B: column 3, row 1
D: column 1, row 2
```

The faces should touch or nearly touch so the net feels contiguous.

---

## 6. Reset

Add reset behavior:

```txt
Escape -> reset cube to solved state
```

Reset should also clear move history and scramble history.

---

## 7. Move History Display

Track moves applied by the user.

Display the current move history on screen at all times, not only in debug mode.

Requirements:

- Standard moves triggered by user input should be appended to history.
- Scramble moves should also be appended.
- Undo should remove moves as described below.
- The display can be plain text near the bottom of the screen.

Keep this display simple. It does not need React.

---

## 8. Scramble Key

Add scramble behavior:

```txt
s -> apply 5 random legal moves
```

Important:

- Scrambling must happen by applying valid Rubik’s Cube moves, not by randomizing stickers directly.
- This guarantees the resulting state is solvable.
- Pressing `s` repeatedly should apply additional groups of 5 moves.
- Each group should be concatenated to the displayed move history.

Example:

```txt
s -> U R F' D L
s again -> U R F' D L B2 U' R D2 F
```

Include all standard moves, inverses, and double moves as possible random moves:

```txt
U U' U2
D D' D2
F F' F2
B B' B2
L L' L2
R R' R2
```

If debug mode is on, it is especially important that the scramble sequence is visible so we can backtrack it for testing.

Since move history is always displayed, the scramble sequence can simply appear there.

---

## 9. Undo

Add undo behavior:

```txt
z -> undo last applied move
```

Undo should:

- look at the last move in move history;
- apply its inverse to the cube;
- remove that move from history.

Example:

```txt
History: U R F'
z pressed -> apply F, history becomes U R
z pressed -> apply R', history becomes U
```

Undo should work for both user-entered moves and scramble-generated moves.

---

## 10. Cube Logic Tests

Add tests for cube logic and invariants.

At minimum test:

1. A solved cube contains exactly 54 stickers.
2. Sticker IDs are unique.
3. Applying any legal move preserves the same set of sticker IDs.
4. Applying a move four times returns to the original state.
5. Applying a move followed by its inverse returns to the original state.
6. Applying `U2`, `D2`, etc. is equivalent to applying the corresponding quarter turn twice.

If a test framework is not already installed, choose the simplest reasonable option for a Vite + TypeScript project, such as Vitest.

Do not let tests depend on Pixi.

Tests should target the pure cube logic.

---

## Implementation Order

Recommended order:

1. Add/confirm cube move utility helpers:
   - `inverseMove(move)`
   - `allMoves`
   - `randomMoves(count)`
2. Add tests for cube invariants.
3. Add debug flag + ID labels.
4. Rename `FloatingFaces` -> `FloatingFacesGrid3x2`.
5. Add projection registry.
6. Add projection switching.
7. Add `FloatingFacesHex`.
8. Add `CubeNetCross`.
9. Add reset.
10. Add move history display.
11. Add scramble.
12. Add undo.

---

## Constraints

- Preserve the existing architecture.
- Do not introduce React.
- Do not introduce Three.js.
- Do not implement image tiles yet.
- Do not implement blob/gradient/shader rendering yet.
- Do not put renderer-specific code in the cube model.
- Keep changes small and readable.

---

## Definition of Done

This pass is complete when:

- app still runs with `npm run dev`;
- sticker IDs can be shown with debug flag enabled;
- current projection has been renamed to `FloatingFacesGrid3x2`;
- user can switch projections with keys `1`, `2`, `3`;
- `FloatingFacesHex` renders six faces around a hexagon with opposite faces across from each other;
- `CubeNetCross` renders the cube as an unfolded cross net;
- `Escape` resets the cube and clears history;
- `s` applies 5 random legal moves and appends them to history;
- repeated `s` presses append additional groups of 5 moves;
- move history is displayed on screen at all times;
- `z` undoes the last move and updates history;
- cube logic tests pass.

Favor clarity over cleverness.
