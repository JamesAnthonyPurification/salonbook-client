"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Power, Scissors, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner, TableSkeleton } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

export default function ManageServicesPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const { data, setData, loading, error, reload } = useApiQuery<Service[]>("/services/admin/all", { search, sort });
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  async function toggleStatus(s: Service) {
    const status = s.status === "active" ? "inactive" : "active";
    setTogglingId(s._id);
    try {
      await api.patch(`/services/${s._id}/status`, { status });
      setData((prev) => prev?.map((x) => (x._id === s._id ? { ...x, status } : x)) ?? prev);
      toast.success(`"${s.serviceName}" is now ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update service status"));
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/services/${deleting._id}`);
      setData((prev) => prev?.filter((x) => x._id !== deleting._id) ?? prev);
      toast.success("Service deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the service"));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Manage Services"
        description="Add, edit, activate or remove salon services. Only active services are visible to customers."
        action={<Link href="/dashboard/admin/services/new" className="btn-primary"><Plus className="h-4 w-4" /> Add service</Link>}
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input type="search" className="input pl-10" placeholder="Search by service name…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-52" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <EmptyState title="Couldn't load services" description={error} action={<button className="btn-primary" onClick={reload}>Retry</button>} />
      ) : !data?.length ? (
        <EmptyState
          icon={Scissors}
          title={search ? "No services match your search" : "No services yet"}
          description={search ? "Try a different name." : "Create your first salon service to get started."}
          action={!search && <Link href="/dashboard/admin/services/new" className="btn-primary">Add service</Link>}
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      <span className="max-w-56 truncate font-medium text-stone-900">{s.serviceName}</span>
                    </div>
                  </td>
                  <td>{s.category}</td>
                  <td className="font-semibold">{formatPrice(s.price)}</td>
                  <td>{formatDuration(s.duration)}</td>
                  <td><Badge value={s.status} /></td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => toggleStatus(s)}
                        disabled={togglingId === s._id}
                        title={s.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {togglingId === s._id ? <Spinner className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                        {s.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <Link href={`/dashboard/admin/services/${s._id}/edit`} className="btn-outline btn-sm" title="Edit">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button className="btn-outline btn-sm text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => setDeleting(s)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this service?"
        message={
          deleting && (
            <>
              <strong>{deleting.serviceName}</strong> will be permanently removed. Services with pending or confirmed
              appointments can&apos;t be deleted — deactivate them instead.
            </>
          )
        }
        confirmLabel="Delete service"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
