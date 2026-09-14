import { describe, expect, it } from "vitest"

import { isUniqueViolation } from "@/lib/db/errors"

describe("isUniqueViolation", () => {
  it("returns true for a direct pg error object with code 23505", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true)
  })

  it("returns true for a DrizzleQueryError-style wrapper with cause.code 23505", () => {
    expect(isUniqueViolation({ cause: { code: "23505" } })).toBe(true)
  })

  it("returns false for a non-matching code", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false)
  })

  it("returns false for a non-matching cause code", () => {
    expect(isUniqueViolation({ cause: { code: "23503" } })).toBe(false)
  })

  it("returns false for non-object values", () => {
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation(undefined)).toBe(false)
    expect(isUniqueViolation("error")).toBe(false)
    expect(isUniqueViolation(42)).toBe(false)
  })
})
