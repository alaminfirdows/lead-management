import { describe, expect, it } from "vitest"
import { z } from "zod"

import { loginSchema, registerSchema } from "@/lib/validators/auth"

describe("registerSchema", () => {
  it("accepts valid input and lowercases the email", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "Ada@Example.COM",
      password: "supersecret",
      confirmPassword: "supersecret",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com")
    }
  })

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "short1",
      confirmPassword: "short1",
    })

    expect(result.success).toBe(false)
  })

  it("rejects mismatched confirmPassword", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret",
      confirmPassword: "different1",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const flattened = z.flattenError(result.error)
      expect(flattened.fieldErrors.confirmPassword).toBeDefined()
    }
  })

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      password: "supersecret",
      confirmPassword: "supersecret",
    })

    expect(result.success).toBe(false)
  })

  it("trims leading/trailing whitespace before validating the email", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "  Ada@Example.com  ",
      password: "supersecret",
      confirmPassword: "supersecret",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com")
    }
  })
})

describe("loginSchema", () => {
  it("requires a password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "",
    })

    expect(result.success).toBe(false)
  })

  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "Ada@Example.com",
      password: "anything",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com")
    }
  })
})
