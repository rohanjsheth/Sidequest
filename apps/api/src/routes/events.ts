import { Hono } from "hono";
import { and, eq, or, inArray, gte, count } from "drizzle-orm";
import {
  db,
  events as eventsTable,
  invites,
  friendships,
  users,
} from "@sidequest/db";
import { authMiddleware } from "../middleware/auth.js";
import type { Env } from "../types.js";

export const events = new Hono<Env>();
events.use(authMiddleware);

events.post("/", async (c) => {
  const userId = c.get("userId");
  const { title, location, startsAt, notificationMessage, imageUrl } =
    await c.req.json();

  if (typeof title !== "string" || title.trim() === "") {
    return c.json({ error: "title is required" }, 400);
  }

  if (typeof location !== "string" || location.trim() === "") {
    return c.json({ error: "location is required" }, 400);
  }

  if (
    notificationMessage !== undefined &&
    typeof notificationMessage !== "string"
  ) {
    return c.json({ error: "invalid notificationMessage" }, 400);
  }

  if (imageUrl !== undefined && typeof imageUrl !== "string") {
    return c.json({ error: "invalid imageUrl" }, 400);
  }

  if (startsAt === undefined) {
    return c.json({ error: "startsAt is required" }, 400);
  }
  const startsAtDate = new Date(startsAt);
  if (isNaN(startsAtDate.getTime())) {
    return c.json({ error: "invalid startsAt" }, 400);
  }

  // host's name powers the default blast message
  const [host] = await db.select().from(users).where(eq(users.id, userId));
  const blast =
    notificationMessage?.trim() ||
    `${host?.name ?? "Someone"} wants to sidequest`;

  const [event] = await db
    .insert(eventsTable)
    .values({
      hostId: userId,
      title: title.trim(),
      location: location.trim(),
      startsAt: startsAtDate,
      notificationMessage: blast,
      imageUrl: imageUrl?.trim(),
    })
    .returning();

  return c.json({ event }, 201);
});

events.get("/", async (c) => {
  const userId = c.get("userId");
  const friendList = await db
    .select({
      id: users.id,
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

  const friendIds = friendList.map((f) => f.id);
  const hostIds = [userId, ...friendIds];

  const eventList = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      location: eventsTable.location,
      imageUrl: eventsTable.imageUrl,
      startsAt: eventsTable.startsAt,
      host: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(eventsTable)
    .innerJoin(users, eq(eventsTable.hostId, users.id))
    .where(
      and(
        inArray(eventsTable.hostId, hostIds),
        eq(eventsTable.cancelled, false),
        gte(eventsTable.startsAt, new Date()),
      ),
    )
    .orderBy(eventsTable.startsAt);

  const eventIds = eventList.map((e) => e.id);

  const goingCounts = await db
    .select({ eventId: invites.eventId, going: count() })
    .from(invites)
    .where(and(inArray(invites.eventId, eventIds), eq(invites.status, "going")))
    .groupBy(invites.eventId);

  const countMap = new Map(goingCounts.map((r) => [r.eventId, r.going]));

  const feed = eventList.map((e) => ({
    ...e,
    going: 1 + (countMap.get(e.id) ?? 0),
  }));

  return c.json({ events: feed });
});

events.get("/:id", async (c) => {
  const eventId = c.req.param("id");
  const [event] = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      location: eventsTable.location,
      description: eventsTable.description,
      imageUrl: eventsTable.imageUrl,
      startsAt: eventsTable.startsAt,
      cancelled: eventsTable.cancelled,
      shareToken: eventsTable.shareToken,
      host: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
    .from(eventsTable)
    .innerJoin(users, eq(eventsTable.hostId, users.id))
    .where(eq(eventsTable.id, eventId));

  if (!event) {
    return c.json({ error: "could not find event" }, 404);
  }

  const goingInvites = await db
    .select({ attendeeId: invites.attendeeId })
    .from(invites)
    .where(and(eq(invites.eventId, event.id), eq(invites.status, "going")));
  const going = 1 + goingInvites.length;

  return c.json({ event: { ...event, going } });
});

events.get("/:id/attendees", async (c) => {
  const eventId = c.req.param("id");
  const userId = c.get("userId");

  const [event] = await db
    .select({
      hostId: eventsTable.hostId,
      host: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(eventsTable)
    .innerJoin(users, eq(eventsTable.hostId, users.id))
    .where(eq(eventsTable.id, eventId));

  if (!event) {
    return c.json({ error: "could not find event" }, 404);
  }

  const viewerIsHost = event.hostId === userId;

  const attendees = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
      status: invites.status,
    })
    .from(invites)
    .innerJoin(users, eq(invites.attendeeId, users.id))
    .where(
      viewerIsHost
        ? eq(invites.eventId, eventId)
        : and(eq(invites.eventId, eventId), eq(invites.status, "going")),
    );

  const attendeesWithHost = [
    {
      user: event.host,
      status: "going",
      isHost: true,
    },
    ...attendees.map((attendee) => ({
      ...attendee,
      isHost: false,
    })),
  ];

  return c.json({ attendees: attendeesWithHost });
});

events.patch("/:id", async (c) => {
  const eventId = c.req.param("id");
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: Partial<typeof eventsTable.$inferInsert> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      return c.json({ error: "invalid title" }, 400);
    }
    updates.title = body.title.trim();
  }
  if (body.location !== undefined) {
    if (typeof body.location !== "string" || body.location.trim() === "") {
      return c.json({ error: "invalid location" }, 400);
    }
    updates.location = body.location.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return c.json({ error: "invalid description" }, 400);
    }
    updates.description = body.description.trim();
  }
  if (body.notificationMessage !== undefined) {
    if (
      typeof body.notificationMessage !== "string" ||
      body.notificationMessage.trim() === ""
    ) {
      return c.json({ error: "invalid notificationMessage" }, 400);
    }
    updates.notificationMessage = body.notificationMessage.trim();
  }
  if (body.imageUrl !== undefined) {
    if (typeof body.imageUrl !== "string") {
      return c.json({ error: "invalid imageUrl" }, 400);
    }
    updates.imageUrl = body.imageUrl.trim();
  }
  if (body.cancelled !== undefined) {
    if (typeof body.cancelled !== "boolean") {
      return c.json({ error: "invalid cancelled" }, 400);
    }
    updates.cancelled = body.cancelled;
  }
  if (body.startsAt !== undefined) {
    const parsed = new Date(body.startsAt);
    if (isNaN(parsed.getTime())) {
      return c.json({ error: "invalid startsAt" }, 400);
    }
    updates.startsAt = parsed;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "no fields to patch" }, 400);
  }

  const [event] = await db
    .update(eventsTable)
    .set(updates)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.hostId, userId)))
    .returning();

  if (!event) {
    return c.json({ error: "could not find event" }, 404);
  }
  return c.json({ event });
});

