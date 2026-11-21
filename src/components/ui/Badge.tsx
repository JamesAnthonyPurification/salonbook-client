const styles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  unpaid: "bg-rose-50 text-rose-700 ring-rose-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-stone-100 text-stone-600 ring-stone-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  admin: "bg-brand-50 text-brand-700 ring-brand-200",
  customer: "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[value] ?? "bg-stone-100 text-stone-700 ring-stone-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? value}
    </span>
  );
}
