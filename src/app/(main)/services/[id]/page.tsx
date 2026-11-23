import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, SearchX, ShieldCheck, Tag } from "lucide-react";
import BookingPanel from "@/components/services/BookingPanel";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { API_URL } from "@/lib/api";
import { formatDuration, formatPrice } from "@/lib/format";
import { requireSession } from "@/lib/session";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Service Details" };

async function getService(id: string): Promise<{ service: Service | null; error: string | null }> {
  try {
    const res = await fetch(`${API_URL}/services/${encodeURIComponent(id)}`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { service: null, error: json?.message || "Service not found" };
    return { service: json.data as Service, error: null };
  } catch {
    return { service: null, error: "We couldn't reach the server. Please try again shortly." };
  }
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Protected route: unauthenticated users are redirected to sign in (and returned here afterwards)
  const session = await requireSession(`/services/${id}`);
  const { service, error } = await getService(id);

  if (!service) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={SearchX}
          title="Service not found"
          description={error ?? "This service doesn't exist or the link is invalid."}
          action={<Link href="/services" className="btn-primary">Browse services</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-stone-100 lg:sticky lg:top-24 lg:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.image} alt={service.serviceName} className="aspect-[4/3] h-full w-full object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Tag className="h-3.5 w-3.5" /> {service.category}
            </span>
            {service.status !== "active" && <Badge value="inactive" label="Currently unavailable" />}
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{service.serviceName}</h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Price</p>
              <p className="mt-1 font-sans text-2xl font-bold tabular-nums text-brand-800">{formatPrice(service.price)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Estimated duration</p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-sans text-2xl font-bold tabular-nums">
                <Clock className="h-5 w-5 text-brand-600" /> {formatDuration(service.duration)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-sans text-sm font-semibold tracking-wide text-stone-900 uppercase">About this service</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-stone-600">{service.description}</p>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-stone-600">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Certified, experienced professionals</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Free cancellation while your request is pending</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure online payment with Stripe</li>
          </ul>

          <div className="mt-8">
            <BookingPanel service={service} role={session.user.role ?? "customer"} />
          </div>
        </div>
      </div>
    </div>
  );
}
