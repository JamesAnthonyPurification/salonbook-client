"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";
import { api, getErrorMessage } from "@/lib/api";
import { formatApptDate, formatPrice, shortRef } from "@/lib/format";

type SessionInfo = {
  stripePaymentStatus: string;
  recorded: boolean;
  amount: number;
  currency: string;
  transaction: { stripeSessionId: string; createdAt: string } | null;
  appointment: { appointmentDate: string; timeSlot: string; serviceName?: string; paymentStatus: string } | null;
};

const MAX_ATTEMPTS = 12;

export default function PaymentStatus() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(sessionId ? null : "Missing payment session reference.");
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    // Poll until our server has recorded the payment from the verified Stripe webhook
    async function check(n: number) {
      try {
        const res = await api.get<{ data: SessionInfo }>(`/payments/session/${sessionId}`);
        if (cancelled) return;
        setInfo(res.data.data);
        setAttempts(n);
        if (!res.data.data.recorded && n < MAX_ATTEMPTS) timer.current = setTimeout(() => check(n + 1), 2500);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Could not verify your payment"));
      }
    }
    check(1);
    return () => {
      cancelled = true;
      clearTimeout(timer.current);
    };
  }, [sessionId]);

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-14 w-14 text-red-500" />
        <h1 className="mt-4 text-2xl font-semibold">We couldn&apos;t verify this payment</h1>
        <p className="mt-2 text-stone-500">{error}</p>
        <Link href="/dashboard/customer/appointments" className="btn-primary mt-6">Go to my appointments</Link>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center text-stone-500">
        <Spinner className="h-10 w-10 text-brand-600" />
        <p className="font-medium">Processing your payment…</p>
      </div>
    );
  }

  const confirmed = info.recorded;
  const stillWaiting = !confirmed && attempts < MAX_ATTEMPTS && info.stripePaymentStatus === "paid";

  return (
    <div className="text-center">
      {confirmed ? (
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
      ) : stillWaiting ? (
        <Spinner className="mx-auto h-14 w-14 text-brand-600" />
      ) : (
        <Clock className="mx-auto h-14 w-14 text-amber-500" />
      )}
      <h1 className="mt-4 text-3xl font-semibold">
        {confirmed ? "Payment successful!" : stillWaiting ? "Confirming your payment…" : "Payment is being processed"}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-stone-500">
        {confirmed
          ? "Thank you! Your appointment is confirmed and fully paid. We look forward to seeing you."
          : stillWaiting
            ? "Stripe has received your payment. We're waiting for the secure confirmation to update your appointment."
            : "Your payment hasn't been confirmed yet. It will appear in your appointments as soon as Stripe confirms it."}
      </p>

      <div className="mx-auto mt-8 max-w-sm divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-stone-50/60 text-left text-sm">
        {info.appointment?.serviceName && (
          <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Service</span><span className="font-medium">{info.appointment.serviceName}</span></div>
        )}
        {info.appointment && (
          <div className="flex justify-between gap-4 px-4 py-3">
            <span className="text-stone-500">Appointment</span>
            <span className="text-right font-medium">{formatApptDate(info.appointment.appointmentDate)} · {info.appointment.timeSlot}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Amount</span><span className="font-semibold">{formatPrice(info.amount, info.currency)}</span></div>
        <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Payment status</span><span className="font-medium capitalize">{confirmed ? "Paid" : "Pending confirmation"}</span></div>
        {sessionId && (
          <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Reference</span><span className="font-mono text-xs" title={sessionId}>{shortRef(sessionId)}</span></div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/customer/appointments" className="btn-primary">View my appointments</Link>
        <Link href="/services" className="btn-outline">Browse more services</Link>
      </div>
    </div>
  );
}
