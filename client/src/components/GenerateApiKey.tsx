import { api } from "@/utils/api";
import { useState } from "react";

const GenerateApiKey = () => {
  const [userId, setUserId] = useState("");
  const generateApiKeyMutation = api.user.generateApiKey.useMutation();

  const handleGenerateApiKey = async () => {
    if (!userId) {
      alert("Please enter a User ID");
      return;
    }

    try {
      await generateApiKeyMutation.mutateAsync({ userId });
      alert("API Key generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate API Key");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Generate API Key</h2>
      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button
        onClick={handleGenerateApiKey}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate API Key
      </button>
    </div>
  );
};

export default GenerateApiKey;
