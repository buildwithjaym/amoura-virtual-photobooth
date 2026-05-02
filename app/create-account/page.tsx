"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  Camera,
  Check,
  Heart,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function CreateAccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    try {
      setIsLoading(true)

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error("Google sign-in error:", error.message)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Unexpected sign-in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <main className="amoura-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[-18%] top-[-10%] h-[420px] w-[420px] rounded-full bg-amoura-red/25 blur-[130px]" />
      <div className="pointer-events-none absolute left-[-18%] bottom-[-12%] h-[320px] w-[320px] rounded-full bg-amoura-red-deep/20 blur-[120px]" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 shadow-[0_0_70px_rgba(194,31,58,0.16)] backdrop-blur-xl lg:grid-cols-[0.95fr_1fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/5 bg-gradient-to-br from-amoura-red-deep/45 via-black to-black p-8 lg:flex lg:min-h-[560px] lg:flex-col lg:justify-between xl:min-h-[600px]">
          <div className="absolute right-[-24%] top-[-18%] h-80 w-80 rounded-full bg-amoura-red/25 blur-[90px]" />

          <BrandMark />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
              <Heart className="h-4 w-4" />
              Romantic memories, beautifully framed
            </div>

            <h1 className="amoura-serif max-w-lg text-4xl leading-[0.98] text-amoura-cream xl:text-6xl">
              Start your romantic photobooth experience.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-amoura-muted xl:text-lg xl:leading-8">
              Create beautiful photostrips, save your favorite moments, and use
              Dual Mode to capture memories with someone from anywhere.
            </p>
          </div>

          <div className="relative z-10 grid gap-3">
            <FeatureLine icon={Camera} text="Guided photobooth countdowns" />
            <FeatureLine icon={Heart} text="Romantic frames and themes" />
            <FeatureLine icon={ShieldCheck} text="Memories saved to your account" />
          </div>
        </aside>

        <section className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center p-5 sm:p-8 lg:min-h-[560px] xl:min-h-[600px]">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <BrandMark centered />
            </div>

            <div className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 sm:p-7">
              <div className="text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-amoura-red-soft">
                  Create Account
                </p>

                <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-5xl">
                  Continue to AmoreFrame.
                </h2>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-amoura-muted sm:text-base sm:leading-7">
                  Sign in with Google to save your strips, access your gallery,
                  and start creating shared memories.
                </p>
              </div>

              <button
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white px-6 py-4 text-base font-semibold text-black transition hover:bg-amoura-cream disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </button>

              <div className="mt-6 grid gap-3 rounded-2xl border border-amoura-red-soft/15 bg-black/25 p-4 text-sm text-amoura-muted">
                <AccountStep text="Enter your dashboard." />
                <AccountStep text="Start Single Mode or Dual Mode." />
                <AccountStep text="Save your finished photostrips." />
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-amoura-muted">
                By continuing, you agree to use AmoreFrame to create and save
                your photobooth memories.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-amoura-muted">
              Not ready yet?{" "}
              <Link
                href="/"
                className="font-semibold text-amoura-red-soft transition hover:text-amoura-pink"
              >
                Return to home
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}

function BrandMark({ centered = false }: { centered?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative z-10 flex items-center gap-3 ${
        centered ? "flex-col text-center" : ""
      }`}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black/40 shadow-[0_0_20px_rgba(194,31,58,0.18)] sm:h-14 sm:w-14">
        <Image
          src="/images/amoreframe-og.png"
          alt="AmoreFrame logo"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div>
        <p className="amoura-serif text-3xl text-amoura-red-soft sm:text-4xl lg:text-3xl">
          AmoreFrame
        </p>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-amoura-muted sm:text-[0.62rem]">
          Romantic Photobooth
        </p>
      </div>
    </Link>
  )
}

function FeatureLine({
  icon: Icon,
  text,
}: {
  icon: React.ElementType
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amoura-red-soft/15 bg-white/[0.035] px-4 py-3 text-sm text-amoura-muted">
      <Icon className="h-5 w-5 shrink-0 text-amoura-red-soft" />
      <span>{text}</span>
    </div>
  )
}

function AccountStep({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-3">
      <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" />
      <span>{text}</span>
    </p>
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