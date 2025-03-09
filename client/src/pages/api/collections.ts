import { NextApiRequest, NextApiResponse } from "next";
import { SearchAPI } from "@/lib/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  const searchApi = new SearchAPI(apiKey);

  try {
    switch (req.method) {
      case "GET":
        // Get collections list
        const collections = await searchApi.getCollections();
        return res.status(200).json(collections);

      case "POST":
        // Create new collection
        const { name, allowedOperations } = req.body;
        const newCollection = await searchApi.generateApiKey({
          type: "admin", // Adding required 'type' field
          name,
          allowedOperations: allowedOperations || ["search", "write", "delete"], // Changed 'read' to 'search' to match allowed values
        });
        return res.status(201).json(newCollection);

      case "DELETE":
        // Delete collection
        const { collectionId } = req.query;
        if (!collectionId || typeof collectionId !== "string") {
          return res.status(400).json({ error: "Collection ID is required" });
        }
        await searchApi.deleteCollection(collectionId);
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API route error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
