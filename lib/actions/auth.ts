"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { CredentialsSignin } from "next-auth"
import { z } from "zod"

import { signIn, signOut } from "@/lib/auth"
import { db } from "@/lib/db/client"
import { isUniqueViolation } from "@/lib/db/errors"
import { users } from "@/lib/db/schema"
import { loginSchema, registerSchema } from "@/lib/validators/auth"

export type AuthFormState =
  | {
      error?: string
      fieldErrors?: Record<string, string[] | undefined>
      values?: { name?: string; email?: string }
    }
  | undefined

const BCRYPT_ROUNDS = 12

function safeCallbackUrl(callbackUrl: FormDataEntryValue | null): string {
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/")) {
    return "/dashboard"
  }

  // Resolve against a fixed, fake origin so relative-looking but
  // protocol-relative or backslash-based inputs (e.g. "/\evil.com",
  // "//evil.com") can't smuggle a different host through the URL parser.
  const url = new URL(callbackUrl, "http://n")
  if (url.origin !== "http://n") {
    return "/dashboard"
  }

  return url.pathname + url.search
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = registerSchema.safeParse(raw)

  const values = {
    name: typeof raw.name === "string" ? raw.name : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
  }

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const { name, email, password } = parsed.data

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    return { error: "Email already in use", values }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  try {
    await db.insert(users).values({ name, email, passwordHash })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Email already in use", values }
    }
    // Don't rethrow: DrizzleQueryError's message includes the failed query's
    // params (email + bcrypt hash), which we don't want leaking into logs.
    console.error("register: insert failed", {
      code: (error as { cause?: { code?: unknown } })?.cause?.code,
    })
    return { error: "Something went wrong. Please try again.", values }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { error: "Account created. Please log in.", values }
    }
    throw error
  }

  redirect("/dashboard")
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(raw)

  const values = {
    email: typeof raw.email === "string" ? raw.email : undefined,
  }

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const { email, password } = parsed.data
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"))

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { error: "Invalid email or password", values }
    }
    throw error
  }

  redirect(callbackUrl)
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
