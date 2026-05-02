"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Link2,
  Loader2,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { createRoomCode, getDisplayName, getInviteLink } from "@/lib/dual/helpers"

type Props = {
  displayName: string
}

export default function CreateSessionClient({ displayName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const inviteLink = useMemo(() => {
    return roomCode ? getInviteLink(roomCode) : ""
  }, [roomCode])

  async function createSession() {
    try {
      setIsCreating(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/create-account")
        return
      }

      const newRoomCode = createRoomCode()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      const { data: room, error: roomError } = await supabase
        .from("dual_rooms")
        .insert({
          room_code: newRoomCode,
          host_user_id: user.id,
          status: "waiting",
          total_shots: 3,
          current_shot: 0,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (roomError) throw roomError

      const hostName = getDisplayName({
        email: user.email,
        user_metadata: user.user_metadata ?? {},
      })

      const { error: memberError } = await supabase
        .from("dual_room_members")
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: "host",
          display_name: hostName,
          is_ready: false,
          is_connected: true,
        })

      if (memberError) throw memberError

      setRoomCode(newRoomCode)
    } catch (err) {
      console.error(err)
      setError("We couldn’t create your session. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  async function copyLink() {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("We couldn’t copy the link. Please copy it manually.")
    }
  }

  async function shareLink() {
    if (!inviteLink) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my AmoreFrame dual photobooth session",
          text: "Join me on AmoreFrame and let’s capture memories together.",
          url: inviteLink,
        })
        return
      }

      await copyLink()
    } catch {
      // User cancelled share.
    }
  }

  return (
    <main className="amoura-page min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="text-right">
              <p className="amoura-serif text-2xl leading-none text-amoura-red-soft">
                Dual Mode
              </p>
              <p className="text-xs text-amoura-muted">
                Invite your partner and capture together
              </p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-6 backdrop-blur-xl sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
              <Sparkles className="h-4 w-4" />
              Dual Booth Session
            </div>

            <h1 className="amoura-serif mt-5 text-4xl leading-none text-amoura-cream sm:text-5xl">
              Start together,
              <br />
              even from different places.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-amoura-muted">
              Hi <span className="text-amoura-cream">{displayName}</span>, create
              a private room, copy your invite link, and let your partner join.
              You will both see each other live before taking photos.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoCard icon={<Link2 className="h-4 w-4" />} title="Copy link">
                Generate one private session link.
              </InfoCard>

              <InfoCard icon={<Users className="h-4 w-4" />} title="See partner">
                Both cameras appear side by side.
              </InfoCard>

              <InfoCard icon={<Heart className="h-4 w-4" />} title="Pose together">
                Get ready before the countdown starts.
              </InfoCard>
            </div>
          </section>

          <aside className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-[radial-gradient(circle_at_top,#25070f_0%,#0a0507_40%,#040404_100%)] p-6 backdrop-blur-xl sm:p-8">
            {!roomCode ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/10 text-amoura-red-soft">
                    {isCreating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-amoura-red-soft" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
                      Create Session
                    </p>
                    <p className="text-sm text-amoura-muted">
                      Your room expires after 30 minutes
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amoura-red-soft/15 bg-black/35 p-5">
                  <p className="text-sm leading-7 text-amoura-muted">
                    Create a private room and send the link to your partner. No
                    final photo is stored. The session is only for live syncing.
                  </p>

                  <button
                    onClick={createSession}
                    disabled={isCreating}
                    className="amoura-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating session...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Dual Session
                      </>
                    )}
                  </button>

                  {isCreating ? (
                    <div className="mt-5 space-y-3">
                      <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
                      <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
                    </div>
                  ) : null}

                  {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-amoura-red-soft/30 bg-black/35 p-5 shadow-[0_0_40px_rgba(194,31,58,0.14)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
                      Session created
                    </p>
                    <h2 className="amoura-serif mt-2 text-3xl text-amoura-cream">
                      Share your invite link
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-amoura-muted">
                      Send this link to your partner so they can join your room.
                    </p>
                  </div>

                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/10 text-amoura-red-soft">
                    <Check className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-amoura-red-soft/15 bg-black/40 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                    Session ID
                  </p>
                  <p className="mt-2 text-lg font-semibold text-amoura-cream">
                    {roomCode}
                  </p>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                    Session Link
                  </p>

                  <div className="mt-2 break-all rounded-xl border border-amoura-red-soft/15 bg-black/30 px-4 py-3 text-sm text-amoura-cream">
                    {inviteLink}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={copyLink}
                    className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Link copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Invite Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={shareLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/30 px-5 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </button>
                </div>

                <Link
                  href={`/booth/dual/room/${roomCode}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-amoura-red-soft/20 bg-transparent px-5 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                >
                  Enter Waiting Room
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-amoura-red-soft/15 bg-black/30 p-4">
      <div className="mb-3 inline-flex rounded-full bg-amoura-red/10 p-2 text-amoura-red-soft">
        {icon}
      </div>
      <p className="text-sm font-semibold text-amoura-cream">{title}</p>
      <p className="mt-1 text-sm leading-6 text-amoura-muted">{children}</p>
    </div>
  )
}