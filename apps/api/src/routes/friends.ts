import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { and, eq, or } from "drizzle-orm";
import { db, users, friendships } from "@sidequest/db";
import type { Env } from "../types";
import parsePhoneNumberFromString from "libphonenumber-js";

export const friends = new Hono<Env>();

// every friends route requires auth
friends.use(authMiddleware);

friends.post("/request", async (c) => {
  const userId = c.get("userId");
  const { phone } = await c.req.json();
  const parsed = parsePhoneNumberFromString(phone, "US");
  if (!parsed?.isValid()) {
    return c.json({ error: "invalid phone number" }, 400);
  }
  const [requested] = await db
    .select()
    .from(users)
    .where(eq(users.phone, parsed.number));
  if (!requested) {
    return c.json({ error: "could not find user" }, 404);
  }
  if (requested.id === userId) {
    return c.json({ error: "cannot friend yourself" }, 400);
  }
  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, requested.id),
        ),
        and(
          eq(friendships.requesterId, requested.id),
          eq(friendships.addresseeId, userId),
        ),
      ),
    );
  if (existing) {
    return c.json(
      { error: "friendship already exists", status: existing.status },
      409,
    );
  }
  const [friendship] = await db
    .insert(friendships)
    .values({ requesterId: userId, addresseeId: requested.id })
    .returning();
  return c.json({ friendship }, 201);
});

friends.post("/:id/accept", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  const [request] = await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(and(eq(friendships.id, id), eq(friendships.addresseeId, userId)))
    .returning();

  if (!request) {
    return c.json({ error: "unauthorized" }, 403);
  }
  return c.json({ friendship: request });
});

friends.post("/:id/decline", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  const [request] = await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, id),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .returning();

  if (!request) {
    return c.json({ error: "unauthorized" }, 403);
  }

  return c.json({ deleted: request });
});

friends.get("/", async (c) => {
  const userId = c.get("userId");
  const friendList = await db
    .select({
      friendshipId: friendships.id,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        phone: users.phone,
      },
    })
    .from(friendships)
    .innerJoin(
      users,
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(users.id, friendships.addresseeId),
        ),
        and(
          eq(friendships.addresseeId, userId),
          eq(users.id, friendships.requesterId),
        ),
      ),
    )
    .where(eq(friendships.status, "accepted"));
  return c.json({ friends: friendList });
});

friends.get("/requests", async (c) => {
  const userId = c.get("userId");
  const requests = await db
    .select({
      friendshipId: friendships.id,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        phone: users.phone,
      },
    })
    .from(friendships)
    .innerJoin(
      users,
      and(
        eq(friendships.addresseeId, userId),
        eq(users.id, friendships.requesterId),
      ),
    )
    .where(eq(friendships.status, "pending"));
  return c.json({ requests });
});

friends.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  const [deleted] = await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, id),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )
    .returning();

  if (!deleted) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json({ deleted });
});
