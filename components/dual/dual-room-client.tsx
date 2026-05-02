"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Heart,
  Loader2,
  RefreshCcw,
  Send,
  UserCircle2,
  Users,
  Video,
  VideoOff,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import {
  getCountdownSeconds,
  getDisplayName,
  getInviteLink,
  getTimeLeft,
} from "@/lib/dual/helpers"
import type { DualRoom, DualRoomMember, DualRoomMemberRole } from "@/lib/dual/types"

type Props = {
  roomCode: string
}

type SignalPayload = {
  from: string
  role: DualRoomMemberRole
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
}

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default function DualRoomClient({ roomCode }: Props) {
  const supabase = createClient()

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const madeOfferRef = useRef(false)

  const [room, setRoom] = useState<DualRoom | null>(null)
  const [members, setMembers] = useState<DualRoomMember[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentRole, setCurrentRole] = useState<DualRoomMemberRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)
  const [remoteReady, setRemoteReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new")

  const inviteLink = useMemo(() => getInviteLink(roomCode), [roomCode])

  const hostMember = members.find((member) => member.role === "host") ?? null
  const partnerMember = members.find((member) => member.role === "partner") ?? null

  const isHost = currentRole === "host"
  const currentMember =
    members.find((member) => member.user_id === currentUserId) ?? null

  const bothReady = !!hostMember?.is_ready && !!partnerMember?.is_ready
  const timeLeft = room ? getTimeLeft(room.expires_at) : "00:00"
  const countdown = getCountdownSeconds(room?.countdown_starts_at ?? null)

  const fetchRoomState = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from("dual_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single()

    if (roomError || !roomData) {
      setRoom(null)
      setMembers([])
      setError("This room could not be found or may have already expired.")
      return
    }

    const { data: memberData, error: memberError } = await supabase
      .from("dual_room_members")
      .select("*")
      .eq("room_id", roomData.id)
      .order("joined_at", { ascending: true })

    if (memberError) throw memberError

    setRoom(roomData as DualRoom)
    setMembers((memberData ?? []) as DualRoomMember[])
  }, [roomCode, supabase])

  async function ensureJoined() {
    try {
      setLoading(true)
      setError("")

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

      let role: DualRoomMemberRole | null = null

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

        if (insertError) throw insertError

        if (role === "partner") {
          await supabase
            .from("dual_rooms")
            .update({ status: "partner_joined" })
            .eq("id", roomData.id)
        }
      }

      setCurrentRole(role)
      await fetchRoomState()
    } catch (err) {
      console.error(err)
      setError("We couldn’t join the session right now.")
    } finally {
      setLoading(false)
    }
  }

  async function startCamera() {
    try {
      setError("")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      })

      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setCameraReady(true)

      if (peerRef.current) {
        stream.getTracks().forEach((track) => {
          peerRef.current?.addTrack(track, stream)
        })
      }
    } catch (err) {
      console.error(err)
      setCameraReady(false)
      setError("Camera access is required for Dual Mode.")
    }
  }

  function createPeer() {
    if (peerRef.current) return peerRef.current

    const peer = new RTCPeerConnection(rtcConfig)

    remoteStreamRef.current = new MediaStream()

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current
    }

    peer.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current?.addTrack(track)
      })

      setRemoteReady(true)
    }

    peer.onicecandidate = async (event) => {
      if (!event.candidate || !channelRef.current || !currentRole) return

      await channelRef.current.send({
        type: "broadcast",
        event: "webrtc-ice",
        payload: {
          from: currentUserId,
          role: currentRole,
          candidate: event.candidate.toJSON(),
        } satisfies SignalPayload,
      })
    }

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState)
    }

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current as MediaStream)
    })

    peerRef.current = peer
    return peer
  }

  async function makeOffer() {
    if (!channelRef.current || !currentRole || madeOfferRef.current) return
    if (!isHost || !partnerMember || !cameraReady) return

    const peer = createPeer()
    madeOfferRef.current = true

    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)

    await channelRef.current.send({
      type: "broadcast",
      event: "webrtc-offer",
      payload: {
        from: currentUserId,
        role: currentRole,
        sdp: offer,
      } satisfies SignalPayload,
    })
  }

  async function handleOffer(payload: SignalPayload) {
    if (payload.from === currentUserId || !payload.sdp || !currentRole) return
    if (currentRole !== "partner") return

    const peer = createPeer()

    await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp))

    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)

    await channelRef.current?.send({
      type: "broadcast",
      event: "webrtc-answer",
      payload: {
        from: currentUserId,
        role: currentRole,
        sdp: answer,
      } satisfies SignalPayload,
    })
  }

  async function handleAnswer(payload: SignalPayload) {
    if (payload.from === currentUserId || !payload.sdp) return
    if (!peerRef.current) return

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
  }

  async function handleIce(payload: SignalPayload) {
    if (payload.from === currentUserId || !payload.candidate) return
    if (!peerRef.current) return

    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate))
    } catch (err) {
      console.error("ICE candidate error:", err)
    }
  }

  useEffect(() => {
    ensureJoined()

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      peerRef.current?.close()

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  useEffect(() => {
    if (!room?.id) return

    const channel = supabase
      .channel(`dual-room-${room.id}`)
      .on(
        "broadcast",
        { event: "webrtc-offer" },
        async ({ payload }) => handleOffer(payload as SignalPayload)
      )
      .on(
        "broadcast",
        { event: "webrtc-answer" },
        async ({ payload }) => handleAnswer(payload as SignalPayload)
      )
      .on(
        "broadcast",
        { event: "webrtc-ice" },
        async ({ payload }) => handleIce(payload as SignalPayload)
      )
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

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, currentUserId, currentRole, cameraReady])

  useEffect(() => {
    if (!isHost || !partnerMember || !cameraReady || !channelRef.current) return

    const timer = window.setTimeout(() => {
      makeOffer().catch((err) => {
        console.error(err)
        setError("We couldn’t connect the live preview.")
      })
    }, 700)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, partnerMember?.id, cameraReady, currentRole])

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

  if (loading) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amoura-red-soft" />
          <p className="mt-4 text-base font-semibold text-amoura-cream">
            Joining your dual session...
          </p>
          <p className="mt-2 text-sm text-amoura-muted">
            Preparing the room and checking your camera.
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
            Session unavailable
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
              <span className="h-2 w-2 animate-pulse rounded-full bg-amoura-red-soft" />
              {room.room_code}
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-amoura-muted">
                Expires in
              </p>
              <p className="text-lg font-semibold text-amoura-red-soft">
                {timeLeft}
              </p>
            </div>
          </div>
        </header>

        {countdown !== null && room.status === "countdown" ? (
          <div className="mt-4 rounded-[1.5rem] border border-amoura-red-soft/25 bg-amoura-red/10 px-5 py-4 text-center backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
              Synced countdown
            </p>
            <div className="amoura-serif mt-2 animate-pulse text-5xl text-amoura-cream">
              {countdown > 0 ? countdown : "Smile!"}
            </div>
          </div>
        ) : null}

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
                  Live Preview
                </p>
                <h1 className="amoura-serif mt-1 text-3xl text-amoura-cream">
                  Pose together
                </h1>
              </div>

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
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <VideoCard
                label="You"
                name={currentMember?.display_name || "You"}
                ready={!!currentMember?.is_ready}
                connected
                videoRef={localVideoRef}
                isLocal
                cameraReady={cameraReady}
                onStartCamera={startCamera}
              />

              <VideoCard
                label="Partner"
                name={partnerMember?.display_name || "Waiting for partner"}
                ready={!!partnerMember?.is_ready}
                connected={remoteReady || connectionState === "connected"}
                videoRef={remoteVideoRef}
                waiting={!partnerMember}
                cameraReady={remoteReady}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-amoura-red-soft/15 bg-black/30 px-4 py-4 text-sm text-amoura-cream break-all">
              {inviteLink}
            </div>
          </section>

          <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
              <Heart className="h-4 w-4" />
              Waiting Room
            </div>

            <h2 className="amoura-serif mt-5 text-3xl text-amoura-cream">
              Ready when you are
            </h2>

            <p className="mt-3 text-sm leading-7 text-amoura-muted">
              Both of you can see each other first. When both are ready, the host
              can start the synced countdown.
            </p>

            <div className="mt-6 space-y-3">
              <StatusRow label="Your camera" value={cameraReady} />
              <StatusRow label="Partner joined" value={!!partnerMember} />
              <StatusRow
                label="Live connection"
                value={remoteReady || connectionState === "connected"}
              />
              <StatusRow label="Host ready" value={!!hostMember?.is_ready} />
              <StatusRow label="Partner ready" value={!!partnerMember?.is_ready} />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3">
              {!cameraReady ? (
                <button
                  onClick={startCamera}
                  className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" />
                  Allow Camera
                </button>
              ) : null}

              <button
                onClick={toggleReady}
                disabled={!currentMember || !cameraReady}
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
                  Start Countdown
                </button>
              ) : (
                <div className="rounded-2xl border border-amoura-red-soft/15 bg-black/30 px-4 py-4 text-sm text-amoura-muted">
                  Only the host can start once both are ready.
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

function VideoCard({
  label,
  name,
  ready,
  connected,
  videoRef,
  isLocal = false,
  waiting = false,
  cameraReady,
  onStartCamera,
}: {
  label: string
  name: string
  ready: boolean
  connected: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  isLocal?: boolean
  waiting?: boolean
  cameraReady: boolean
  onStartCamera?: () => void
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/35">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-muted">
            {label}
          </p>
          <p className="text-sm font-semibold text-amoura-cream">{name}</p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            ready ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-500/10 text-zinc-300"
          }`}
        >
          {ready ? "Ready" : "Not ready"}
        </div>
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full w-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />

        {!cameraReady ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-6 text-center">
            {waiting ? (
              <>
                <UserCircle2 className="h-12 w-12 text-amoura-red-soft" />
                <p className="mt-4 text-sm font-semibold text-amoura-cream">
                  Waiting for partner
                </p>
                <div className="mt-3 flex gap-1">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amoura-red-soft" />
                  <span
                    className="h-2.5 w-2.5 animate-bounce rounded-full bg-amoura-red-soft"
                    style={{ animationDelay: "0.12s" }}
                  />
                  <span
                    className="h-2.5 w-2.5 animate-bounce rounded-full bg-amoura-red-soft"
                    style={{ animationDelay: "0.24s" }}
                  />
                </div>
              </>
            ) : isLocal ? (
              <>
                <VideoOff className="h-12 w-12 text-amoura-red-soft" />
                <p className="mt-4 text-sm font-semibold text-amoura-cream">
                  Camera access required
                </p>
                <button
                  onClick={onStartCamera}
                  className="amoura-btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" />
                  Allow Camera
                </button>
              </>
            ) : (
              <>
                <Video className="h-12 w-12 text-amoura-red-soft" />
                <p className="mt-4 text-sm font-semibold text-amoura-cream">
                  Connecting live preview
                </p>
                <p className="mt-2 text-xs text-amoura-muted">
                  Ask your partner to allow camera.
                </p>
              </>
            )}
          </div>
        ) : null}

        <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-semibold text-amoura-cream backdrop-blur">
          {connected ? "Connected" : "Waiting"}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amoura-red-soft/10 bg-black/25 px-4 py-3">
      <p className="text-sm text-amoura-muted">{label}</p>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          value ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-500/10 text-zinc-300"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${value ? "bg-emerald-400" : "bg-zinc-400"}`} />
        {value ? "Yes" : "No"}
      </span>
    </div>
  )
}