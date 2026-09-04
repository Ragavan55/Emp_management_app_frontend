export default function PageLoadingOverlay({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm" role="status" aria-label={label}>
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}