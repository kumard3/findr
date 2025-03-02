// src/components/IndexData.tsx
import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "sonner";

const IndexData = () => {
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState("");

  const indexMutation = api.indexData.useMutation({
    onSuccess: () => {
      toast.success("Data indexed successfully");
      setFile(null);
      setManualData("");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const handleIndex = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          indexMutation.mutate({ data });
        } catch {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    } else if (manualData) {
      try {
        const data = JSON.parse(manualData);
        indexMutation.mutate({ data });
      } catch {
        toast.error("Invalid JSON format");
      }
    } else {
      toast.error("Please upload a file or enter data manually");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Index Data</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <Label>Upload JSON File</Label>
        <input type="file" accept=".json" onChange={handleFileUpload} className="mt-2" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <Label>Or Enter JSON Manually</Label>
        <textarea
          value={manualData}
          onChange={(e) => setManualData(e.target.value)}
          className="mt-2 block w-full h-32 border rounded p-2"
          placeholder='{"content": "Sample data"}'
        />
      </div>
      <Button
        onClick={handleIndex}
        disabled={indexMutation.isPending}
        className="bg-green-500 hover:bg-green-600"
      >
        {indexMutation.isPending ? "Indexing..." : "Index Data"}
      </Button>
    </div>
  );
};

export default IndexData;