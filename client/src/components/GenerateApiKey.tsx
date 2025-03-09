// src/components/GenerateApiKey.tsx
import { useState } from "react";
import { api } from "@/utils/api";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner"; // Add this for notifications

const GenerateApiKey = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"search" | "write" | "admin">("search");
  const [operations, setOperations] = useState<("search" | "write" | "delete")[]>(["search"]);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  const { data: apiKeys, isPending } = api.apiKey.list.useQuery();

  const createMutation = api.apiKey.create.useMutation({
    onSuccess: (data) => {
      setShowNewKey(data.value);
      toast.success("API Key created successfully");
      setName("");
      setOperations(["search"]);
      setExpiresIn(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeMutation = api.apiKey.revoke.useMutation({
    onSuccess: () => toast.success("API Key revoked"),
    onError: (error) => toast.error(error.message),
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
              expiresIn: expiresIn || undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Key Name</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <Label>Key Type</Label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as typeof type);
                if (e.target.value === "search") setOperations(["search"]);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="search">Search Only</option>
              <option value="write">Write Access</option>
              <option value="admin">Admin Access</option>
            </select>
          </div>

          <div>
            <Label>Operations</Label>
            <div className="mt-2 space-x-4">
              {["search", "write", "delete"].map((op) => (
                <Label key={op} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={operations.includes(op as "search" | "write" | "delete")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOperations([...operations, op as "search" | "write" | "delete"]);
                      } else {
                        setOperations(operations.filter((o) => o !== op));
                      }
                    }}
                    disabled={type === "search" && op !== "search"}
                  />
                  <span className="ml-2 text-sm">{op}</span>
                </Label>
              ))}
            </div>
          </div>

          <div>
            <Label>Expires In (days)</Label>
            <input
              type="number"
              value={expiresIn || ""}
              onChange={(e) => setExpiresIn(e.target.value ? Number(e.target.value) : null)}
              placeholder="Leave blank for no expiration"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
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
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(showNewKey);
                  toast.success("Copied to clipboard");
                }}
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
              <div key={key.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{key.name}</h3>
                  <p className="text-sm text-gray-500">Type: {key.permissions}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                  {key.lastUsed && (
                    <p className="text-sm text-gray-500">
                      Last Used: {new Date(key.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => revokeMutation.mutate(key.id)}
                  disabled={revokeMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
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