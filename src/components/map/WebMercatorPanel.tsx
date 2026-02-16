import { geoGraticule10, geoPath } from 'd3-geo';
import { useMemo } from 'react';
import type { ProjectionDefinition } from '../../projections/registry';
import type { Segment } from '../../types/domain';

interface WebMercatorPanelProps {
  width?: number;
  height?: number;
  projectionDef: ProjectionDefinition;
  segment: Segment;
}

export const WebMercatorPanel = ({
  width = 760,
  height = 460,
  projectionDef,
  segment,
}: WebMercatorPanelProps) => {
  const projection = useMemo(() => projectionDef.createProjection?.(width, height), [projectionDef, width, height]);

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);
  const sphere = useMemo(() => ({ type: 'Sphere' as const }), []);

  const projectedA = projection?.([segment.a.lon, segment.a.lat]) ?? null;
  const projectedB = projection?.([segment.b.lon, segment.b.lat]) ?? null;

  const pixelLength =
    projectedA && projectedB
      ? Math.hypot(projectedB[0] - projectedA[0], projectedB[1] - projectedA[1])
      : null;

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 shadow-xl">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">{projectionDef.name}</h2>
        <p className="text-xs text-slate-300">
          Segment length: {pixelLength ? `${pixelLength.toFixed(1)} px` : 'N/A'}
        </p>
      </header>
      <svg role="img" aria-label="Web Mercator panel" viewBox={`0 0 ${width} ${height}`} className="h-auto w-full rounded bg-slate-950">
        <path d={path?.(sphere) ?? ''} fill="#020617" stroke="#334155" strokeWidth={1.2} />
        <path d={path?.(graticule) ?? ''} fill="none" stroke="#1e293b" strokeWidth={0.75} />

        {projectedA && projectedB && (
          <>
            <line
              x1={projectedA[0]}
              y1={projectedA[1]}
              x2={projectedB[0]}
              y2={projectedB[1]}
              stroke="#f97316"
              strokeWidth={3}
            />
            <circle cx={projectedA[0]} cy={projectedA[1]} r={6} fill="#22d3ee" />
            <circle cx={projectedB[0]} cy={projectedB[1]} r={6} fill="#e879f9" />
          </>
        )}
      </svg>
    </article>
  );
};
