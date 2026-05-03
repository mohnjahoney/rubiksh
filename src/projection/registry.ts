import { cubeNetCrossConfig, cubeNetCrossProjection } from "./cubeNetCross";
import { floatingFacesGrid3x2Config, floatingFacesGrid3x2Projection } from "./floatingFacesGrid3x2";
import { floatingFacesHexConfig, floatingFacesHexProjection } from "./floatingFacesHex";
import type { Projection, ProjectionConfig } from "./types";

export type ProjectionId = "floatingFacesGrid3x2" | "floatingFacesHex" | "cubeNetCross";

export type ProjectionDefinition = {
  id: ProjectionId;
  name: string;
  project: Projection;
  config: ProjectionConfig;
};

export const projectionDefinitions: ProjectionDefinition[] = [
  {
    id: "floatingFacesGrid3x2",
    name: "FloatingFacesGrid3x2",
    project: floatingFacesGrid3x2Projection,
    config: floatingFacesGrid3x2Config,
  },
  {
    id: "floatingFacesHex",
    name: "FloatingFacesHex",
    project: floatingFacesHexProjection,
    config: floatingFacesHexConfig,
  },
  {
    id: "cubeNetCross",
    name: "CubeNetCross",
    project: cubeNetCrossProjection,
    config: cubeNetCrossConfig,
  },
];

export type ProjectionEntry = {
  project: Projection;
  config: ProjectionConfig;
};

export const projections: Record<ProjectionId, ProjectionEntry> = {
  floatingFacesGrid3x2: {
    project: floatingFacesGrid3x2Projection,
    config: floatingFacesGrid3x2Config,
  },
  floatingFacesHex: {
    project: floatingFacesHexProjection,
    config: floatingFacesHexConfig,
  },
  cubeNetCross: {
    project: cubeNetCrossProjection,
    config: cubeNetCrossConfig,
  },
};

export const projectionNames: Record<ProjectionId, string> = Object.fromEntries(
  projectionDefinitions.map((definition) => [definition.id, definition.name]),
) as Record<ProjectionId, string>;
