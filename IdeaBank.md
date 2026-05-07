

# Rubik's Cube App — Idea Bank

This document captures exploratory ideas without committing to implementation details.

The goal is to preserve creative directions so they can be revisited later.

---

## 2D Layout / Projection Ideas

### Floating Faces
- Six faces rendered as independent 3×3 grids
- Faces do not touch
- Cube moves appear as pieces jumping between faces

### Cube Net
- Standard unfolded cube (T / cross shape)
- Useful for debugging adjacency

### Randomized Face Layout
- Faces appear in random positions each time
- Underlying cube remains consistent
- Prevents spatial memorization

### Partial Visibility
- Only some faces visible at a time
- Others hidden or faded

---

## Visual / Material Ideas

### Solid Color Stickers
- Standard cube colors
- Clean baseline for testing

### Subtle Whites Cube
- All faces are different shades of white
- Differences barely perceptible when solved
- Mixed faces reveal subtle variation

### Image Tile Faces
- Each face is a 3×3 slice of an image
- Example: cats, faces, objects
- Solving reconstructs the image

### Symbol-Based Stickers
- Shapes or icons instead of colors
- Possibly harder to parse than colors

---

## Continuous / Organic Rendering Ideas

### Pigment / Ink Cube
- Stickers rendered as blobs of color
- Colors blend slightly at boundaries
- Movement feels like dragging ink

### Viscous / Blob Cube
- Cube appears soft and deformable
- Stickers are raised blobs
- Movement resembles kneading material

### Gradient Faces
- Faces rendered as continuous gradients
- Stickers influence regions rather than hard edges

---

## 3D Ideas

### Standard 3D Cube
- Basic cube with colored faces
- True spatial rotations

### Rounded / Soft Cube
- Edges and corners smoothed
- More organic look

### Protruding Stickers
- Each sticker bulges outward slightly
- Emphasizes individual identity

### Living Surface
- Subtle idle animation
- Breathing, pulsing, or drifting motion

---

## Interaction Ideas

### Keyboard-Driven Play
- Minimal UI
- Direct manipulation via keys

### Focus Mode
- Temporarily exaggerate differences (color, contrast)
- Helps perception in subtle modes

### Progressive Reveal
- Start with simple views
- Gradually introduce complexity

---

## Constraint Variations

### Limited Moves
- Only certain moves allowed
- Forces new strategies

### Goal Variants
- Solve only one face
- Reach a specific pattern
- Minimize moves

### Hidden Information
- Some stickers obscured
- Must infer structure

---

## Hybrid / Combined Ideas

- Floating faces + image tiles
- Subtle whites + blob rendering
- Random layout + limited visibility
- 3D soft cube + image faces

---

## Video

We currently have image capture happening with the camera.
Got me thinking - what if a face (each face?) was a video instead of a still image.
Maybe even a live video feed from somewhere.


## Notes

- These ideas are intentionally unresolved
- No need to decide feasibility here
- The technical spec should remain simple
- This list can grow freely over time

The purpose is to keep creative momentum without blocking implementation.