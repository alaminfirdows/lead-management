import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import type { SessionUser } from "@/lib/auth.config"

export const getOptionalUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth()
  if (!session?.user) return null
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
  }
})

export async function requireUser(): Promise<SessionUser> {
  const user = await getOptionalUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
