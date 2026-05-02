"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  Heart,
  Loader2,
  Sparkles,
  Users,
  VideoOff,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { getDisplayName } from "@/lib/dual/helpers"
import type {
  DualRoom,
  DualRoomMember,
  DualRoomMemberRole,
} from "@/lib/dual/types"

type Props = {
  roomCode: string
}

type SignalPayload = {
  from: string
  role: DualRoomMemberRole
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
}

type PhotoPayload = {
  from: string
  role: DualRoomMemberRole
  shot: number
  imageData: string
}

type DualResultData = {
  roomCode: string
  hostName: string
  partnerName: string
  hostPhotos: string[]
  partnerPhotos: string[]
  createdAt: string
}

const MAX_SHOTS = 3
const DUAL_RESULT_KEY = "amoreframe_dual_photos"

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default function DualCaptureClient({ roomCode }: Props) {
  const supabase = createClient()

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const madeOfferRef = useRef(false)
  const scheduledShotRef = useRef<number | null>(null)
  const hostPhotosRef = useRef<string[]>([])
  const partnerPhotosRef = useRef<string[]>([])

  const [room, setRoom] = useState<DualRoom | null>(null)
  const [members, setMembers] = useState<DualRoomMember[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentRole, setCurrentRole] = useState<DualRoomMemberRole | null>(null)

  const [loading, setLoading] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)
  const [remoteCameraReady, setRemoteCameraReady] = useState(false)
  const [remoteReady, setRemoteReady] = useState(false)
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new")

  const [countdown, setCountdown] = useState<number | null>(null)
  const [captureMessage, setCaptureMessage] = useState("")
  const [capturingShot, setCapturingShot] = useState<number | null>(null)

  const [hostPhotos, setHostPhotos] = useState<string[]>([])
  const [partnerPhotos, setPartnerPhotos] = useState<string[]>([])
  const [error, setError] = useState("")

  const hostMember = members.find((member) => member.role === "host") ?? null
  const partnerMember = members.find((member) => member.role === "partner") ?? null
  const currentMember =
    members.find((member) => member.user_id === currentUserId) ?? null

  const isHost = currentRole === "host"
  const partnerOnline = !!partnerMember?.is_connected
  const liveConnected = remoteReady || connectionState === "connected"

  const nextPhotoLabel = useMemo(() => {
    if (!room) return "Start Photo 1"

    if (room.status === "countdown") return "Countdown running..."
    if (room.status === "capturing") return "Capturing..."

    if (hostPhotos.length === 0 && partnerPhotos.length === 0) {
      return "Start Photo 1"
    }

    if (room.status === "between_shots" && room.current_shot === 1) {
      return "Take Photo 2"
    }

    if (room.status === "between_shots" && room.current_shot === 2) {
      return "Take Final Photo"
    }

    if (room.status === "completed") return "Photos Complete"

    return "Start Photo 1"
  }, [room, hostPhotos.length, partnerPhotos.length])

  const stageTitle = useMemo(() => {
    if (!room) return "Preparing room"

    if (!partnerOnline) return "Waiting for partner"
    if (!cameraReady) return "Allow your camera"
    if (!liveConnected) return "Connecting cameras"

    if (room.status === "between_shots" && room.current_shot === 1) {
      return "Photo 1 captured"
    }

    if (room.status === "between_shots" && room.current_shot === 2) {
      return "Photo 2 captured"
    }

    if (room.status === "completed") {
      return "All photos captured"
    }

    if (room.current_shot === 1) return "Photo 1 of 3"
    if (room.current_shot === 2) return "Photo 2 of 3"
    if (room.current_shot === 3) return "Final photo"

    return "Ready to capture"
  }, [room, partnerOnline, cameraReady, liveConnected])

  const stageSubtitle = useMemo(() => {
    if (!partnerOnline) {
      return "Keep this room open. We’ll continue once your partner reconnects."
    }

    if (!cameraReady) {
      return "Allow camera so your side can be captured."
    }

    if (!liveConnected) {
      return "Stay here while both cameras connect."
    }

    if (room?.status === "between_shots" && room.current_shot === 1) {
      return "Change your pose before photo 2. Heart hands are perfect here."
    }

    if (room?.status === "between_shots" && room.current_shot === 2) {
      return "One last pose. Make the final photo count."
    }

    if (room?.status === "completed") {
      return "Preparing your dual photostrip..."
    }

    if (room?.current_shot === 1) {
      return "First pose. Smile and look at the camera."
    }

    if (room?.current_shot === 2) {
      return "Second pose. Move closer or try something cute."
    }

    if (room?.current_shot === 3) {
      return "Final pose. Make it sweet, funny, or romantic."
    }

    return "The host can start when both cameras are connected."
  }, [partnerOnline, cameraReady, liveConnected, room?.status, room?.current_shot])

  const fetchRoomState = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from("dual_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single()

    if (roomError || !roomData) {
      setRoom(null)
      setMembers([])
      setError("This capture room could not be found.")
      return
    }

    const { data: memberData, error: memberError } = await supabase
      .from("dual_room_members")
      .select("*")
      .eq("room_id", roomData.id)
      .order("joined_at", { ascending: true })

    if (memberError) {
      setError("We could not load the capture members.")
      return
    }

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
        window.location.href = `/create-account?next=/booth/dual/capture/${roomCode}`
        return
      }

      setCurrentUserId(user.id)

      const { data: roomData, error: roomError } = await supabase
        .from("dual_rooms")
        .select("*")
        .eq("room_code", roomCode)
        .single()

      if (roomError || !roomData) {
        setError("This capture session no longer exists.")
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
            is_ready: true,
            is_connected: true,
          })

        if (insertError) {
          setError("We could not join the capture room.")
          return
        }
      }

      setCurrentRole(role)
      await fetchRoomState()
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

      window.setTimeout(() => {
        broadcastCameraReady().catch(console.error)
      }, 400)
    } catch {
      setCameraReady(false)
      setError("Camera access is required for the capture stage.")
    }
  }

  async function broadcastCameraReady() {
    if (!channelRef.current || !currentRole) return

    await channelRef.current.send({
      type: "broadcast",
      event: "camera-ready",
      payload: {
        from: currentUserId,
        role: currentRole,
      },
    })
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
    if (!isHost || !partnerMember || !cameraReady || !remoteCameraReady) return

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
    if (currentRole !== "partner" || !cameraReady) return

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

  function captureLocalPhoto() {
    const video = localVideoRef.current
    if (!video || video.readyState < 2) return null

    const canvas = document.createElement("canvas")
    canvas.width = 720
    canvas.height = 540

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const videoRatio = video.videoWidth / video.videoHeight
    const canvasRatio = canvas.width / canvas.height

    let sx = 0
    let sy = 0
    let sw = video.videoWidth
    let sh = video.videoHeight

    if (videoRatio > canvasRatio) {
      sw = video.videoHeight * canvasRatio
      sx = (video.videoWidth - sw) / 2
    } else {
      sh = video.videoWidth / canvasRatio
      sy = (video.videoHeight - sh) / 2
    }

    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    return canvas.toDataURL("image/jpeg", 0.82)
  }

  function storeCapturedPhoto(
    role: DualRoomMemberRole,
    shot: number,
    imageData: string
  ) {
    const index = shot - 1

    if (role === "host") {
      const next = [...hostPhotosRef.current]
      next[index] = imageData
      hostPhotosRef.current = next.filter(Boolean)
      setHostPhotos([...hostPhotosRef.current])
    } else {
      const next = [...partnerPhotosRef.current]
      next[index] = imageData
      partnerPhotosRef.current = next.filter(Boolean)
      setPartnerPhotos([...partnerPhotosRef.current])
    }
  }

  async function handlePhotoCaptured(payload: PhotoPayload) {
    if (payload.from === currentUserId) return
    storeCapturedPhoto(payload.role, payload.shot, payload.imageData)
  }

  async function captureShot(shot: number) {
    if (!currentRole || !channelRef.current) return

    setCapturingShot(shot)
    setCaptureMessage("Capturing...")

    const imageData = captureLocalPhoto()

    if (!imageData) {
      setError("We could not capture your photo. Please keep your camera open.")
      setCapturingShot(null)
      return
    }

    storeCapturedPhoto(currentRole, shot, imageData)

    await channelRef.current.send({
      type: "broadcast",
      event: "photo-captured",
      payload: {
        from: currentUserId,
        role: currentRole,
        shot,
        imageData,
      } satisfies PhotoPayload,
    })

    if (shot === 1) {
      setCaptureMessage("Photo 1 saved. Prepare for photo 2.")
    } else if (shot === 2) {
      setCaptureMessage("Photo 2 saved. One final pose left.")
    } else {
      setCaptureMessage("All photos captured. Preparing your strip.")
    }

    window.setTimeout(() => {
      setCapturingShot(null)
    }, 800)

    if (isHost && room) {
      window.setTimeout(async () => {
        if (shot < MAX_SHOTS) {
          await supabase
            .from("dual_rooms")
            .update({
              status: "between_shots",
              current_shot: shot,
              countdown_starts_at: null,
            })
            .eq("id", room.id)
        } else {
          await supabase
            .from("dual_rooms")
            .update({
              status: "completed",
              current_shot: MAX_SHOTS,
              countdown_starts_at: null,
            })
            .eq("id", room.id)
        }
      }, 1200)
    }
  }

  async function startNextPhoto() {
    if (!room || !isHost) return

    if (!cameraReady || !partnerOnline || !liveConnected) {
      setError("Both cameras must be connected before taking the next photo.")
      return
    }

    const nextShot =
      room.status === "between_shots" ? room.current_shot + 1 : room.current_shot || 1

    if (nextShot > MAX_SHOTS) return

    scheduledShotRef.current = null
    setCountdown(null)
    setError("")
    setCaptureMessage("Get ready. Countdown is starting...")

    const { error: updateError } = await supabase
      .from("dual_rooms")
      .update({
        status: "countdown",
        current_shot: nextShot,
        countdown_starts_at: new Date(Date.now() + 4200).toISOString(),
      })
      .eq("id", room.id)

    if (updateError) {
      setError("We could not start the next photo. Please try again.")
    }
  }

  async function leaveCapture() {
    if (currentMember) {
      await supabase
        .from("dual_room_members")
        .update({ is_connected: false, is_ready: false })
        .eq("id", currentMember.id)
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    peerRef.current?.close()

    window.location.href = "/dashboard"
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
      .channel(`dual-capture-${room.id}`)
      .on("broadcast", { event: "camera-ready" }, ({ payload }) => {
        if (payload?.from !== currentUserId) {
          setRemoteCameraReady(true)
        }
      })
      .on("broadcast", { event: "webrtc-offer" }, async ({ payload }) => {
        await handleOffer(payload as SignalPayload)
      })
      .on("broadcast", { event: "webrtc-answer" }, async ({ payload }) => {
        await handleAnswer(payload as SignalPayload)
      })
      .on("broadcast", { event: "webrtc-ice" }, async ({ payload }) => {
        await handleIce(payload as SignalPayload)
      })
      .on("broadcast", { event: "photo-captured" }, async ({ payload }) => {
        await handlePhotoCaptured(payload as PhotoPayload)
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
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, currentUserId, currentRole, cameraReady])

  useEffect(() => {
    if (cameraReady && partnerMember) {
      broadcastCameraReady().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady, partnerMember?.id])

  useEffect(() => {
    if (!isHost || !partnerMember || !cameraReady || !remoteCameraReady) return

    const timer = window.setTimeout(() => {
      makeOffer().catch((err) => {
        console.error(err)
        setError("We could not connect the live preview.")
      })
    }, 800)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, partnerMember?.id, cameraReady, remoteCameraReady])

  useEffect(() => {
    if (!room || room.status !== "countdown") return
    if (!room.countdown_starts_at || !cameraReady || !currentRole) return

    const shot = room.current_shot
    if (!shot || scheduledShotRef.current === shot) return

    scheduledShotRef.current = shot

    const captureAt = new Date(room.countdown_starts_at).getTime()
    const delay = Math.max(captureAt - Date.now(), 0)

    const countdownTimer = window.setInterval(() => {
      const diff = captureAt - Date.now()

      if (diff <= 0) {
        setCountdown(0)
        window.clearInterval(countdownTimer)
        return
      }

      setCountdown(Math.ceil(diff / 1000))
    }, 150)

    const captureTimer = window.setTimeout(() => {
      captureShot(shot).catch(console.error)
    }, delay)

    return () => {
      window.clearInterval(countdownTimer)
      window.clearTimeout(captureTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    room?.status,
    room?.current_shot,
    room?.countdown_starts_at,
    cameraReady,
    currentRole,
  ])

  useEffect(() => {
    const ready = hostPhotos.length >= MAX_SHOTS && partnerPhotos.length >= MAX_SHOTS

    if (!ready) return

    const data: DualResultData = {
      roomCode,
      hostName: hostMember?.display_name || "Host",
      partnerName: partnerMember?.display_name || "Partner",
      hostPhotos: hostPhotos.slice(0, MAX_SHOTS),
      partnerPhotos: partnerPhotos.slice(0, MAX_SHOTS),
      createdAt: new Date().toISOString(),
    }

    sessionStorage.setItem(DUAL_RESULT_KEY, JSON.stringify(data))
    window.location.href = "/booth/dual/result"
  }, [hostPhotos, partnerPhotos, roomCode, hostMember, partnerMember])

  if (loading) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-amoura-red-soft" />
          <p className="mt-4 font-semibold text-amoura-cream">
            Opening capture stage...
          </p>
          <p className="mt-2 text-sm text-amoura-muted">
            Preparing your dual photobooth.
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
            Capture room unavailable
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
    <main className="amoura-page min-h-screen overflow-hidden px-3 py-3 sm:px-4">
      <section className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-3">
        <header className="flex shrink-0 items-center justify-between gap-3 rounded-[1.25rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl">
          <button
            onClick={leaveCapture}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
              Dual Capture
            </p>
            <p className="text-xs text-amoura-muted">{room.room_code}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-amoura-red-soft/15 bg-black/30 px-3 py-2 text-xs text-amoura-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                liveConnected ? "bg-emerald-400" : "bg-zinc-400"
              }`}
            />
            {liveConnected ? "Live" : "Syncing"}
          </div>
        </header>

        <section className="relative min-h-0 flex-1 overflow-hidden rounded-[1.6rem] border border-amoura-red-soft/20 bg-black shadow-[0_0_70px_rgba(194,31,58,0.16)]">
          <div className="absolute inset-0 grid grid-cols-2">
            <JoinedVideoStage
              label="You"
              name={currentMember?.display_name || "You"}
              videoRef={localVideoRef}
              isLocal
              cameraReady={cameraReady}
              onStartCamera={startCamera}
            />

            <JoinedVideoStage
              label="Partner"
              name={partnerMember?.display_name || "Partner"}
              videoRef={remoteVideoRef}
              cameraReady={remoteReady}
              waiting={!partnerOnline}
            />
          </div>

          <CaptureCenterOverlay
            title={stageTitle}
            subtitle={stageSubtitle}
            countdown={countdown}
            message={captureMessage}
            shot={room.current_shot}
            capturingShot={capturingShot}
            error={error}
          />
        </section>

        <footer className="shrink-0 rounded-[1.25rem] border border-amoura-red-soft/20 bg-black/55 p-3 backdrop-blur-xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs text-amoura-muted">
            <ProgressChip
              label="Photo 1"
              done={hostPhotos.length >= 1 && partnerPhotos.length >= 1}
              active={room.current_shot === 1 && room.status !== "completed"}
            />
            <ProgressChip
              label="Photo 2"
              done={hostPhotos.length >= 2 && partnerPhotos.length >= 2}
              active={room.current_shot === 2 && room.status !== "completed"}
            />
            <ProgressChip
              label="Photo 3"
              done={hostPhotos.length >= 3 && partnerPhotos.length >= 3}
              active={room.current_shot === 3 && room.status !== "completed"}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            {isHost ? (
              <button
                onClick={startNextPhoto}
                disabled={
                  !cameraReady ||
                  !partnerOnline ||
                  !liveConnected ||
                  room.status === "countdown" ||
                  room.status === "capturing" ||
                  room.status === "completed"
                }
                className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {nextPhotoLabel}
              </button>
            ) : (
              <div className="rounded-full border border-amoura-red-soft/20 bg-black/40 px-5 py-4 text-center text-sm font-semibold text-amoura-muted">
                Waiting for host to start the next photo
              </div>
            )}

            <button
              onClick={leaveCapture}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
            >
              <ArrowLeft className="h-4 w-4" />
              Leave
            </button>
          </div>
        </footer>
      </section>
    </main>
  )
}

function JoinedVideoStage({
  label,
  name,
  videoRef,
  isLocal = false,
  cameraReady,
  waiting = false,
  onStartCamera,
}: {
  label: string
  name: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  isLocal?: boolean
  cameraReady: boolean
  waiting?: boolean
  onStartCamera?: () => void
}) {
  return (
    <section className="relative h-full min-h-[420px] overflow-hidden border-r border-white/10 last:border-r-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`h-full w-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
      />

      <div className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amoura-cream backdrop-blur sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs">
        {label}
      </div>

      <div className="absolute bottom-2 left-2 right-2 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-center backdrop-blur sm:bottom-4 sm:left-4 sm:right-4">
        <p className="truncate text-xs font-semibold text-amoura-cream sm:text-sm">
          {name}
        </p>
      </div>

      {!cameraReady ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-3 text-center">
          {waiting ? (
            <>
              <Users className="h-9 w-9 text-amoura-red-soft sm:h-12 sm:w-12" />
              <p className="mt-3 text-xs font-semibold text-amoura-cream sm:text-sm">
                Partner offline
              </p>
              <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-amoura-muted sm:max-w-xs sm:text-xs sm:leading-5">
                Waiting for your partner to reconnect.
              </p>
            </>
          ) : (
            <>
              <VideoOff className="h-9 w-9 text-amoura-red-soft sm:h-12 sm:w-12" />
              <p className="mt-3 text-xs font-semibold text-amoura-cream sm:text-sm">
                Camera needed
              </p>
              <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-amoura-muted sm:max-w-xs sm:text-xs sm:leading-5">
                Allow camera to capture your side.
              </p>

              {onStartCamera ? (
                <button
                  onClick={onStartCamera}
                  className="amoura-btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm"
                >
                  <Camera className="h-4 w-4" />
                  Allow
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}

function CaptureCenterOverlay({
  title,
  subtitle,
  countdown,
  message,
  shot,
  capturingShot,
  error,
}: {
  title: string
  subtitle: string
  countdown: number | null
  message: string
  shot: number
  capturingShot: number | null
  error: string
}) {
  const isCounting = countdown !== null

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 text-center transition ${
        isCounting ? "scale-100" : "scale-95"
      }`}
    >
      {isCounting ? (
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-amoura-red-soft/50 bg-black/70 text-6xl font-bold text-amoura-cream shadow-[0_0_80px_rgba(194,31,58,0.45)] backdrop-blur-xl sm:h-44 sm:w-44 sm:text-8xl">
          {countdown > 0 ? countdown : "📸"}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-amoura-red-soft/20 bg-black/45 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amoura-red-soft sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            {shot ? `Photo ${shot} of 3` : "Capture stage"}
          </div>

          <h1 className="amoura-serif text-2xl leading-none text-amoura-cream sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-amoura-muted sm:text-sm sm:leading-6">
            {subtitle}
          </p>

          {capturingShot ? (
            <div className="mt-3 text-sm font-semibold text-amoura-cream">
              Capturing photo {capturingShot}...
            </div>
          ) : null}

          {message ? (
            <div className="mt-3 rounded-full border border-amoura-red-soft/20 bg-black/40 px-4 py-2 text-xs text-amoura-cream sm:text-sm">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 sm:text-sm">
              {error}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ProgressChip({
  label,
  done,
  active = false,
}: {
  label: string
  done: boolean
  active?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-semibold transition ${
        done
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
          : active
            ? "border-amoura-red-soft/40 bg-amoura-red/15 text-amoura-cream"
            : "border-white/10 bg-white/5 text-amoura-muted"
      }`}
    >
      {done ? (
        <Check className="h-3.5 w-3.5" />
      ) : active ? (
        <Camera className="h-3.5 w-3.5" />
      ) : (
        <Heart className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  )
}