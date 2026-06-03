import { Hono } from "hono";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { twilioClient, verifyServiceSid } from "../lib/twilio";

export const auth = new Hono();

auth.post("/start", async (c) => {
    const { phone } = await c.req.json()
    const parsedPhone = parsePhoneNumberFromString(phone, "US")
    if (!parsedPhone?.isValid()){
        return c.json({error: "invalid phone"}, 400)
    }
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: parsedPhone.number, channel: "sms" });

    return c.json({ ok: true });
})