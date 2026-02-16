import {
  geoAzimuthalEquidistant,
  geoEqualEarth,
  geoMercator,
  type GeoProjection,
} from 'd3-geo';
import type { ProjectionId, ProjectionInfo } from '../types/domain';

export interface ProjectionDefinition extends ProjectionInfo {
  kind: '2d' | 'globe';
  createProjection?: (width: number, height: number) => GeoProjection;
}

export const projectionRegistry: Record<ProjectionId, ProjectionDefinition> = {
  globe: {
    id: 'globe',
    kind: 'globe',
    name: 'Globe (3D)',
    description: 'Reference globe preserving true geodesic interpretation.',
    tags: { compromise: false },
  },
  'web-mercator': {
    id: 'web-mercator',
    kind: '2d',
    name: 'Web Mercator',
    description: 'Conformal cylindrical projection used by most web maps.',
    tags: { conformal: true },
    createProjection: (width, height) =>
      geoMercator().fitExtent(
        [
          [16, 16],
          [width - 16, height - 16],
        ],
        { type: 'Sphere' },
      ),
  },
  'azimuthal-equidistant-north': {
    id: 'azimuthal-equidistant-north',
    kind: '2d',
    name: 'Azimuthal Equidistant (North Pole)',
    description: 'Distance-preserving from the North Pole outward.',
    tags: { equidistant: true },
    createProjection: (width, height) =>
      geoAzimuthalEquidistant()
        .rotate([0, -90])
        .fitExtent(
          [
            [16, 16],
            [width - 16, height - 16],
          ],
          { type: 'Sphere' },
        ),
  },
  'azimuthal-equidistant-south': {
    id: 'azimuthal-equidistant-south',
    kind: '2d',
    name: 'Azimuthal Equidistant (South Pole)',
    description: 'Distance-preserving from the South Pole outward.',
    tags: { equidistant: true },
    createProjection: (width, height) =>
      geoAzimuthalEquidistant()
        .rotate([0, 90])
        .fitExtent(
          [
            [16, 16],
            [width - 16, height - 16],
          ],
          { type: 'Sphere' },
        ),
  },
  'equal-earth': {
    id: 'equal-earth',
    kind: '2d',
    name: 'Equal Earth',
    description: 'Equal-area pseudocylindrical compromise projection.',
    tags: { equalArea: true, compromise: true },
    createProjection: (width, height) =>
      geoEqualEarth().fitExtent(
        [
          [16, 16],
          [width - 16, height - 16],
        ],
        { type: 'Sphere' },
      ),
  },
};

export const defaultProjectionId: ProjectionId = 'web-mercator';
