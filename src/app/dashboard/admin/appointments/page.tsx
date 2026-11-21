"use client";

import { useState } from "react";
import { CalendarCheck, CalendarDays, Eye, MessageSquare, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import AppointmentDetails from "@/components/dashboard/AppointmentDetails";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, getErrorMessage } from "@/lib/api";
import { formatApptDate, formatDate, formatPrice } from "@/lib/format";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const FILTERS = ["", "pending", "confirmed", "cancelled"] as const;

export default function ManageAppointmentsPage() {
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("");
  const { data, setData, loading, error, reload } = useApiQuery<Appointment[]>("/appointments/admin/all", { status: status || undefined });
  const [viewing, setViewing] = useState<Appointment | null>(null);
  const [action, setAction] = useState<{ appt: Appointment; status: Exclude<AppointmentStatus, "pending"> } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function runAction() {
    if (!action) return;
    setActionLoading(true);
    try {
      await api.patch(`/appointments/admin/${action.appt._id}/status`, { status: action.status });
      toast.success(action.status === "confirmed" ? "Appointment confirmed" : "Appointment cancelled");
      setData((prev) =>
        prev
          ?.map((a) => (a._id === action.appt._id ? { ...a, status: action.status, ...(action.status === "cancelled" ? { cancelledBy: "admin" as const } : {}) } : a))
          .filter((a) => !status || a.status === status) ?? prev
      );
      setAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the appointment"));
      reload();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Manage Appointments" description="Review requests, confirm pending appointments or cancel them." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
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

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <EmptyState title="Couldn't load appointments" description={error} action={<button className="btn-primary" onClick={reload}>Retry</button>} />
      ) : !data?.length ? (
        <EmptyState icon={CalendarDays} title="No appointments found" description={status ? `There are no ${status} appointments.` : "Appointment requests will appear here."} />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & time</th>
                <th>Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Requested</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((a) => (
                <tr key={a._id}>
                  <td>
                    <p className="font-medium text-stone-900">{a.customer?.name ?? "Unknown"}</p>
                    <p className="text-xs text-stone-500">{a.customer?.email}</p>
                  </td>
                  <td>
                    <p className="max-w-48 truncate">{a.service?.serviceName ?? "Deleted service"}</p>
                    {a.message && (
                      <p className="inline-flex items-center gap-1 text-xs text-stone-400" title={a.message}>
                        <MessageSquare className="h-3 w-3" /> Has message
                      </p>
                    )}
                  </td>
                  <td>{formatApptDate(a.appointmentDate)}<span className="block text-xs text-stone-500">{a.timeSlot}</span></td>
                  <td className="font-semibold">{formatPrice(a.servicePrice)}</td>
                  <td><Badge value={a.status} /></td>
                  <td><Badge value={a.paymentStatus} /></td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-outline btn-sm" onClick={() => setViewing(a)} title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {a.status === "pending" && (
                        <button className="btn-primary btn-sm" onClick={() => setAction({ appt: a, status: "confirmed" })}>
                          <CalendarCheck className="h-3.5 w-3.5" /> Confirm
                        </button>
                      )}
                      {(a.status === "pending" || a.status === "confirmed") && (
                        <button className="btn-outline btn-sm text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => setAction({ appt: a, status: "cancelled" })}>
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Appointment details">
        {viewing && <AppointmentDetails appointment={viewing} showCustomer />}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        tone={action?.status === "confirmed" ? "primary" : "danger"}
        title={action?.status === "confirmed" ? "Confirm this appointment?" : "Cancel this appointment?"}
        message={
          action && (
            <>
              <strong>{action.appt.service?.serviceName}</strong> for <strong>{action.appt.customer?.name}</strong> on{" "}
              {formatApptDate(action.appt.appointmentDate)} at {action.appt.timeSlot}.
              {action.status === "confirmed"
                ? " The customer will then be able to pay online."
                : action.appt.paymentStatus === "paid"
                  ? " This appointment is already paid — any refund must be handled separately."
                  : " The time slot will become available again."}
            </>
          )
        }
        confirmLabel={action?.status === "confirmed" ? "Confirm appointment" : "Cancel appointment"}
        loading={actionLoading}
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </>
  );
}
