export const FACES = ["U", "D", "F", "B", "L", "R"] as const;

export type Face = (typeof FACES)[number];

export type Sticker = {
  id: string;
  homeFace: Face;
  homeIndex: number;
};

export type CubeState = Record<Face, Sticker[]>;

export type Move =
  | "U"
  | "U'"
  | "U2"
  | "D"
  | "D'"
  | "D2"
  | "F"
  | "F'"
  | "F2"
  | "B"
  | "B'"
  | "B2"
  | "L"
  | "L'"
  | "L2"
  | "R"
  | "R'"
  | "R2";
