"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Loader2,
  RefreshCcw,
  Send,
  UserCircle2,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import {
  getCountdownSeconds,
  getDisplayName,
  getInviteLink,
  getTimeLeft,
} from "@/lib/dual/helpers"
import type { DualRoom, DualRoomMember } from "@/lib/dual/types"

type Props = {
  roomCode: string
}

export default function DualRoomClient({ roomCode }: Props) {
  const supabase = createClient()

  const [room, setRoom] = useState<DualRoom | null>(null)
  const [members, setMembers] = useState<DualRoomMember[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const inviteLink = useMemo(() => getInviteLink(roomCode), [roomCode])

  const hostMember = members.find((member) => member.role === "host") ?? null
  const partnerMember = members.find((member) => member.role === "partner") ?? null

  const isHost = hostMember?.user_id === currentUserId
  const currentMember = members.find((member) => member.user_id === currentUserId) ?? null
  const bothReady = !!hostMember?.is_ready && !!partnerMember?.is_ready
  const timeLeft = room ? getTimeLeft(room.expires_at) : "00:00"
  const countdown = getCountdownSeconds(room?.countdown_starts_at ?? null)

  async function fetchRoomState() {
    const { data: roomData, error: roomError } = await supabase
      .from("dual_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single()

    if (roomError || !roomData) {
      setRoom(null)
      setMembers([])
      setLoading(false)
      setError("This room could not be found or may have already expired.")
      return
    }

    const { data: memberData, error: memberError } = await supabase
      .from("dual_room_members")
      .select("*")
      .eq("room_id", roomData.id)
      .order("joined_at", { ascending: true })

    if (memberError) {
      throw memberError
    }

    setRoom(roomData as DualRoom)
    setMembers((memberData ?? []) as DualRoomMember[])
  }

  async function ensureJoined() {
    try {
      setJoining(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/create-account"
        return
      }

      setCurrentUserId(user.id)

      const { data: roomData, error: roomError } = await supabase
        .from("dual_rooms")
        .select("*")
        .eq("room_code", roomCode)
        .single()

      if (roomError || !roomData) {
        setError("This session does not exist anymore.")
        return
      }

      const { data: existingMembers } = await supabase
        .from("dual_room_members")
        .select("*")
        .eq("room_id", roomData.id)

      const safeMembers = existingMembers ?? []
      const alreadyJoined = safeMembers.find((member) => member.user_id === user.id)

      if (!alreadyJoined) {
        const hostExists = safeMembers.some((member) => member.role === "host")
        const partnerExists = safeMembers.some((member) => member.role === "partner")
        const nextRole =
          roomData.host_user_id === user.id ? "host" : partnerExists ? null : "partner"

        if (!nextRole && roomData.host_user_id !== user.id) {
          setError("This room already has a partner.")
          return
        }

        const displayName = getDisplayName({
          email: user.email,
          user_metadata: user.user_metadata ?? {},
        })

        const { error: insertError } = await supabase.from("dual_room_members").insert({
          room_id: roomData.id,
          user_id: user.id,
          role: nextRole ?? (hostExists ? "partner" : "host"),
          display_name: displayName,
          is_ready: false,
          is_connected: true,
        })

        if (insertError) {
          throw insertError
        }
      } else {
        await supabase
          .from("dual_room_members")
          .update({ is_connected: true })
          .eq("id", alreadyJoined.id)
      }

      await fetchRoomState()
    } catch (err) {
      console.error(err)
      setError("We couldn’t join the session right now.")
    } finally {
      setJoining(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    ensureJoined()

    return () => {
      // optional disconnect cleanup later
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  useEffect(() => {
    if (!room?.id) return

    const channel = supabase
      .channel(`dual-room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dual_rooms",
          filter: `id=eq.${room.id}`,
        },
        async () => {
          await fetchRoomState()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dual_room_members",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          await fetchRoomState()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("We couldn’t copy the invite link.")
    }
  }

  async function toggleReady() {
    if (!currentMember) return

    try {
      await supabase
        .from("dual_room_members")
        .update({ is_ready: !currentMember.is_ready })
        .eq("id", currentMember.id)
    } catch (err) {
      console.error(err)
      setError("We couldn’t update your ready status.")
    }
  }

  async function startSession() {
    if (!room || !isHost || !bothReady) return

    try {
      const countdownAt = new Date(Date.now() + 5000).toISOString()

      await supabase
        .from("dual_rooms")
        .update({
          status: "countdown",
          countdown_starts_at: countdownAt,
          current_shot: 1,
        })
        .eq("id", room.id)
    } catch (err) {
      console.error(err)
      setError("We couldn’t start the session.")
    }
  }

  async function refreshState() {
    try {
      setLoading(true)
      await fetchRoomState()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || joining) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amoura-red-soft" />
          <p className="mt-4 text-base font-semibold text-amoura-cream">
            Joining your dual session...
          </p>
          <p className="mt-2 text-sm text-amoura-muted">
            Preparing the room and checking for your partner.
          </p>
        </div>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-red-soft">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="amoura-serif mt-5 text-3xl text-amoura-cream">
            Session unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-amoura-muted">
            {error || "This room is no longer available."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/booth/dual"
              className="amoura-btn-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Create New Session
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-amoura-red-soft/20 bg-black/30 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="amoura-page min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/booth/dual"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Dual Mode
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-amoura-red-soft/15 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amoura-muted">
              <span className="h-2 w-2 rounded-full bg-amoura-red-soft animate-pulse" />
              Session {room.room_code}
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-amoura-muted">
                Expires in
              </p>
              <p className="text-lg font-semibold text-amoura-red-soft">{timeLeft}</p>
            </div>
          </div>
        </header>

        {countdown !== null && room.status === "countdown" ? (
          <div className="mt-4 rounded-[1.5rem] border border-amoura-red-soft/25 bg-amoura-red/10 px-5 py-4 text-center backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
              Synced countdown
            </p>
            <div className="amoura-serif mt-2 text-5xl text-amoura-cream animate-pulse">
              {countdown > 0 ? countdown : "Smile!"}
            </div>
          </div>
        ) : null}

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-[radial-gradient(circle_at_top,#25070f_0%,#0a0507_40%,#040404_100%)] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
                    Share a link
                  </p>
                  <h1 className="amoura-serif mt-2 text-3xl text-amoura-cream sm:text-4xl">
                    Invite your partner
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-amoura-muted">
                    Copy your session link and send it through Messenger, Instagram,
                    WhatsApp, or any app you like.
                  </p>
                </div>

                {isHost ? (
                  <button
                    onClick={copyLink}
                    className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
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
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-4 text-sm text-amoura-cream break-all">
                {inviteLink}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <ParticipantCard
                title="Host"
                member={hostMember}
                isCurrentUser={hostMember?.user_id === currentUserId}
                accent="rose"
              />

              <ParticipantCard
                title="Partner"
                member={partnerMember}
                isCurrentUser={partnerMember?.user_id === currentUserId}
                accent="pink"
                waiting={!partnerMember}
              />
            </section>
          </div>

          <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
              <Heart className="h-4 w-4" />
              Waiting Room
            </div>

            <h2 className="amoura-serif mt-5 text-3xl text-amoura-cream">
              Get ready together
            </h2>

            <p className="mt-3 text-sm leading-7 text-amoura-muted">
              Once both of you are ready, the host can start the synced session.
              We’ll use a shared countdown so the capture feels aligned.
            </p>

            <div className="mt-6 space-y-3">
              <StatusRow
                label="Host joined"
                value={!!hostMember}
              />
              <StatusRow
                label="Partner joined"
                value={!!partnerMember}
              />
              <StatusRow
                label="Host ready"
                value={!!hostMember?.is_ready}
              />
              <StatusRow
                label="Partner ready"
                value={!!partnerMember?.is_ready}
              />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3">
              <button
                onClick={toggleReady}
                disabled={!currentMember}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition ${
                  currentMember?.is_ready
                    ? "border border-amoura-red-soft/20 bg-black/30 text-amoura-cream hover:border-amoura-red-soft/45"
                    : "amoura-btn-primary"
                }`}
              >
                {currentMember?.is_ready ? (
                  <>
                    <Check className="h-4 w-4" />
                    You are ready
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Mark as Ready
                  </>
                )}
              </button>

              {isHost ? (
                <button
                  onClick={startSession}
                  disabled={!bothReady}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/30 px-5 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Start Dual Session
                </button>
              ) : (
                <div className="rounded-2xl border border-amoura-red-soft/15 bg-black/30 px-4 py-4 text-sm text-amoura-muted">
                  Only the host can start the session once both of you are ready.
                </div>
              )}

              <button
                onClick={refreshState}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-transparent px-5 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Room
              </button>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}

function ParticipantCard({
  title,
  member,
  isCurrentUser,
  accent,
  waiting = false,
}: {
  title: string
  member: DualRoomMember | null
  isCurrentUser: boolean
  accent: "rose" | "pink"
  waiting?: boolean
}) {
  const accentClass =
    accent === "rose"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
      : "border-pink-400/20 bg-pink-500/10 text-pink-200"

  return (
    <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-muted">
            {title}
          </p>
          <h3 className="amoura-serif mt-2 text-2xl text-amoura-cream">
            {member?.display_name || (waiting ? "Waiting..." : "Unknown")}
          </h3>
        </div>

        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-amoura-red-soft/20 bg-black/30 text-amoura-red-soft">
          <UserCircle2 className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amoura-red-soft/15 bg-black/30 p-4">
        {waiting ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amoura-red-soft animate-bounce" />
              <span
                className="h-2.5 w-2.5 rounded-full bg-amoura-red-soft animate-bounce"
                style={{ animationDelay: "0.12s" }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full bg-amoura-red-soft animate-bounce"
                style={{ animationDelay: "0.24s" }}
              />
            </div>
            <p className="text-sm text-amoura-muted">
              Waiting for partner to join...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${accentClass}`}>
              {member?.is_connected ? "Connected" : "Disconnected"}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-amoura-red-soft/10 bg-black/20 px-3 py-3">
              <p className="text-sm text-amoura-muted">Ready status</p>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  member?.is_ready
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-zinc-500/10 text-zinc-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    member?.is_ready ? "bg-emerald-400" : "bg-zinc-400"
                  }`}
                />
                {member?.is_ready ? "Ready" : "Not ready"}
              </span>
            </div>

            {isCurrentUser ? (
              <p className="text-xs text-amoura-red-soft">This is you</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

function StatusRow({
  label,
  value,
}: {
  label: string
  value: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amoura-red-soft/10 bg-black/25 px-4 py-3">
      <p className="text-sm text-amoura-muted">{label}</p>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          value
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-zinc-500/10 text-zinc-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${value ? "bg-emerald-400" : "bg-zinc-400"}`}
        />
        {value ? "Yes" : "No"}
      </span>
    </div>
  )
}