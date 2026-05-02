"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Heart,
  Loader2,
  RefreshCcw,
  Send,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import {
  getDisplayName,
  getInviteLink,
  getTimeLeft,
} from "@/lib/dual/helpers"
import type {
  DualRoom,
  DualRoomMember,
  DualRoomMemberRole,
} from "@/lib/dual/types"

type Props = {
  roomCode: string
}

export default function DualRoomClient({ roomCode }: Props) {
  const supabase = createClient()

  const [room, setRoom] = useState<DualRoom | null>(null)
  const [members, setMembers] = useState<DualRoomMember[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentRole, setCurrentRole] = useState<DualRoomMemberRole | null>(null)
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const inviteLink = useMemo(() => getInviteLink(roomCode), [roomCode])

  const hostMember = members.find((member) => member.role === "host") ?? null
  const partnerMember = members.find((member) => member.role === "partner") ?? null
  const currentMember =
    members.find((member) => member.user_id === currentUserId) ?? null

  const isHost = currentRole === "host"
  const partnerOnline =
    !!partnerMember?.user_id && onlineUserIds.includes(partnerMember.user_id)
  const hostOnline = !!hostMember?.user_id && onlineUserIds.includes(hostMember.user_id)

  const bothReady = !!hostMember?.is_ready && !!partnerMember?.is_ready
  const canStart = isHost && bothReady && partnerOnline
  const timeLeft = room ? getTimeLeft(room.expires_at) : "00:00"

  const fetchRoomState = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from("dual_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single()

    if (roomError || !roomData) {
      setRoom(null)
      setMembers([])
      setError("This photobooth room could not be found or may have expired.")
      return
    }

    const { data: memberData, error: memberError } = await supabase
      .from("dual_room_members")
      .select("*")
      .eq("room_id", roomData.id)
      .order("joined_at", { ascending: true })

    if (memberError) {
      setError("We could not load the room members.")
      return
    }

    setRoom(roomData as DualRoom)
    setMembers((memberData ?? []) as DualRoomMember[])
  }, [roomCode, supabase])

  async function joinRoom() {
    try {
      setLoading(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = `/create-account?next=/booth/dual/room/${roomCode}`
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

      if (new Date(roomData.expires_at).getTime() <= Date.now()) {
        setError("This session has expired. Please create a new one.")
        return
      }

      const { data: existingMembers } = await supabase
        .from("dual_room_members")
        .select("*")
        .eq("room_id", roomData.id)

      const safeMembers = existingMembers ?? []
      const alreadyJoined = safeMembers.find((member) => member.user_id === user.id)

      let role: DualRoomMemberRole

      if (alreadyJoined) {
        role = alreadyJoined.role as DualRoomMemberRole

        await supabase
          .from("dual_room_members")
          .update({ is_connected: true })
          .eq("id", alreadyJoined.id)
      } else {
        const partnerExists = safeMembers.some((member) => member.role === "partner")

        if (roomData.host_user_id === user.id) {
          role = "host"
        } else if (!partnerExists) {
          role = "partner"
        } else {
          setError("This room already has a partner.")
          return
        }

        const displayName = getDisplayName({
          email: user.email,
          user_metadata: user.user_metadata ?? {},
        })

        const { error: insertError } = await supabase
          .from("dual_room_members")
          .insert({
            room_id: roomData.id,
            user_id: user.id,
            role,
            display_name: displayName,
            is_ready: false,
            is_connected: true,
          })

        if (insertError) {
          setError("We could not join this room.")
          return
        }

        if (role === "partner") {
          await supabase
            .from("dual_rooms")
            .update({ status: "partner_joined" })
            .eq("id", roomData.id)
        }
      }

      setCurrentRole(role)
      await fetchRoomState()
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("We could not copy the invite link.")
    }
  }

  async function toggleReady() {
    if (!currentMember) return

    const { error: updateError } = await supabase
      .from("dual_room_members")
      .update({ is_ready: !currentMember.is_ready })
      .eq("id", currentMember.id)

    if (updateError) {
      setError("We could not update your ready status.")
    }
  }

  async function startCaptureStage() {
    if (!room || !canStart) return

    const { error: updateError } = await supabase
      .from("dual_rooms")
      .update({
        status: "ready",
        current_shot: 0,
        countdown_starts_at: null,
      })
      .eq("id", room.id)

    if (updateError) {
      setError("We could not start the capture stage.")
      return
    }

    window.location.href = `/booth/dual/capture/${room.room_code}`
  }

  async function refreshRoom() {
    setLoading(true)
    await fetchRoomState()
    setLoading(false)
  }

  useEffect(() => {
    joinRoom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  useEffect(() => {
    if (!room?.id || !currentUserId) return

    const channel = supabase
      .channel(`dual-room-presence-${room.id}`, {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const ids = Object.keys(state)
        setOnlineUserIds(ids)
      })
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
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            role: currentRole,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [room?.id, currentUserId, currentRole, fetchRoomState, supabase])

  useEffect(() => {
    if (!room) return

    if (room.status === "ready" || room.status === "countdown") {
      window.location.href = `/booth/dual/capture/${room.room_code}`
    }
  }, [room])

  if (loading) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-amoura-red-soft" />
          <h1 className="amoura-serif mt-5 text-3xl text-amoura-cream">
            Opening your room...
          </h1>
          <p className="mt-3 text-sm leading-6 text-amoura-muted">
            Preparing your private dual photobooth.
          </p>
        </div>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Users className="mx-auto h-10 w-10 text-amoura-red-soft" />
          <h1 className="amoura-serif mt-5 text-3xl text-amoura-cream">
            Room unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-amoura-muted">
            {error || "This room is no longer available."}
          </p>

          <Link
            href="/booth/dual"
            className="amoura-btn-primary mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Create New Session
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="amoura-page min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/booth/dual"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Dual Mode
            </Link>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
                Waiting Room
              </p>
              <p className="text-xs text-amoura-muted">{room.room_code}</p>
            </div>

            <button
              onClick={refreshRoom}
              className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/30 px-4 py-2 text-xs font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
              <Heart className="h-4 w-4" />
              Invite your partner
            </div>

            <h1 className="amoura-serif mt-5 text-4xl leading-none text-amoura-cream sm:text-5xl">
              Waiting for your partner
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-amoura-muted">
              Share this private link. Once both of you are ready, the host can
              move to the capture stage where the cameras fill the screen.
            </p>

            <div className="mt-6 rounded-2xl border border-amoura-red-soft/15 bg-black/35 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                Invite Link
              </p>
              <p className="mt-2 break-all text-sm text-amoura-cream">
                {inviteLink}
              </p>
            </div>

            <button
              onClick={copyLink}
              className="amoura-btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold"
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
          </section>

          <aside className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-[radial-gradient(circle_at_top,#25070f_0%,#0a0507_40%,#040404_100%)] p-5 backdrop-blur-xl sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <MemberStatusCard
                title="Host"
                name={hostMember?.display_name || "Host"}
                online={hostOnline}
                ready={!!hostMember?.is_ready}
                isYou={hostMember?.user_id === currentUserId}
              />

              <MemberStatusCard
                title="Partner"
                name={partnerMember?.display_name || "Waiting..."}
                online={partnerOnline}
                ready={!!partnerMember?.is_ready}
                isYou={partnerMember?.user_id === currentUserId}
                waiting={!partnerMember}
              />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {!partnerMember ? (
              <div className="mt-5 rounded-2xl border border-amoura-red-soft/15 bg-black/30 p-4 text-sm leading-6 text-amoura-muted">
                Partner has not entered yet. Keep this room open and send the
                invite link.
              </div>
            ) : !partnerOnline ? (
              <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                Partner is offline. Waiting for them to reconnect.
              </div>
            ) : bothReady ? (
              <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
                Both of you are ready. Start the capture stage when you are set.
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amoura-red-soft/15 bg-black/30 p-4 text-sm leading-6 text-amoura-muted">
                Click ready when you are prepared. The host starts the 3-shot
                session.
              </div>
            )}

            <div className="mt-6 grid gap-3">
              <button
                onClick={toggleReady}
                disabled={!currentMember}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
                    I’m Ready
                  </>
                )}
              </button>

              {isHost ? (
                <button
                  onClick={startCaptureStage}
                  disabled={!canStart}
                  className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  Enter Capture Stage
                </button>
              ) : (
                <div className="rounded-full border border-amoura-red-soft/20 bg-black/30 px-5 py-4 text-center text-sm font-semibold text-amoura-muted">
                  Waiting for host to start
                </div>
              )}

              <p className="text-center text-xs text-amoura-muted">
                Room expires in {timeLeft}
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}

function MemberStatusCard({
  title,
  name,
  online,
  ready,
  isYou,
  waiting = false,
}: {
  title: string
  name: string
  online: boolean
  ready: boolean
  isYou: boolean
  waiting?: boolean
}) {
  return (
    <div className="rounded-2xl border border-amoura-red-soft/15 bg-black/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amoura-muted">
        {title}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-amoura-cream">
        {name}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            waiting
              ? "bg-zinc-500/10 text-zinc-300"
              : online
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-amber-500/10 text-amber-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              waiting ? "bg-zinc-400" : online ? "bg-emerald-400" : "bg-amber-300"
            }`}
          />
          {waiting ? "Waiting" : online ? "Online" : "Offline"}
        </span>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            ready ? "bg-amoura-red/15 text-amoura-red-soft" : "bg-zinc-500/10 text-zinc-300"
          }`}
        >
          {ready ? "Ready" : "Not ready"}
        </span>

        {isYou ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amoura-cream">
            You
          </span>
        ) : null}
      </div>
    </div>
  )
}