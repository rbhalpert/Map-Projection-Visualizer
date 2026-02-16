# AGENTS.md

## Project
Projection Distortion Lab (educational web app on projection distortion)

## Primary objective
Deliver a clear, accurate, visual-first app for comparing true great-circle distance vs projected map length across map projections and a globe.

## Engineering principles
- Prefer correctness over cleverness.
- Keep components small, typed, and testable.
- Keep projection logic and geo math in isolated domain modules.
- Avoid hidden coupling between UI and geometry.
- Make every feature explainable to non-experts.

## Required stack
- React + TypeScript + Vite
- Zustand state management
- d3-geo (+ d3-geo-projection if needed)
- CesiumJS for globe
- Tailwind CSS
- Vitest + React Testing Library
- ESLint + Prettier

## Geometry rules (v1)
- Spherical Earth model with fixed radius.
- True distance = great-circle distance.
- Support bearing + forward solve.
- Antimeridian and near-pole robustness are mandatory.
- 2D panels render straight projected segment between projected endpoints (v1 choice).

## Interaction rules
- Center-drag: preserve true distance and bearing.
- Endpoint drag:
  - free mode can change distance/bearing
  - lock-distance mode must preserve distance
- Manual A/B coordinate entry must validate lat/lon ranges.
- Manual bearing and distance input supported.

## Projections in v1
- globe
- web_mercator
- azimuthal_equidistant_north
- azimuthal_equidistant_south
- equal_earth

Projection registry must be extensible.

## UI behavior
- Multi-panel small multiples default.
- Any panel can be maximized and restored with no state loss.
- Per-panel overlay toggles (Heat, Tissot).
- Units toggle (mi/km) updates all distance displays.
- “Show Math” remains concise and optional.

## Performance
- During drag, target smooth updates (requestAnimationFrame pattern recommended).
- Memoize expensive projection/overlay computations.
- Use adaptive overlay resolution if needed.

## Testing requirements
At minimum test:
1. Great-circle distance correctness sanity checks.
2. Bearing/forward-solve round-trip checks.
3. Center-drag invariant (distance preserved).
4. Lock-distance endpoint-drag invariant.
5. Unit conversion consistency.
6. Antimeridian and near-pole edge cases.
7. Panel maximize/restore state retention.

## Output format for coding sessions
For each coding step, provide:
1) PLAN
2) FILES TO CHANGE
3) CHANGES
4) VERIFICATION

## Guardrails
- Do not remove existing tests without replacing coverage.
- Do not hardcode projection-specific hacks in shared geometry utilities.
- Do not introduce backend dependencies for v1.
- Document assumptions in code comments where math choices are non-obvious.

## Definition of done (v1)
- All required projections render
- Segment interactions work as specified
- Metrics and overlays function
- Edge cases handled
- Tests pass
- README explains setup, architecture, and limitations
