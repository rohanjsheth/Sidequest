import { createMiddleware } from "hono/factory"
import { jwtVerify } from "jose";
import type { Env } from "../types";

if (!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not set");
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")){
        return c.json({ error: "unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
        const { payload } = await jwtVerify(token, secret)
        if (!payload.sub){
            return c.json({ error: "unauthorized" }, 401); 
        }
        c.set("userId", payload.sub)
    }
    catch {
        return c.json({ error: "unauthorized" }, 401); 
    }
    await next() 
});