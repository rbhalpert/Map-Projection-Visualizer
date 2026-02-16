const test = require('node:test');
const assert = require('node:assert/strict');

const {
  distanceMeters,
  initialBearingDegrees,
  destinationPoint,
  midpoint,
  normalizePoint,
  wrapLongitude,
} = require('../src/sphericalGeo');

const EPS_M = 1e-6;

function approxEqual(actual, expected, epsilon, message) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${message}: ${actual} vs ${expected}`);
}

function lonDiffDegrees(a, b) {
  return Math.abs(wrapLongitude(a - b));
}

test('distance is symmetric and zero for identical points', () => {
  const a = { lat: 10.123, lon: 179.8 };
  const b = { lat: -20.2, lon: -179.7 };

  const dAB = distanceMeters(a, b);
  const dBA = distanceMeters(b, a);

  approxEqual(dAB, dBA, 1e-7, 'distance symmetry');
  approxEqual(distanceMeters(a, a), 0, EPS_M, 'distance identical points');
});

test('antimeridian crossing uses short path for distance and midpoint longitude', () => {
  const west = { lat: 0, lon: 179.5 };
  const east = { lat: 0, lon: -179.5 };

  const d = distanceMeters(west, east);
  assert.ok(d < 120_000, `expected short path across antimeridian, got ${d}`);

  const mid = midpoint(west, east);
  assert.ok(Math.abs(mid.lat) < 1e-10, `midpoint latitude should stay near equator, got ${mid.lat}`);
  assert.ok(Math.abs(Math.abs(mid.lon) - 180) < 1e-6, `midpoint longitude should sit on antimeridian, got ${mid.lon}`);
});

test('initial bearing handles antimeridian route', () => {
  const a = { lat: 10, lon: 179.9 };
  const b = { lat: 10, lon: -179.9 };

  const bearing = initialBearingDegrees(a, b);
  assert.ok(bearing > 80 && bearing < 100, `expected eastward short-hop bearing, got ${bearing}`);
});

test('forward solve round-trip recovers destination', () => {
  const start = { lat: 37.7749, lon: -122.4194 };
  const target = { lat: -33.8688, lon: 151.2093 };

  const d = distanceMeters(start, target);
  const b = initialBearingDegrees(start, target);
  const solved = destinationPoint(start, b, d);

  approxEqual(solved.lat, target.lat, 1e-9, 'forward solve latitude');
  assert.ok(lonDiffDegrees(solved.lon, target.lon) < 1e-9, `forward solve longitude: ${solved.lon} vs ${target.lon}`);
});

test('near-pole calculations are finite and normalize output', () => {
  const nearNorthPole = { lat: 89.9999, lon: 45 };
  const nearSouthPole = { lat: -89.9999, lon: -120 };

  const d = distanceMeters(nearNorthPole, nearSouthPole);
  assert.ok(Number.isFinite(d) && d > 0, `distance should be finite and positive, got ${d}`);

  const b = initialBearingDegrees(nearNorthPole, { lat: 89.9999, lon: 135 });
  assert.ok(Number.isFinite(b), `bearing should be finite, got ${b}`);

  const moved = destinationPoint(nearNorthPole, 190, 50_000);
  assert.ok(Number.isFinite(moved.lat) && Number.isFinite(moved.lon), `destination should be finite, got ${JSON.stringify(moved)}`);
  assert.ok(moved.lat <= 90 && moved.lat >= -90, `latitude should be normalized, got ${moved.lat}`);
  assert.ok(moved.lon <= 180 && moved.lon >= -180, `longitude should be normalized, got ${moved.lon}`);
});

test('midpoint is equidistant from endpoints', () => {
  const a = normalizePoint({ lat: 48.8566, lon: 2.3522 });
  const b = normalizePoint({ lat: 35.6762, lon: 139.6503 });
  const mid = midpoint(a, b);

  const dAM = distanceMeters(a, mid);
  const dMB = distanceMeters(mid, b);

  approxEqual(dAM, dMB, 1e-6, 'midpoint equidistance');
});
