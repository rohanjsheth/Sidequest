import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
import type { Env } from "./types";

const app = new Hono<Env>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof SyntaxError) {
    return c.json({ error: "invalid body" }, 400);
  }
  // Twilio RestException carries the upstream HTTP status (429 = rate limit
  // tripped on /auth/start, or too many check attempts on /auth/verify)
  if ((err as { status?: number }).status === 429) {
    return c.json({ error: "too many requests" }, 429);
  }
  console.error(err);
  return c.json({ error: "internal error" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/me", authMiddleware);
app.get("/me", (c) => c.json({ userId: c.get("userId") }));

app.route("/auth", auth);

const port = 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});
