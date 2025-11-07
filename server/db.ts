import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DB_URL must be set. Please provide your Supabase database connection string.",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