// POST   /:id/rsvp   (yours)

const RSVP_STATUSES = ["going", "declined"];

events.post("/:id/rsvp", async (c) => {
  const eventId = c.req.param("id");
  const userId = c.get("userId");
  const { status } = await c.req.json();

  if (!RSVP_STATUSES.includes(status)) {
    return c.json({ error: "invalid status" }, 400);
  }

  const [event] = await db
    .select({ hostId: eventsTable.hostId, cancelled: eventsTable.cancelled })
    .from(eventsTable)
    .where(eq(eventsTable.id, eventId));

  if (!event) {
    return c.json({ error: "could not find event" }, 404);
  }
  if (event.cancelled) {
    return c.json({ error: "event is cancelled" }, 400);
  }
  if (event.hostId === userId) {
    return c.json({ error: "host cannot rsvp" }, 400);
  }

  const [invite] = await db
    .insert(invites)
    .values({ eventId, attendeeId: userId, status })
    .onConflictDoUpdate({
      target: [invites.eventId, invites.attendeeId],
      set: { status },
    })
    .returning();

  // Positive RSVP auto-friends you with the host (the one instant friendship).
  const { hostId } = event;
  if (hostId !== userId && status !== "declined") {
    const [existing] = await db
      .select({ id: friendships.id, status: friendships.status })
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, hostId),
          ),
          and(
            eq(friendships.requesterId, hostId),
            eq(friendships.addresseeId, userId),
          ),
        ),
      );

    if (!existing) {
      await db.insert(friendships).values({
        requesterId: userId,
        addresseeId: hostId,
        status: "accepted",
      });
    } else if (existing.status !== "accepted") {
      await db
        .update(friendships)
        .set({ status: "accepted" })
        .where(eq(friendships.id, existing.id));
    }
  }

  return c.json({ invite });
});

export const eventShare = new Hono<Env>();

eventShare.get("/:shareToken", async (c) => {
  const shareToken = c.req.param("shareToken");
  const [event] = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      location: eventsTable.location,
      description: eventsTable.description,
      imageUrl: eventsTable.imageUrl,
      startsAt: eventsTable.startsAt,
      cancelled: eventsTable.cancelled,
      shareToken: eventsTable.shareToken,
      host: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
    .from(eventsTable)
    .innerJoin(users, eq(eventsTable.hostId, users.id))
    .where(eq(eventsTable.shareToken, shareToken));

  if (!event) {
    return c.json({ error: "could not find event" }, 404);
  }

  const goingInvites = await db
    .select({ attendeeId: invites.attendeeId })
    .from(invites)
    .where(and(eq(invites.eventId, event.id), eq(invites.status, "going")));
  const going = 1 + goingInvites.length;

  return c.json({ event: { ...event, going } });
});
