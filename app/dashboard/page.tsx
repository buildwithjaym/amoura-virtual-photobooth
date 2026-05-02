import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Camera,
  Heart,
  Images,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"

type Photostrip = {
  id: string
  title: string | null
  image_url: string
  mode: string | null
  created_at: string
}

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
    "there"

  const avatarUrl = user.user_metadata?.avatar_url

  const { data: photostrips } = await supabase
    .from("photostrips")
    .select("id, title, image_url, mode, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  async function signOut() {
    "use server"

    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <main className="amoura-page min-h-screen overflow-hidden">
      <section className="relative min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-[-18%] top-[-12%] h-[420px] w-[420px] rounded-full bg-amoura-red/25 blur-[130px]" />
        <div className="pointer-events-none absolute left-[-18%] bottom-[-12%] h-[320px] w-[320px] rounded-full bg-amoura-red-deep/20 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col gap-5">
          <header className="flex items-center justify-between rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black/40 shadow-[0_0_20px_rgba(194,31,58,0.18)]">
                <Image
                  src="/images/amoreframe-og.png"
                  alt="AmoreFrame logo"
                  fill
                  sizes="44px"
                  priority
                  className="object-cover"
                />
              </div>

              <div>
                <p className="amoura-serif text-2xl leading-none text-amoura-red-soft sm:text-3xl">
                  AmoreFrame
                </p>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-amoura-muted">
                  Photobooth
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-amoura-cream">
                  {displayName}
                </p>
                <p className="text-xs text-amoura-muted">Signed in</p>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amoura-red-soft/20 bg-white/[0.035] text-amoura-muted transition hover:border-amoura-red-soft/40 hover:text-white"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-gradient-to-br from-amoura-red-deep/55 via-black to-black p-6 shadow-[0_0_70px_rgba(194,31,58,0.14)] sm:p-8 lg:p-10">
            <div className="absolute right-[-15%] top-[-45%] h-96 w-96 rounded-full bg-amoura-red/30 blur-[110px]" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
                <Sparkles className="h-4 w-4" />
                Your booth is ready
              </div>

              <h1 className="amoura-serif mx-auto max-w-4xl text-4xl leading-[0.98] text-amoura-cream sm:text-5xl xl:text-6xl">
                Welcome, {displayName}. What kind of photobooth do you want to start?
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-amoura-muted sm:text-lg sm:leading-8">
                Choose a mode below. You will take your photos first, then pick
                the final strip style and theme after your shots are captured.
              </p>
            </div>
          </section>

          <section className="grid flex-1 gap-5 lg:grid-cols-2">
            <BoothModeCard
              href="/booth/single"
              icon={Camera}
              label="Single Mode"
              title="Start a solo photobooth"
              text="Best for solo portraits, date-night memories, profile shots, and personal photostrips. Open the camera, follow the countdown, and capture your set."
              button="Start Single Mode"
              primary
            />

            <BoothModeCard
              href="/booth/dual"
              icon={Users}
              label="Dual Mode"
              title="Start a booth together"
              text="Best for long-distance couples, friends, and shared online moments. Create a session, invite someone, and capture a connected strip together."
              button="Start Dual Mode"
            />
          </section>

          <section>
            {photostrips && photostrips.length > 0 ? (
              <RecentStrips photostrips={photostrips} />
            ) : (
              <EmptyStrips />
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

function BoothModeCard({
  href,
  icon: Icon,
  label,
  title,
  text,
  button,
  primary = false,
}: {
  href: string
  icon: React.ElementType
  label: string
  title: string
  text: string
  button: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[320px] flex-col justify-between rounded-[1.75rem] border p-6 transition hover:-translate-y-1 sm:p-8 ${
        primary
          ? "border-amoura-red-soft/40 bg-amoura-red/15 shadow-[0_0_45px_rgba(194,31,58,0.14)]"
          : "border-amoura-red-soft/20 bg-white/[0.035] hover:border-amoura-red-soft/45"
      }`}
    >
      <div>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amoura-red-soft/30 bg-black/30 text-amoura-red-soft">
          <Icon className="h-8 w-8" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
          {label}
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-amoura-cream">
          {title}
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-7 text-amoura-muted sm:text-base">
          {text}
        </p>
      </div>

      <div
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition ${
          primary
            ? "amoura-btn-primary"
            : "border border-amoura-red-soft/20 bg-black/35 text-amoura-cream group-hover:border-amoura-red-soft/45"
        }`}
      >
        {button}
        <Icon className="h-4 w-4" />
      </div>
    </Link>
  )
}

function EmptyStrips() {
  return (
    <div className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-white/[0.035] p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/25 bg-amoura-red/10">
        <Heart className="h-6 w-6 text-amoura-red-soft" />
      </div>

      <h2 className="amoura-serif text-3xl text-amoura-cream">
        No saved strips yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amoura-muted">
        After your first successful photobooth session, your saved strips will
        appear here.
      </p>
    </div>
  )
}

function RecentStrips({ photostrips }: { photostrips: Photostrip[] }) {
  return (
    <div className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
            Recent
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-amoura-cream">
            Your saved strips
          </h2>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
        >
          <Images className="h-4 w-4" />
          Open Gallery
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {photostrips.slice(0, 3).map((strip) => (
          <Link
            key={strip.id}
            href={`/gallery/${strip.id}`}
            className="overflow-hidden rounded-2xl border border-white/5 bg-black/30 transition hover:border-amoura-red-soft/40"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={strip.image_url}
                alt={strip.title || "Saved photostrip"}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}