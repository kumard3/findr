import { CollectionsTable } from "@/components/collections-table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Page() {
  return (
    <DashboardLayout>
      <CollectionsTable />
    </DashboardLayout>
  );
}
