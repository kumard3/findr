import { PrismaClient } from '@prisma/client'
import type { UsageMetrics } from '../types'

export class UsageLogger {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async logOperation({
    userId,
    collectionId,
    operation,
    status,
    apiKeyId,
    metrics,
    error,
    request
  }: {
    userId: string
    collectionId?: string
    operation: 'search' | 'index' | 'delete'
    status: 'success' | 'failed'
    apiKeyId: string
    metrics?: UsageMetrics
    error?: Error
    request?: Request
  }) {
    return await this.prisma.usageLog.create({
      data: {
        userId,
        collectionId,
        operation,
        status,
        apiKeyId,
        errorMessage: error?.message,
        documentsProcessed: metrics?.documentsProcessed,
        processingTime: metrics?.processingTime,
        dataSize: metrics?.dataSize,
        ipAddress: request?.headers.get('x-forwarded-for'),
        userAgent: request?.headers.get('user-agent')
      }
    })
  }

  async updateCollectionStats(collectionId: string, size: number) {
    return await this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        documentCount: { increment: 1 },
        storageSize: { increment: size }
      }
    })
  }
}
