import { Hono } from "hono";
import { eq, desc, and, inArray} from "drizzle-orm";
import { db, events, invites, users } from "@sidequest/db";
import { authMiddleware } from "../middleware/auth.js";
import type { Env } from "../types.js";

export const me = new Hono<Env>();

me.use(authMiddleware);

me.get("/", async (c) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, c.get("userId")));
  if (!user) {
    // valid token but the row is gone (deleted account)
    return c.json({ error: "unauthorized" }, 401);
  }
  return c.json({ user });
});

me.get("/activity", async (c) => {
  const userId = c.get("userId")
  const hostedEvents = await db
    .select({
      id: invites.id,
      status: invites.status, 
      createdAt: invites.createdAt,
      attendee: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
      event: { id: events.id, title: events.title },
    })
    .from(invites)
    .innerJoin(events, eq(invites.eventId, events.id))
    .innerJoin(users, eq(invites.attendeeId, users.id))
    .where(and(eq(events.hostId, userId), inArray(invites.status, ['going','declined'])))
    .orderBy(desc(invites.createdAt))
    .limit(50)

    return c.json({ activity: hostedEvents });
})

me.patch("/", async (c) => {
  const body = await c.req.json();
  const updates: Partial<typeof users.$inferInsert> = {};
  if (typeof body.name === "string" && body.name.trim() !== "") {
    updates.name = body.name.trim();
  }
  if (typeof body.avatarUrl === "string" && body.avatarUrl.trim() !== "") {
    updates.avatarUrl = body.avatarUrl.trim();
  }
  if (
    typeof body.expoPushToken === "string" &&
    body.expoPushToken.trim() !== ""
  ) {
    updates.expoPushToken = body.expoPushToken.trim();
  }
  if (Object.keys(updates).length === 0) {
    return c.json({ error: "no fields to patch" }, 400);
  }
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, c.get("userId")))
    .returning();
  if (!user) {
    return c.json({ error: "unauthorized" }, 401);
  }
  return c.json({ user });
});

me.delete("/", async (c) => {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, c.get("userId")))
    .returning({ id: users.id });
  if (!deleted) {
    return c.json({ error: "unauthorized" }, 401);
  }
  return c.json({ ok: true });
});
