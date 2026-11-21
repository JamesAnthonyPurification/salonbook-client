import type { LucideIcon } from "lucide-react";

const tones = {
  brand: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  stone: "bg-stone-100 text-stone-600",
  sky: "bg-sky-50 text-sky-700",
  gold: "bg-amber-50 text-gold-600",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  hint?: string;
}) {
  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold text-stone-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}
