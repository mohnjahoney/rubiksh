

# Rubik's Cube App — Core Architecture Principles

## Purpose

This document defines the core architectural philosophy of the project.

It is not about implementation details. It is about preserving the structure and intent of the system as it evolves.

As the project grows (more renderers, more visual ideas, more interaction modes), these principles help ensure the system remains coherent and flexible.

---

## Core Mental Model

```txt
CubeState (logic)
  → Projection (layout)
  → Skin (appearance)
  → Renderer (drawing)
```

Each layer has a single responsibility.

---

## 1. Cube Logic is Pure and Independent

The cube model:

- represents the state of the cube;
- defines legal moves;
- applies transformations;
- contains no rendering or UI logic.

Rules:

- No PixiJS, Three.js, DOM, or rendering objects in cube code.
- No knowledge of screen position or layout.
- No mutation of external state.

The cube is a pure data structure and transformation system.

---

## 2. Stickers Have Stable Identity

Each sticker has a unique, persistent ID.

This ID does not change when the cube is manipulated.

Why this matters:

- enables animation (movement of the *same* object);
- allows renderers to track objects across frames;
- avoids flickering and re-creation of visual elements.

Rule:

> Identity belongs to the sticker, not the position.

---

## 3. Projection Defines Space, Not Appearance

Projection is responsible for answering:

> Where should each sticker be located in space?

Projection:

- maps cube state → positions;
- defines layout (net, floating faces, etc.);
- may define size and rotation;
- does not define color, texture, or style.

Rules:

- Projection does not modify cube state.
- Projection does not decide visual styling.

---

## 4. Skin Defines Appearance, Not Space

Skin is responsible for answering:

> What should each sticker look like?

Skin:

- maps sticker identity → material;
- determines color, image, gradient, or future procedural style;
- does not define position or layout.

Rules:

- Skin does not decide geometry or placement.
- Skin does not depend on renderer implementation.

---

## 5. Renderer is a Consumer, Not an Authority

The renderer:

- receives a fully described visual scene;
- creates and updates visual objects;
- handles animation between states;
- does not determine cube logic or layout rules.

Rules:

- Renderer does not modify cube state.
- Renderer does not compute projections.
- Renderer should be replaceable.

We should be able to swap:

- PixiJS renderer
- Canvas renderer
- Three.js renderer

without rewriting core logic.

---

## 6. Separate Data from Display Objects

Do not mix application state with rendering objects.

Bad:

```ts
cubeState.stickers[0].pixiObject = ...
```

Good:

```ts
Map<stickerId, PixiObject>
```

This separation:

- keeps the model testable;
- prevents hidden coupling;
- allows multiple renderers;
- avoids memory and lifecycle bugs.

---

## 7. Prefer Composition Over Generalization

Do not attempt to design a perfect universal abstraction early.

Instead:

- keep types simple;
- compose projection + skin + renderer;
- extend only when necessary.

Example:

```ts
buildScene(cube, floatingFacesProjection, solidColorSkin);
buildScene(cube, cubeNetProjection, imageTileSkin);
```

Avoid overengineering abstractions for future blob/shader ideas in v1.

---

## 8. Keep Early Versions Discrete and Simple

v1 should use:

- discrete sticker positions;
- solid colors;
- simple transforms.

Do not prematurely introduce:

- continuous fields;
- physics simulation;
- shader complexity.

These can be layered on later.

---

## 9. Explicit App State

Even without a UI framework, maintain a clear app state object.

Example:

```ts
type AppState = {
  cube: CubeState;
  projectionId: string;
  skinId: string;
};
```

This makes it easy to:

- integrate React later;
- switch projections and skins;
- debug state transitions.

---

## 10. Animation is Derived from State Changes

Animation should emerge from differences between:

- previous visual state;
- next visual state.

The system should:

- update targets when cube state changes;
- interpolate over time;
- not encode animation logic into the cube model.

---

## 11. Design for Replaceable Renderers

The system should support multiple renderers over time:

- PixiJS (2D)
- Canvas (2D)
- Three.js (3D)

This implies:

- renderer-agnostic scene descriptions;
- no renderer-specific logic in core layers;
- clean boundaries between scene and rendering.

---

## 12. Optimize for Exploration, Not Perfection

This project is exploratory.

The architecture should make it easy to ask:

- “What does this projection feel like?”
- “What happens if we change the skin?”
- “What if the layout is unstable?”

Not:

- “Is this the perfect abstraction?”

---

## Summary

Key principles:

- Keep cube logic pure
- Preserve stable sticker identity
- Separate projection, skin, and rendering
- Avoid coupling state to rendering objects
- Prefer simple composition over early abstraction
- Design for renderer flexibility

These principles are more important than any specific implementation detail.

They should guide decisions as the system evolves.