# Codex Prompt — Phase 1 React Migration: Shell Only

You are adding React to the existing Vite + TypeScript + PixiJS Rubik’s Cube visualization app.

Before making changes, read:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- current codebase

This pass should introduce React as a thin application shell without changing the cube model, Pixi renderer, projections, skins, move logic, keyboard behavior, or visual output.

---

## Goal

Add React to the project while preserving the current app behavior.

The app should still look and behave exactly as it does now, but the Pixi canvas should be mounted through a React component.

This is a setup/refactor step only.

---

## What React Is Responsible For In This Pass

React should be responsible for:

- mounting the application shell;
- providing a DOM container for Pixi;
- owning the lifecycle of the Pixi app/controller at the top level;
- eventually becoming the home for UI controls in later passes.

For now, React should **not** manage projection state, skin state, cube state, move history, debug flags, or camera state.

---

## What React Is NOT Responsible For In This Pass

Do not move these into React yet:

- cube state;
- Rubik’s Cube move logic;
- projection registry;
- skin selection;
- Pixi drawing logic;
- animation logic;
- keyboard controls;
- move history;
- reset/scramble/undo behavior.

React should not become the cube model or the renderer.

Keep the architecture:

```txt
Cube logic = pure TypeScript
Projection = layout
Skin = appearance
PixiRenderer = drawing/animation
React = shell / DOM mounting layer

---

## Install React

Add React dependencies:

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

---

## Update Entry Point

Convert the current app entry point so it renders a React component.

Likely changes:

- create `src/App.tsx`
- update `src/main.ts` or `src/main.tsx`
- if needed, rename `main.ts` to `main.tsx`
- mount React into `#app` or whatever root element already exists in `index.html`

Example shape:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Use the actual root element from the existing project.

---

## Create App Component

Create an `App` component that renders:

```tsx
<div className="app-shell">
  <div ref={pixiContainerRef} className="pixi-host" />
</div>
```

The Pixi app/controller should mount into `pixiContainerRef.current`.

Use `useEffect` to initialize the existing app/controller once the DOM node exists.

Example conceptual shape:

```tsx
export function App() {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pixiContainerRef.current) return;

    const controller = createExistingPixiAppOrController({
      container: pixiContainerRef.current,
    });

    return () => {
      controller.destroy?.();
    };
  }, []);

  return (
    <div className="app-shell">
      <div ref={pixiContainerRef} className="pixi-host" />
    </div>
  );
}
```

Adapt this to the current codebase.

Do not duplicate initialization logic if a controller already exists. Prefer extracting the existing startup code into a reusable function if needed.

---

## Refactor Existing Startup Code Carefully

If current `main.ts` directly creates the Pixi app, move that logic into a function such as:

```ts
createRubikApp(container: HTMLElement)
```

or:

```ts
createAppController(container: HTMLElement)
```

That function should:

- initialize Pixi;
- attach the Pixi canvas to the provided container;
- set up the existing keyboard controls;
- preserve current behavior;
- return a cleanup/destroy function if practical.

Do not rewrite the app architecture.

This should be a minimal extraction so React can call the existing initialization code.

---

## Cleanup

If possible, return a cleanup function from the controller setup:

```ts
return {
  destroy() {
    // remove event listeners
    // destroy Pixi app/renderer if appropriate
  }
}
```

This matters because React StrictMode may mount/unmount during development.

If StrictMode causes double initialization problems, either:

- make cleanup robust, or
- temporarily remove `React.StrictMode`.

Prefer robust cleanup if simple.

---

## Styling

Keep styling minimal.

Do not build UI controls yet.

The app should still fill the page similarly to before.

If needed, add simple CSS:

```css
html,
body,
#app {
  margin: 0;
  width: 100%;
  height: 100%;
}

.app-shell,
.pixi-host {
  width: 100%;
  height: 100%;
}
```

---

## Constraints

- Do not change cube logic.
- Do not change projection behavior.
- Do not change skin behavior.
- Do not change keyboard mappings.
- Do not change image tile rendering.
- Do not add camera features yet.
- Do not add dropdowns/buttons yet.
- Keep this pass focused on introducing React as a shell.

---

## Critical Architectural Constraint

React must not:

- hold or mutate cube state
- call cube logic directly
- influence projection calculations
- influence rendering logic

React may only:

- mount the Pixi container
- initialize the existing controller
- later provide UI inputs that call into existing APIs

Violating this boundary is not allowed.

---

## Behavioral Invariance Requirement

After this change:

- Visual output must be pixel-identical
- Animation timing must be unchanged
- Keyboard responsiveness must be unchanged

If anything visually changes, treat it as a bug.

---

## StrictMode / Double Initialization

Ensure that:

- Pixi app is not initialized twice
- Event listeners are not duplicated

If necessary:

- track initialization via a ref
- or make cleanup idempotent

React StrictMode may mount/unmount components more than once in development.

Prefer robust cleanup over disabling StrictMode, but disabling StrictMode temporarily is acceptable if needed.

---

## Definition of Done

This pass is complete when:

- React is installed and used as the app entry point.
- The Pixi canvas is mounted through a React component.
- The existing cube visualization appears as before.
- Existing keyboard controls still work.
- Projection switching still works.
- Skin switching still works.
- Reset, scramble, undo, and move history still work.
- Image tile mode still works.
- `npm run dev` works.
- `npm run build` works.
- No duplicate canvases appear during development.
- No obvious event listener duplication occurs.

---

## What We Should Be Able To Test / Observe

After this pass, we should be able to:

1. Start the app with:

   ```bash
   npm run dev
   ```

2. See the same Pixi-rendered Rubik’s Cube view as before.

3. Use all existing keyboard shortcuts:
   - move keys;
   - projection switching;
   - skin switching;
   - reset;
   - scramble;
   - undo.

4. Confirm there is only one Pixi canvas in the DOM.

5. Confirm no React UI controls exist yet.

6. Confirm the codebase now has a React shell that can support UI controls in the next pass.

Favor the smallest safe React integration.