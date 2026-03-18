"use client";

export default function ResultPreview({ preview }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        Predicted Result
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{preview}</p>
      <p className="mt-2 text-xs text-slate-500">
        Preview only. Final result and winner are calculated by the backend after save.
      </p>
    </div>
  );
}
