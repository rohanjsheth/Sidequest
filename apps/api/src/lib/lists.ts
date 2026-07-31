import { and, eq, inArray, or } from "drizzle-orm";
import { db, friendLists, friendListMembers } from "@sidequest/db";

export async function listMemberIds(listId: string): Promise<string[]> {
  const rows = await db
    .select({ memberId: friendListMembers.memberId })
    .from(friendListMembers)
    .where(eq(friendListMembers.listId, listId));
  return rows.map((r) => r.memberId);
}

// list membership outlives the friendship it was validated against — drop each
// user from the other's lists whenever the friendship ends (unfriend or block)
export async function pruneListMemberships(a: string, b: string) {
  const listsOwnedBy = (ownerId: string) =>
    db
      .select({ id: friendLists.id })
      .from(friendLists)
      .where(eq(friendLists.ownerId, ownerId));

  await db
    .delete(friendListMembers)
    .where(
      or(
        and(
          eq(friendListMembers.memberId, b),
          inArray(friendListMembers.listId, listsOwnedBy(a)),
        ),
        and(
          eq(friendListMembers.memberId, a),
          inArray(friendListMembers.listId, listsOwnedBy(b)),
        ),
      ),
    );
}
