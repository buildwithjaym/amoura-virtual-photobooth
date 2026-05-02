import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Camera,
  Heart,
  Images,
  LogOut,
  Plus,
  Sparkles,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/create-account")
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Creator"

  const avatarUrl = user.user_metadata?.avatar_url

  async function signOut() {
    "use server"

    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <main className="amoura-page min-h-screen overflow-hidden">
      <section className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-[-18%] top-[-10%] h-[420px] w-[420px] rounded-full bg-amoura-red/25 blur-[130px]" />
        <div className="pointer-events-none absolute left-[-18%] bottom-[-12%] h-[320px] w-[320px] rounded-full bg-amoura-red-deep/20 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
          <header className="flex items-center justify-between rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-4 backdrop-blur-xl sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black/40 shadow-[0_0_20px_rgba(194,31,58,0.18)]">
                <Image
                  src="/images/amoreframe-og.png"
                  alt="AmoreFrame logo"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div>
                <p className="amoura-serif text-2xl leading-none text-amoura-red-soft sm:text-3xl">
                  AmoreFrame
                </p>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-amoura-muted">
                  Dashboard
                </p>
              </div>
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-amoura-muted transition hover:border-amoura-red-soft/40 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </header>

          <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-gradient-to-br from-amoura-red-deep/45 via-black to-black p-6 shadow-[0_0_70px_rgba(194,31,58,0.14)] sm:p-8">
              <div className="absolute right-[-20%] top-[-20%] h-80 w-80 rounded-full bg-amoura-red/25 blur-[90px]" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
                    <Sparkles className="h-4 w-4" />
                    Ready to create a memory
                  </div>

                  <h1 className="amoura-serif max-w-xl text-4xl leading-[0.98] text-amoura-cream sm:text-5xl xl:text-6xl">
                    Welcome back, {displayName}.
                  </h1>

                  <p className="mt-5 max-w-xl text-base leading-7 text-amoura-muted sm:text-lg sm:leading-8">
                    Start a romantic photobooth session, capture your best shots,
                    and turn them into a beautiful strip worth saving.
                  </p>
                </div>

                <div className="grid gap-3">
                  <DashboardPoint
                    icon={Camera}
                    text="Single Mode for solo portraits, dates, and personal memories."
                  />
                  <DashboardPoint
                    icon={Users}
                    text="Dual Mode for long-distance couples and shared sessions."
                  />
                  <DashboardPoint
                    icon={Images}
                    text="Saved strips will appear in your gallery soon."
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6">
              <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amoura-red/20 text-xl font-bold text-amoura-cream">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-amoura-cream">
                      {displayName}
                    </p>
                    <p className="truncate text-sm text-amoura-muted">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ActionCard
                  href="/booth/single"
                  icon={Camera}
                  title="Single Mode"
                  text="Take a guided set of photos and turn them into a romantic photostrip."
                  button="Start taking pictures"
                  primary
                />

                <ActionCard
                  href="/booth/dual"
                  icon={Users}
                  title="Dual Mode"
                  text="Create a shared booth session with someone from another place."
                  button="Create shared session"
                />
              </div>

              <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                      Gallery
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-amoura-cream">
                      Your saved strips
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-amoura-muted">
                      Your finished photostrips will appear here once saving is
                      connected.
                    </p>
                  </div>

                  <Link
                    href="/gallery"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                  >
                    <Images className="h-4 w-4" />
                    Open Gallery
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <EmptyStrip />
                  <EmptyStrip />
                  <EmptyStrip />
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

function DashboardPoint({
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

function ActionCard({
  href,
  icon: Icon,
  title,
  text,
  button,
  primary = false,
}: {
  href: string
  icon: React.ElementType
  title: string
  text: string
  button: string
  primary?: boolean
}) {
  return (
    <article className="group rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-amoura-red-soft/45 sm:p-6">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amoura-red-soft/30 bg-amoura-red/15 text-amoura-red-soft">
        <Icon className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-semibold text-amoura-cream">{title}</h2>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-amoura-muted">
        {text}
      </p>

      <Link
        href={href}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
          primary
            ? "amoura-btn-primary"
            : "border border-amoura-red-soft/20 bg-black/35 text-amoura-cream hover:border-amoura-red-soft/45"
        }`}
      >
        {button}
        {primary ? <Camera className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </Link>
    </article>
  )
}

function EmptyStrip() {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/5 bg-black/30 p-2">
      <div className="aspect-[4/3] rounded-xl bg-white/[0.04]" />
      <div className="aspect-[4/3] rounded-xl bg-white/[0.04]" />
      <div className="aspect-[4/3] rounded-xl bg-white/[0.04]" />
      <div className="flex items-center justify-center gap-2 py-2 text-xs text-amoura-muted">
        <Heart className="h-3.5 w-3.5 text-amoura-red-soft" />
        Empty strip
      </div>
    </div>
  )
}