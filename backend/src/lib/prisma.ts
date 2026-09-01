import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Neon requires uselibpqcompat to honour sslmode=require correctly
// with the current pg-connection-string version
const connectionString = process.env.DATABASE_URL?.includes('uselibpqcompat')
  ? process.env.DATABASE_URL
  : process.env.DATABASE_URL?.replace('?sslmode=require', '?sslmode=require&uselibpqcompat=true');

const pool = new pg.Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });