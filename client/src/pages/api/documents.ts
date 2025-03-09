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
        // Search documents
        const { q: query, limit, offset } = req.query;
        if (!query || typeof query !== "string") {
          return res.status(400).json({ error: "Search query is required" });
        }
        const searchResults = await searchApi.searchDocuments(query, {
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        });
        return res.status(200).json(searchResults);

      case "POST":
        // Index document
        const { content, metadata } = req.body;
        if (!content) {
          return res
            .status(400)
            .json({ error: "Document content is required" });
        }
        const indexedDocument = await searchApi.indexDocument({
          content,
          metadata,
        });
        return res.status(201).json(indexedDocument);

      case "DELETE":
        // Delete document
        const { documentId } = req.query;
        if (!documentId || typeof documentId !== "string") {
          return res.status(400).json({ error: "Document ID is required" });
        }
        await searchApi.deleteDocument(documentId);
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
