import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, users } from "@sidequest/db";
import type { Env } from "../types";

export const me = new Hono<Env>();

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


me.patch("/", async (c) => {
    const body = await c.req.json();
    const updates: Partial<typeof users.$inferInsert> = {};
    if (typeof body.name === "string" && body.name.trim() !== "") {
        updates.name = body.name.trim();
    }
    if (typeof body.avatarUrl === "string" && body.avatarUrl.trim() !== "") {
        updates.avatarUrl = body.avatarUrl.trim();
    }
    if (typeof body.expoPushToken === "string" && body.expoPushToken.trim() !== "") {
        updates.expoPushToken = body.expoPushToken.trim();
    }
    if (Object.keys(updates).length === 0){
        return c.json({error: "No fields to patch"}, 400)
    }
    const [user] = await db.update(users).set(updates).where(eq(users.id, c.get("userId"))).returning()
    if (!user) {
        return c.json({ error: "unauthorized" }, 401);
    }
    return c.json({user})
});