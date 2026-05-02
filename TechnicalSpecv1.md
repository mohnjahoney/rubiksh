

# Rubik's Cube App — Technical Spec v1

## Purpose

This document defines the first buildable version of a Rubik's Cube-inspired visual puzzle app.

The goal for v1 is not to build every creative direction we discussed. The goal is to create a clean technical backbone that lets us experiment with different 2D renderings of a standard Rubik's Cube state.

The first version should prove that we can:

- represent a Rubik's Cube in code;
- apply standard cube moves correctly;
- project the cube state into a 2D visual scene;
- render that scene with PixiJS;
- animate sticker movement using stable sticker identities;
- swap projection and skin ideas without rewriting the cube logic.

The core principle is:

```txt
The cube model is logical.
The projection is spatial.
The skin is visual.
The renderer is mechanical.
```

## Initial Stack

### Vite

Use Vite as the development server and build tool.

Vite gives us:

- a fast local dev server;
- TypeScript support;
- simple asset handling for image files;
- a straightforward production build path;
- room to add React, Three.js, or other libraries later if needed.

This project should start with the vanilla TypeScript Vite template, not React.

Suggested setup:

```bash
npm create vite@latest rubiks -- --template vanilla-ts
cd rubiks
npm install
npm install pixi.js
npm run dev
```

### TypeScript

Use TypeScript for the entire app.

The cube model, move system, projections, skins, and Pixi renderer should all be typed explicitly enough that the architecture stays understandable as the project grows.

### PixiJS

Use PixiJS as the first rendering engine.

PixiJS is a good fit because v1 is focused on 2D visual experimentation, including:

- solid-color sticker tiles;
- flat cube layouts;
- floating face layouts;
- image tiles on cube faces;
- future gradient, blob, shader, or texture-based experiments.

Pixi should not own the cube state. Pixi should render a visual scene derived from the cube state.

## Scope of v1

v1 should include:

1. A pure Rubik's Cube model.
2. A standard set of legal Rubik's Cube moves.
3. A 2D visual scene representation.
4. One or two simple 2D projections.
5. A PixiJS renderer for solid-color stickers.
6. Basic animation between cube states.
7. Basic keyboard input for applying moves.

v1 should not include:

- full 3D rendering;
- soft-body or blob simulation;
- shader-based pigment fields;
- React UI;
- advanced controls;
- a full game progression system;
- solving logic;
- performance optimization beyond reasonable structure.

## Architecture Overview

The app should be organized around this pipeline:

```txt
CubeState
  -> Projection
  -> PositionedSticker[]
  -> Skin
  -> VisualSticker[]
  -> PixiRenderer
```

A slightly more concrete version:

```txt
pure cube model
  -> choose layout/projection
  -> choose visual skin/material
  -> build renderable scene
  -> draw/animate in PixiJS
```

The important separation:

- The cube model does not know about Pixi.
- The projection does not mutate the cube.
- The skin does not decide where stickers go.
- The renderer does not decide cube legality.

## Suggested File Structure

```txt
src/
  main.ts

  core/
    cube.ts
    moves.ts
    types.ts

  projection/
    types.ts
    floatingFaces.ts
    cubeNet.ts

  skin/
    types.ts
    solidColors.ts
    imageTiles.ts

  scene/
    buildScene.ts
    types.ts

  renderers/
    pixi/
      PixiRenderer.ts
      pixiTypes.ts

  input/
    keyboard.ts

  app/
    AppController.ts
```

This structure can change, but the conceptual boundaries should remain.

## Core Cube Model

The cube should be represented as 54 sticker positions: 6 faces with 9 stickers per face.

Each sticker should have a stable identity. This is essential for animation.

```ts
type Face = "U" | "D" | "F" | "B" | "L" | "R";

type Sticker = {
  id: string;        // stable identity, e.g. "U0", "U1", ...
  homeFace: Face;    // face where this sticker began in solved state
};

type CubeState = Record<Face, Sticker[]>; // 9 stickers per face
```

In the solved state:

```txt
U face contains U0-U8
D face contains D0-D8
F face contains F0-F8
B face contains B0-B8
L face contains L0-L8
R face contains R0-R8
```

When moves are applied, stickers move between positions, but their IDs do not change.

This lets the renderer understand that the same sticker has moved from one visual position to another.

## Moves

v1 should support the standard outer-layer Rubik's Cube moves:

