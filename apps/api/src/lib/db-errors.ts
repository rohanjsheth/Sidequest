// Postgres signals constraint failures with SQLSTATE codes. Drizzle wraps the
// driver error, so the code sits on the error itself OR one level down on
// `.cause` — pgErrorCode hides that quirk behind a single lookup.
const PG_UNIQUE_VIOLATION = "23505";

function pgErrorCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code ?? e.cause?.code;
}

export function isUniqueViolation(err: unknown): boolean {
  return pgErrorCode(err) === PG_UNIQUE_VIOLATION;
}
