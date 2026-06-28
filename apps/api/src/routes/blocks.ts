import { Hono } from "hono";
import { and, eq, or } from "drizzle-orm";
import { db, blocks as blocksTable, friendships, users } from "@sidequest/db";
import { authMiddleware } from "../middleware/auth.js";
import type { Env } from "../types.js";

export const blocks = new Hono<Env>();
blocks.use(authMiddleware);

blocks.post("/:id", async (c) => {
  const userId = c.get("userId");
  const blockedId = c.req.param("id");

  if (blockedId === userId) {
    return c.json({ error: "cannot block yourself" }, 400);
  }

  const [target] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, blockedId));
  if (!target) {
    return c.json({ error: "could not find user" }, 404);
  }

  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, blockedId),
        ),
        and(
          eq(friendships.requesterId, blockedId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    );

  const [block] = await db
    .insert(blocksTable)
    .values({ blockerId: userId, blockedId })
    .onConflictDoNothing()
    .returning();

  return c.json({ block: block ?? null }, 201);
});

blocks.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const blockedId = c.req.param("id");

  const [deleted] = await db
    .delete(blocksTable)
    .where(
      and(
        eq(blocksTable.blockerId, userId),
        eq(blocksTable.blockedId, blockedId),
      ),
    )
    .returning();

  if (!deleted) return c.json({ error: "not found" }, 404);
  return c.json({ deleted });
});
