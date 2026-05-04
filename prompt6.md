

# Codex Prompt — Phase 2: Move Config Into React State (No/Minimal UI)

You are continuing the migration to React for the Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase
- the Phase 1 changes (React shell mounting Pixi)

This pass moves **app configuration state** into React while preserving all existing behavior and keeping the Pixi renderer and cube logic unchanged.

---

## Goal

React owns the following state:

- current projection
- current skin (colors / image / etc.)
- debug flag (on/off)

These values should be passed into the existing controller/renderer so the app updates when they change.

No substantial UI is required yet (a minimal control or even no visible UI is acceptable). Keyboard controls should continue to work.

---

## What React Is Responsible For In This Pass

React should:

- hold app config in `useState`
- update config in response to events (keyboard or temporary controls)
- pass config changes into the existing controller

---

## What Should NOT Change

Do NOT modify:

- cube state or move logic
- projection implementations
- skin implementations
- Pixi renderer internals
- animation system

Keep the architecture:

```
React (state)
  → Controller (imperative bridge)
    → Projection / Skin
      → PixiRenderer
```

---

## 1. Define React State

In `App.tsx`, add state:

```tsx
const [projectionId, setProjectionId] = useState<ProjectionId>(initialProjection);
const [skinId, setSkinId] = useState<SkinId>(initialSkin);
const [debug, setDebug] = useState<boolean>(false);
```

Use existing types/enums if present.

---

## 2. Bridge React → Existing Controller

Your existing Pixi controller should expose imperative setters such as:

```ts
setProjection(id: ProjectionId)
setSkin(id: SkinId)
setDebug(flag: boolean)
```

If they do not exist, add minimal methods to the controller (do not refactor deeply).

In `App.tsx`, after controller initialization, add effects:

```tsx
useEffect(() => {
  controller.setProjection(projectionId);
}, [projectionId]);

useEffect(() => {
  controller.setSkin(skinId);
}, [skinId]);

useEffect(() => {
  controller.setDebug(debug);
}, [debug]);
```

---

## 3. Keep Keyboard Controls Working

If keyboard handlers currently change projection/skin/debug directly, modify them so they call the React setters instead.

Example:

```ts
// instead of controller.setProjection(...)
setProjectionId(nextProjection);
```

This keeps React as the single source of truth.

Keyboard shortcuts should still function exactly as before.

---

## 4. Minimal Temporary Controls (Optional but Helpful)

You may add very simple temporary controls inside `App` (not styled):

```tsx
<button onClick={() => setDebug(d => !d)}>Toggle Debug</button>
```

Or simple `<select>` elements for projection/skin.

Keep this minimal—full UI comes in Phase 3.

---

## 5. Initialization

On mount, initialize React state to match current defaults used by the controller.

Avoid double-initialization issues.

---

## Constraints

- Do not move cube logic into React
- Do not rewrite Pixi renderer
- Do not introduce camera functionality yet
- Keep this pass focused on state ownership

---

## Controller Setter Requirements

The following methods must be safe to call multiple times with the same value:

- setProjection
- setSkin
- setDebug

They should:

- avoid unnecessary recomputation if the value has not changed
- avoid rebuilding the scene redundantly

Example:

```ts
if (this.currentProjection === id) return;
```

---

## Initialization Safety

React effects must not call controller methods before the controller is initialized.

Use a ref and guard access:

```ts
if (!controllerRef.current) return;
```

---

## Initial State Ownership

React is the source of truth for configuration.

On mount:

- React state should be initialized to the desired defaults
- Then React should push those values into the controller

Do NOT read initial values from the controller.

---
---

## Definition of Done

- React holds projection/skin/debug state
- Changing state updates the rendered scene
- Keyboard controls still work
- No duplicate logic paths for state
- App still builds and runs

---

## What We Should Be Able To Test / Observe

After this pass, we should be able to:

1. Run:

   ```bash
   npm run dev
   ```

2. See the same cube visualization.

3. Change projection via keyboard and see React state update correctly.

4. Change skin via keyboard and see updates reflected.

5. Toggle debug and see expected debug output.

6. (If temporary controls added) use them to change projection/skin/debug.

7. Confirm that React state is the source of truth (no desync between keyboard and UI).

Favor minimal, clean integration over large refactors.