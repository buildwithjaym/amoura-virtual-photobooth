import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

function isNewOAuthUser(createdAt?: string, lastSignInAt?: string) {
  if (!createdAt) return false

  const createdTime = new Date(createdAt).getTime()
  const lastSignInTime = lastSignInAt ? new Date(lastSignInAt).getTime() : createdTime

  if (Number.isNaN(createdTime) || Number.isNaN(lastSignInTime)) {
    return false
  }

  const differenceInSeconds = Math.abs(lastSignInTime - createdTime) / 1000

  return differenceInSeconds <= 10
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  const code = requestUrl.searchParams.get("code")
  const intent = requestUrl.searchParams.get("intent") ?? "login"

  let next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (!next.startsWith("/")) {
    next = "/dashboard"
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_auth_code", requestUrl.origin)
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Supabase auth callback error:", error.message)

    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", requestUrl.origin)
    )
  }

  const user = data.user

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=no_user_session", requestUrl.origin)
    )
  }

  const isNewUser = isNewOAuthUser(user.created_at, user.last_sign_in_at)

  if (intent === "signup" && !isNewUser) {
    await supabase.auth.signOut()

    return NextResponse.redirect(
      new URL(
        "/login?message=existing_account",
        requestUrl.origin
      )
    )
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}