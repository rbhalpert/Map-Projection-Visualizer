import { CoordinateInput } from '../components/ui/CoordinateInput';
import { WebMercatorPanel } from '../components/map/WebMercatorPanel';
import { projectionRegistry } from '../projections/registry';
import { useAppStore } from '../store/appStore';

export const App = () => {
  const segment = useAppStore((state) => state.segment);
  const setEndpoint = useAppStore((state) => state.setEndpoint);
  const unit = useAppStore((state) => state.unit);
  const setUnit = useAppStore((state) => state.setUnit);
  const trueDistance = useAppStore((state) => state.trueDistance);

  const distance = trueDistance();

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[320px_1fr]">
        <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h1 className="text-xl font-bold">Projection Distortion Lab</h1>
          <p className="text-sm text-slate-300">
            Compare true great-circle distance against projected segment length.
          </p>

          <CoordinateInput label="Endpoint A" value={segment.a} onChange={(point) => setEndpoint('a', point)} />
          <CoordinateInput label="Endpoint B" value={segment.b} onChange={(point) => setEndpoint('b', point)} />

          <div className="rounded-md border border-slate-700 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">True great-circle distance</p>
            <p className="text-lg font-semibold text-cyan-300">
              {unit === 'km' ? `${distance.km.toFixed(2)} km` : `${distance.mi.toFixed(2)} mi`}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                className={`rounded px-3 py-1 text-sm ${unit === 'km' ? 'bg-cyan-600 text-white' : 'bg-slate-800'}`}
                onClick={() => setUnit('km')}
              >
                km
              </button>
              <button
                className={`rounded px-3 py-1 text-sm ${unit === 'mi' ? 'bg-cyan-600 text-white' : 'bg-slate-800'}`}
                onClick={() => setUnit('mi')}
              >
                miles
              </button>
            </div>
          </div>
        </section>

        <section>
          <WebMercatorPanel projectionDef={projectionRegistry['web-mercator']} segment={segment} />
        </section>
      </div>
    </main>
  );
};
