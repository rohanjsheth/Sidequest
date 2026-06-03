import { pgTable, uuid, text, timestamp, unique} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull().unique(),
    name: text("name"),
    avatarUrl : text("avatar_url"),
    expoPushToken: text("expo_push_token"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const friendships = pgTable("friendships", {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId : uuid("requester_id").notNull().references(() => users.id),
    addresseeId : uuid("addressee_id").notNull().references(() => users.id),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const friendLists = pgTable("friend_lists", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const friendListMembers = pgTable("friend_list_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id").notNull().references(() => friendLists.id),
    memberId: uuid("member_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    }, (table) => [
        unique().on(table.listId, table.memberId)
    ]);

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    hostId: uuid("host_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    location: text("location"),
    status: text("status").notNull().default("active"),
    description: text("description"),
    notificationMessage: text("notification_message"),
    shareToken: text("share_token").notNull().unique().$defaultFn(() => nanoid()),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  });

export const invites = pgTable("invites", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => events.id),
    attendeeId: uuid("attendee_id").notNull().references(() => users.id),
    status: text("status").notNull().default("invited"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
      unique().on(table.eventId, table.attendeeId),
  ]);