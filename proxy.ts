import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

const AUTH_PAGES = ["/login", "/register"]

export const proxy = auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAuthPage = AUTH_PAGES.includes(nextUrl.pathname)
  const isPublic = nextUrl.pathname === "/" || isAuthPage

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search
    )
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.well-known|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
}
