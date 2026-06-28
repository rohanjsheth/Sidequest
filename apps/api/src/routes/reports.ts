import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, reports as reportsTable, events } from "@sidequest/db";
import { authMiddleware } from "../middleware/auth.js";
import type { Env } from "../types.js";

export const reports = new Hono<Env>();
reports.use(authMiddleware);

reports.post("/:id", async (c) => {
  const userId = c.get("userId");
  const eventId = c.req.param("id");
  // reason is optional — tolerate an empty body
  const { reportBody } = await c.req.json().catch(() => ({}));

  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, eventId));
  if (!event) {
    return c.json({ error: "could not find plan" }, 404);
  }

  const [report] = await db
    .insert(reportsTable)
    .values({ reporterId: userId, eventId, reportBody: reportBody ?? null })
    .onConflictDoNothing()
    .returning();

  return c.json({ report: report ?? null }, 201);
});
