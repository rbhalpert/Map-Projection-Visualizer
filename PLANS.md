# PLANS.md

## Current phase
Phase 1: Scaffold + geometry core + single panel

## Milestones
- [ ] M1 scaffold/tooling
- [ ] M2 geo core + tests
- [ ] M3 projection registry + Web Mercator panel
- [ ] M4 interaction model
- [ ] M5 multi-panel + maximize
- [ ] M6 globe sync
- [ ] M7 overlays
- [ ] M8 polish/docs/tests

## Risks
- Cesium integration complexity
- Antimeridian rendering edge cases
- Overlay performance at high resolution

## Decisions
- v1 uses spherical Earth
- 2D maps use straight projected segment between projected endpoints
- Educational framing emphasizes tradeoffs, not winners

## Living execution log
- [x] Plan document created and initialized.
- [x] Initial plan sanity check completed (phase/milestones/risks/decisions captured).

## Update cadence
- Update this file at the start and end of each work session.
- Check off milestones only when acceptance criteria for that milestone are met.
- Add newly discovered risks and decisions as they arise.
