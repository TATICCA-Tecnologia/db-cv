import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isLoginPage = nextUrl.pathname === "/login"
  const isChangePasswordPage = nextUrl.pathname === "/change-password"
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")

  if (isApiAuth) return NextResponse.next()

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  const mustChange = (session?.user as { mustChangePassword?: boolean })?.mustChangePassword
  if (isLoggedIn && mustChange && !isChangePasswordPage) {
    return NextResponse.redirect(new URL("/change-password", nextUrl))
  }

  if (isLoggedIn && !mustChange && isChangePasswordPage) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)"],
}
