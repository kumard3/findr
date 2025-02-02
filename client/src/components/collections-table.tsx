import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchAPI } from "@/lib/api";
import { env } from "@/env";

type Collection = {
  id: string;
  name: string;
  documentCount: number;
  storageSize: number;
  createdAt: Date;
  updatedAt: Date;
};

export function CollectionsTable() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usage, setUsage] = useState<{
    documentsProcessed: number;
    dataSize: number;
    requestCount: number;
    storageUsed: number;
  } | null>(null);
  const itemsPerPage = 10;

  const searchApi = new SearchAPI(env.NEXT_PUBLIC_API_KEY);

  // useEffect(() => {
  //   const fetchUsage = async () => {
  //     try {
  //       const usageData = await searchApi.getUsage();
  //       setUsage(usageData);
  //     } catch (error) {
  //       console.error("Error fetching usage:", error);
  //     }
  //   };

  //   fetchUsage();
  // }, []);

  // const handleNewCollection = async () => {
  //   try {
  //     await searchApi.generateApiKey({
  //       name: "New Collection",
  //       type: "admin", // Adding required 'type' field
  //       allowedOperations: ["search", "write", "delete"],
  //     });
  //     // Refresh usage data after creating a new collection
  //     const usageData = await searchApi.getUsage();
  //     setUsage(usageData);
  //   } catch (error) {
  //     console.error("Error creating collection:", error);
  //   }
  // };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {/* <Button onClick={handleNewCollection}>New Collection</Button> */}
      </div>

      {usage && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Documents Processed</h3>
            <p className="mt-2 text-2xl font-bold">
              {usage.documentsProcessed}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Data Size</h3>
            <p className="mt-2 text-2xl font-bold">
              {(usage.dataSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Request Count</h3>
            <p className="mt-2 text-2xl font-bold">{usage.requestCount}</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Storage Used</h3>
            <p className="mt-2 text-2xl font-bold">
              {(usage.storageUsed / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Storage Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCollections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>{collection.name}</TableCell>
                <TableCell>{collection.documentCount}</TableCell>
                <TableCell>
                  {(collection.storageSize / 1024 / 1024).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  {new Date(collection.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(collection.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (!(currentPage === 1 || totalPages === 0)) {
                  setCurrentPage((p) => Math.max(1, p - 1));
                }
              }}
              className={
                currentPage === 1 || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (!(currentPage === totalPages || totalPages === 0)) {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }
              }}
              className={
                currentPage === totalPages || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
