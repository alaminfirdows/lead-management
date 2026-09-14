import { redirect } from "next/navigation"

import { getOptionalUser } from "@/lib/auth-helpers"

export default async function Page() {
  const user = await getOptionalUser()

  redirect(user ? "/dashboard" : "/login")
}
