import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: varchar("key").notNull().unique(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true),
  requestCount: integer("request_count").default(0),
  requestLimit: integer("request_limit").default(10000),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Download Requests table
export const downloadRequests = pgTable("download_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  apiKeyId: varchar("api_key_id").notNull().references(() => apiKeys.id),
  url: text("url").notNull(),
  title: varchar("title"),
  platform: varchar("platform").notNull(), // youtube, spotify, instagram
  status: varchar("status").notNull().default("pending"), // pending, in_progress, completed, failed
  progress: integer("progress").default(0), // 0-100
  fileSize: integer("file_size"), // in bytes
  fileName: varchar("file_name"),
  filePath: varchar("file_path"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // platform-specific metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Logs table
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: varchar("level").notNull(), // info, warning, error, debug
  message: text("message").notNull(),
  details: text("details"),
  userId: varchar("user_id").references(() => users.id),
  requestId: varchar("request_id").references(() => downloadRequests.id),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys),
  downloadRequests: many(downloadRequests),
  logs: many(systemLogs),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  downloadRequests: many(downloadRequests),
}));

export const downloadRequestsRelations = relations(downloadRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [downloadRequests.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {
    fields: [downloadRequests.apiKeyId],
    references: [apiKeys.id],
  }),
  logs: many(systemLogs),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
  request: one(downloadRequests, {
    fields: [systemLogs.requestId],
    references: [downloadRequests.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  key: true, // Auto-generated
  createdAt: true,
  requestCount: true,
  lastUsedAt: true,
});

export const insertDownloadRequestSchema = createInsertSchema(downloadRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  progress: true,
  fileSize: true,
  fileName: true,
  filePath: true,
  errorMessage: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type DownloadRequest = typeof downloadRequests.$inferSelect;
export type InsertDownloadRequest = z.infer<typeof insertDownloadRequestSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
