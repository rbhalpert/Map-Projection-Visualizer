const EARTH_RADIUS_METERS = 6_371_008.8;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function wrapLongitude(longitudeDeg) {
  const wrapped = ((longitudeDeg + 540) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

function clampLatitude(latitudeDeg) {
  return Math.max(-90, Math.min(90, latitudeDeg));
}

function normalizePoint(point) {
  return {
    lat: clampLatitude(point.lat),
    lon: wrapLongitude(point.lon),
  };
}

function angularDistanceRadians(a, b) {
  const aNorm = normalizePoint(a);
  const bNorm = normalizePoint(b);

  const lat1 = toRadians(aNorm.lat);
  const lat2 = toRadians(bNorm.lat);
  const dLat = lat2 - lat1;
  const dLon = toRadians(bNorm.lon - aNorm.lon);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

function distanceMeters(a, b, radiusMeters = EARTH_RADIUS_METERS) {
  return angularDistanceRadians(a, b) * radiusMeters;
}

function initialBearingDegrees(a, b) {
  const aNorm = normalizePoint(a);
  const bNorm = normalizePoint(b);

  const lat1 = toRadians(aNorm.lat);
  const lat2 = toRadians(bNorm.lat);
  const dLon = toRadians(bNorm.lon - aNorm.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  if (Math.abs(x) < 1e-15 && Math.abs(y) < 1e-15) {
    return 0;
  }

  const theta = Math.atan2(y, x);
  return (toDegrees(theta) + 360) % 360;
}

function destinationPoint(start, initialBearingDeg, distanceM, radiusMeters = EARTH_RADIUS_METERS) {
  const startNorm = normalizePoint(start);
  const lat1 = toRadians(startNorm.lat);
  const lon1 = toRadians(startNorm.lon);
  const brng = toRadians(initialBearingDeg);
  const delta = distanceM / radiusMeters;

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);

  const sinLat2 = sinLat1 * cosDelta + cosLat1 * sinDelta * Math.cos(brng);
  const lat2 = Math.asin(Math.max(-1, Math.min(1, sinLat2)));

  const y = Math.sin(brng) * sinDelta * cosLat1;
  const x = cosDelta - sinLat1 * Math.sin(lat2);
  const lon2 = lon1 + Math.atan2(y, x);

  return normalizePoint({ lat: toDegrees(lat2), lon: toDegrees(lon2) });
}

function midpoint(a, b) {
  const aNorm = normalizePoint(a);
  const bNorm = normalizePoint(b);

  const lat1 = toRadians(aNorm.lat);
  const lon1 = toRadians(aNorm.lon);
  const lat2 = toRadians(bNorm.lat);
  const lon2 = toRadians(bNorm.lon);

  const dLon = lon2 - lon1;
  const bx = Math.cos(lat2) * Math.cos(dLon);
  const by = Math.cos(lat2) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by),
  );
  const lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  return normalizePoint({ lat: toDegrees(lat3), lon: toDegrees(lon3) });
}

module.exports = {
  EARTH_RADIUS_METERS,
  toRadians,
  toDegrees,
  wrapLongitude,
  clampLatitude,
  normalizePoint,
  angularDistanceRadians,
  distanceMeters,
  initialBearingDegrees,
  destinationPoint,
  midpoint,
};
