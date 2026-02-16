/**
 * @typedef {{x:number,y:number}} Point
 * @typedef {{a:Point,b:Point}} Segment
 * @typedef {'free'|'lock-distance'} EndpointMode
 * @typedef {'a'|'b'} Endpoint
 */

/** @param {Point} p @param {Point} q */
export function add(p, q) {
  return { x: p.x + q.x, y: p.y + q.y };
}

/** @param {Point} p @param {Point} q */
export function sub(p, q) {
  return { x: p.x - q.x, y: p.y - q.y };
}

/** @param {Point} p @param {number} s */
export function scale(p, s) {
  return { x: p.x * s, y: p.y * s };
}

/** @param {Point} p */
export function magnitude(p) {
  return Math.hypot(p.x, p.y);
}

/** @param {Segment} segment */
export function segmentLength(segment) {
  return magnitude(sub(segment.b, segment.a));
}

/** @param {Segment} segment */
export function segmentCenter(segment) {
  return scale(add(segment.a, segment.b), 0.5);
}

/**
 * Moves both endpoints as a rigid segment by dragging the center.
 * Distance and bearing are preserved by applying a pure translation.
 * @param {Segment} startSegment
 * @param {Point} startPointer
 * @param {Point} pointer
 * @returns {Segment}
 */
export function dragCenter(startSegment, startPointer, pointer) {
  const delta = sub(pointer, startPointer);
  return {
    a: add(startSegment.a, delta),
    b: add(startSegment.b, delta),
  };
}

/**
 * @param {Segment} startSegment
 * @param {Endpoint} endpoint
 * @param {Point} pointer
 * @returns {Segment}
 */
export function dragEndpointFree(startSegment, endpoint, pointer) {
  return endpoint === 'a'
    ? { a: { ...pointer }, b: { ...startSegment.b } }
    : { a: { ...startSegment.a }, b: { ...pointer } };
}

/**
 * Drags an endpoint while locking the original endpoint distance.
 * The opposite endpoint acts as the anchor; bearing follows pointer direction.
 * @param {Segment} startSegment
 * @param {Endpoint} endpoint
 * @param {Point} pointer
 * @returns {Segment}
 */
export function dragEndpointLockDistance(startSegment, endpoint, pointer) {
  const anchor = endpoint === 'a' ? startSegment.b : startSegment.a;
  const startDragged = endpoint === 'a' ? startSegment.a : startSegment.b;
  const lockedLength = segmentLength(startSegment);

  const towardPointer = sub(pointer, anchor);
  const towardPointerLen = magnitude(towardPointer);
  const fallbackDirection = sub(startDragged, anchor);
  const fallbackLen = magnitude(fallbackDirection);

  const dir = towardPointerLen > 0
    ? scale(towardPointer, 1 / towardPointerLen)
    : fallbackLen > 0
      ? scale(fallbackDirection, 1 / fallbackLen)
      : { x: 1, y: 0 };

  const dragged = add(anchor, scale(dir, lockedLength));

  return endpoint === 'a'
    ? { a: dragged, b: { ...anchor } }
    : { a: { ...anchor }, b: dragged };
}

/**
 * @typedef {{
 *   kind:'center',
 *   startSegment: Segment,
 *   startPointer: Point
 * } | {
 *   kind:'endpoint',
 *   endpoint: Endpoint,
 *   mode: EndpointMode,
 *   startSegment: Segment
 * }} Interaction
 */

/** @typedef {{segment: Segment, interaction: Interaction|null}} State */

/** @param {Segment} segment @returns {State} */
export function initialState(segment) {
  return { segment, interaction: null };
}

/** @param {State} state @param {Point} pointer */
export function startCenterDrag(state, pointer) {
  return {
    ...state,
    interaction: {
      kind: 'center',
      startSegment: state.segment,
      startPointer: pointer,
    },
  };
}

/** @param {State} state @param {Endpoint} endpoint @param {EndpointMode} mode */
export function startEndpointDrag(state, endpoint, mode) {
  return {
    ...state,
    interaction: {
      kind: 'endpoint',
      endpoint,
      mode,
      startSegment: state.segment,
    },
  };
}

/** @param {State} state @param {Point} pointer */
export function updateDrag(state, pointer) {
  if (!state.interaction) return state;

  if (state.interaction.kind === 'center') {
    return {
      ...state,
      segment: dragCenter(
        state.interaction.startSegment,
        state.interaction.startPointer,
        pointer,
      ),
    };
  }

  const { startSegment, endpoint, mode } = state.interaction;
  return {
    ...state,
    segment: mode === 'free'
      ? dragEndpointFree(startSegment, endpoint, pointer)
      : dragEndpointLockDistance(startSegment, endpoint, pointer),
  };
}

/** @param {State} state */
export function endDrag(state) {
  return { ...state, interaction: null };
}
