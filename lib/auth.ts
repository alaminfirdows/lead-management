import "server-only"

import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "@/lib/auth.config"
import { db } from "@/lib/db/client"
import { users } from "@/lib/db/schema"
import { loginSchema } from "@/lib/validators/auth"

// Fixed bcrypt hash of a random value (not a real user's password) used to
// equalize response timing when a user with the given email does not exist,
// so login timing doesn't leak whether an email is registered.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeOxKgHTUW.CHt3xN1E9HfMfhIQ9WlIzXW"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        const passwordHash = user?.passwordHash ?? DUMMY_HASH
        const isValid = await bcrypt.compare(password, passwordHash)

        if (!user || !isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
})
