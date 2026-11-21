import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
