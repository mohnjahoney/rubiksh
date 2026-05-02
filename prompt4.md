

# Codex Prompt — Projection Config + Image Tile Bleed

You are continuing implementation of the modular Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase

This pass fixes the visual discontinuity in image-tile rendering caused by sticker gaps/padding.

---

## Problem

The image-tile skin currently slices each face image into a strict 3×3 grid.

That means the 9 tiles are contiguous in texture/image space.

However, the projections render the stickers with visible gaps between rows and columns.

So even when the cube is solved, the image tiles do not visually reconstruct the original face image because the screen-space layout has spacing that the image crop does not account for.

This creates visible seams/gaps in the reconstructed image.

In graphics terms, we need a small amount of **texture bleed / UV expansion / atlas padding** for each image tile.

---

## Goal

Add projection-specific layout config and use it to compute image-tile bleed.

When image stickers are rendered with gaps between them, each sticker should sample a slightly expanded region of the source image so the overall face still looks visually coherent.

The system should remain modular:

```txt
Projection config defines layout metrics
Projection uses config to place stickers
Image tile skin uses layout metrics to compute texture bleed
Renderer simply draws the resulting material
```

Do not hardcode gap values inside the image-tile skin or Pixi renderer.

---

## 1. Add Projection Config Type

Add a projection config type in the projection layer.

Suggested shape:

```ts
export type ProjectionConfig = {
  stickerSize: number;
  stickerGap: number;
  faceGap: number;
  cornerRadius: number;
};
```

Use names that fit the existing codebase if similar types already exist.

The important values are:

- `stickerSize`
- `stickerGap`
- `cornerRadius`

`faceGap` is useful for projections with separated faces, but does not necessarily affect image-tile bleed.

---

## 2. Give Each Projection Its Own Config

Each projection should own/export its own config.

For example:

```ts
export const floatingFacesGrid3x2Config: ProjectionConfig = {
  stickerSize: 80,
  stickerGap: 6,
  faceGap: 40,
  cornerRadius: 8,
};
```

Do this for:

- `FloatingFacesGrid3x2`
- `FloatingFacesHex`
- `CubeNetCross`

Use the existing layout values from each projection as the initial config values.

Do not change the visual layout unless necessary.

This pass should mostly extract existing constants into explicit configs.

---

## 3. Projection Registry Should Include Config

Update the projection registry so each projection ID maps to both:

- the projection function
- its projection config

Suggested shape:

```ts
type ProjectionEntry = {
  project: Projection;
  config: ProjectionConfig;
};

const projections: Record<ProjectionId, ProjectionEntry> = {
  floatingFacesGrid3x2: {
    project: floatingFacesGrid3x2,
    config: floatingFacesGrid3x2Config,
  },
  floatingFacesHex: {
    project: floatingFacesHex,
    config: floatingFacesHexConfig,
  },
  cubeNetCross: {
    project: cubeNetCross,
    config: cubeNetCrossConfig,
  },
};
```

Adjust names to match current code.

---

## 4. Projection Should Attach Layout Metadata

Update `PositionedSticker` so it includes layout metadata derived from the active projection config.

Suggested addition:

```ts
type PositionedSticker = {
  // existing fields...
  width: number;
  height: number;
  cornerRadius: number;
  layout: {
    stickerSize: number;
    stickerGap: number;
  };
};
```

The exact shape can vary, but the skin must be able to determine:

```txt
stickerGap / stickerSize
```

Do not make the skin import a specific projection config directly.

The skin should receive layout metadata through the positioned sticker.

---

## 5. Renderer Should Use Sticker Corner Radius

The Pixi renderer currently may have a hardcoded corner radius, such as `8`, when drawing the rounded rect and mask.

Replace hardcoded radius values with the `cornerRadius` supplied by the `VisualSticker` / `PositionedSticker`.

The renderer should draw:

- solid tile body
- image tile mask
- border

using the same corner radius.

This keeps rounded corners consistent with projection config.

---

## 6. Compute Image Tile Bleed in the Image Tile Skin

Update the image tile skin/source rect helper so each tile source rect is expanded based on layout gap.

Conceptually:

```txt
bleedRatio = stickerGap / stickerSize
```

Then convert that ratio into texture/source-image pixels.

For a centered square source crop of size `cropSize`, each nominal tile has:

```txt
tileSize = cropSize / 3
```

A reasonable first implementation:

```txt
bleedPx = tileSize * bleedRatio
```

Then expand the source rectangle by `bleedPx` on all sides.

Clamp the expanded source rect so it stays inside the centered square crop.

Important:

- Tile 0 should not sample outside the left/top of the square crop.
- Tile 8 should not sample outside the right/bottom of the square crop.
- Interior tiles can overlap neighboring regions.

---

## 7. Preserve Centered Square Crop

Keep the existing centered square crop rule:

1. Find the largest square that fits inside the source image.
2. Center that square within the source image.
3. Slice that square into 3×3 nominal tiles.
4. Expand each nominal tile by bleed.
5. Clamp the expanded tile to the square crop bounds.

Do not stretch non-square images into square images.

---

## 8. Recompute Bleed When Projection Changes

When switching projections:

- the active projection changes;
- the projection config may change;
- `PositionedSticker.layout` should change;
- image tile source rects should update accordingly.

The current cube state should not reset.

The current skin should not reset.

The same stickers should simply be reprojected and reskinned using the new layout metadata.

---

## 9. Keep Renderer Simple

Do not put bleed computation in the Pixi renderer.

The renderer should only receive an `imageTile` material with a final `sourceRect`.

The renderer can continue to create Pixi textures/sprites from that source rect.

In other words:

```txt
ImageTileSkin decides sourceRect
PixiRenderer draws sourceRect
```

---

## 10. Optional Debugging Aid

If simple to add, include a temporary/debug flag such as:

```ts
DEBUG_IMAGE_BLEED = true
```

or a configurable multiplier:

```ts
IMAGE_BLEED_MULTIPLIER = 1
```

This would make it easy to tune the effect.

For example:

```txt
bleedPx = tileSize * bleedRatio * IMAGE_BLEED_MULTIPLIER
```

This is optional but useful.

---

## Existing Features Must Keep Working

Do not break:

- solid color skin
- image tile skin
- projection switching
- debug sticker IDs
- reset
- scramble
- move history display
- undo
- cube logic tests

---

## Definition of Done

This pass is complete when:

- each projection has an explicit config;
- projection registry exposes both projection function and config;
- positioned/visual stickers carry layout metadata needed for bleed;
- renderer uses configured corner radius instead of hardcoded radius;
- image tile source rects expand slightly based on active projection’s sticker gap;
- expanded source rects are clamped inside the centered square crop;
- solved image faces appear more visually continuous despite sticker gaps;
- switching projections updates image bleed appropriately;
- app still runs with `npm run dev`;
- existing tests still pass.

Favor the smallest clean change that makes layout spacing and image bleed share the same source of truth.