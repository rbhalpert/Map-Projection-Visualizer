import {
  destinationPoint,
  greatCircleDistanceKm,
  initialBearingDeg,
  kmToMiles,
  normalizeLongitude,
} from './utils';

describe('geo utilities', () => {
  it('normalizes longitudes to [-180, 180]', () => {
    expect(normalizeLongitude(190)).toBe(-170);
    expect(normalizeLongitude(-190)).toBe(170);
    expect(normalizeLongitude(540)).toBe(180);
  });

  it('calculates known great-circle distance approximately', () => {
    const paris = { lat: 48.8566, lon: 2.3522 };
    const nyc = { lat: 40.7128, lon: -74.006 };
    const distance = greatCircleDistanceKm(paris, nyc);
    expect(distance).toBeGreaterThan(5800);
    expect(distance).toBeLessThan(5900);
  });

  it('computes initial bearing', () => {
    const a = { lat: 0, lon: 0 };
    const b = { lat: 10, lon: 10 };
    const bearing = initialBearingDeg(a, b);
    expect(bearing).toBeGreaterThan(40);
    expect(bearing).toBeLessThan(50);
  });

  it('forward solves destination and preserves distance', () => {
    const start = { lat: 34, lon: -118 };
    const end = destinationPoint(start, 90, 1000);
    const distance = greatCircleDistanceKm(start, end);
    expect(distance).toBeCloseTo(1000, 1);
  });

  it('converts km to miles', () => {
    expect(kmToMiles(1)).toBeCloseTo(0.621371, 6);
  });
});
