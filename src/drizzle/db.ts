import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'Missing DATABASE_URL environment variable. Set DATABASE_URL before importing src/drizzle/db.ts.'
  );
}

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql });
