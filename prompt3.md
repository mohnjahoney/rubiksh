

# Codex Prompt — Image Tile Face Rendering

You are continuing implementation of the modular Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase

This pass adds image-based face rendering while preserving the existing architecture.

---

## Goal

Add a new visual skin/material mode where each solved cube face is represented by an image.

Each face image should be sliced into a 3×3 grid, and each sticker from that face should carry its corresponding image tile as it moves around the cube.

For example:

- sticker `U0` shows the upper-left ninth of image `U`
- sticker `U4` shows the center ninth of image `U`
- sticker `D8` shows the lower-right ninth of image `D`

The cube logic should not change except where needed to ensure every sticker has stable access to its original home face and home index.

---

## Image Assets

The user has added six image files, named by cube face:

```txt
U
D
F
B
L
R
```

Find the actual extensions in the project (`.jpg`, `.jpeg`, `.png`, etc.) and import them appropriately.

Preferred location should be something like:

```txt
src/assets/images/faces/
  U.jpg
  D.jpg
  F.jpg
  B.jpg
  L.jpg
  R.jpg
```

If the files are elsewhere, use their existing location and keep imports clean.

---

## Important Cropping Rule

The images may not be square.

For each source image:

1. Determine the largest square crop that fits inside the image.
2. Center that square crop within the image.
3. Slice that centered square crop into a 3×3 grid.
4. Use those 9 crop regions as the image tiles for the stickers.

Examples:

- If image is `1200 × 900`, use a centered `900 × 900` crop.
- If image is `800 × 1000`, use a centered `800 × 800` crop.

Do not stretch the full image into a square.

The result should preserve aspect ratio and use the center of the image.

---

## Architecture Requirements

Preserve the existing pipeline:

```txt
CubeState
  -> Projection
  -> PositionedSticker[]
  -> Skin
  -> VisualSticker[]
  -> PixiRenderer
```

This feature should be implemented as a **skin/material**, not as a projection.

Projection decides where stickers go.

Skin decides what stickers look like.

Do not put image logic into cube logic or projection logic.

---

## Sticker Data Requirement

Each sticker needs to know:

```ts
homeFace: Face
homeIndex: number
```

If `homeIndex` does not already exist, add it to the sticker model.

In the solved cube:

```txt
U0 has homeFace U and homeIndex 0
U1 has homeFace U and homeIndex 1
...
R8 has homeFace R and homeIndex 8
```

Moves must preserve both `homeFace` and `homeIndex` because these describe sticker identity, not current position.

---

## Material Type

If not already present, add support for an image tile material.

Suggested shape:

```ts
type Material =
  | { kind: "solid"; color: RGB }
  | {
      kind: "imageTile";
      imageId: Face;
      sourceRect: Rect;
    };
```

`sourceRect` should describe the crop area within the original image/texture.

---

## Image Tile Skin

Implement a new skin, for example:

```ts
imageTileSkin(positioned: PositionedSticker): Material
```

This skin should:

1. Look at `positioned.sticker.homeFace`.
2. Look at `positioned.sticker.homeIndex`.
3. Select the corresponding face image.
4. Compute the centered-square crop for that image.
5. Return the source rectangle for the appropriate 3×3 tile.

Important:

- The tile should be based on the sticker’s original `homeIndex`, not its current face/index.
- A sticker should carry its image fragment as it moves.

---

## Pixi Renderer Changes

Update the Pixi renderer so it can draw both:

- `solid` materials
- `imageTile` materials

For `imageTile` materials:

- load each face image as a Pixi texture;
- create a cropped texture for the source rectangle;
- render the sticker as a sprite using that cropped texture;
- size the sprite to the projected sticker width/height.

Keep one visual object per sticker ID.

If the material kind changes, update or recreate the child display object inside the sticker container as needed, but keep the sticker container keyed by stable sticker ID.

---

## Skin Switching

Add a way to switch between skins:

```txt
c -> solid color skin
i -> image tile skin
```

The current cube state should not reset when switching skins.

Switching skins should simply rebuild/update the visual scene using the same cube state and current projection.

---

## Move History / Existing Features

Do not break existing features from the previous pass:

- projection switching
- sticker ID debug labels
- reset
- scramble
- move history display
- undo
- cube tests

Image tiles should work across all current 2D projections:

- `FloatingFacesGrid3x2`
- `FloatingFacesHex`
- `CubeNetCross`

---

## Implementation Notes

Keep the first implementation simple.

It is okay to compute source rectangles after textures/images are loaded, but avoid doing expensive work every frame.

Preferred approach:

- load/cache face textures once;
- compute/cache 9 tile rectangles per face once;
- reuse those tiles during rendering.

---

## Definition of Done

This pass is complete when:

- app runs with `npm run dev`;
- pressing `i` switches to image tile skin;
- pressing `c` switches back to solid color skin;
- each solved face displays its corresponding face image sliced into 9 tiles;
- non-square images are center-cropped to the largest possible square before slicing;
- image fragments move with their original stickers when cube moves are applied;
- image skin works with all existing projections;
- existing reset/scramble/undo/history/debug features still work;
- cube logic remains independent from Pixi and image loading.

Favor the simplest clean implementation that preserves the architecture.