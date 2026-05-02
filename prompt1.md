

# Codex Prompt — Initial Implementation (v1)

You are helping implement a modular Rubik’s Cube visualization app using TypeScript, Vite, and PixiJS.

Before writing code, carefully read and follow the architecture and constraints defined in these documents:

- `TechnicalSpecv1`
- `CoreArchitecturePrinciples.md`
- `IdeaBank.md` (for context only, not for scope)

---

## Objective

Implement the **first working version** of the system with the following goals:

1. Represent a Rubik’s Cube state in TypeScript.
2. Implement basic cube moves (U, D, F, B, L, R and inverses).
3. Project the cube into a 2D layout (start with floating faces).
4. Render the result using PixiJS.
5. Animate sticker movement using stable IDs.
6. Support keyboard input to trigger moves.

Do **not** implement advanced ideas from the Idea Bank yet.

---

## Core Requirements

### 1. Architecture

Follow this pipeline strictly:

```txt
CubeState
  -> Projection
  -> PositionedSticker[]
  -> Skin
  -> VisualSticker[]
  -> PixiRenderer
```

Enforce separation of concerns:

- Cube logic is pure and independent
- Projection defines layout only
- Skin defines appearance only
- Renderer only draws and animates

---

### 2. Cube Model

- Represent the cube as 6 faces × 9 stickers
- Each sticker must have a **stable ID**
- Moves should permute stickers, not recreate them
- Do not mutate cube state in place

---

### 3. Projection (start here)

Implement **floating faces projection**:

- Six 3×3 grids
- Fixed positions on screen
- Each face rendered independently

---

### 4. Skin (start simple)

Implement **solid color skin**:

- Each sticker color determined by its `homeFace`
- No gradients, no images yet

---

### 5. Pixi Renderer

- Use PixiJS to render stickers
- One Pixi object per sticker ID
- Maintain a map: `stickerId -> Pixi object`
- Update position + size + rotation per frame

---

### 6. Animation

- Animate movement between states
- Use interpolation (lerp) for position
- Do not animate materials yet

---

### 7. Input

Implement basic keyboard controls:

```txt
u d f b l r → apply moves
shift + key → inverse move
```

---

## Implementation Strategy

Build incrementally in this order:

1. Cube data model + solved state
2. Move application logic
3. Projection → positions
4. Scene builder (projection + skin)
5. Pixi renderer (static first)
6. Animation layer
7. Keyboard input

---

## Constraints

- Do not introduce React
- Do not introduce Three.js
- Do not implement blob/gradient systems yet
- Do not over-generalize types prematurely

---

## Output Expectations

Produce:

- Clear file structure under `src/`
- Well-separated modules (core / projection / skin / renderer)
- Minimal but clean TypeScript types
- Code that runs with `npm run dev`

---

## Guiding Principle

Favor simplicity and clarity over abstraction.

The goal is to reach a working system quickly that allows visual experimentation.

---

If unsure about a design decision, choose the simplest option that respects the architecture.