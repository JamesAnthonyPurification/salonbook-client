import Link from "next/link";
import { Scissors } from "lucide-react";

export default function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label="SalonBook home">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          light ? "bg-white/10 text-gold-400" : "bg-brand-700 text-white"
        }`}
      >
        <Scissors className="h-4.5 w-4.5" />
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? "text-white" : "text-stone-900"}`}>
        Salon<span className={light ? "text-gold-400" : "text-brand-700"}>Book</span>
      </span>
    </Link>
  );
}
