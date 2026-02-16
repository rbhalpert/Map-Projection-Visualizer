import { create } from 'zustand';
import type { DistanceUnit, GeoPoint, ProjectionId, Segment } from '../types/domain';
import { greatCircleDistanceKm, kmToMiles } from '../geo/utils';

interface AppState {
  segment: Segment;
  unit: DistanceUnit;
  activeProjection: ProjectionId;
  setEndpoint: (endpoint: 'a' | 'b', point: GeoPoint) => void;
  setUnit: (unit: DistanceUnit) => void;
  setActiveProjection: (projectionId: ProjectionId) => void;
  trueDistance: () => { km: number; mi: number };
}

const defaultSegment: Segment = {
  id: 'default-segment',
  a: { lat: 40.7128, lon: -74.006 },
  b: { lat: 51.5072, lon: -0.1276 },
};

export const useAppStore = create<AppState>((set, get) => ({
  segment: defaultSegment,
  unit: 'km',
  activeProjection: 'web-mercator',
  setEndpoint: (endpoint, point) =>
    set((state) => ({ segment: { ...state.segment, [endpoint]: point } })),
  setUnit: (unit) => set({ unit }),
  setActiveProjection: (activeProjection) => set({ activeProjection }),
  trueDistance: () => {
    const km = greatCircleDistanceKm(get().segment.a, get().segment.b);
    return { km, mi: kmToMiles(km) };
  },
}));
