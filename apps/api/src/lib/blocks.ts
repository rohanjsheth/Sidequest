import { and, eq, or } from "drizzle-orm";
import { db, blocks } from "@sidequest/db";

// blocks are symmetric — a guard trips if either user blocked the other
export async function isBlocked(a: string, b: string): Promise<boolean> {
  const [row] = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)),
        and(eq(blocks.blockerId, b), eq(blocks.blockedId, a)),
      ),
    );
  return !!row;
}
