import { redirect } from "next/navigation"

import { getOptionalUser } from "@/lib/auth-helpers"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getOptionalUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
