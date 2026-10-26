import { sql } from "drizzle-orm";
import { connection } from "next/server";

import { jsonError } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";

export async function GET() {
  await connection();
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ready" });
  } catch (error) {
    const response = jsonError(error);
    return new Response(response.body, { status: 503, headers: response.headers });
  }
}
