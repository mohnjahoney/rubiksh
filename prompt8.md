# Codex Prompt — Phase 4A: Photo Image Source Integration (No Camera)

You are adding support for user-provided face images (photos) to the Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase
- Phase 1–3 changes (React shell + state + UI)

This pass introduces a **photo-backed image source system** using `localStorage`, without implementing camera capture or UI.

---

## Goal

Integrate a photo-based image source system into the existing cube rendering pipeline.

Photos come from `localStorage` and override default images.

No camera functionality in this pass.

---

## Responsibilities

This pass should:

- add a photo storage system (localStorage)
- extend the face image resolution logic
- ensure renderer updates correctly when images change

This pass should NOT:

- add camera APIs
- add React camera UI
- modify Pixi renderer internals
- change cube logic
- change image tiling math

---

## 1. Add Photo Storage Module

Create a new module:

```
src/photo/photoStorage.ts
```

This module should provide:

```ts
export type FaceId = "U" | "D" | "F" | "B" | "L" | "R";

export function getPhoto(face: FaceId): string | null;
export function setPhoto(face: FaceId, dataUrl: string): void;
export function clearPhoto(face: FaceId): void;
export function clearAllPhotos(): void;
```

Use keys like:

```txt
rubiksh.photo.U
rubiksh.photo.D
...
```

Images should be stored as data URLs.

---

## 2. Extend Face Image Resolution

Update the logic that resolves face images (likely in `faceImages.ts` or equivalent).

Current behavior:

```ts
{ url: "/assets/.../U.jpg" }
```

New behavior:

```ts
const photo = getPhoto(face);

if (photo) {
  return { url: photo };
}

return defaultImage;
```

Ensure this integrates cleanly with existing image loading.

Pixi should be able to load data URLs directly.

---

## 3. Image Update Propagation (Critical)

When a photo is updated, the renderer must reflect the change.

Implement a simple and explicit mechanism such as:

- controller.refreshSkin()
- or re-call setSkin()
- or version key invalidation

Keep this minimal and localized.

Do NOT introduce complex caching systems.

---

## 4. Debug / Test Hook

Add a temporary global hook to verify functionality:

```ts
(window as any).rubiksh = {
  setPhoto,
  clearPhoto,
  clearAllPhotos,
};
```

This allows testing via:

```js
rubiksh.setPhoto("U", dataUrl)
```

---

## Constraints

- Do not add camera functionality
- Do not modify Pixi renderer
- Do not change cube logic
- Do not change projection logic
- Keep implementation minimal and modular

---

## Definition of Done

- `photoStorage.ts` exists and works
- face image resolution checks localStorage first
- default images still work when no photo exists
- updating a photo updates rendering
- removing a photo restores default image
- no crashes when photos are missing
- app builds and runs

---

## What We Should Be Able To Test / Observe

After this pass, we should be able to:

1. Run:

   ```bash
   npm run dev
   ```

2. See the cube render with default images as before.

3. Manually insert a photo via:

   ```js
   localStorage.setItem("rubiksh.photo.U", dataUrl)
   ```

4. Refresh and observe that face U now uses the stored image.

5. Use the debug hook:

   ```js
   rubiksh.setPhoto("U", dataUrl)
   ```

6. Confirm that updating the photo updates rendering immediately.

7. Remove the photo and confirm it falls back to the default image.

8. Confirm no regressions in rendering or interaction.

---

Favor clean separation between storage, image resolution, and rendering.
