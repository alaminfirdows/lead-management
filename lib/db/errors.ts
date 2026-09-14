/**
 * Postgres error code for a unique constraint violation.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const UNIQUE_VIOLATION_CODE = "23505"

/**
 * A pg unique_violation error, thrown either directly as an object with a
 * `code` property, or (as of drizzle-orm 0.45's `DrizzleQueryError`) wrapped
 * with the original pg error attached as `.cause`.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false
  }

  if (
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION_CODE
  ) {
    return true
  }

  const cause = (error as { cause?: unknown }).cause
  if (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as { code?: unknown }).code === UNIQUE_VIOLATION_CODE
  ) {
    return true
  }

  return false
}
