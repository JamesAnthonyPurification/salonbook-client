import type { Metadata } from "next";
import { Suspense } from "react";
import ServiceBrowser from "@/components/services/ServiceBrowser";
import { ServiceCardSkeleton } from "@/components/services/ServiceCard";

export const metadata: Metadata = {
  title: "Browse Services",
  description: "Browse SalonBook's hair, skin, nail, makeup and spa services.",
};

export default function BrowseServicesPage() {
  return (
    <>
      <section className="border-b border-stone-200/70 bg-white">
        <div className="container-x py-12">
          <p className="section-eyebrow">Our menu</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Browse salon services</h1>
          <p className="mt-2 max-w-2xl text-stone-500">
            Search by name, filter by category and sort by price to find the perfect treatment.
          </p>
        </div>
      </section>
      <section className="container-x py-10">
        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ServiceBrowser />
        </Suspense>
      </section>
    </>
  );
}
