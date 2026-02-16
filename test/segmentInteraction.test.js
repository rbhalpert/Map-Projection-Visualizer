import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dragCenter,
  dragEndpointFree,
  dragEndpointLockDistance,
  segmentLength,
  sub,
  magnitude,
  initialState,
  startCenterDrag,
  startEndpointDrag,
  updateDrag,
  endDrag,
} from '../segmentInteraction.js';

const approx = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

function samePoint(p, q, eps = 1e-9) {
  return approx(p.x, q.x, eps) && approx(p.y, q.y, eps);
}

test('center drag preserves segment length and bearing', () => {
  const start = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
  const next = dragCenter(start, { x: 10, y: 10 }, { x: 17, y: 2 });

  assert.ok(approx(segmentLength(next), segmentLength(start)));
  const startVec = sub(start.b, start.a);
  const nextVec = sub(next.b, next.a);
  assert.ok(samePoint(startVec, nextVec));
});

test('endpoint free mode keeps opposite endpoint fixed and follows pointer', () => {
  const start = { a: { x: 1, y: 1 }, b: { x: 8, y: 5 } };
  const pointer = { x: -2, y: 10 };
  const next = dragEndpointFree(start, 'a', pointer);

  assert.ok(samePoint(next.a, pointer));
  assert.ok(samePoint(next.b, start.b));
});

test('endpoint lock-distance mode preserves distance to anchor', () => {
  const start = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
  const anchor = start.a;
  const pointer = { x: 10, y: 10 };
  const next = dragEndpointLockDistance(start, 'b', pointer);

  assert.ok(approx(segmentLength(next), segmentLength(start)));
  assert.ok(samePoint(next.a, anchor));

  const towardPointer = sub(pointer, anchor);
  const nextDirection = sub(next.b, anchor);
  const cross = towardPointer.x * nextDirection.y - towardPointer.y * nextDirection.x;
  assert.ok(approx(cross, 0));
  assert.ok(magnitude(nextDirection) > 0);
});

test('lock-distance mode handles pointer at anchor using fallback bearing', () => {
  const start = { a: { x: 2, y: 3 }, b: { x: 5, y: 7 } };
  const next = dragEndpointLockDistance(start, 'b', start.a);

  assert.ok(approx(segmentLength(next), segmentLength(start)));
  const startVec = sub(start.b, start.a);
  const nextVec = sub(next.b, next.a);
  const cross = startVec.x * nextVec.y - startVec.y * nextVec.x;
  assert.ok(approx(cross, 0));
});

test('state actions wire up interaction lifecycle', () => {
  let state = initialState({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } });

  state = startCenterDrag(state, { x: 1, y: 1 });
  state = updateDrag(state, { x: 3, y: 4 });
  assert.ok(samePoint(state.segment.a, { x: 2, y: 3 }));
  assert.ok(samePoint(state.segment.b, { x: 6, y: 3 }));

  state = endDrag(state);
  assert.equal(state.interaction, null);

  state = startEndpointDrag(state, 'a', 'free');
  state = updateDrag(state, { x: -1, y: -1 });
  assert.ok(samePoint(state.segment.a, { x: -1, y: -1 }));
  assert.ok(samePoint(state.segment.b, { x: 6, y: 3 }));
});
