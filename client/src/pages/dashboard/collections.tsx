import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CollectionsTable } from "@/components/collections-table";

export default function CollectionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <CollectionsTable />
      </div>
    </DashboardLayout>
  );
}
