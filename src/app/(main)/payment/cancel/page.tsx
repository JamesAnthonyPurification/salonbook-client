import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return (
    <section className="container-x py-16">
      <div className="card mx-auto max-w-xl px-6 py-12 text-center sm:px-10">
        <XCircle className="mx-auto h-16 w-16 text-stone-400" />
        <h1 className="mt-4 text-3xl font-semibold">Payment cancelled</h1>
        <p className="mx-auto mt-2 max-w-md text-stone-500">
          No worries — you haven&apos;t been charged. Your appointment is still confirmed and you can complete the
          payment any time from your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/customer/appointments" className="btn-primary">Back to my appointments</Link>
          <Link href="/" className="btn-outline">Go home</Link>
        </div>
      </div>
    </section>
  );
}
