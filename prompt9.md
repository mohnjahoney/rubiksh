

# Codex Prompt — Phase 5: Add Camera Capture UI (React)

You are adding camera-based image capture to the Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase
- Phase 1–4 changes (React shell + state + UI + photo storage)

This pass introduces a **camera capture UI** that allows the user to take photos for each cube face (`U D F B L R`) and store them in localStorage.

---

## Goal

Allow the user to:

- open a camera capture overlay
- take 6 photos (one for each face)
- store each photo in localStorage
- immediately see those images applied to the cube

---

## Responsibilities

React should:

- render a camera overlay/modal
- manage capture state (current face, progress)
- interact with browser camera APIs
- store captured images via `photoStorage`

Pixi and cube logic remain unchanged.

---

## Critical Image Flow Constraint

CameraCapture must NOT interact with rendering directly.

It must only:

- produce a dataUrl
- call setPhoto(face, dataUrl)

The existing image resolution system will handle:

- localStorage → image resolution
- renderer updates

Do NOT:

- call Pixi APIs
- modify textures directly
- bypass faceImages or imageTiles

---

## 1. Add Camera Overlay Component

Create a new component:

```
src/camera/CameraCapture.tsx
```

This component should:

- render a full-screen or centered overlay
- contain:
  - `<video>` element for live camera feed
  - instruction text (e.g., "Capture face U")
  - capture button
  - cancel button

Example structure:

```tsx
<div className="camera-overlay">
  <video ref={videoRef} autoPlay playsInline />
  <p>Capture face {currentFace}</p>
  <button onClick={handleCapture}>Capture</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

---

## 2. Camera Access

On mount, request camera access:

```ts
navigator.mediaDevices.getUserMedia({ video: true })
```

Attach stream to video element:

```ts
videoRef.current.srcObject = stream;
```

Handle permission failure gracefully.

---

## 3. Capture Flow

Define face order:

```ts
const FACE_SEQUENCE: FaceId[] = ["U", "D", "F", "B", "L", "R"];
```

Maintain state:

```ts
const [index, setIndex] = useState(0);
const currentFace = FACE_SEQUENCE[index];
```

Reset index to 0 each time the overlay opens.

- Do not modify anything else.

On capture:

1. draw current video frame to a canvas
2. center-crop to square
3. resize to ~512–768 px
4. convert to JPEG data URL
5. call:

```ts
setPhoto(currentFace, dataUrl);
```

6. advance to next face

When all faces captured:

- close overlay
- optionally trigger skin refresh

---

## 4. Image Capture Implementation

Use a hidden canvas:

```ts
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
```

Steps:

```ts
// assume videoWidth / videoHeight
const size = Math.min(videoWidth, videoHeight);
const sx = (videoWidth - size) / 2;
const sy = (videoHeight - size) / 2;

canvas.width = 512;
canvas.height = 512;

ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);

const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
```

---

## 5. Integrate With App

In `App.tsx`:

- add state:

```tsx
const [cameraOpen, setCameraOpen] = useState(false);
```

- add button in UI:

```tsx
<button onClick={() => setCameraOpen(true)}>Capture Photos</button>
```

- optionally add keyboard shortcut (`p`)

- conditionally render:

```tsx
{cameraOpen && (
  <CameraCapture onClose={() => setCameraOpen(false)} />
)}
```

---

## 6. Cleanup

When overlay closes:

- stop camera stream:

```ts
stream.getTracks().forEach(track => track.stop());
```

---

## Stream Lifecycle Safety

Ensure camera stream is:

- created once on mount
- cleaned up on unmount

Cleanup must always run:

```ts
return () => {
  stream.getTracks().forEach(track => track.stop());
};
```

Guard against double-mount in React StrictMode.

---

## 7. Refresh Images

## Image Update Propagation

After calling setPhoto, the cube must update using the existing image pipeline.

Use the same mechanism introduced in Phase 4A:

- controller.refreshSkin()
OR
- re-call setSkin(currentSkin)

Do not introduce new rendering pathways.

---

## Constraints

- Do not refactor Pixi renderer
- Do not modify cube logic
- Keep UI simple
- No need for retake/delete UI yet

---

## Rendering Invariance Requirement

This change must not affect rendering when camera is not used.

Before opening the camera:

- cube should behave exactly as before
- no additional console warnings
- no changes to PixiRenderer behavior

If rendering changes, treat it as a bug.

---

## Definition of Done

- Camera overlay opens
- Permission request works
- User can capture 6 images
- Images stored in localStorage
- Cube updates to show captured images
- Overlay closes after completion
- App builds and runs

---

## What We Should Be Able To Test / Observe

After this pass, we should be able to:

1. Run:

   ```bash
   npm run dev
   ```

2. Click "Capture Photos" (or press `p`).

3. See camera overlay.

4. Capture images for all 6 faces.

5. Observe cube updating with captured images.

6. Refresh page and confirm images persist.

7. Confirm no regressions in cube interaction.

Favor simplicity and reliability over polish.
