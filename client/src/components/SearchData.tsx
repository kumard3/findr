import { api } from "@/utils/api";
import { useState } from "react";

const SearchData = () => {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { data: searchDataQuery } = api.user.searchData.useQuery(
    {
      apiKey,
      query,
    },
    {
      enabled: !!apiKey || !!query,
    }
  );

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Search Data</h2>
      <input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Enter Query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <div className="mt-4">
        <h3 className="font-bold">Results:</h3>
        <ul>
          {searchDataQuery?.hits?.map((result, index) => (
            <li key={index} className="border-b py-1">
              {result.document.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchData;

const data = {
  facet_counts: [],
  found: 1,
  hits: [
    {
      document: {
        content:
          '[\n  {\n    "id": "1",\n    "userId": "user123",\n    "content": "The quick brown fox jumps over the lazy dog."\n  },\n  {\n    "id": "2",\n    "userId": "user123",\n    "content": "Next.js is a React framework for production-grade applications."\n  },\n  {\n    "id": "3",\n    "userId": "user456",\n    "content": "Typesense is an open-source search engine optimized for speed and simplicity."\n  },\n  {\n    "id": "4",\n    "userId": "user456",\n    "content": "Prisma is a next-generation ORM for Node.js and TypeScript."\n  },\n  {\n    "id": "5",\n    "userId": "user789",\n    "content": "tRPC is a powerful framework for building end-to-end type-safe APIs in TypeScript."\n  },\n  {\n    "id": "6",\n    "userId": "user789",\n    "content": "Cloudflare Workers allow developers to deploy serverless code at the edge."\n  }\n]\n',
        id: "cm504ws4i00041z0ig04a3hld",
        userId: "cm504ss0000001z0i1j6u0hbq",
      },
      highlight: {
        content: {
          matched_tokens: ["Cloud"],
          snippet:
            '6",\n    "userId": "user789",\n    "content": "<mark>Cloud</mark>flare Workers allow developers to',
        },
      },
      highlights: [
        {
          field: "content",
          matched_tokens: ["Cloud"],
          snippet:
            '6",\n    "userId": "user789",\n    "content": "<mark>Cloud</mark>flare Workers allow developers to',
        },
      ],
      text_match: 578730089005449300,
      text_match_info: {
        best_field_score: "1108074561536",
        best_field_weight: 15,
        fields_matched: 1,
        num_tokens_dropped: 0,
        score: "578730089005449337",
        tokens_matched: 1,
        typo_prefix_score: 1,
      },
    },
  ],
  out_of: 1,
  page: 1,
  request_params: {
    collection_name: "documents",
    first_q: "cloud",
    per_page: 10,
    q: "cloud",
  },
  search_cutoff: false,
  search_time_ms: 1,
};
