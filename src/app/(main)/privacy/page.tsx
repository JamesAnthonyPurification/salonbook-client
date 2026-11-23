import type { Metadata } from "next";
import { SALON_INFO } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="container-x max-w-3xl py-14">
      <p className="section-eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: November 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-stone-600">
        <section>
          <h2 className="text-xl font-semibold">Information we collect</h2>
          <p className="mt-2">
            When you create a SalonBook account we store your name, email address and, optionally, a profile image and
            phone number. If you sign in with Google we receive only your basic profile (name, email and profile
            picture). When you book, we store the appointment details you submit.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">How we use it</h2>
          <p className="mt-2">
            Your information is used solely to manage your account, process appointment requests and show your booking
            and payment history. We never sell or share your personal data with third parties for marketing.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="mt-2">
            Payments are processed securely by Stripe. SalonBook never sees or stores your card details; we only keep a
            payment reference, amount and status.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Your choices</h2>
          <p className="mt-2">
            You can update your profile at any time from your dashboard. To delete your account or data, contact us at{" "}
            <a href={`mailto:${SALON_INFO.email}`} className="font-medium text-brand-700">{SALON_INFO.email}</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
