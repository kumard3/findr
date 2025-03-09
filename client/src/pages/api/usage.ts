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
    if (req.method === "GET") {
      const usageData = await searchApi.getUsage();
      return res.status(200).json(usageData);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("API route error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
