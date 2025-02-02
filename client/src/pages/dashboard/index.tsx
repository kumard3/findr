import { CollectionsTable } from "@/components/collections-table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Page() {

  return (
    <DashboardLayout>
      {/* <Button onClick={signOut}>
        Sign Out
      </Button> */}
      <CollectionsTable />
    </DashboardLayout>
  );
}
