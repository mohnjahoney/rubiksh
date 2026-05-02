import { cubeNetCrossProjection } from "./cubeNetCross";
import { floatingFacesGrid3x2Projection } from "./floatingFacesGrid3x2";
import { floatingFacesHexProjection } from "./floatingFacesHex";
import type { Projection } from "./types";

export type ProjectionId = "floatingFacesGrid3x2" | "floatingFacesHex" | "cubeNetCross";

export type ProjectionDefinition = {
  id: ProjectionId;
  name: string;
  projection: Projection;
};

export const projectionDefinitions: ProjectionDefinition[] = [
  {
    id: "floatingFacesGrid3x2",
    name: "FloatingFacesGrid3x2",
    projection: floatingFacesGrid3x2Projection,
  },
  {
    id: "floatingFacesHex",
    name: "FloatingFacesHex",
    projection: floatingFacesHexProjection,
  },
  {
    id: "cubeNetCross",
    name: "CubeNetCross",
    projection: cubeNetCrossProjection,
  },
];

export const projections: Record<ProjectionId, Projection> = {
  floatingFacesGrid3x2: floatingFacesGrid3x2Projection,
  floatingFacesHex: floatingFacesHexProjection,
  cubeNetCross: cubeNetCrossProjection,
};

export const projectionNames: Record<ProjectionId, string> = Object.fromEntries(
  projectionDefinitions.map((definition) => [definition.id, definition.name]),
) as Record<ProjectionId, string>;
