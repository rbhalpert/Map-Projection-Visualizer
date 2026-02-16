import type { GeoPoint } from '../../types/domain';

interface CoordinateInputProps {
  label: string;
  value: GeoPoint;
  onChange: (next: GeoPoint) => void;
}

export const CoordinateInput = ({ label, value, onChange }: CoordinateInputProps) => {
  return (
    <fieldset className="rounded-md border border-slate-700 p-3">
      <legend className="px-1 text-xs uppercase tracking-wide text-slate-400">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-300">
          Latitude
          <input
            aria-label={`${label} latitude`}
            type="number"
            min={-90}
            max={90}
            step={0.0001}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm"
            value={value.lat}
            onChange={(event) => onChange({ ...value, lat: Number(event.target.value) })}
          />
        </label>
        <label className="text-xs text-slate-300">
          Longitude
          <input
            aria-label={`${label} longitude`}
            type="number"
            min={-180}
            max={180}
            step={0.0001}
            className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm"
            value={value.lon}
            onChange={(event) => onChange({ ...value, lon: Number(event.target.value) })}
          />
        </label>
      </div>
    </fieldset>
  );
};
