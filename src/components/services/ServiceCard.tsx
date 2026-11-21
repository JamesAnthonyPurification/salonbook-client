import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatDuration, formatPrice } from "@/lib/format";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.serviceName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
          {service.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug font-semibold">{service.serviceName}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-stone-500">{service.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
          <div>
            <p className="text-lg font-semibold text-stone-900">{formatPrice(service.price)}</p>
            <p className="inline-flex items-center gap-1 text-xs text-stone-500">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration)}
            </p>
          </div>
          <Link href={`/services/${service._id}`} className="btn-outline btn-sm group-hover:border-brand-300">
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-stone-200" />
        <div className="h-3 w-full rounded bg-stone-100" />
        <div className="h-3 w-4/5 rounded bg-stone-100" />
        <div className="flex justify-between pt-3">
          <div className="h-5 w-16 rounded bg-stone-200" />
          <div className="h-8 w-28 rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  );
}
