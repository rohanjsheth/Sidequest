import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { auth } from "./routes/auth";
import { me } from "./routes/me";
import { friends } from "./routes/friends";
import { lists } from "./routes/lists";
import { events, eventShare } from "./routes/events";
import { isUniqueViolation } from "./lib/db-errors";
import type { Env } from "./types";

const app = new Hono<Env>();

const webOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3001").split(",");
app.use(
  "*",
  cors({
    origin: webOrigins,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof SyntaxError) {
    return c.json({ error: "invalid body" }, 400);
  }
  // a duplicate slipped past an app-level check (or a concurrent race)
  if (isUniqueViolation(err)) {
    return c.json({ error: "already exists" }, 409);
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

app.route("/me", me);
app.route("/friends", friends);
app.route("/lists", lists);
app.route("/events", events);

app.route("/auth", auth);
app.route("/e", eventShare);

export default app;
