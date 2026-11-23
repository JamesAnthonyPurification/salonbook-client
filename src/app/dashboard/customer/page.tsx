"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarClock, CalendarDays, CalendarX, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useSession } from "@/lib/auth-client";
import { formatApptDate, formatPrice, todayLocal } from "@/lib/format";
import type { Appointment } from "@/lib/types";

type Stats = { total: number; pending: number; confirmed: number; cancelled: number; totalSpent: number; payments: number };

export default function CustomerOverview() {
  const { data: session } = useSession();
  const stats = useApiQuery<Stats>("/appointments/my/stats");
  const appts = useApiQuery<Appointment[]>("/appointments/my");

  const upcoming = (appts.data ?? [])
    .filter((a) => a.status !== "cancelled" && a.appointmentDate >= todayLocal())
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Hello, ${session?.user.name?.split(" ")[0] ?? "there"} 👋`}
        description="Here's a quick look at your salon appointments."
        action={<Link href="/services" className="btn-primary">Book a service <ArrowRight className="h-4 w-4" /></Link>}
      />

      {stats.loading ? (
        <StatsSkeleton />
      ) : stats.error ? (
        <EmptyState title="Couldn't load your stats" description={stats.error} action={<button className="btn-primary" onClick={stats.reload}>Retry</button>} />
      ) : (
        stats.data && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Requests" value={stats.data.total} icon={CalendarDays} tone="brand" />
            <StatCard label="Pending" value={stats.data.pending} icon={CalendarClock} tone="amber" />
            <StatCard label="Confirmed" value={stats.data.confirmed} icon={CalendarCheck} tone="emerald" />
            <StatCard label="Cancelled" value={stats.data.cancelled} icon={CalendarX} tone="stone" />
          </div>
        )
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming appointments</h2>
            <Link href="/dashboard/customer/appointments" className="text-sm font-medium text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="mt-4">
            {appts.loading ? (
              <TableSkeleton rows={3} />
            ) : upcoming.length === 0 ? (
              <p className="rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                No upcoming appointments. <Link href="/services" className="font-medium text-brand-700">Book one now</Link>
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {upcoming.map((a) => (
                  <li key={a._id} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.service?.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.service?.serviceName ?? "Service"}</p>
                      <p className="text-xs text-stone-500">{formatApptDate(a.appointmentDate)} · {a.timeSlot}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge value={a.status} />
                      {a.status === "confirmed" && <Badge value={a.paymentStatus} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card flex flex-col justify-between bg-brand-900 p-6 text-white">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-gold-400">
              <Wallet className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-stone-300">Total paid</p>
            <p className="mt-1 font-sans text-3xl font-bold tabular-nums text-white">
              {stats.data ? formatPrice(stats.data.totalSpent) : "—"}
            </p>
            <p className="mt-1 text-xs text-stone-400">{stats.data?.payments ?? 0} successful payment(s)</p>
          </div>
          <Link href="/dashboard/customer/appointments?tab=payments" className="btn mt-6 bg-white/10 text-white hover:bg-white/20">
            Payment history
          </Link>
        </section>
      </div>
    </>
  );
}
