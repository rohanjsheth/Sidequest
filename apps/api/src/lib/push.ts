import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { and, inArray, isNotNull } from "drizzle-orm";
import { db, users } from "@sidequest/db";

const expo = new Expo();

type Push = { title: string; body: string; data?: Record<string, unknown> };

export async function sendPushToUsers(userIds: string[], msg: Push) {
  if (userIds.length === 0) return;

  const rows = await db
    .select({ token: users.expoPushToken })
    .from(users)
    .where(and(inArray(users.id, userIds), isNotNull(users.expoPushToken)))
  
  const messages: ExpoPushMessage[] = rows
    .map((r) => r.token )
    .filter((t): t is string => t !== null && Expo.isExpoPushToken(t))
    .map((r) => ({to: r, sound: "default", ...msg}));

  try{
    for (const chunk of expo.chunkPushNotifications(messages)) {
      await expo.sendPushNotificationsAsync(chunk)
    }
  }
  catch (err) {
    console.error("push send failed", err);
  }
}
