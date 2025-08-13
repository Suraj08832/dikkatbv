import {
  users,
  apiKeys,
  downloadRequests,
  systemLogs,
  systemSettings,
  type User,
  type UpsertUser,
  type ApiKey,
  type InsertApiKey,
  type DownloadRequest,
  type InsertDownloadRequest,
  type SystemLog,
  type InsertSystemLog,
  type SystemSetting,
  type InsertSystemSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { randomBytes } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // API Key operations
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  incrementApiKeyUsage(keyId: string): Promise<void>;
  
  // Download Request operations
  createDownloadRequest(data: InsertDownloadRequest): Promise<DownloadRequest>;
  getDownloadRequests(limit?: number): Promise<DownloadRequest[]>;
  getDownloadRequestsByUser(userId: string): Promise<DownloadRequest[]>;
  updateDownloadRequest(id: string, data: Partial<DownloadRequest>): Promise<DownloadRequest>;
  deleteDownloadRequest(id: string): Promise<void>;
  
  // System Log operations
  createLog(data: InsertSystemLog): Promise<SystemLog>;
  getLogs(limit?: number): Promise<SystemLog[]>;
  getLogsByLevel(level: string, limit?: number): Promise<SystemLog[]>;
  
  // System Settings operations
  getSetting(key: string): Promise<SystemSetting | undefined>;
  setSetting(data: InsertSystemSetting): Promise<SystemSetting>;
  getAllSettings(): Promise<SystemSetting[]>;
  
  // Statistics operations
  getUserStats(): Promise<{
    totalUsers: number;
    activeApiKeys: number;
    requestsToday: number;
    rateLimited: number;
  }>;
  
  getDownloadStats(): Promise<{
    total: number;
    inProgress: number;
    completedToday: number;
    failed: number;
  }>;
  
  getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    cleanupEligible: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // API Key operations
  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const key = `sk-${randomBytes(32).toString('hex')}`;
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...data,
        key,
      })
      .returning();
    return apiKey;
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, true)));
    return apiKey;
  }

  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey> {
    const [apiKey] = await db
      .update(apiKeys)
      .set(data)
      .where(eq(apiKeys.id, id))
      .returning();
    return apiKey;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async incrementApiKeyUsage(keyId: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({
        requestCount: sql`${apiKeys.requestCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(apiKeys.id, keyId));
  }

  // Download Request operations
  async createDownloadRequest(data: InsertDownloadRequest): Promise<DownloadRequest> {
    const [request] = await db
      .insert(downloadRequests)
      .values(data)
      .returning();
    return request;
  }

  async getDownloadRequests(limit = 50): Promise<DownloadRequest[]> {
    return await db
      .select({
        id: downloadRequests.id,
        userId: downloadRequests.userId,
        apiKeyId: downloadRequests.apiKeyId,
        url: downloadRequests.url,
        title: downloadRequests.title,
        platform: downloadRequests.platform,
        status: downloadRequests.status,
        progress: downloadRequests.progress,
        fileSize: downloadRequests.fileSize,
        fileName: downloadRequests.fileName,
        filePath: downloadRequests.filePath,
        errorMessage: downloadRequests.errorMessage,
        metadata: downloadRequests.metadata,
        createdAt: downloadRequests.createdAt,
        updatedAt: downloadRequests.updatedAt,
        userEmail: users.email,
      })
      .from(downloadRequests)
      .leftJoin(users, eq(downloadRequests.userId, users.id))
      .orderBy(desc(downloadRequests.createdAt))
      .limit(limit);
  }

  async getDownloadRequest(id: string): Promise<DownloadRequest | undefined> {
    const [request] = await db
      .select()
      .from(downloadRequests)
      .where(eq(downloadRequests.id, id));
    return request;
  }

  async getDownloadRequestsByUser(userId: string): Promise<DownloadRequest[]> {
    return await db
      .select()
      .from(downloadRequests)
      .where(eq(downloadRequests.userId, userId))
      .orderBy(desc(downloadRequests.createdAt));
  }

  async updateDownloadRequest(id: string, data: Partial<DownloadRequest>): Promise<DownloadRequest> {
    const [request] = await db
      .update(downloadRequests)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(downloadRequests.id, id))
      .returning();
    return request;
  }

  async deleteDownloadRequest(id: string): Promise<void> {
    await db.delete(downloadRequests).where(eq(downloadRequests.id, id));
  }

  // System Log operations
  async createLog(data: InsertSystemLog): Promise<SystemLog> {
    const [log] = await db
      .insert(systemLogs)
      .values(data)
      .returning();
    return log;
  }

  async getLogs(limit = 100): Promise<SystemLog[]> {
    return await db
      .select({
        id: systemLogs.id,
        level: systemLogs.level,
        message: systemLogs.message,
        details: systemLogs.details,
        userId: systemLogs.userId,
        requestId: systemLogs.requestId,
        timestamp: systemLogs.timestamp,
        metadata: systemLogs.metadata,
        userEmail: users.email,
      })
      .from(systemLogs)
      .leftJoin(users, eq(systemLogs.userId, users.id))
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  async getLogsByLevel(level: string, limit = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.level, level))
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  // System Settings operations
  async getSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting;
  }

  async setSetting(data: InsertSystemSetting): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values(data)
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async getAllSettings(): Promise<SystemSetting[]> {
    return await db
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.key);
  }

  // Statistics operations
  async getUserStats(): Promise<{
    totalUsers: number;
    activeApiKeys: number;
    requestsToday: number;
    rateLimited: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeKeysResult] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(eq(apiKeys.isActive, true));

    const [requestsTodayResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(sql`${downloadRequests.createdAt} >= ${startOfDay}`);

    const [rateLimitedResult] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(sql`${apiKeys.requestCount} >= ${apiKeys.requestLimit}`);

    return {
      totalUsers: totalUsersResult.count,
      activeApiKeys: activeKeysResult.count,
      requestsToday: requestsTodayResult.count,
      rateLimited: rateLimitedResult.count,
    };
  }

  async getDownloadStats(): Promise<{
    total: number;
    inProgress: number;
    completedToday: number;
    failed: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalResult] = await db
      .select({ count: count() })
      .from(downloadRequests);

    const [inProgressResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(eq(downloadRequests.status, "in_progress"));

    const [completedTodayResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(
        and(
          eq(downloadRequests.status, "completed"),
          sql`${downloadRequests.updatedAt} >= ${startOfDay}`
        )
      );

    const [failedResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(eq(downloadRequests.status, "failed"));

    return {
      total: totalResult.count,
      inProgress: inProgressResult.count,
      completedToday: completedTodayResult.count,
      failed: failedResult.count,
    };
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    cleanupEligible: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalFilesResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(eq(downloadRequests.status, "completed"));

    const [totalSizeResult] = await db
      .select({ 
        totalSize: sql<number>`sum(${downloadRequests.fileSize})`.mapWith(Number)
      })
      .from(downloadRequests)
      .where(eq(downloadRequests.status, "completed"));

    const [cleanupEligibleResult] = await db
      .select({ count: count() })
      .from(downloadRequests)
      .where(
        and(
          eq(downloadRequests.status, "completed"),
          sql`${downloadRequests.createdAt} < ${thirtyDaysAgo}`
        )
      );

    return {
      totalFiles: totalFilesResult.count,
      totalSize: totalSizeResult?.totalSize || 0,
      cleanupEligible: cleanupEligibleResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
