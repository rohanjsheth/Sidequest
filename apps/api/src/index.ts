import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db, users } from "@sidequest/db";
import { auth } from "./routes/auth";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/health/db", async (c) => {
  const rows = await db.select().from(users);
  return c.json({ status: "ok", userCount: rows.length });
});

app.route("/auth", auth);

const port = 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});
