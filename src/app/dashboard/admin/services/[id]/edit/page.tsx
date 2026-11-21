"use client";

import Link from "next/link";
import { use } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import ServiceForm from "@/components/dashboard/ServiceForm";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { Service } from "@/lib/types";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useApiQuery<Service>(`/services/${id}`);

  if (loading) return <PageLoader label="Loading service…" />;
  if (error || !data) {
    return (
      <EmptyState
        title="Service not found"
        description={error ?? "This service may have been deleted."}
        action={<Link href="/dashboard/admin/services" className="btn-primary">Back to services</Link>}
      />
    );
  }

  return (
    <>
      <PageHeader title="Update Service" description={`Editing “${data.serviceName}”`} />
      <ServiceForm service={data} />
    </>
  );
}
