"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CreditCard, Eye, Receipt, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import AppointmentDetails from "@/components/dashboard/AppointmentDetails";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { PageLoader, Spinner, TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, getErrorMessage } from "@/lib/api";
import { formatApptDate, formatDate, formatDateTime, formatPrice, shortRef } from "@/lib/format";
import type { Appointment, Transaction } from "@/lib/types";

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

function AppointmentsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = params.get("tab") === "payments" ? "payments" : "appointments";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const appts = useApiQuery<Appointment[]>("/appointments/my");
  const payments = useApiQuery<Transaction[]>(tab === "payments" ? "/payments/my" : null);

  const [viewing, setViewing] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const list = (appts.data ?? []).filter((a) => filter === "all" || a.status === filter);

  async function confirmCancel() {
    if (!cancelling) return;
    setCancelLoading(true);
    try {
      await api.patch(`/appointments/${cancelling._id}/cancel`);
      toast.success("Appointment request cancelled");
      appts.setData((prev) => prev?.map((a) => (a._id === cancelling._id ? { ...a, status: "cancelled", cancelledBy: "customer" } : a)) ?? prev);
      setCancelling(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel the appointment"));
      appts.reload();
    } finally {
      setCancelLoading(false);
    }
  }

  async function payNow(a: Appointment) {
    setPayingId(a._id);
    try {
      const res = await api.post<{ data: { url: string } }>("/payments/checkout", { appointmentId: a._id });
      toast.loading("Redirecting to secure Stripe checkout…");
      window.location.assign(res.data.data.url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start the payment"));
      setPayingId(null);
      appts.reload();
    }
  }

  const setTab = (t: string) => router.replace(t === "payments" ? `${pathname}?tab=payments` : pathname, { scroll: false });

  return (
    <>
      <PageHeader
        title="My Appointments"
        description="Track requests, cancel pending ones and pay for confirmed appointments."
        action={<Link href="/services" className="btn-primary">New booking</Link>}
      />

      <div className="mb-5 inline-flex rounded-full bg-white p-1 ring-1 ring-stone-200">
        {[
          { key: "appointments", label: "Appointments", icon: CalendarDays },
          { key: "payments", label: "Payment History", icon: Receipt },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              tab === t.key ? "bg-brand-700 text-white" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "appointments" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ring-1 ${
                  filter === f ? "bg-stone-900 text-white ring-stone-900" : "bg-white text-stone-600 ring-stone-200"
                }`}
              >
                {f} {f !== "all" && appts.data ? `(${appts.data.filter((a) => a.status === f).length})` : ""}
              </button>
            ))}
          </div>

          {appts.loading ? (
            <TableSkeleton />
          ) : appts.error ? (
            <EmptyState title="Couldn't load appointments" description={appts.error} action={<button className="btn-primary" onClick={appts.reload}>Retry</button>} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={filter === "all" ? "No appointments yet" : `No ${filter} appointments`}
              description="Browse our services and request your first appointment."
              action={<Link href="/services" className="btn-primary">Browse services</Link>}
            />
          ) : (
            <ul className="space-y-3">
              {list.map((a) => (
                <li key={a._id} className="card flex flex-col gap-4 p-4 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.service?.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{a.service?.serviceName ?? "Deleted service"}</p>
                      <p className="text-xs text-brand-700">{a.service?.category}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {formatApptDate(a.appointmentDate)} · {a.timeSlot}
                      </p>
                      <p className="text-xs text-stone-400">Requested {formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end">
                    <div className="text-sm">
                      <p className="text-xs text-stone-400">Price</p>
                      <p className="font-semibold">{formatPrice(a.servicePrice)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-stone-400">Status</p>
                      <Badge value={a.status} />
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-stone-400">Payment</p>
                      <Badge value={a.paymentStatus} />
                    </div>
                    <div className="flex w-full gap-2 md:w-auto">
                      <button className="btn-outline btn-sm" onClick={() => setViewing(a)}>
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>
                      {a.status === "pending" && (
                        <button className="btn-outline btn-sm text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => setCancelling(a)}>
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                      {a.status === "confirmed" && a.paymentStatus === "unpaid" && (
                        <button className="btn-primary btn-sm" onClick={() => payNow(a)} disabled={payingId !== null}>
                          {payingId === a._id ? <Spinner className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                          {payingId === a._id ? "Processing…" : "Pay Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : payments.loading ? (
        <TableSkeleton />
      ) : payments.error ? (
        <EmptyState title="Couldn't load payments" description={payments.error} action={<button className="btn-primary" onClick={payments.reload}>Retry</button>} />
      ) : !payments.data?.length ? (
        <EmptyState icon={Receipt} title="No payments yet" description="Payments for confirmed appointments will appear here." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Service</th>
                <th>Appointment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Paid on</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.data.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium text-stone-900">{t.service?.serviceName ?? "—"}</td>
                  <td>{t.appointment?.appointmentDate ? `${formatApptDate(t.appointment.appointmentDate)} · ${t.appointment.timeSlot}` : "—"}</td>
                  <td className="font-semibold">{formatPrice(t.amount, t.currency)}</td>
                  <td><Badge value={t.status} /></td>
                  <td className="font-mono text-xs" title={t.stripeSessionId}>{shortRef(t.stripeSessionId)}</td>
                  <td>{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Appointment details">
        {viewing && <AppointmentDetails appointment={viewing} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelling)}
        title="Cancel appointment request?"
        message={
          cancelling && (
            <>
              Your request for <strong>{cancelling.service?.serviceName}</strong> on{" "}
              <strong>{formatApptDate(cancelling.appointmentDate)}</strong> at <strong>{cancelling.timeSlot}</strong> will be
              cancelled. This can&apos;t be undone.
            </>
          )
        }
        confirmLabel="Yes, cancel it"
        loading={cancelLoading}
        onConfirm={confirmCancel}
        onClose={() => setCancelling(null)}
      />
    </>
  );
}

export default function CustomerAppointmentsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading appointments…" />}>
      <AppointmentsContent />
    </Suspense>
  );
}
