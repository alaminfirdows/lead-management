import "server-only"

import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"

import * as schema from "./schema"

declare global {
  var _pgPool: Pool | undefined
}

const pool =
  globalThis._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool
}

export const db = drizzle(pool, { schema, casing: "snake_case" })
