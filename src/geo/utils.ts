import { EARTH_RADIUS_KM, KM_TO_MI } from './constants';
import type { GeoPoint } from '../types/domain';

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

export const normalizeLongitude = (lon: number): number => {
  const normalized = ((lon + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 ? 180 : normalized;
};

export const clampLatitude = (lat: number): number => Math.max(-90, Math.min(90, lat));

export const greatCircleDistanceKm = (a: GeoPoint, b: GeoPoint): number => {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(normalizeLongitude(b.lon - a.lon));

  const hav =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(hav));
};

export const kmToMiles = (km: number): number => km * KM_TO_MI;

export const initialBearingDeg = (a: GeoPoint, b: GeoPoint): number => {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(normalizeLongitude(b.lon - a.lon));

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

export const destinationPoint = (
  start: GeoPoint,
  bearingDeg: number,
  distanceKm: number,
): GeoPoint => {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearing = toRadians(bearingDeg);
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);

  const sinLat2 =
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing);

  const lat2 = Math.asin(Math.max(-1, Math.min(1, sinLat2)));
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: clampLatitude(toDegrees(lat2)),
    lon: normalizeLongitude(toDegrees(lon2)),
  };
};

export const midpoint = (a: GeoPoint, b: GeoPoint): GeoPoint => {
  const lat1 = toRadians(a.lat);
  const lon1 = toRadians(a.lon);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(normalizeLongitude(b.lon - a.lon));

  const bx = Math.cos(lat2) * Math.cos(dLon);
  const by = Math.cos(lat2) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2),
  );
  const lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  return { lat: toDegrees(lat3), lon: normalizeLongitude(toDegrees(lon3)) };
};
