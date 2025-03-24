import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema"; // or wherever your schema is
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;
console.log(process.env.DATABASE_URL);
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export const db = drizzle(client, { schema });