```ts
type Move =
  | "U" | "U'" | "U2"
  | "D" | "D'" | "D2"
  | "F" | "F'" | "F2"
  | "B" | "B'" | "B2"
  | "L" | "L'" | "L2"
  | "R" | "R'" | "R2";
```

Internally, each move can be implemented as a permutation of sticker positions.

Preferred approach:

```ts
function applyMove(cube: CubeState, move: Move): CubeState
```

This function should:

- return a new cube state;
- not mutate the input cube;
- preserve sticker IDs;
- preserve the total set of stickers;
- be easy to test.

Optional helper:

```ts
function applyMoves(cube: CubeState, moves: Move[]): CubeState
```

## Projection Layer

The projection layer converts logical cube positions into spatial positions.

It answers the question:

> Where should each current cube position appear on screen?

A projection should not care whether the sticker is rendered as a color, an image tile, or something else.

Suggested types:

```ts
type Vec2 = {
  x: number;
  y: number;
};

type PositionedSticker = {
  id: string;
  sticker: Sticker;
  face: Face;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type Projection = (cube: CubeState) => PositionedSticker[];
```

The `face` and `index` fields describe the sticker's current logical position, not its original home position.

The `sticker.homeFace` describes where the sticker came from in the solved cube.

## Initial Projections

### 1. Floating Faces Projection

Render the six faces as six independent 3x3 square grids on screen.

This projection is likely the best first visual experiment because it directly supports the idea of seeing cube moves as strange spatial jumps across separated faces.

For v1, the face arrangement can be fixed rather than random.

Example layout:

```txt
U   D   F
B   L   R
```

Each face is rendered as a local 3x3 grid.

### 2. Cube Net Projection

Render the six cube faces as a 2D unfolded cube net.

Example layout:

```txt
      U
L     F     R     B
      D
```

This is less visually strange than floating faces, but it is useful for debugging because adjacency is easier to inspect.

The cube net projection can come after floating faces if we want to keep v1 smaller.

## Skin Layer

The skin layer converts stickers into visual materials.

It answers the question:

> What should each sticker look like?

The skin should not decide where the sticker is drawn.

Suggested type:

```ts
type RGB = {
  r: number;
  g: number;
  b: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Material =
  | { kind: "solid"; color: RGB }
  | { kind: "imageTile"; imageId: string; sourceRect: Rect };

type Skin = (positioned: PositionedSticker) => Material;
```

For v1, implement solid colors first.

Image tiles should be designed for, but they do not need to be implemented immediately unless the first solid-color version comes together quickly.

## Solid Color Skin

The simplest skin maps each sticker's `homeFace` to a color.

Example:

```ts
const faceColors: Record<Face, RGB> = {
  U: { r: 255, g: 255, b: 255 },
  D: { r: 255, g: 213, b: 0 },
  F: { r: 0, g: 155, b: 72 },
  B: { r: 0, g: 70, b: 173 },
  L: { r: 255, g: 88, b: 0 },
  R: { r: 183, g: 18, b: 52 },
};
```

The important point is that color is attached to sticker identity/home face, not current face.

A blue sticker remains blue no matter where it moves.

## Image Tile Skin

The image tile skin should support the future idea where each solved face contains an image, and each of the 9 stickers on that face carries one ninth of that image.

The model does not need to change much for this.

Each sticker already has:

```ts
id: string
homeFace: Face
```

We can derive the original tile index from the sticker ID or store it explicitly.

Possible expanded sticker type:

```ts
type Sticker = {
  id: string;
  homeFace: Face;
  homeIndex: number; // 0-8 in solved state
};
```

Then the skin can map:

```txt
homeFace -> imageId
homeIndex -> source rectangle within that image
```

Example:

```ts
const imageTileSkin: Skin = (positioned) => {
  const { homeFace, homeIndex } = positioned.sticker;

  return {
    kind: "imageTile",
    imageId: imageForFace[homeFace],
    sourceRect: sourceRectForTile(homeIndex),
  };
};
```

This keeps image rendering compatible with the same projection and animation system.

## Visual Scene

The scene builder combines projection and skin.

Suggested type:

```ts
type VisualSticker = PositionedSticker & {
  material: Material;
};

function buildScene(
  cube: CubeState,
  projection: Projection,
  skin: Skin
): VisualSticker[] {
  return projection(cube).map((positioned) => ({
    ...positioned,
    material: skin(positioned),
  }));
}
```

This gives us a clean mix-and-match structure:

```ts
buildScene(cube, floatingFacesProjection, solidColorSkin);
buildScene(cube, cubeNetProjection, solidColorSkin);
buildScene(cube, floatingFacesProjection, imageTileSkin);
```

## PixiJS Renderer

The Pixi renderer consumes `VisualSticker[]` and draws them.

It should maintain a map from sticker ID to Pixi display object:

```ts
const objectsByStickerId = new Map<string, PIXI.Container>();
```

On each scene update:

1. Find the visual sticker by ID.
2. Find or create the Pixi object for that ID.
3. Update or animate its position, size, rotation, and material.
4. Remove any objects no longer present, though for a normal cube this should rarely happen.

The stable ID is what makes animation straightforward.

## Animation Strategy

For v1, animate transforms only.

That means:

- x;
- y;
- width;
- height;
- rotation.

Material changes can be instant at first.

For each sticker, the renderer stores current display values and target display values.

Example:

```ts
type AnimatedValue = {
  current: number;
  target: number;
};
```

Or a fuller internal renderer type:

```ts
type RenderedSticker = {
  id: string;
  container: PIXI.Container;
  current: Transform2D;
  target: Transform2D;
};
```

On every animation frame:

```ts
current.x = lerp(current.x, target.x, amount);
current.y = lerp(current.y, target.y, amount);
```

A simple easing/tweening system is enough for v1.

No need for full physical animation yet.

## Input

Initial input can be keyboard-based.

Example mapping:

```txt
u -> U
d -> D
f -> F
b -> B
l -> L
r -> R
shift + key -> inverse move
number 2 after key, or alternate key mapping -> double move
```

This can be rough in v1.

The goal is simply to apply moves and observe rendering/animation behavior.

A later version can add buttons, dropdowns, presets, or React controls.

## App Controller

The app controller should hold the current app state.

```ts
type ProjectionId = "floatingFaces" | "cubeNet";
type SkinId = "solidColors" | "imageTiles";

type AppState = {
  cube: CubeState;
  projectionId: ProjectionId;
  skinId: SkinId;
};
```

Even without React, this explicit state object makes it easier to add React or another UI layer later.

Suggested controller responsibilities:

- initialize Pixi;
- create the solved cube;
- choose the initial projection and skin;
- listen for keyboard input;
- apply moves;
- rebuild the visual scene;
- tell Pixi renderer to update targets.

## Testing and Validation

At minimum, test the cube logic separately from rendering.

Useful invariants:

1. A solved cube contains exactly 54 stickers.
2. Sticker IDs are unique.
3. Applying any move preserves the same set of sticker IDs.
4. Applying a move four times returns to the original state.
5. Applying a move followed by its inverse returns to the original state.
6. Applying `U2` is equivalent to applying `U` twice.

These tests do not require Pixi.

They are pure model tests.

## First Milestone

The first satisfying milestone should be:

- Vite app runs locally;
- Pixi canvas appears;
- solved cube appears as six separated 3x3 faces;
- stickers are colored by home face;
- pressing move keys updates the cube;
- stickers animate to their new positions;
- cube logic remains independent from Pixi.

This milestone proves the main architecture.

## Second Milestone

After the first milestone, add one of:

1. cube net projection;
2. image tile skin;
3. projection switching;
4. subtle white color palette;
5. random floating face layout.

The best second milestone is probably image tile skin if the rendering feels stable, because it tests whether the material abstraction is useful.

## Design Guardrails

- Do not put Pixi objects inside the cube model.
- Do not mutate cube state in place unless there is a very deliberate reason.
- Do not make the first renderer too general.
- Do not solve future blob/shader problems in v1.
- Do preserve stable sticker IDs.
- Do make projections easy to swap.
- Do make skins easy to swap.
- Do keep the first version visually simple enough to finish.

## Notes for Future Expansion

The architecture should leave room for:

- image-based cube faces;
- subtle near-white face palettes;
- gradient materials;
- procedural blob materials;
- Pixi filters or shaders;
- randomized 2D layouts;
- partial visibility modes;
- Three.js or React Three Fiber 3D rendering;
- React UI controls.

These should not drive v1 implementation except where they inform clean boundaries.

The immediate priority is a small working visual system that makes it easy to ask:

> Does this projection feel interesting?