import Badge from "@/components/ui/Badge";
import { formatApptDate, formatDateTime, formatDuration, formatPrice } from "@/lib/format";
import type { Appointment } from "@/lib/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right font-medium text-stone-900">{children}</dd>
    </div>
  );
}

export default function AppointmentDetails({ appointment: a, showCustomer = false }: { appointment: Appointment; showCustomer?: boolean }) {
  return (
    <div>
      <div className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.service?.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
        <div>
          <p className="text-xs font-semibold text-brand-700">{a.service?.category}</p>
          <p className="font-display text-lg font-semibold">{a.service?.serviceName ?? "Deleted service"}</p>
          {a.service?.duration && <p className="text-xs text-stone-500">{formatDuration(a.service.duration)}</p>}
        </div>
      </div>
      <dl className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
        {showCustomer && (
          <Row label="Customer">
            {a.customer?.name ?? "Unknown"}
            <span className="block text-xs font-normal text-stone-500">{a.customer?.email}</span>
            {a.customer?.phone && <span className="block text-xs font-normal text-stone-500">{a.customer.phone}</span>}
          </Row>
        )}
        <Row label="Appointment date">{formatApptDate(a.appointmentDate)}</Row>
        <Row label="Time slot">{a.timeSlot}</Row>
        <Row label="Service price">{formatPrice(a.servicePrice)}</Row>
        <Row label="Appointment status"><Badge value={a.status} /></Row>
        <Row label="Payment status"><Badge value={a.paymentStatus} /></Row>
        <Row label="Requested on">{formatDateTime(a.createdAt)}</Row>
        {a.paidAt && <Row label="Paid on">{formatDateTime(a.paidAt)}</Row>}
        {a.cancelledBy && <Row label="Cancelled by"><span className="capitalize">{a.cancelledBy}</span></Row>}
      </dl>
      <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
        <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Customer message</p>
        <p className="mt-1 whitespace-pre-line text-stone-700">{a.message || "No message provided."}</p>
      </div>
    </div>
  );
}
