"use client";

import { useEffect, useState } from "react";
import { Ban, Eye, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { PageLoader, TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { UserLite } from "@/lib/types";

type Customer = UserLite & { appointmentCount: number };
type CustomerDetails = UserLite & {
  stats: { pending: number; confirmed: number; cancelled: number; totalPaid: number; payments: number };
};

function UserDetails({ id }: { id: string }) {
  const { data, loading, error } = useApiQuery<CustomerDetails>(`/users/admin/${id}`);
  if (loading) return <PageLoader label="Loading user…" />;
  if (error || !data) return <p className="text-sm text-red-600">{error ?? "User not found"}</p>;
  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar src={data.image} name={data.name} size={64} />
        <div>
          <p className="font-display text-lg font-semibold">{data.name}</p>
          <p className="text-sm text-stone-500">{data.email}</p>
          <div className="mt-1 flex gap-1.5">
            <Badge value={data.role ?? "customer"} />
            <Badge value={data.isBlocked ? "blocked" : "active"} />
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Phone", data.phone || "Not provided"],
          ["Joined", formatDate(data.createdAt)],
          ["Pending", data.stats.pending],
          ["Confirmed", data.stats.confirmed],
          ["Cancelled", data.stats.cancelled],
          ["Total paid", `${formatPrice(data.stats.totalPaid)} (${data.stats.payments})`],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-xl bg-stone-50 p-3">
            <dt className="text-xs text-stone-500">{k}</dt>
            <dd className="mt-0.5 font-semibold text-stone-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ManageUsersPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const { data, setData, loading, error, reload } = useApiQuery<Customer[]>("/users/admin/all", { search });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [target, setTarget] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  async function toggleBlock() {
    if (!target) return;
    const isBlocked = !target.isBlocked;
    setActionLoading(true);
    try {
      const res = await api.patch<{ message: string }>(`/users/admin/${target._id}/block`, { isBlocked });
      setData((prev) => prev?.map((u) => (u._id === target._id ? { ...u, isBlocked } : u)) ?? prev);
      toast.success(res.data.message);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the user"));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Manage Users" description="View registered customers and block or unblock access." />

      <div className="card mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input type="search" className="input pl-10" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <EmptyState title="Couldn't load users" description={error} action={<button className="btn-primary" onClick={reload}>Retry</button>} />
      ) : !data?.length ? (
        <EmptyState icon={Users} title={search ? "No users match your search" : "No customers yet"} />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Appointments</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.image} name={u.name} size={36} />
                      <div>
                        <p className="font-medium text-stone-900">{u.name}</p>
                        <p className="text-xs text-stone-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{u.phone || "—"}</td>
                  <td>{u.appointmentCount}</td>
                  <td><Badge value={u.isBlocked ? "blocked" : "active"} /></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-outline btn-sm" onClick={() => setViewingId(u._id)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      {u.isBlocked ? (
                        <button className="btn-outline btn-sm text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50" onClick={() => setTarget(u)}>
                          <ShieldCheck className="h-3.5 w-3.5" /> Unblock
                        </button>
                      ) : (
                        <button className="btn-outline btn-sm text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => setTarget(u)}>
                          <Ban className="h-3.5 w-3.5" /> Block
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

      <Modal open={Boolean(viewingId)} onClose={() => setViewingId(null)} title="Customer details">
        {viewingId && <UserDetails id={viewingId} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(target)}
        tone={target?.isBlocked ? "primary" : "danger"}
        title={target?.isBlocked ? "Unblock this user?" : "Block this user?"}
        message={
          target &&
          (target.isBlocked ? (
            <><strong>{target.name}</strong> will regain access to their dashboard and bookings.</>
          ) : (
            <><strong>{target.name}</strong> will be signed out immediately and won&apos;t be able to access protected features until unblocked.</>
          ))
        }
        confirmLabel={target?.isBlocked ? "Unblock user" : "Block user"}
        loading={actionLoading}
        onConfirm={toggleBlock}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
