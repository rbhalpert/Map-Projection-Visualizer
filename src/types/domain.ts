export type ProjectionId =
  | 'globe'
  | 'web-mercator'
  | 'azimuthal-equidistant-north'
  | 'azimuthal-equidistant-south'
  | 'equal-earth';

export type DistanceUnit = 'km' | 'mi';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface Segment {
  id: string;
  a: GeoPoint;
  b: GeoPoint;
}

export interface ProjectionTradeoffTags {
  conformal?: boolean;
  equalArea?: boolean;
  equidistant?: boolean;
  compromise?: boolean;
}

export interface ProjectionInfo {
  id: ProjectionId;
  name: string;
  description: string;
  tags: ProjectionTradeoffTags;
}

export interface SegmentMetrics {
  trueDistanceKm: number;
  trueDistanceMi: number;
  initialBearingDeg: number;
}

export interface PanelMetrics {
  projectionId: ProjectionId;
  projectedPixelLength: number | null;
}
