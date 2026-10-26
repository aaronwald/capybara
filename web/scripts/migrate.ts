import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const pool = new Pool({ connectionString, max: 1 });
const migrationsDir = join(process.cwd(), "migrations");

try {
  await pool.query("select pg_advisory_lock(1128354865)");
  await pool.query(`
    create table if not exists capybara_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of files) {
    const sql = await readFile(join(migrationsDir, name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const applied = await pool.query<{ checksum: string }>(
      "select checksum from capybara_migrations where name = $1",
      [name],
    );

    if (applied.rowCount) {
      if (applied.rows[0]?.checksum !== checksum) {
        throw new Error(`Applied migration ${name} has changed.`);
      }
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into capybara_migrations (name, checksum) values ($1, $2)",
        [name, checksum],
      );
      await client.query("commit");
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.query("select pg_advisory_unlock(1128354865)").catch(() => undefined);
  await pool.end();
}
