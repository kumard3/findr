import { PrismaClient } from "@prisma/client";
import { Client } from "typesense";
import type { Env, UserWithApiKey } from "../types";

export class UserManager {
    private prisma: PrismaClient;
    private typesense: Client;

    constructor(env: Env) {
        this.prisma = new PrismaClient();
        this.typesense = new Client({
            nodes: [
                {
                    host: env.TYPESENSE_HOST || "localhost",
                    port: env.TYPESENSE_PORT || 8108,
                    protocol: "http",
                },
            ],
            apiKey: env.TYPESENSE_ADMIN_KEY,
        });
    }

    async validateUser(apiKey: string): Promise<UserWithApiKey | null> {
        return await this.prisma.apiKey.findUnique({
            where: { value: apiKey },
            include: { user: true },
        });
    }

    async incrementUsage(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { used: { increment: 1 } },
        });
    }

    async createCollection(userId: string): Promise<void> {
        await this.typesense.collections().create({
            name: `collection_${userId}`,
            fields: [
                { name: ".*", type: "auto" },
                { name: "user_id", type: "string", facet: true },
                { name: "created_at", type: "int64", sort: true },
            ],
            default_sorting_field: "created_at",
        });
    }
}
