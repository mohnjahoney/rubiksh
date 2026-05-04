

# Codex Prompt — Phase 3: Add Basic UI Controls (React)

You are continuing the migration to React for the Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase
- Phase 1 (React shell)
- Phase 2 (React owns config state)

This pass adds a simple, usable UI for controlling the app via React while preserving all existing behavior and keeping Pixi and cube logic unchanged.

---

## Goal

Provide a minimal but usable control surface in React for:

- projection selection
- skin selection
- debug toggle
- reset
- scramble
- undo

Keyboard controls should continue to work exactly as before.

The UI should be simple and unstyled (functional over pretty).

---

## Responsibilities

React should:

- render basic controls (dropdowns / buttons)
- update React state (already created in Phase 2)
- call controller methods for imperative actions (reset/scramble/undo)

Pixi and cube logic remain unchanged.

---

## 1. Add Control Panel Component

Create a simple control panel inside `App.tsx` (or a new component like `Controls.tsx`).

Structure example:

```tsx
<div className="controls">
  <label>
    Projection
    <select value={projectionId} onChange={...}>
      {projectionOptions.map(...) }
    </select>
  </label>

  <label>
    Skin
    <select value={skinId} onChange={...}>
      {skinOptions.map(...) }
    </select>
  </label>

  <button onClick={() => setDebug(d => !d)}>
    Toggle Debug
  </button>

  <button onClick={() => controller.reset()}>
    Reset
  </button>

  <button onClick={() => controller.scramble()}>
    Scramble
  </button>

  <button onClick={() => controller.undo()}>
    Undo
  </button>
</div>
```

Use existing projection/skin registries to populate options.

---

## 2. Wire Controls to State

Ensure:

```tsx
onChange={(e) => setProjectionId(e.target.value as ProjectionId)}
onChange={(e) => setSkinId(e.target.value as SkinId)}
```

State changes should flow through existing `useEffect` hooks from Phase 2.

---

## 3. Imperative Actions

For actions that are not pure state (reset, scramble, undo), call controller methods directly.

Example:

```tsx
<button onClick={() => controller.scramble()}>
```

Do not move these into React state.

---

## 4. Layout

Place controls in a simple overlay or side panel.

Example:

```tsx
<div className="app-shell">
  <div className="controls" />
  <div ref={pixiContainerRef} className="pixi-host" />
</div>
```

Minimal CSS is fine:

```css
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.9);
  padding: 8px;
  border-radius: 4px;
}
```

---

## 5. Keep Keyboard Shortcuts

Do not remove or break keyboard shortcuts.

UI and keyboard should both update the same React state.

---

## Constraints

- Do not refactor Pixi renderer
- Do not change cube logic
- Do not introduce camera yet
- Keep UI minimal

---

## Definition of Done

- Dropdowns exist for projection and skin
- Buttons exist for debug/reset/scramble/undo
- UI updates the rendered scene correctly
- Keyboard shortcuts still work
- No duplication of state logic
- App builds and runs

---

## What We Should Be Able To Test / Observe

After this pass, we should be able to:

1. Run:

   ```bash
   npm run dev
   ```

2. See a control panel overlay.

3. Change projection via dropdown and see the cube update.

4. Change skin via dropdown and see updates.

5. Click "Reset", "Scramble", "Undo" and see correct behavior.

6. Toggle debug and observe expected debug output.

7. Still use all keyboard shortcuts successfully.

8. Confirm UI and keyboard stay in sync.

Favor clarity and minimalism over styling.