import { Hono } from "hono";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { twilioClient, verifyServiceSid } from "../lib/twilio";
import { db, users } from "@sidequest/db";
import { SignJWT } from "jose";
import { RATE_LIMIT_PHONE } from "../lib/constants";

export const auth = new Hono();

auth.post("/start", async (c) => {
  const { phone } = await c.req.json();
  const parsedPhone = parsePhoneNumberFromString(phone, "US");
  if (!parsedPhone?.isValid()) {
    return c.json({ error: "invalid phone" }, 400);
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
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  return c.json({ token, user });
});
