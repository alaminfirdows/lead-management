import type { NextAuthConfig } from "next-auth"

/**
 * Shape of the authenticated user as exposed by `session.user` /
 * `requireUser()` / `getOptionalUser()`. Kept in this db-free module so
 * client components can import the type without pulling in `lib/auth.ts`
 * (which is `server-only` and touches the database).
 */
export type SessionUser = {
  id: string
  email: string
  name: string | null
}

/**
 * Database-free Auth.js config, safe to import from `proxy.ts` (Node runtime,
 * but no drizzle/pg import here so it stays lightweight and edge-safe if we
 * ever need it there). The real `providers` array (which touches the
 * database) lives in `lib/auth.ts`.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  logger: {
    // Wrong email/password on login throws `CredentialsSignin`, which
    // Auth.js logs as `[auth][error] CredentialsSignin` by default — noisy
    // for an expected, user-facing failure. Silence just that one; still
    // log everything else so real errors surface.
    error(error) {
      if (error.name === "CredentialsSignin") return
      console.error("[auth][error]", error)
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
