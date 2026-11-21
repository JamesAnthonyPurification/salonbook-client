"use client";

import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarDays, CreditCard, Scissors, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { formatApptDate, formatPrice } from "@/lib/format";
import type { Appointment } from "@/lib/types";

type AdminStats = {
  totalCustomers: number;
  blockedCustomers: number;
  activeServices: number;
  totalServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  successfulPayments: number;
  totalRevenue: number;
  recentAppointments: Appointment[];
};

export default function AdminOverview() {
  const { data, loading, error, reload } = useApiQuery<AdminStats>("/stats/admin");

  return (
    <>
      <PageHeader title="Admin Overview" description="Your salon at a glance." />

      {loading ? (
        <>
          <StatsSkeleton count={6} />
          <div className="mt-8"><TableSkeleton rows={4} /></div>
        </>
      ) : error || !data ? (
        <EmptyState title="Couldn't load dashboard data" description={error ?? undefined} action={<button className="btn-primary" onClick={reload}>Retry</button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Registered Customers" value={data.totalCustomers} icon={Users} tone="sky" hint={`${data.blockedCustomers} blocked`} />
            <StatCard label="Active Services" value={data.activeServices} icon={Scissors} tone="brand" hint={`${data.totalServices} total services`} />
            <StatCard label="Appointment Requests" value={data.totalAppointments} icon={CalendarDays} tone="stone" hint={`${data.cancelledAppointments} cancelled`} />
            <StatCard label="Pending Appointments" value={data.pendingAppointments} icon={CalendarClock} tone="amber" hint="Awaiting your review" />
            <StatCard label="Confirmed Appointments" value={data.confirmedAppointments} icon={CalendarCheck} tone="emerald" />
            <StatCard label="Successful Payments" value={data.successfulPayments} icon={CreditCard} tone="gold" hint={`${formatPrice(data.totalRevenue)} revenue`} />
          </div>

          <section className="card mt-8 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Latest appointment requests</h2>
              <Link href="/dashboard/admin/appointments" className="text-sm font-medium text-brand-700 hover:underline">Manage all</Link>
            </div>
            {data.recentAppointments.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-500">No appointment requests yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date & time</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.recentAppointments.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <p className="font-medium text-stone-900">{a.customer?.name ?? "—"}</p>
                          <p className="text-xs text-stone-500">{a.customer?.email}</p>
                        </td>
                        <td>{a.service?.serviceName ?? "—"}</td>
                        <td>{formatApptDate(a.appointmentDate)} · {a.timeSlot}</td>
                        <td>{formatPrice(a.servicePrice)}</td>
                        <td><Badge value={a.status} /></td>
                        <td><Badge value={a.paymentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
