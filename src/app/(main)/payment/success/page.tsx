import { Suspense } from "react";
import PaymentStatus from "@/components/payment/PaymentStatus";
import { PageLoader } from "@/components/ui/Loader";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment Successful" };

export default async function PaymentSuccessPage() {
  await requireSession("/dashboard/customer/appointments");
  return (
    <section className="container-x py-16">
      <div className="card mx-auto max-w-2xl px-6 py-12 sm:px-10">
        <Suspense fallback={<PageLoader label="Processing your payment…" />}>
          <PaymentStatus />
        </Suspense>
      </div>
    </section>
  );
}
