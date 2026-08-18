"use client"

import Link from "next/link"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  Heart,
  Loader2,
  Mic,
  RefreshCcw,
  Sparkles,
  Users,
  VideoOff,
  Volume2,
  VolumeX,
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

type CameraReadyPayload = {
  from: string
  role: DualRoomMemberRole
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

type ResultPayload = {
  from: string
  data: DualResultData
}

type DisplaySlot = {
  key: "host" | "partner"
  label: string
  name: string
  videoRef: RefObject<HTMLVideoElement | null>
  isLocal: boolean
  cameraReady: boolean
  waiting: boolean
}

const MAX_SHOTS = 3
const CAPTURE_DELAY_MS = 3300
const DUAL_RESULT_KEY = "amoreframe_dual_photos"

const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

const hasTurnServer = Boolean(turnUsername && turnCredential)


const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },

    ...(hasTurnServer
      ? [
          {
            urls: "turn:global.relay.metered.ca:80",
            username: turnUsername,
            credential: turnCredential,
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: turnUsername,
            credential: turnCredential,
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: turnUsername,
            credential: turnCredential,
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: turnUsername,
            credential: turnCredential,
          },
        ]
      : []),
  ],
  iceCandidatePoolSize: 10,
}
export default function DualCaptureClient({ roomCode }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const scheduledShotRef = useRef<number | null>(null)
  const hostPhotosRef = useRef<string[]>([])
  const partnerPhotosRef = useRef<string[]>([])
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const makingOfferRef = useRef(false)
  const ignoreOfferRef = useRef(false)
  const lastOfferAtRef = useRef(0)
  const cameraAutoStartedRef = useRef(false)

  const currentUserIdRef = useRef("")
  const currentRoleRef = useRef<DualRoomMemberRole | null>(null)
  const soundEnabledRef = useRef(false)

  const [room, setRoom] = useState<DualRoom | null>(null)
  const [members, setMembers] = useState<DualRoomMember[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentRole, setCurrentRole] = useState<DualRoomMemberRole | null>(null)

  const [loading, setLoading] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)
  const [remoteCameraReady, setRemoteCameraReady] = useState(false)
  const [remoteReady, setRemoteReady] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new")
  const [iceState, setIceState] = useState<RTCIceConnectionState>("new")

  const [countdown, setCountdown] = useState<number | null>(null)
  const [captureMessage, setCaptureMessage] = useState("")
  const [capturingShot, setCapturingShot] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)

  const [hostPhotos, setHostPhotos] = useState<string[]>([])
  const [partnerPhotos, setPartnerPhotos] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isResultReady, setIsResultReady] = useState(false)

  const hostMember = members.find((member) => member.role === "host") ?? null
  const partnerMember =
    members.find((member) => member.role === "partner") ?? null
  const currentMember =
    members.find((member) => member.user_id === currentUserId) ?? null

  const isHost = currentRole === "host"
  const partnerOnline = !!partnerMember?.is_connected
  const liveConnected =
    remoteReady ||
    connectionState === "connected" ||
    iceState === "connected" ||
    iceState === "completed"

  const isViewSwapped = !!room?.is_view_swapped

  const hostName = hostMember?.display_name || "Host"
  const partnerName = partnerMember?.display_name || "Partner"

  const hostVideoRef = currentRole === "host" ? localVideoRef : remoteVideoRef
  const partnerVideoRef =
    currentRole === "partner" ? localVideoRef : remoteVideoRef

  const hostCameraReady = currentRole === "host" ? cameraReady : remoteReady
  const partnerCameraReady =
    currentRole === "partner" ? cameraReady : remoteReady

  const defaultSlots: DisplaySlot[] = [
    {
      key: "host",
      label: "Host",
      name: hostName,
      videoRef: hostVideoRef,
      isLocal: currentRole === "host",
      cameraReady: hostCameraReady,
      waiting: !hostMember?.is_connected,
    },
    {
      key: "partner",
      label: "Partner",
      name: partnerName,
      videoRef: partnerVideoRef,
      isLocal: currentRole === "partner",
      cameraReady: partnerCameraReady,
      waiting: !partnerOnline,
    },
  ]

  const displaySlots = isViewSwapped ? [...defaultSlots].reverse() : defaultSlots

  const nextPhotoLabel = useMemo(() => {
    if (!room) return "Start Photo 1"

    if (room.status === "countdown") return "Countdown in progress"
    if (room.status === "capturing") return "Capturing photo"
    if (isResultReady) return "Continue to Strip Design"

    if (hostPhotos.length === 0 && partnerPhotos.length === 0) {
      return "Start Photo 1"
    }

    if (room.current_shot === 1) return "Take Photo 2"
    if (room.current_shot === 2) return "Take Final Photo"

    return "Start Photo 1"
  }, [room, hostPhotos.length, partnerPhotos.length, isResultReady])

  const stageTitle = useMemo(() => {
    if (!room) return "Preparing your room"

    if (!partnerOnline) return "Waiting for partner"
    if (!cameraReady) return "Allow camera and mic"
    if (!liveConnected) return "Connecting cameras"

    if (isResultReady) return "Your photos are ready"

    if (room.current_shot === 1 && room.status !== "countdown") {
      return "Photo 1 saved"
    }

    if (room.current_shot === 2 && room.status !== "countdown") {
      return "Photo 2 saved"
    }

    if (room.current_shot === 1) return "Photo 1 of 3"
    if (room.current_shot === 2) return "Photo 2 of 3"
    if (room.current_shot === 3) return "Final photo"

    return "Ready to capture"
  }, [room, partnerOnline, cameraReady, liveConnected, isResultReady])

  const stageSubtitle = useMemo(() => {
    if (!partnerOnline) {
      return "Keep this room open. We’ll continue once your partner reconnects."
    }

    if (!cameraReady) {
      return "Allow camera and microphone so your side can be seen and heard."
    }

    if (!hasTurnServer && !liveConnected) {
      return "Still syncing. TURN credentials are missing, so different networks may fail to connect."
    }

    if (!liveConnected) {
      return "Stay here while both cameras connect. If it takes too long, tap reconnect on both devices."
    }

    if (!soundEnabled) {
      return "Video is connected. Tap Enable Sound so you can hear your partner."
    }

    if (isResultReady) {
      return "Choose your theme, filter, and caption in the strip editor."
    }

    if (room?.current_shot === 1 && room.status !== "countdown") {
      return "Nice shot. Change your pose before photo 2."
    }

    if (room?.current_shot === 2 && room.status !== "countdown") {
      return "One last pose. Make the final photo your favorite."
    }

    if (room?.current_shot === 1) {
      return "First pose. Smile, look at the camera, or make heart hands."
    }

    if (room?.current_shot === 2) {
      return "Second pose. Move closer or try something cute."
    }

    if (room?.current_shot === 3) {
      return "Final pose is otw. Make it sweet, funny, or romantic."
    }

    return "The host can start when both cameras are ready."
  }, [
    partnerOnline,
    cameraReady,
    liveConnected,
    soundEnabled,
    room?.status,
    room?.current_shot,
    isResultReady,
  ])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    currentRoleRef.current = currentRole
  }, [currentRole])

  useEffect(() => {
    soundEnabledRef.current = soundEnabled

    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !soundEnabled
      remoteVideoRef.current.volume = soundEnabled ? 1 : 0
      remoteVideoRef.current.play().catch(() => undefined)
    }
  }, [soundEnabled])

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
      currentUserIdRef.current = user.id

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
      const alreadyJoined = safeMembers.find(
        (member) => member.user_id === user.id
      )

      let role: DualRoomMemberRole

      if (alreadyJoined) {
        role = alreadyJoined.role as DualRoomMemberRole

        await supabase
          .from("dual_room_members")
          .update({ is_connected: true, is_ready: true })
          .eq("id", alreadyJoined.id)
      } else {
        const partnerExists = safeMembers.some(
          (member) => member.role === "partner"
        )

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
      currentRoleRef.current = role

      await fetchRoomState()
    } finally {
      setLoading(false)
    }
  }

  function attachLocalStream() {
    if (!localVideoRef.current || !localStreamRef.current) return

    if (localVideoRef.current.srcObject !== localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }

    localVideoRef.current.muted = true
    localVideoRef.current.volume = 0
    localVideoRef.current.play().catch(() => undefined)
  }

  function attachRemoteStream() {
    if (!remoteVideoRef.current || !remoteStreamRef.current) return

    if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current
    }

    remoteVideoRef.current.muted = !soundEnabledRef.current
    remoteVideoRef.current.volume = soundEnabledRef.current ? 1 : 0
    remoteVideoRef.current.play().catch(() => undefined)
  }

  async function startCamera() {
    try {
      setError("")

      if (localStreamRef.current) {
        attachLocalStream()
        setCameraReady(true)
        await broadcastCameraReady()
        maybeStartConnection()
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Your browser does not support camera and microphone access.")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      localStreamRef.current = stream
      attachLocalStream()

      setCameraReady(true)

      const peer = createPeer()
      addLocalTracks(peer)

      window.setTimeout(() => {
        broadcastCameraReady().catch(console.error)
        maybeStartConnection()
      }, 300)
    } catch (cameraError) {
      console.error("Camera/mic error:", cameraError)
      setCameraReady(false)
      setError(
        "Camera and microphone access are required. Please allow permission in your browser, then tap reconnect."
      )
    }
  }

  function addLocalTracks(peer: RTCPeerConnection) {
    const stream = localStreamRef.current
    if (!stream) return

    const existingTrackIds = new Set(
      peer
        .getSenders()
        .map((sender) => sender.track?.id)
        .filter(Boolean)
    )

    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.has(track.id)) {
        peer.addTrack(track, stream)
      }
    })
  }

  async function broadcastCameraReady() {
    if (!channelRef.current || !currentRoleRef.current) return

    await channelRef.current.send({
      type: "broadcast",
      event: "camera-ready",
      payload: {
        from: currentUserIdRef.current,
        role: currentRoleRef.current,
      } satisfies CameraReadyPayload,
    })
  }

  function createPeer() {
    if (peerRef.current) return peerRef.current

    const peer = new RTCPeerConnection(rtcConfig)

    remoteStreamRef.current = new MediaStream()
    attachRemoteStream()

    peer.ontrack = (event) => {
      const remoteStream = remoteStreamRef.current ?? new MediaStream()
      remoteStreamRef.current = remoteStream

      const incomingTracks =
        event.streams[0]?.getTracks().length > 0
          ? event.streams[0].getTracks()
          : [event.track]

      incomingTracks.forEach((track) => {
        const alreadyAdded = remoteStream
          .getTracks()
          .some((existingTrack) => existingTrack.id === track.id)

        if (!alreadyAdded) {
          remoteStream.addTrack(track)
        }

        if (track.kind === "video") {
          setRemoteReady(true)
          setError("")
        }

        track.onunmute = () => {
          if (track.kind === "video") {
            setRemoteReady(true)
          }
          attachRemoteStream()
        }

        track.onended = () => {
          if (track.kind === "video") {
            setRemoteReady(false)
          }
        }
      })

      attachRemoteStream()
    }

    peer.onicecandidate = async (event) => {
      if (!event.candidate || !channelRef.current || !currentRoleRef.current) {
        return
      }

      await channelRef.current.send({
        type: "broadcast",
        event: "webrtc-ice",
        payload: {
          from: currentUserIdRef.current,
          role: currentRoleRef.current,
          candidate: event.candidate.toJSON(),
        } satisfies SignalPayload,
      })
    }

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState)

      if (peer.connectionState === "connected") {
        setError("")
      }

      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "disconnected" ||
        peer.connectionState === "closed"
      ) {
        setRemoteReady(false)
      }

      if (peer.connectionState === "failed") {
        setError("Connection failed. Tap reconnect on both devices.")
      }
    }

    peer.oniceconnectionstatechange = () => {
      setIceState(peer.iceConnectionState)

      if (
        peer.iceConnectionState === "connected" ||
        peer.iceConnectionState === "completed"
      ) {
        setError("")
      }

      if (
        peer.iceConnectionState === "failed" ||
        peer.iceConnectionState === "disconnected"
      ) {
        setRemoteReady(false)
      }
    }

    peer.onicecandidateerror = (event) => {
      console.error("ICE candidate error:", event)
    }

    peer.onnegotiationneeded = () => {
      if (currentRoleRef.current === "host") {
        makeOffer().catch(console.error)
      }
    }

    peerRef.current = peer

    addLocalTracks(peer)

    return peer
  }

  async function makeOffer(force = false) {
    if (!channelRef.current || !currentRoleRef.current) return
    if (currentRoleRef.current !== "host") return
    if (!localStreamRef.current) return

    const now = Date.now()

    if (!force && now - lastOfferAtRef.current < 1200) return

    const peer = createPeer()
    addLocalTracks(peer)

    if (peer.signalingState !== "stable") return

    try {
      lastOfferAtRef.current = now
      makingOfferRef.current = true

      const offer = await peer.createOffer({
        iceRestart:
          force ||
          peer.iceConnectionState === "failed" ||
          peer.iceConnectionState === "disconnected",
      })

      await peer.setLocalDescription(offer)

      await channelRef.current.send({
        type: "broadcast",
        event: "webrtc-offer",
        payload: {
          from: currentUserIdRef.current,
          role: currentRoleRef.current,
          sdp: peer.localDescription ?? offer,
        } satisfies SignalPayload,
      })
    } catch (offerError) {
      console.error("Offer error:", offerError)
      setError("We could not start the live connection. Please tap reconnect.")
    } finally {
      makingOfferRef.current = false
    }
  }

  async function handleOffer(payload: SignalPayload) {
    if (payload.from === currentUserIdRef.current || !payload.sdp) return
    if (!localStreamRef.current || !currentRoleRef.current) return

    const peer = createPeer()
    addLocalTracks(peer)

    const isPolite = currentRoleRef.current === "partner"
    const offerCollision =
      payload.sdp.type === "offer" &&
      (makingOfferRef.current || peer.signalingState !== "stable")

    ignoreOfferRef.current = !isPolite && offerCollision

    if (ignoreOfferRef.current) return

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      await flushPendingCandidates()

      if (payload.sdp.type === "offer") {
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)

        await channelRef.current?.send({
          type: "broadcast",
          event: "webrtc-answer",
          payload: {
            from: currentUserIdRef.current,
            role: currentRoleRef.current,
            sdp: peer.localDescription ?? answer,
          } satisfies SignalPayload,
        })
      }
    } catch (offerError) {
      console.error("Handle offer error:", offerError)
      setError("Live connection failed. Please tap reconnect on both devices.")
    }
  }

  async function handleAnswer(payload: SignalPayload) {
    if (payload.from === currentUserIdRef.current || !payload.sdp) return

    const peer = peerRef.current
    if (!peer) return

    try {
      if (peer.signalingState !== "have-local-offer") return

      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      await flushPendingCandidates()
    } catch (answerError) {
      console.error("Handle answer error:", answerError)
      setError("Answer failed. Tap reconnect on both devices.")
    }
  }

  async function handleIce(payload: SignalPayload) {
    if (payload.from === currentUserIdRef.current || !payload.candidate) return

    const peer = peerRef.current

    if (!peer || !peer.remoteDescription) {
      pendingCandidatesRef.current.push(payload.candidate)
      return
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(payload.candidate))
    } catch (iceError) {
      if (!ignoreOfferRef.current) {
        console.error("ICE candidate error:", iceError)
      }
    }
  }

  async function flushPendingCandidates() {
    const peer = peerRef.current
    if (!peer || !peer.remoteDescription) return

    const candidates = [...pendingCandidatesRef.current]
    pendingCandidatesRef.current = []

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (iceError) {
        console.error("Pending ICE error:", iceError)
      }
    }
  }

  function maybeStartConnection() {
    if (!localStreamRef.current || !currentRoleRef.current) return

    const peer = createPeer()
    addLocalTracks(peer)

    if (currentRoleRef.current === "host") {
      makeOffer().catch(console.error)
    } else {
      broadcastCameraReady().catch(console.error)
    }
  }

  async function enableSound() {
    setSoundEnabled(true)
    soundEnabledRef.current = true

    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false
      remoteVideoRef.current.volume = 1

      try {
        await remoteVideoRef.current.play()
      } catch (playError) {
        console.error("Remote audio play error:", playError)
      }
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
    if (payload.from === currentUserIdRef.current) return
    storeCapturedPhoto(payload.role, payload.shot, payload.imageData)
  }

  function saveResultData(data: DualResultData) {
    sessionStorage.setItem(DUAL_RESULT_KEY, JSON.stringify(data))
    setIsResultReady(true)
    setCaptureMessage("All photos are ready. Continue to the strip editor.")
  }

  function handleResultReady(payload: ResultPayload) {
    if (payload.from === currentUserIdRef.current) return
    saveResultData(payload.data)
  }

  async function captureShot(shot: number) {
    if (!currentRoleRef.current || !channelRef.current) return

    setCapturingShot(shot)
    setCaptureMessage("Capturing your photo...")

    setFlash(true)
    window.setTimeout(() => {
      setFlash(false)
    }, 180)

    const imageData = captureLocalPhoto()

    if (!imageData) {
      setError("We could not capture your photo. Please keep your camera open.")
      setCapturingShot(null)
      return
    }

    storeCapturedPhoto(currentRoleRef.current, shot, imageData)

    await channelRef.current.send({
      type: "broadcast",
      event: "photo-captured",
      payload: {
        from: currentUserIdRef.current,
        role: currentRoleRef.current,
        shot,
        imageData,
      } satisfies PhotoPayload,
    })

    if (shot === 1) {
      setCaptureMessage("Photo 1 saved. Get ready for photo 2.")
    } else if (shot === 2) {
      setCaptureMessage("Photo 2 saved. One final pose left.")
    } else {
      setCaptureMessage("All photos captured. Continue to the strip editor.")
    }

    window.setTimeout(() => {
      setCapturingShot(null)
    }, 800)

    if (currentRoleRef.current === "host" && room) {
      window.setTimeout(async () => {
        if (shot < MAX_SHOTS) {
          await supabase
            .from("dual_rooms")
            .update({
              status: "ready",
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

    if (!cameraReady || !partnerOnline) {
      setError(
        "Both users must be inside the capture room before taking the next photo."
      )
      return
    }

    if (!liveConnected) {
      setError("Wait until both cameras are live before taking the photo.")
      return
    }

    const nextShot = room.current_shot >= 1 ? room.current_shot + 1 : 1

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
        countdown_starts_at: new Date().toISOString(),
      })
      .eq("id", room.id)

    if (updateError) {
      setError("We could not start the next photo. Please try again.")
    }
  }

  async function toggleSwapView() {
    if (!room) return

    const { error: updateError } = await supabase
      .from("dual_rooms")
      .update({
        is_view_swapped: !room.is_view_swapped,
      })
      .eq("id", room.id)

    if (updateError) {
      setError("We could not swap the view. Please try again.")
    }
  }

  function continueToStripDesign() {
    const saved = sessionStorage.getItem(DUAL_RESULT_KEY)

    if (saved) {
      window.location.href = "/booth/dual/result"
      return
    }

    if (hostPhotos.length < MAX_SHOTS || partnerPhotos.length < MAX_SHOTS) {
      setError("Still waiting for all photos. Please wait a moment.")
      return
    }

    const data: DualResultData = {
      roomCode,
      hostName,
      partnerName,
      hostPhotos: hostPhotos.slice(0, MAX_SHOTS),
      partnerPhotos: partnerPhotos.slice(0, MAX_SHOTS),
      createdAt: new Date().toISOString(),
    }

    saveResultData(data)
    window.location.href = "/booth/dual/result"
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

  async function reconnectCamera() {
    setError("")
    setRemoteReady(false)
    setRemoteCameraReady(false)
    setConnectionState("new")
    setIceState("new")
    pendingCandidatesRef.current = []
    makingOfferRef.current = false
    ignoreOfferRef.current = false
    lastOfferAtRef.current = 0

    peerRef.current?.close()
    peerRef.current = null
    remoteStreamRef.current = null

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    if (!localStreamRef.current) {
      await startCamera()
      return
    }

    attachLocalStream()
    setCameraReady(true)

    const peer = createPeer()
    addLocalTracks(peer)

    await broadcastCameraReady()
    maybeStartConnection()

    if (currentRoleRef.current === "host") {
      window.setTimeout(() => makeOffer(true).catch(console.error), 500)
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
    if (!currentRole || cameraAutoStartedRef.current) return

    cameraAutoStartedRef.current = true

    window.setTimeout(() => {
      startCamera().catch(console.error)
    }, 350)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole])

  useEffect(() => {
    if (!room?.id || !currentUserId || !currentRole) return

    const channel = supabase
      .channel(`dual-capture-${room.id}`)
      .on("broadcast", { event: "camera-ready" }, ({ payload }) => {
        const readyPayload = payload as CameraReadyPayload

        if (readyPayload?.from !== currentUserIdRef.current) {
          setRemoteCameraReady(true)
          maybeStartConnection()

          if (currentRoleRef.current === "host") {
            window.setTimeout(() => makeOffer().catch(console.error), 300)
          }
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
      .on("broadcast", { event: "result-ready" }, ({ payload }) => {
        handleResultReady(payload as ResultPayload)
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel

          window.setTimeout(() => {
            broadcastCameraReady().catch(console.error)
            maybeStartConnection()
          }, 500)
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, currentUserId, currentRole])

  useEffect(() => {
    if (!cameraReady || !partnerMember) return

    const interval = window.setInterval(() => {
      broadcastCameraReady().catch(console.error)

      if (!remoteReady) {
        maybeStartConnection()

        if (currentRoleRef.current === "host") {
          makeOffer().catch(console.error)
        }
      }
    }, 2500)

    return () => window.clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady, partnerMember?.id, remoteReady])

  useEffect(() => {
    if (!room || room.status !== "countdown") return
    if (!cameraReady || !currentRole) return

    const shot = room.current_shot
    if (!shot || scheduledShotRef.current === shot) return

    scheduledShotRef.current = shot

    setCountdown(3)

    const tickTwo = window.setTimeout(() => setCountdown(2), 1000)
    const tickOne = window.setTimeout(() => setCountdown(1), 2000)
    const tickCapture = window.setTimeout(() => setCountdown(0), 3000)

    const captureTimer = window.setTimeout(() => {
      captureShot(shot).catch(console.error)
    }, CAPTURE_DELAY_MS)

    return () => {
      window.clearTimeout(tickTwo)
      window.clearTimeout(tickOne)
      window.clearTimeout(tickCapture)
      window.clearTimeout(captureTimer)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, room?.current_shot, cameraReady, currentRole])

  useEffect(() => {
    const ready =
      hostPhotos.length >= MAX_SHOTS && partnerPhotos.length >= MAX_SHOTS

    if (!ready || isResultReady) return

    const data: DualResultData = {
      roomCode,
      hostName,
      partnerName,
      hostPhotos: hostPhotos.slice(0, MAX_SHOTS),
      partnerPhotos: partnerPhotos.slice(0, MAX_SHOTS),
      createdAt: new Date().toISOString(),
    }

    saveResultData(data)

    channelRef.current?.send({
      type: "broadcast",
      event: "result-ready",
      payload: {
        from: currentUserIdRef.current,
        data,
      } satisfies ResultPayload,
    })
  }, [
    hostPhotos,
    partnerPhotos,
    roomCode,
    hostName,
    partnerName,
    isResultReady,
  ])

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
        <header className="flex shrink-0 items-center justify-between gap-2 rounded-[1.25rem] border border-amoura-red-soft/20 bg-black/45 px-3 py-3 backdrop-blur-xl sm:px-4">
          <button
            onClick={leaveCapture}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amoura-muted transition hover:text-amoura-cream sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave
          </button>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amoura-red-soft sm:text-xs">
              Dual Capture
            </p>
            <p className="text-[10px] text-amoura-muted sm:text-xs">
              {room.room_code}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSwapView}
              className="rounded-full border border-amoura-red-soft/20 bg-black/30 px-3 py-2 text-[10px] font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45 sm:text-xs"
            >
              Swap
            </button>

            <button
              onClick={enableSound}
              className="inline-flex items-center gap-1.5 rounded-full border border-amoura-red-soft/20 bg-black/30 px-3 py-2 text-[10px] font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45 sm:text-xs"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              {soundEnabled ? "Sound On" : "Enable Sound"}
            </button>

            <button
              onClick={reconnectCamera}
              className="rounded-full border border-amoura-red-soft/20 bg-black/30 p-2 text-amoura-cream transition hover:border-amoura-red-soft/45"
              aria-label="Reconnect camera"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-amoura-red-soft/15 bg-black/30 px-3 py-2 text-xs text-amoura-muted sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${liveConnected ? "bg-emerald-400" : "bg-zinc-400"
                  }`}
              />
              {liveConnected ? "Live" : "Syncing"}
            </div>
          </div>
        </header>

        <section className="relative min-h-0 flex-1 overflow-hidden rounded-[1.6rem] border border-amoura-red-soft/20 bg-black shadow-[0_0_70px_rgba(194,31,58,0.16)]">
          <div className="absolute inset-0 grid grid-cols-2">
            {displaySlots.map((slot) => (
              <JoinedVideoStage
                key={slot.key}
                label={slot.label}
                name={slot.name}
                videoRef={slot.videoRef}
                isLocal={slot.isLocal}
                cameraReady={slot.cameraReady}
                waiting={slot.waiting}
                soundEnabled={soundEnabled}
                onStartCamera={slot.isLocal ? startCamera : undefined}
              />
            ))}
          </div>

          <CaptureCenterOverlay
            title={stageTitle}
            subtitle={stageSubtitle}
            countdown={countdown}
            message={captureMessage}
            shot={room.current_shot}
            capturingShot={capturingShot}
            error={error}
            isResultReady={isResultReady}
            connectionState={connectionState}
            iceState={iceState}
            hasTurnServer={hasTurnServer}
            remoteCameraReady={remoteCameraReady}
          />

          {flash ? (
            <div className="pointer-events-none absolute inset-0 z-30 bg-white/45" />
          ) : null}
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
            {isResultReady ? (
              <button
                onClick={continueToStripDesign}
                className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold"
              >
                <Check className="h-4 w-4" />
                Continue to Strip Design
              </button>
            ) : isHost ? (
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
                Waiting for host to take the next photo
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
  soundEnabled,
  onStartCamera,
}: {
  label: string
  name: string
  videoRef: RefObject<HTMLVideoElement | null>
  isLocal?: boolean
  cameraReady: boolean
  waiting?: boolean
  soundEnabled: boolean
  onStartCamera?: () => void
}) {
  return (
    <section className="relative h-full min-h-[420px] overflow-hidden border-r border-white/10 last:border-r-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || !soundEnabled}
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
                Waiting
              </p>
              <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-amoura-muted sm:max-w-xs sm:text-xs sm:leading-5">
                Waiting for this side to connect.
              </p>
            </>
          ) : (
            <>
              <VideoOff className="h-9 w-9 text-amoura-red-soft sm:h-12 sm:w-12" />
              <p className="mt-3 text-xs font-semibold text-amoura-cream sm:text-sm">
                Camera and mic needed
              </p>
              <p className="mt-1 max-w-[160px] text-[10px] leading-4 text-amoura-muted sm:max-w-xs sm:text-xs sm:leading-5">
                Allow camera and microphone to join the live capture.
              </p>

              {onStartCamera ? (
                <button
                  onClick={onStartCamera}
                  className="amoura-btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm"
                >
                  <Mic className="h-4 w-4" />
                  Allow Camera & Mic
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
  isResultReady,
  connectionState,
  iceState,
  hasTurnServer,
  remoteCameraReady,
}: {
  title: string
  subtitle: string
  countdown: number | null
  message: string
  shot: number
  capturingShot: number | null
  error: string
  isResultReady: boolean
  connectionState: RTCPeerConnectionState
  iceState: RTCIceConnectionState
  hasTurnServer: boolean
  remoteCameraReady: boolean
}) {
  const isCounting = countdown !== null

  return (
    <>
      {isCounting ? (
        <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 sm:top-6">
          <div className="flex items-center gap-3 rounded-full border border-amoura-red-soft/30 bg-black/45 px-5 py-3 text-amoura-cream shadow-[0_0_40px_rgba(194,31,58,0.25)] backdrop-blur-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amoura-red-soft">
              {shot ? `Photo ${shot}` : "Get ready"}
            </span>

            <span className="amoura-serif min-w-12 text-center text-3xl leading-none text-amoura-cream sm:text-4xl">
              {countdown > 0 ? countdown : "Capture"}
            </span>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-3 top-5 z-20 mx-auto max-w-md text-center sm:top-6">
          <div className="rounded-[1.25rem] border border-amoura-red-soft/15 bg-black/35 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/15 bg-amoura-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amoura-red-soft">
              <Sparkles className="h-3.5 w-3.5" />
              {isResultReady
                ? "Ready"
                : shot
                  ? `Photo ${shot} of 3`
                  : "Capture stage"}
            </div>

            <h1 className="amoura-serif text-xl leading-none text-amoura-cream sm:text-3xl">
              {title}
            </h1>

            <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-5 text-amoura-muted sm:text-sm sm:leading-6">
              {subtitle}
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-amoura-muted">
              <span className="rounded-full border border-white/10 bg-black/35 px-2 py-1">
                Peer: {connectionState}
              </span>
              <span className="rounded-full border border-white/10 bg-black/35 px-2 py-1">
                ICE: {iceState}
              </span>
              <span className="rounded-full border border-white/10 bg-black/35 px-2 py-1">
                Remote: {remoteCameraReady ? "ready" : "waiting"}
              </span>
              <span
                className={`rounded-full border px-2 py-1 ${hasTurnServer
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-400/20 bg-amber-500/10 text-amber-200"
                  }`}
              >
                TURN: {hasTurnServer ? "on" : "missing"}
              </span>
            </div>

            {capturingShot ? (
              <div className="mt-2 text-xs font-semibold text-amoura-cream sm:text-sm">
                Capturing photo {capturingShot}...
              </div>
            ) : null}

            {message ? (
              <div className="mt-2 rounded-full border border-amoura-red-soft/15 bg-black/35 px-4 py-2 text-[11px] text-amoura-cream sm:text-sm">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-2 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-semibold transition ${done
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