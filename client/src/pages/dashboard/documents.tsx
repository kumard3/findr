import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchAPI } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [indexName, setIndexName] = useState("");
  const session = useSession();
  console.log(session, "session");
  const searchApi = new SearchAPI(
    "sk_4Etu0CEwfh7C5BAHWJnyu8rfgFyn5Tgh",
    session.data?.user.id || ""
  );

  // Handle search functionality
  const handleSearch = async () => {
    try {
      const results = await searchApi.searchDocuments(searchQuery, {
        collectionName: indexName,
      });
      setSearchResults(results.hits || []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search documents");
    }
  };

  // Capture the selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file indexing
  const handleIndex = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to index");
      return;
    }

    setIsIndexing(true);
    try {
      const fileContent = await readFileAsText(selectedFile);
      const data = parseFileContent(fileContent, selectedFile.name);
      await searchApi.indexDocument({
        indexName: indexName,
        body: data,
      });
      // if (Array.isArray(data)) {
      //   for (const doc of data) {
      //     await searchApi.indexDocument({
      //       indexName: indexName,
      //       body: doc,
      //     });
      //   }
      // } else {
      //   await searchApi.indexDocument({
      //     indexName: indexName,
      //     body: data,
      //   });
      // }
      setSelectedFile(null); // Clear the input after success
      toast.success("File indexed successfully!");
    } catch (error) {
      console.error("Indexing error:", error);
      toast.error("Failed to index file");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Documents</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* File Indexing Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Index File</h2>
              <div className="space-y-2">
                <Label>Upload File (JSON or CSV)</Label>
                <Input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  disabled={isIndexing}
                />
                <Button
                  onClick={handleIndex}
                  disabled={isIndexing || !selectedFile}
                  className="w-full"
                >
                  {isIndexing ? "Indexing..." : "Index File"}
                </Button>
              </div>
              <Input
                type="text"
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
                placeholder="Enter index name"
              />
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Search</h2>
              <div className="space-y-2">
                <Label>Search Query</Label>
                <div>
                  <Label>Index Name</Label>
                  <Input
                    type="text"
                    value={indexName}
                    onChange={(e) => setIndexName(e.target.value)}
                    placeholder="Enter index name"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search query..."
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.document, null, 2)}
                    </pre>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <p className="text-gray-500">No results found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to read file content as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Helper function to parse file content based on extension
const parseFileContent = (content: string, fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "json") {
    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Invalid JSON format");
    }
  } else if (extension === "csv") {
    // Placeholder for CSV parsing (e.g., use PapaParse library)
    throw new Error("CSV parsing not implemented yet");
  } else {
    throw new Error("Unsupported file type");
  }
};
