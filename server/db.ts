import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let poolVar: Pool | undefined;
let dbVar: any;

if (process.env.DATABASE_URL) {
  poolVar = new Pool({ connectionString: process.env.DATABASE_URL });
  dbVar = drizzle({ client: poolVar, schema });
} else {
  // Allow app to boot without DB (e.g., on Heroku before config), but throw on actual DB use
  console.warn("DATABASE_URL not set; running in no-db mode. Set DATABASE_URL to enable persistence.");
  dbVar = new Proxy({}, {
    get() {
      throw new Error("DATABASE_URL must be set to use the database. Configure it in Heroku Config Vars.");
    }
  });
}

export const pool = poolVar as any;
export const db = dbVar as any;