import { cloneCube } from "./cube";
import { FACES, type CubeState, type Face, type Move, type Sticker } from "./types";

type Axis = "x" | "y" | "z";

type Vec3 = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  z: -1 | 0 | 1;
};

type FaceBasis = {
  normal: Vec3;
  right: Vec3;
  down: Vec3;
};

type StickerPosition = {
  sticker: Sticker;
  normal: Vec3;
  position: Vec3;
};

const FACE_BASIS: Record<Face, FaceBasis> = {
  U: {
    normal: { x: 0, y: 1, z: 0 },
    right: { x: 1, y: 0, z: 0 },
    down: { x: 0, y: 0, z: 1 },
  },
  D: {
    normal: { x: 0, y: -1, z: 0 },
    right: { x: 1, y: 0, z: 0 },
    down: { x: 0, y: 0, z: -1 },
  },
  F: {
    normal: { x: 0, y: 0, z: 1 },
    right: { x: 1, y: 0, z: 0 },
    down: { x: 0, y: -1, z: 0 },
  },
  B: {
    normal: { x: 0, y: 0, z: -1 },
    right: { x: -1, y: 0, z: 0 },
    down: { x: 0, y: -1, z: 0 },
  },
  L: {
    normal: { x: -1, y: 0, z: 0 },
    right: { x: 0, y: 0, z: 1 },
    down: { x: 0, y: -1, z: 0 },
  },
  R: {
    normal: { x: 1, y: 0, z: 0 },
    right: { x: 0, y: 0, z: -1 },
    down: { x: 0, y: -1, z: 0 },
  },
};

const MOVE_SPECS: Record<Exclude<Move, `${string}2`>, { axis: Axis; layer: -1 | 1; turns: -1 | 1 }> = {
  U: { axis: "y", layer: 1, turns: 1 },
  "U'": { axis: "y", layer: 1, turns: -1 },
  D: { axis: "y", layer: -1, turns: -1 },
  "D'": { axis: "y", layer: -1, turns: 1 },
  F: { axis: "z", layer: 1, turns: -1 },
  "F'": { axis: "z", layer: 1, turns: 1 },
  B: { axis: "z", layer: -1, turns: 1 },
  "B'": { axis: "z", layer: -1, turns: -1 },
  L: { axis: "x", layer: -1, turns: 1 },
  "L'": { axis: "x", layer: -1, turns: -1 },
  R: { axis: "x", layer: 1, turns: -1 },
  "R'": { axis: "x", layer: 1, turns: 1 },
};

function add(a: Vec3, b: Vec3): Vec3 {
  return {
    x: (a.x + b.x) as Vec3["x"],
    y: (a.y + b.y) as Vec3["y"],
    z: (a.z + b.z) as Vec3["z"],
  };
}

function scale(vector: Vec3, factor: -1 | 0 | 1): Vec3 {
  return {
    x: (vector.x * factor) as Vec3["x"],
    y: (vector.y * factor) as Vec3["y"],
    z: (vector.z * factor) as Vec3["z"],
  };
}

function axisValue(vector: Vec3, axis: Axis): -1 | 0 | 1 {
  return vector[axis];
}

function rotateQuarter(vector: Vec3, axis: Axis, turns: -1 | 1): Vec3 {
  if (axis === "x") {
    return turns === -1
      ? { x: vector.x, y: vector.z, z: (-vector.y) as Vec3["z"] }
      : { x: vector.x, y: (-vector.z) as Vec3["y"], z: vector.y };
  }

  if (axis === "y") {
    return turns === -1
      ? { x: (-vector.z) as Vec3["x"], y: vector.y, z: vector.x }
      : { x: vector.z, y: vector.y, z: (-vector.x) as Vec3["z"] };
  }

  return turns === -1
    ? { x: vector.y, y: (-vector.x) as Vec3["y"], z: vector.z }
    : { x: (-vector.y) as Vec3["x"], y: vector.x, z: vector.z };
}

function toStickerPositions(cube: CubeState): StickerPosition[] {
  const positions: StickerPosition[] = [];

  for (const face of FACES) {
    const basis = FACE_BASIS[face];
    for (let index = 0; index < cube[face].length; index += 1) {
      const sticker = cube[face][index];
      const row = Math.floor(index / 3) as 0 | 1 | 2;
      const column = (index % 3) as 0 | 1 | 2;
      const position = add(
        basis.normal,
        add(scale(basis.right, (column - 1) as -1 | 0 | 1), scale(basis.down, (row - 1) as -1 | 0 | 1)),
      );

      positions.push({
        sticker,
        normal: basis.normal,
        position,
      });
    }
  }

  return positions;
}

function faceFromNormal(normal: Vec3): Face {
  const match = Object.entries(FACE_BASIS).find(([, basis]) => {
    return basis.normal.x === normal.x && basis.normal.y === normal.y && basis.normal.z === normal.z;
  });

  if (!match) {
    throw new Error(`No face found for normal ${JSON.stringify(normal)}`);
  }

  return match[0] as Face;
}

function toFaceIndex(position: Vec3, normal: Vec3): { face: Face; index: number } {
  const face = faceFromNormal(normal);
  const basis = FACE_BASIS[face];
  const offset = {
    x: (position.x - basis.normal.x) as Vec3["x"],
    y: (position.y - basis.normal.y) as Vec3["y"],
    z: (position.z - basis.normal.z) as Vec3["z"],
  };
  const column = offset.x * basis.right.x + offset.y * basis.right.y + offset.z * basis.right.z + 1;
  const row = offset.x * basis.down.x + offset.y * basis.down.y + offset.z * basis.down.z + 1;

  return {
    face,
    index: row * 3 + column,
  };
}

function applyQuarterTurn(cube: CubeState, axis: Axis, layer: -1 | 1, turns: -1 | 1): CubeState {
  const next = cloneCube(cube);

  for (const face of FACES) {
    next[face] = new Array(9) as Sticker[];
  }

  for (const entry of toStickerPositions(cube)) {
    const shouldRotate = axisValue(entry.position, axis) === layer;
    const nextPosition = shouldRotate ? rotateQuarter(entry.position, axis, turns) : entry.position;
    const nextNormal = shouldRotate ? rotateQuarter(entry.normal, axis, turns) : entry.normal;
    const { face, index } = toFaceIndex(nextPosition, nextNormal);
    next[face][index] = entry.sticker;
  }

  return next;
}

function isDoubleMove(move: Move): move is Extract<Move, `${string}2`> {
  return move.endsWith("2");
}

export function applyMove(cube: CubeState, move: Move): CubeState {
  if (isDoubleMove(move)) {
    const singleMove = move[0] as keyof typeof MOVE_SPECS;
    return applyMove(applyMove(cube, singleMove), singleMove);
  }

  const spec = MOVE_SPECS[move];
  return applyQuarterTurn(cube, spec.axis, spec.layer, spec.turns);
}

export function applyMoves(cube: CubeState, moves: Move[]): CubeState {
  return moves.reduce((current, move) => applyMove(current, move), cube);
}
