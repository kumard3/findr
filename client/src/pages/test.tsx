import { useState } from "react";
import { api } from "@/utils/api";
import GenerateApiKey from "@/components/GenerateApiKey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [indexContent, setIndexContent] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${searchQuery}`,
        {
          headers: {
            "x-api-key": localStorage.getItem("apiKey") || "",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.hits || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleIndex = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sk_J3nn_vEOxIgRiasr80jBsdNA_HRmBSZ9",
        },
        body: JSON.stringify({ content: indexContent }),
      });
      //sk_J3nn_vEOxIgRiasr80jBsdNA_HRmBSZ9

      const data = await response.json();
      console.log("data", data);
      if (data.success) {
        // setIndexContent("");
        alert("Content indexed successfully!");
      }
    } catch (error) {
      console.error("Indexing error:", error);
    }
  };
  console.log(session, "session");
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Search Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Index Content</h2>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={indexContent}
                onChange={(e) => setIndexContent(e.target.value)}
                placeholder="Enter content to index..."
                className="min-h-[200px]"
              />
              <Button onClick={handleIndex} className="w-full">
                Index Content
              </Button>
            </div>
          </div>

          <GenerateApiKey />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Search</h2>
            <div className="space-y-2">
              <Label>Search Query</Label>
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
              {searchResults.map((result: any, index: number) => (
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
  );
};

export default Dashboard;