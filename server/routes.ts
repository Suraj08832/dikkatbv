import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertApiKeySchema, 
  insertDownloadRequestSchema, 
  insertSystemLogSchema,
  insertSystemSettingSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User API Key Management
  app.get('/api/users/:userId/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own API keys unless they're admin
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const apiKeys = await storage.getApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/users/:userId/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertApiKeySchema.parse({
        ...req.body,
        userId,
      });
      
      const apiKey = await storage.createApiKey(validatedData);
      
      await storage.createLog({
        level: "info",
        message: "API key created",
        details: `User created new API key: ${apiKey.name}`,
        userId,
      });
      
      res.json(apiKey);
    } catch (error) {
      console.error("Error creating API key:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.patch('/api/api-keys/:keyId', isAuthenticated, async (req: any, res) => {
    try {
      const { keyId } = req.params;
      const userId = req.user.claims.sub;
      
      const apiKey = await storage.updateApiKey(keyId, req.body);
      
      await storage.createLog({
        level: "info",
        message: "API key updated",
        details: `API key ${keyId} was updated`,
        userId,
      });
      
      res.json(apiKey);
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  app.delete('/api/api-keys/:keyId', isAuthenticated, async (req: any, res) => {
    try {
      const { keyId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.deleteApiKey(keyId);
      
      await storage.createLog({
        level: "info",
        message: "API key deleted",
        details: `API key ${keyId} was deleted`,
        userId,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Download Request Management
  app.get('/api/download-requests', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const requests = await storage.getDownloadRequests(limit);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching download requests:", error);
      res.status(500).json({ message: "Failed to fetch download requests" });
    }
  });

  app.post('/api/download-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertDownloadRequestSchema.parse({
        ...req.body,
        userId,
      });
      
      const request = await storage.createDownloadRequest(validatedData);
      
      await storage.createLog({
        level: "info",
        message: "Download request created",
        details: `New download request for ${request.platform}: ${request.url}`,
        userId,
        requestId: request.id,
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error creating download request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create download request" });
    }
  });

  app.patch('/api/download-requests/:requestId', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.claims.sub;
      
      const request = await storage.updateDownloadRequest(requestId, req.body);
      
      await storage.createLog({
        level: "info",
        message: "Download request updated",
        details: `Download request ${requestId} status: ${request.status}`,
        userId,
        requestId,
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error updating download request:", error);
      res.status(500).json({ message: "Failed to update download request" });
    }
  });

  app.delete('/api/download-requests/:requestId', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.deleteDownloadRequest(requestId);
      
      await storage.createLog({
        level: "info",
        message: "Download request deleted",
        details: `Download request ${requestId} was deleted`,
        userId,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting download request:", error);
      res.status(500).json({ message: "Failed to delete download request" });
    }
  });

  // System Logs
  app.get('/api/logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const level = req.query.level as string;
      
      const logs = level 
        ? await storage.getLogsByLevel(level, limit)
        : await storage.getLogs(limit);
        
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.post('/api/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertSystemLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.createLog(validatedData);
      res.json(log);
    } catch (error) {
      console.error("Error creating log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create log" });
    }
  });

  // System Settings
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get('/api/settings/:key', isAuthenticated, async (req: any, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertSystemSettingSchema.parse(req.body);
      const setting = await storage.setSetting(validatedData);
      
      await storage.createLog({
        level: "info",
        message: "System setting updated",
        details: `Setting ${setting.key} was updated`,
        userId,
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Statistics endpoints
  app.get('/api/stats/users', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/stats/downloads', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDownloadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching download stats:", error);
      res.status(500).json({ message: "Failed to fetch download stats" });
    }
  });

  app.get('/api/stats/storage', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getStorageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching storage stats:", error);
      res.status(500).json({ message: "Failed to fetch storage stats" });
    }
  });

  // API Key validation middleware for external API calls
  const validateApiKey = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Missing or invalid API key" });
      }
      
      const apiKey = authHeader.substring(7);
      const keyRecord = await storage.getApiKeyByKey(apiKey);
      
      if (!keyRecord) {
        return res.status(401).json({ message: "Invalid API key" });
      }
      
      if (keyRecord.requestCount >= keyRecord.requestLimit) {
        return res.status(429).json({ message: "Rate limit exceeded" });
      }
      
      await storage.incrementApiKeyUsage(keyRecord.id);
      req.apiKey = keyRecord;
      next();
    } catch (error) {
      console.error("Error validating API key:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Public API endpoints for external consumption
  app.post('/api/v1/download', validateApiKey, async (req: any, res) => {
    try {
      const { url, platform } = req.body;
      
      if (!url || !platform) {
        return res.status(400).json({ message: "URL and platform are required" });
      }
      
      const request = await storage.createDownloadRequest({
        userId: req.apiKey.userId,
        apiKeyId: req.apiKey.id,
        url,
        platform,
        status: "pending",
      });
      
      await storage.createLog({
        level: "info",
        message: "API download request received",
        details: `External API request for ${platform}: ${url}`,
        userId: req.apiKey.userId,
        requestId: request.id,
      });
      
      res.json({
        id: request.id,
        status: request.status,
        message: "Download request queued successfully"
      });
    } catch (error) {
      console.error("Error processing API download request:", error);
      res.status(500).json({ message: "Failed to process download request" });
    }
  });

  app.get('/api/v1/download/:requestId', validateApiKey, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const requests = await storage.getDownloadRequestsByUser(req.apiKey.userId);
      const request = requests.find(r => r.id === requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Download request not found" });
      }
      
      res.json({
        id: request.id,
        status: request.status,
        progress: request.progress,
        fileName: request.fileName,
        fileSize: request.fileSize,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching API download status:", error);
      res.status(500).json({ message: "Failed to fetch download status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
