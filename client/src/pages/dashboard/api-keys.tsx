import { DashboardLayout } from "@/components/layout/DashboardLayout";
import GenerateApiKey from "@/components/GenerateApiKey";

export default function ApiKeysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <GenerateApiKey />
      </div>
    </DashboardLayout>
  );
}
