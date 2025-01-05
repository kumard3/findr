// import { api } from "@/utils/api";
// import { useState } from "react";

// const GenerateApiKey = () => {
//   const [userId, setUserId] = useState("");
//   const generateApiKeyMutation = api.user.generateApiKey.useMutation();

//   const handleGenerateApiKey = async () => {
//     if (!userId) {
//       alert("Please enter a User ID");
//       return;
//     }

//     try {
//       await generateApiKeyMutation.mutateAsync({ userId });
//       alert("API Key generated successfully!");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to generate API Key");
//     }
//   };

//   return (
//     <div className="p-4 border rounded">
//       <h2 className="text-lg font-bold mb-2">Generate API Key</h2>
//       <input
//         type="text"
//         placeholder="Enter User ID"
//         value={userId}
//         onChange={(e) => setUserId(e.target.value)}
//         className="border p-2 rounded w-full mb-2"
//       />
//       <Button
//         onClick={handleGenerateApiKey}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Generate API Key
//       </Button>
//     </div>
//   );
// };

// src/components/ApiKeyManager.tsx
import { useState } from "react";
import { api } from "@/utils/api";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const GenerateApiKey = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"search" | "write" | "admin">("search");
  const [operations, setOperations] = useState<
    ("search" | "write" | "delete")[]
  >(["search"]);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  // const utils = api.useContext();

  const { data: apiKeys, isPending } = api.apiKey.list.useQuery();

  const createMutation = api.apiKey.create.useMutation({
    onSuccess: (data) => {
      setShowNewKey(data.value);
      // void utils.apiKey.list.invalidate();
      setName("");
      setOperations(["search"]);
    },
  });

  const revokeMutation = api.apiKey.revoke.useMutation({
    onSuccess: () => {
      // void utils.apiKey.list.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              name,
              type,
              allowedOperations: operations,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label className="block text-sm font-medium text-gray-700">
              Key Name
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700">
              Key Type
            </Label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as typeof type);
                if (e.target.value === "search") {
                  setOperations(["search"]);
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="search">Search Only</option>
              <option value="write">Write Access</option>
              <option value="admin">Admin Access</option>
            </select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700">
              Operations
            </Label>
            <div className="mt-2 space-x-4">
              {["search", "write", "delete"].map((op) => (
                <Label key={op} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={operations.includes(op as "search" | "write" | "delete")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOperations([
                          ...operations,
                          op as "search" | "write" | "delete",
                        ]);
                      } else {
                        setOperations(operations.filter((o) => o !== op));
                      }
                    }}
                    disabled={type === "search" && op !== "search"}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">{op}</span>
                </Label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create API Key"}
          </Button>
        </form>

        {showNewKey && (
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <p className="text-sm font-medium text-yellow-800">
              Copy your API key (shown only once):
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <code className="block p-2 bg-yellow-100 rounded flex-1 font-mono">
                {showNewKey}
              </code>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <Button
                onClick={() => {
                  void navigator.clipboard.writeText(showNewKey);
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>
        {isPending ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {apiKeys?.map((key) => (
              <div
                key={key.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{key.name}</h3>
                  <p className="text-sm text-gray-500">Type: {key.type}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                  {key.lastUsed && (
                    <p className="text-sm text-gray-500">
                      Last used: {new Date(key.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => revokeMutation.mutate(key.id)}
                  disabled={revokeMutation.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateApiKey;
