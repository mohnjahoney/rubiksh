import { FACES, type CubeState, type Face, type Sticker } from "./types";

function createFace(face: Face): Sticker[] {
  return Array.from({ length: 9 }, (_, index) => ({
    id: `${face}${index}`,
    homeFace: face,
    homeIndex: index,
  }));
}

export function createSolvedCube(): CubeState {
  return {
    U: createFace("U"),
    D: createFace("D"),
    F: createFace("F"),
    B: createFace("B"),
    L: createFace("L"),
    R: createFace("R"),
  };
}

export function cloneCube(cube: CubeState): CubeState {
  return {
    U: [...cube.U],
    D: [...cube.D],
    F: [...cube.F],
    B: [...cube.B],
    L: [...cube.L],
    R: [...cube.R],
  };
}

export function getAllStickers(cube: CubeState): Sticker[] {
  return FACES.flatMap((face) => cube[face]);
}
