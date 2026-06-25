import { Hono } from "hono";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { twilioClient, verifyServiceSid } from "../lib/twilio.js";
import { db, users } from "@sidequest/db";
import { SignJWT } from "jose";
import { RATE_LIMIT_PHONE } from "../lib/constants.js";
import {
  ensureReviewUser,
  isReviewCode,
  isReviewPhone,
} from "../lib/review-login.js";

export const auth = new Hono();

async function signUserToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

auth.post("/start", async (c) => {
  const { phone } = await c.req.json();
  const parsedPhone = parsePhoneNumberFromString(phone, "US");
  if (!parsedPhone?.isValid()) {
    return c.json({ error: "invalid phone" }, 400);
  }

  if (isReviewPhone(parsedPhone.number)) {
    return c.json({ ok: true });
  }

  await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
    to: parsedPhone.number,
    channel: "sms",
    rateLimits: { [RATE_LIMIT_PHONE]: parsedPhone.number },
  });

  return c.json({ ok: true });
});

auth.post("/verify", async (c) => {
  const { phone, code } = await c.req.json();
  const parsedPhone = parsePhoneNumberFromString(phone, "US");
  if (!parsedPhone?.isValid()) {
    return c.json({ error: "invalid phone" }, 400);
  }

  if (isReviewPhone(parsedPhone.number)) {
    if (!isReviewCode(code)) {
      return c.json({ error: "invalid code" }, 401);
    }
    const user = await ensureReviewUser(parsedPhone.number);
    const token = await signUserToken(user.id);
    return c.json({ token, user });
  }

  const verification = await twilioClient.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ to: parsedPhone.number, code });
  if (!(verification.status === "approved")) {
    return c.json({ error: "invalid code" }, 401);
  }

  const [user] = await db
    .insert(users)
    .values({ phone: parsedPhone.number })
    .onConflictDoUpdate({
      target: users.phone,
      set: { phone: parsedPhone.number },
    })
    .returning();
  const token = await signUserToken(user.id);
  return c.json({ token, user });
});
