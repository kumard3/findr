import { api } from "@/utils/api";
import { useState } from "react";

const IndexData = () => {
  const [apiKey, setApiKey] = useState("");
  const [content, setContent] = useState("");
  const indexDataMutation = api.user.indexData.useMutation();

  const handleIndexData = async () => {
    if (!apiKey || !content) {
      alert("Please provide both API Key and Content");
      return;
    }

    try {
      await indexDataMutation.mutateAsync({
        apiKey,
        data: JSON.parse(content),
      });
      alert("Data indexed successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to index data");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Index Data</h2>
      <input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <textarea
        placeholder="Enter Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded w-full mb-2"
        rows={4}
      />
      <button
        onClick={handleIndexData}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Index Data
      </button>
    </div>
  );
};

export default IndexData;
