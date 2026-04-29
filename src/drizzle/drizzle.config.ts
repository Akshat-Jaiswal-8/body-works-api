import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'Missing required environment variable DATABASE_URL for drizzle-kit. Set it in your environment or .env file before running Drizzle commands.',
  );
}

export default defineConfig({
  dialect: 'postgresql',
  out: './src/drizzle/migrations',
  schema: './src/drizzle/schema.ts',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
