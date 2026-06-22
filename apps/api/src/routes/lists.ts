import { Hono } from "hono";
import { and, eq, or } from "drizzle-orm";
import {
  db,
  users,
  friendships,
  friendLists,
  friendListMembers,
} from "@sidequest/db";
import { authMiddleware } from "../middleware/auth.js";
import type { Env } from "../types.js";

export const lists = new Hono<Env>();

lists.use(authMiddleware);

lists.post("/", async (c) => {
  const { name } = await c.req.json();
  if (typeof name !== "string" || name.trim() === "") {
    return c.json({ error: "missing name" }, 400);
  }
  const userId = c.get("userId");
  const [list] = await db
    .insert(friendLists)
    .values({ ownerId: userId, name: name.trim() })
    .returning();
  return c.json({ list }, 201);
});

lists.get("/", async (c) => {
  const userId = c.get("userId");
  const userLists = await db
    .select()
    .from(friendLists)
    .where(eq(friendLists.ownerId, userId));
  return c.json({ lists: userLists });
});

lists.post("/:id/members", async (c) => {
  const userId = c.get("userId");
  const listId = c.req.param("id");
  const { friendId } = await c.req.json();
  if (typeof friendId !== "string" || friendId === "") {
    return c.json({ error: "missing friendId" }, 400);
  }

  const [wantedList] = await db
    .select()
    .from(friendLists)
    .where(and(eq(friendLists.id, listId), eq(friendLists.ownerId, userId)));

  if (!wantedList) {
    return c.json({ error: "could not find list" }, 404);
  }

  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, friendId),
          ),
          and(
            eq(friendships.requesterId, friendId),
            eq(friendships.addresseeId, userId),
          ),
        ),
      ),
    );

  if (!friendship) {
    return c.json({ error: "not friends" }, 403);
  }

  const [member] = await db
    .insert(friendListMembers)
    .values({ listId, memberId: friendId })
    .returning();

  return c.json({ member }, 201);
});

lists.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const listId = c.req.param("id");
  const { name } = await c.req.json();

  if (typeof name !== "string" || name.trim() === "") {
    return c.json({ error: "missing name" }, 400);
  }

  const [list] = await db
    .update(friendLists)
    .set({ name: name.trim() })
    .where(and(eq(friendLists.id, listId), eq(friendLists.ownerId, userId)))
    .returning();

  if (!list) {
    return c.json({ error: "could not find list" }, 404);
  }
  return c.json({ list });
});

lists.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const listId = c.req.param("id");

  const [deleted] = await db
    .delete(friendLists)
    .where(and(eq(friendLists.id, listId), eq(friendLists.ownerId, userId)))
    .returning();

  if (!deleted) {
    return c.json({ error: "could not find list" }, 404);
  }
  return c.json({ deleted });
});

lists.delete("/:id/members/:memberId", async (c) => {
  const userId = c.get("userId");
  const listId = c.req.param("id");
  const memberId = c.req.param("memberId");

  const [wantedList] = await db
    .select()
    .from(friendLists)
    .where(and(eq(friendLists.id, listId), eq(friendLists.ownerId, userId)));

  if (!wantedList) {
    return c.json({ error: "could not find list" }, 404);
  }

  const [removed] = await db
    .delete(friendListMembers)
    .where(
      and(
        eq(friendListMembers.listId, listId),
        eq(friendListMembers.memberId, memberId),
      ),
    )
    .returning();

  if (!removed) {
    return c.json({ error: "member not in list" }, 404);
  }
  return c.json({ removed });
});
