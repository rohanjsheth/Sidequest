import { events, friendships, invites, users, db } from "@sidequest/db";
import { and, eq, gte, or } from "drizzle-orm";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const DEFAULT_REVIEW_PHONE = "+14155550100";
const DEFAULT_REVIEW_CODE = "000000";
const REVIEW_NAME = "Apple Reviewer";

function normalizedReviewPhone() {
  const configured = process.env.APPLE_REVIEW_PHONE ?? DEFAULT_REVIEW_PHONE;
  return (
    parsePhoneNumberFromString(configured, "US")?.number ?? DEFAULT_REVIEW_PHONE
  );
}

export function isReviewPhone(phone: string) {
  return (
    process.env.APPLE_REVIEW_LOGIN_ENABLED === "true" &&
    phone === normalizedReviewPhone()
  );
}

export function isReviewCode(code: unknown) {
  return (
    String(code) === (process.env.APPLE_REVIEW_CODE ?? DEFAULT_REVIEW_CODE)
  );
}

export async function ensureReviewUser(phone: string) {
  const [user] = await db
    .insert(users)
    .values({ phone, name: REVIEW_NAME })
    .onConflictDoUpdate({
      target: users.phone,
      set: { name: REVIEW_NAME },
    })
    .returning();

  await seedReviewData(user.id);
  return user;
}

async function upsertDemoUser(phone: string, name: string) {
  const [user] = await db
    .insert(users)
    .values({ phone, name })
    .onConflictDoUpdate({
      target: users.phone,
      set: { name },
    })
    .returning();
  return user;
}

async function ensureFriendship(requesterId: string, addresseeId: string) {
  const [existing] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId),
        ),
        and(
          eq(friendships.requesterId, addresseeId),
          eq(friendships.addresseeId, requesterId),
        ),
      ),
    );

  if (existing) {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, existing.id));
    return;
  }

  await db.insert(friendships).values({
    requesterId,
    addresseeId,
    status: "accepted",
  });
}

async function ensureFutureEvent({
  hostId,
  title,
  location,
  description,
  startsAt,
}: {
  hostId: string;
  title: string;
  location: string;
  description: string;
  startsAt: Date;
}) {
  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(
      and(
        eq(events.hostId, hostId),
        eq(events.title, title),
        eq(events.cancelled, false),
        gte(events.startsAt, new Date()),
      ),
    );

  if (existing) return existing.id;

  const [event] = await db
    .insert(events)
    .values({
      hostId,
      title,
      location,
      startsAt,
      description,
      notificationMessage: description,
    })
    .returning({ id: events.id });

  return event.id;
}

async function ensureInvite(
  eventId: string,
  attendeeId: string,
  status: string,
) {
  await db
    .insert(invites)
    .values({ eventId, attendeeId, status })
    .onConflictDoUpdate({
      target: [invites.eventId, invites.attendeeId],
      set: { status },
    });
}

function daysFromNow(days: number, hours = 0) {
  return new Date(
    Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000,
  );
}

async function seedReviewData(reviewUserId: string) {
  const maya = await upsertDemoUser("+14155550101", "Maya");
  const dev = await upsertDemoUser("+14155550102", "Dev");

  await Promise.all([
    ensureFriendship(reviewUserId, maya.id),
    ensureFriendship(reviewUserId, dev.id),
  ]);

  const hostedEventId = await ensureFutureEvent({
    hostId: reviewUserId,
    title: "Rooftop sunset hangs",
    location: "Cavalier Rooftop",
    description: "A seeded App Review plan for exercising sharing and RSVPs.",
    startsAt: daysFromNow(1, 2),
  });

  await Promise.all([
    ensureInvite(hostedEventId, maya.id, "going"),
    ensureInvite(hostedEventId, dev.id, "invited"),
  ]);

  const invitedEventId = await ensureFutureEvent({
    hostId: maya.id,
    title: "Pickup basketball",
    location: "Mission Rec Center",
    description: "A seeded invite so the review account has an incoming plan.",
    startsAt: daysFromNow(2, 1),
  });

  await ensureInvite(invitedEventId, reviewUserId, "invited");
}
