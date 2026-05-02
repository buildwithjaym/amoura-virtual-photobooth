"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Heart, Loader2, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    try {
      setIsLoading(true)

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error("Google login error:", error.message)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Unexpected login error:", error)
      setIsLoading(false)
    }
  }

  return (
    <main className="amoura-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="pointer-events-none absolute left-[-15%] top-[-10%] h-[420px] w-[420px] rounded-full bg-amoura-red/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-15%] h-[460px] w-[460px] rounded-full bg-amoura-red-deep/30 blur-[150px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_48%)]" />

      <section className="relative w-full max-w-md">
        <Sparkles className="pointer-events-none absolute -left-4 top-20 h-5 w-5 text-amoura-red-soft opacity-80" />
        <Sparkles className="pointer-events-none absolute -right-3 top-8 h-6 w-6 text-amoura-pink opacity-80" />

        <div className="relative overflow-hidden rounded-[2rem] border border-amoura-red-soft/20 bg-black/50 p-6 shadow-[0_0_90px_rgba(194,31,58,0.18)] backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amoura-red-soft/60 to-transparent" />
          <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amoura-red/20 blur-[90px]" />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black/50 shadow-[0_0_30px_rgba(255,77,109,0.16)]">
              <Image
                src="/images/amoreframe-og.png"
                alt="AmoreFrame logo"
                fill
                className="object-cover"
                priority
              />
            </div>

            <p className="amoura-serif text-5xl leading-none text-amoura-red-soft">
              AmoreFrame
            </p>

            <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-amoura-muted">
              Virtual Photobooth
            </p>
          </Link>

          {/* Content */}
          <div className="relative z-10 mt-10 text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amoura-pink">
              <Heart className="h-3.5 w-3.5" />
              Welcome back
            </div>

            <h1 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-5xl">
              Continue your memories.
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-amoura-muted sm:text-base">
              Sign in to access your dashboard, saved photostrips, and booth sessions.
            </p>
          </div>

          {/* Login button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="relative z-10 mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-6 py-4 text-base font-bold text-black shadow-[0_16px_40px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:bg-amoura-cream disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* Links */}
          <div className="relative z-10 mt-7 space-y-3 text-center text-sm">
            <p className="text-amoura-muted">
              New to AmoreFrame?{" "}
              <Link
                href="/create-account"
                className="font-semibold text-amoura-red-soft transition hover:text-amoura-pink"
              >
                Create an account
              </Link>
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-amoura-muted transition hover:text-amoura-red-soft"
            >
              Return to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-amoura-muted">
          By continuing, you agree to use AmoreFrame for creating and saving your
          photobooth memories.
        </p>
      </section>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}