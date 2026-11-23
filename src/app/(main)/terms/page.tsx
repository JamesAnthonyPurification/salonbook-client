import type { Metadata } from "next";
import { SALON_INFO } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="container-x max-w-3xl py-14">
      <p className="section-eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: November 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-stone-600">
        <section>
          <h2 className="text-xl font-semibold">Appointment requests</h2>
          <p className="mt-2">
            Submitting a booking creates an appointment <strong>request</strong>. An appointment is only confirmed once
            the salon approves it. You may cancel a request free of charge while it is still pending.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="mt-2">
            Confirmed appointments can be paid online through Stripe. Prices shown at the time of booking apply. Refunds
            for cancelled paid appointments are handled directly by the salon.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Accounts</h2>
          <p className="mt-2">
            You are responsible for keeping your login details secure. The salon may block accounts that misuse the
            platform, for example through repeated fake bookings.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email{" "}
            <a href={`mailto:${SALON_INFO.email}`} className="font-medium text-brand-700">{SALON_INFO.email}</a> or call{" "}
            {SALON_INFO.phone}.
          </p>
        </section>
      </div>
    </article>
  );
}
