"use client";

import { useState } from "react";
import { Copy, Lock, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { formatApptDate, formatDateTime, formatPrice, shortRef } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useApiQuery<Transaction[]>("/payments/admin/transactions", { status: status || undefined });
  const total = (data ?? []).filter((t) => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <PageHeader
        title="Transactions"
        description="All Stripe payments recorded by verified webhook events."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
            <Lock className="h-3.5 w-3.5" /> Read-only · payments can&apos;t be edited manually
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {["", "paid", "failed"].map((f) => (
            <button
              key={f || "all"}
              onClick={() => setStatus(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ring-1 ${
                status === f ? "bg-stone-900 text-white ring-stone-900" : "bg-white text-stone-600 ring-stone-200"
              }`}
            >
              {f || "All"}
            </button>
          ))}
        </div>
        {data && <p className="text-sm text-stone-500">Paid total: <span className="font-semibold text-stone-900">{formatPrice(total)}</span></p>}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <EmptyState title="Couldn't load transactions" description={error} action={<button className="btn-primary" onClick={reload}>Retry</button>} />
      ) : !data?.length ? (
        <EmptyState icon={Receipt} title="No transactions yet" description="Payments appear here after Stripe confirms them." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Appointment</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Stripe session</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((t) => (
                <tr key={t._id}>
                  <td>
                    <p className="font-medium text-stone-900">{t.customer?.name ?? "Unknown"}</p>
                    <p className="text-xs text-stone-500">{t.customer?.email}</p>
                  </td>
                  <td>{t.service?.serviceName ?? "—"}</td>
                  <td>
                    {t.appointment?.appointmentDate ? (
                      <>
                        {formatApptDate(t.appointment.appointmentDate)}
                        <span className="block text-xs text-stone-500">{t.appointment.timeSlot}</span>
                      </>
                    ) : "—"}
                  </td>
                  <td className="font-semibold">{formatPrice(t.amount, t.currency)}</td>
                  <td className="uppercase">{t.currency}</td>
                  <td>
                    <button
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-stone-600 hover:text-brand-700"
                      title={t.stripeSessionId}
                      onClick={() => {
                        navigator.clipboard?.writeText(t.stripeSessionId).then(
                          () => toast.success("Session ID copied"),
                          () => toast.error("Could not copy")
                        );
                      }}
                    >
                      {shortRef(t.stripeSessionId)} <Copy className="h-3 w-3" />
                    </button>
                  </td>
                  <td><Badge value={t.status} /></td>
                  <td>{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
