import { PageHeader } from "@/components/dashboard/DashboardShell";
import ServiceForm from "@/components/dashboard/ServiceForm";

export const metadata = { title: "Add Service" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="Add New Service" description="New services are active by default and appear on the public services page." />
      <ServiceForm />
    </>
  );
}
