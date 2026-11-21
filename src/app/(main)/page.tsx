import Link from "next/link";
import { ArrowRight, CalendarCheck, CreditCard, Search, Sparkles, Star } from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import EmptyState from "@/components/ui/EmptyState";
import { serverGet } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { CategoryCount, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, categories] = await Promise.all([
    serverGet<Service[]>("/services?limit=6"),
    serverGet<CategoryCount[]>("/services/categories"),
  ]);
  const counts = Object.fromEntries((categories ?? []).map((c) => [c.name, c.count]));

  return (
    <>
      {/* ------------------------------ Banner ------------------------------ */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/70 to-brand-950/20" />
        <div className="container-x py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold-400 uppercase ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Hair · Skin · Nails · Spa
            </span>
            <h1 className="mt-6 text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-6xl">
              Look good, feel better – <span className="text-gold-400 italic">book in seconds.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">
              Discover expert stylists and therapists at SalonBook. Browse our services, pick a time that suits you and
              request your appointment online — no phone calls needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn bg-gold-500 px-7 py-3 text-brand-950 hover:bg-gold-400">
                Explore Salon Services <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn border border-white/30 px-7 py-3 text-white hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- Featured services ------------------------ */}
      <section className="container-x py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-eyebrow">Featured</p>
            <h2 className="section-title">Our most-loved services</h2>
            <p className="mt-2 max-w-xl text-stone-500">Hand-picked treatments our clients book again and again.</p>
          </div>
          <Link href="/services" className="btn-outline self-start sm:self-auto">
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10">
          {services === null ? (
            <EmptyState title="Services are unavailable right now" description="We couldn't load services. Please refresh the page in a moment." />
          ) : services.length === 0 ? (
            <EmptyState title="No services yet" description="New services are coming soon. Check back shortly!" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------- Categories ---------------------------- */}
      <section className="bg-white py-20">
        <div className="container-x">
          <div className="text-center">
            <p className="section-eyebrow">Categories</p>
            <h2 className="section-title">Explore by category</h2>
            <p className="mx-auto mt-2 max-w-xl text-stone-500">From a quick trim to a full day of pampering — find exactly what you need.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map(({ name, icon: Icon, blurb }) => (
              <Link
                key={name}
                href={`/services?category=${encodeURIComponent(name)}`}
                className="group rounded-2xl border border-stone-200 bg-cream p-5 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-700 shadow-sm group-hover:bg-brand-700 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-sans text-sm font-semibold text-stone-900 sm:text-base">{name}</h3>
                <p className="mt-1 hidden text-xs text-stone-500 sm:block">{blurb}</p>
                <p className="mt-2 text-xs font-medium text-brand-700">
                  {counts[name] ?? 0} service{counts[name] === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
            <Link
              href="/services"
              className="flex flex-col justify-between rounded-2xl bg-brand-800 p-5 text-white transition-colors hover:bg-brand-900"
            >
              <span className="font-sans text-sm font-semibold sm:text-base">View every service</span>
              <ArrowRight className="mt-6 h-5 w-5 text-gold-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------- Extra: How booking works --------------------- */}
      <section id="how-it-works" className="container-x scroll-mt-20 py-20">
        <div className="text-center">
          <p className="section-eyebrow">Simple booking</p>
          <h2 className="section-title">How SalonBook works</h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { icon: Search, title: "Choose a service", text: "Browse, search and filter treatments by category or price." },
            { icon: CalendarCheck, title: "Request a slot", text: "Pick a date and time slot that suits you and add a note." },
            { icon: Sparkles, title: "Get confirmed", text: "Our team reviews your request and confirms your appointment." },
            { icon: CreditCard, title: "Pay securely", text: "Pay online with Stripe once confirmed — fast and secure." },
          ].map((step, i) => (
            <li key={step.title} className="card relative p-6">
              <span className="absolute top-5 right-5 font-display text-4xl font-semibold text-brand-100">0{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-sans text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-stone-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --------------------------- Testimonials --------------------------- */}
      <section className="bg-brand-50/60 py-20">
        <div className="container-x">
          <div className="text-center">
            <p className="section-eyebrow">Kind words</p>
            <h2 className="section-title">Loved by our clients</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Amelia R.", service: "Full Balayage", text: "My colour has never looked this natural. Booking took me less than a minute and I got confirmation the same day." },
              { name: "Daniel K.", service: "Classic Men's Cut", text: "Clean, quick and friendly. Love that I can see my appointment status and pay online before I even arrive." },
              { name: "Sofia M.", service: "Hydrating Glow Facial", text: "The facial was pure bliss. The dashboard keeps all my bookings in one place — so convenient!" },
            ].map((t) => (
              <figure key={t.name} className="card p-6">
                <div className="flex gap-0.5 text-gold-500" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-stone-600">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-stone-100 pt-4">
                  <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.service}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="container-x py-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-900 px-8 py-12 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Ready for your next glow-up?</h2>
            <p className="mt-2 text-stone-300">Create a free account and request your first appointment today.</p>
          </div>
          <Link href="/services" className="btn bg-gold-500 px-7 py-3 text-brand-950 hover:bg-gold-400">
            Book an appointment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
