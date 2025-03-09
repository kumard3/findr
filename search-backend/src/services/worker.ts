import { Queue, Worker } from "bullmq";
import { TypesenseService } from "./typesenseService";
import fs from "fs";
import { SingleCollectionDatatype } from "@/types";
export const redisConnection = {
  host: "localhost",
  port: 6379,
  password: "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81",
};

// Create a BullMQ queue for indexing jobs
export const indexQueue = new Queue("indexQueue", {
  connection: redisConnection,
});
const indexWorker = new Worker(
  "indexQueue",
  async (job) => {
    if (job.name === "indexJob") {
      const { documents } = job.data as {
        documents: SingleCollectionDatatype[];
      };

      // Group documents by collection name
      const groupedDocs = documents.reduce((acc, doc) => {
        acc[doc.collection_name] = acc[doc.collection_name] || [];
        acc[doc.collection_name].push({
          id: doc.id,
          document: doc.document,
          indexed_at: doc.indexed_at,
        });
        return acc;
      }, {} as Record<string, SingleCollectionDatatype["document"][]>);
      // Process each collection
      for (const [collectionName, docs] of Object.entries(groupedDocs)) {
        const batches = [];
        // Split into batches of 40 documents
        for (let i = 0; i < docs?.length; i += 40) {
          batches.push(docs?.slice(i, i + 40));
        }
        // Schedule batches with a 10-second delay between each
        let delay = 0;
        for (const batch of batches) {
          await indexQueue.add(
            "batchIndexJob",
            {
              collectionName,
              batch,
            },
            { delay: delay * 1000 }
          );
          delay += 10;
        }
      }
    }
  },
  { connection: redisConnection, concurrency: 1 } // Single concurrency for grouping
);

// Worker for Processing Batch Index Jobs
const batchIndexWorker = new Worker(
  "indexQueue",
  async (job) => {
    if (job.name === "batchIndexJob") {
      const { collectionName, batch } = job.data;
      const typesense = new TypesenseService();
      await typesense.indexDocument(collectionName, batch);
    }
  },
  { connection: redisConnection, concurrency: 5 } // Process up to 5 batches concurrently
);

// Worker Event Listeners
[indexWorker, batchIndexWorker].forEach((worker) => {
  worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
  worker.on("failed", (job, err) => {
    fs.appendFileSync(
      "index-worker-error.log",
      `Job ${job?.id} failed: ${err}\n`
    );
  });
});
