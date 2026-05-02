"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"

const MAX_SHOTS = 3
const STORAGE_KEY = "amoreframe_single_photos"

type CameraPermission = "checking" | "granted" | "prompt" | "denied" | "unsupported"

export default function SingleBoothClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isStartingRef = useRef(false)

  const [permission, setPermission] = useState<CameraPermission>("checking")
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)

  const isComplete = photos.length >= MAX_SHOTS
  const nextShotNumber = Math.min(photos.length + 1, MAX_SHOTS)

  useEffect(() => {
    checkCameraPermission()

    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkCameraPermission() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermission("unsupported")
        setCameraError("Your browser does not support camera access.")
        return
      }

      if (!navigator.permissions?.query) {
        setPermission("prompt")
        return
      }

      const status = await navigator.permissions.query({
        name: "camera" as PermissionName,
      })

      setPermission(status.state as CameraPermission)

      if (status.state === "granted") {
        await startCamera()
      }

      status.onchange = () => {
        const state = status.state as CameraPermission
        setPermission(state)

        if (state === "granted" && !streamRef.current) {
          startCamera()
        }

        if (state === "denied") {
          stopCamera()
          setIsCameraReady(false)
          setCameraError(
            "Camera access is blocked. Please allow camera access in your browser settings."
          )
        }
      }
    } catch {
      setPermission("prompt")
    }
  }

  async function requestCameraAccess() {
    await startCamera()
  }

  async function startCamera() {
    if (isStartingRef.current || streamRef.current) return

    try {
      isStartingRef.current = true
      setCameraError("")
      setIsStartingCamera(true)

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermission("unsupported")
        setCameraError("Your browser does not support camera access.")
        setIsCameraReady(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setPermission("granted")

      const video = videoRef.current
      if (!video) return

      video.srcObject = stream

      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) {
          resolve()
          return
        }

        video.onloadedmetadata = () => resolve()
      })

      try {
        await video.play()
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        throw error
      }

      setIsCameraReady(true)
    } catch (error) {
      console.error("Camera error:", error)

      setIsCameraReady(false)

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setPermission("denied")
          setCameraError(
            "Camera access was denied. Please allow camera permission in your browser settings."
          )
          return
        }

        if (error.name === "NotFoundError") {
          setCameraError("No camera was found on this device.")
          return
        }

        if (error.name === "NotReadableError") {
          setCameraError("Your camera is already being used by another app.")
          return
        }
      }

      setCameraError(
        "We could not open your camera. Please try again or refresh the page."
      )
    } finally {
      isStartingRef.current = false
      setIsStartingCamera(false)
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  async function startPhotoSet() {
    if (!isCameraReady || isCapturing || isComplete) return

    setIsCapturing(true)

    const remainingShots = MAX_SHOTS - photos.length

    for (let i = 0; i < remainingShots; i += 1) {
      await runCountdown()
      capturePhoto()
      await wait(650)
    }

    setCountdown(null)
    setIsCapturing(false)
  }

  function runCountdown() {
    return new Promise<void>((resolve) => {
      let value = 3
      setCountdown(value)

      const interval = window.setInterval(() => {
        value -= 1

        if (value <= 0) {
          window.clearInterval(interval)
          setCountdown(null)
          resolve()
          return
        }

        setCountdown(value)
      }, 800)
    })
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    if (!videoWidth || !videoHeight) return

    const targetWidth = 720
    const targetHeight = Math.round((videoHeight / videoWidth) * targetWidth)

    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext("2d")
    if (!context) return

    context.save()
    context.translate(targetWidth, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, targetWidth, targetHeight)
    context.restore()

    const image = canvas.toDataURL("image/jpeg", 0.82)

    setPhotos((current) => {
      if (current.length >= MAX_SHOTS) return current
      return [...current, image]
    })
  }

  function retakeAll() {
    setPhotos([])
    setCountdown(null)
    setIsCapturing(false)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  function removeShot(indexToRemove: number) {
    setPhotos((current) => current.filter((_, index) => index !== indexToRemove))
  }

  function continueToPreview() {
    if (photos.length !== MAX_SHOTS) return

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
      window.location.href = "/booth/result"
    } catch (error) {
      console.error("Could not save photos for preview:", error)

      alert(
        "Your photos are still too large to prepare the preview. Please retake the photos and try again."
      )

      retakeAll()
    }
  }

  return (
    <main className="amoura-page min-h-screen overflow-hidden">
      <section className="relative min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-[-18%] top-[-12%] h-[420px] w-[420px] rounded-full bg-amoura-red/25 blur-[130px]" />
        <div className="pointer-events-none absolute left-[-18%] bottom-[-12%] h-[320px] w-[320px] rounded-full bg-amoura-red-deep/20 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-5">
          <header className="flex items-center justify-between rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="text-right">
              <p className="amoura-serif text-2xl leading-none text-amoura-red-soft">
                Single Mode
              </p>
              <p className="text-xs text-amoura-muted">
                {photos.length}/{MAX_SHOTS} shots captured
              </p>
            </div>
          </header>

          <section className="grid flex-1 gap-5 lg:grid-cols-[1fr_0.42fr]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-3 shadow-[0_0_70px_rgba(194,31,58,0.14)] backdrop-blur-xl sm:p-4">
              <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-black lg:min-h-[calc(100vh-9rem)]">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`h-full min-h-[460px] w-full scale-x-[-1] object-cover lg:min-h-[calc(100vh-9rem)] ${
                    isCameraReady ? "opacity-100" : "opacity-20"
                  }`}
                />

                {(permission === "checking" || isStartingCamera) && (
                  <CameraLoadingState />
                )}

                {(permission === "prompt" || permission === "unsupported") &&
                  !isStartingCamera &&
                  !isCameraReady && (
                    <CameraPermissionState
                      title={
                        permission === "unsupported"
                          ? "Camera not supported"
                          : "Allow camera access"
                      }
                      text={
                        permission === "unsupported"
                          ? cameraError
                          : "AmoreFrame needs your camera to capture your photobooth shots. Click below and allow camera permission in your browser."
                      }
                      buttonText="Allow Camera"
                      onClick={requestCameraAccess}
                      disabled={permission === "unsupported"}
                    />
                  )}

                {permission === "denied" && !isStartingCamera && (
                  <CameraPermissionState
                    title="Camera access blocked"
                    text={
                      cameraError ||
                      "Camera permission is blocked. Open your browser site settings and allow camera access for AmoreFrame."
                    }
                    buttonText="Try Again"
                    onClick={requestCameraAccess}
                  />
                )}

                {cameraError &&
                  permission !== "prompt" &&
                  permission !== "denied" &&
                  permission !== "unsupported" &&
                  !isStartingCamera &&
                  !isCameraReady && (
                    <CameraPermissionState
                      title="Camera error"
                      text={cameraError}
                      buttonText="Try Again"
                      onClick={requestCameraAccess}
                    />
                  )}

                {isCameraReady && (
                  <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold text-amoura-muted backdrop-blur-md">
                    Shot {nextShotNumber} of {MAX_SHOTS}
                  </div>
                )}

                {isCameraReady && !isComplete && !isCapturing && (
                  <div className="absolute bottom-4 left-1/2 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-amoura-red-soft/20 bg-black/65 p-4 text-center backdrop-blur-md">
                    <p className="text-sm font-semibold text-amoura-cream">
                      Ready when you are.
                    </p>
                    <p className="mt-1 text-xs text-amoura-muted">
                      Press start and AmoreFrame will capture your photo set automatically.
                    </p>
                  </div>
                )}

                {countdown !== null && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border border-amoura-red-soft/40 bg-black/70 text-7xl font-bold text-amoura-cream shadow-[0_0_70px_rgba(194,31,58,0.38)]">
                      {countdown}
                    </div>
                  </div>
                )}

                {isComplete && (
                  <div className="absolute inset-x-4 bottom-4 z-20 rounded-3xl border border-amoura-red-soft/25 bg-black/75 p-4 text-center backdrop-blur-md">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/10">
                      <Check className="h-6 w-6 text-amoura-red-soft" />
                    </div>

                    <p className="font-semibold text-amoura-cream">
                      Photo set complete
                    </p>
                    <p className="mt-1 text-sm text-amoura-muted">
                      Continue to choose your strip design.
                    </p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>

            <aside className="grid gap-5 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
              <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
                  <Sparkles className="h-4 w-4" />
                  Guided capture
                </div>

                <h1 className="amoura-serif text-4xl leading-tight text-amoura-cream">
                  Capture your strip photos.
                </h1>

                <p className="mt-3 text-sm leading-6 text-amoura-muted">
                  Take {MAX_SHOTS} photos first. After that, you can choose the
                  final photostrip design.
                </p>

                <div className="mt-5 grid gap-3 rounded-2xl border border-amoura-red-soft/15 bg-black/25 p-4 text-sm text-amoura-muted">
                  <InfoLine text="Allow camera access once." />
                  <InfoLine text="Next time, your browser can open it directly." />
                  <InfoLine text="Choose your strip design after capture." />
                </div>

                <div className="mt-6 grid gap-3">
                  {!isComplete ? (
                    <button
                      onClick={startPhotoSet}
                      disabled={!isCameraReady || isCapturing}
                      className="amoura-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Capturing...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Start Countdown
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={continueToPreview}
                      className="amoura-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold"
                    >
                      Continue to Strip Design
                    </button>
                  )}

                  {photos.length > 0 && (
                    <button
                      onClick={retakeAll}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-6 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Retake all
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-amoura-cream">
                    Captured shots
                  </h2>

                  <p className="rounded-full border border-amoura-red-soft/15 bg-black/25 px-3 py-1 text-xs text-amoura-muted">
                    {photos.length}/{MAX_SHOTS}
                  </p>
                </div>

                {photos.length === 0 ? (
                  <EmptyShots />
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-white/5 bg-black/30"
                      >
                        <div className="relative">
                          <img
                            src={photo}
                            alt={`Shot ${index + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                          />

                          {!isCapturing && (
                            <button
                              type="button"
                              onClick={() => removeShot(index)}
                              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-amoura-muted opacity-0 transition hover:text-white group-hover:opacity-100"
                              aria-label={`Remove shot ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-amoura-muted">
                          Shot {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-amoura-red-soft" />
                  <div>
                    <p className="font-semibold text-amoura-cream">
                      Your photos stay private
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amoura-muted">
                      These shots are only stored temporarily in this browser
                      until you continue to the strip design page.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  )
}

function CameraLoadingState() {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-6 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-amoura-red-soft" />
      <p className="font-semibold text-amoura-cream">Checking camera...</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-amoura-muted">
        We are checking if you already allowed camera access.
      </p>
    </div>
  )
}

function CameraPermissionState({
  title,
  text,
  buttonText,
  onClick,
  disabled = false,
}: {
  title: string
  text: string
  buttonText: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-amoura-red-soft/25 bg-amoura-red/10">
        <Camera className="h-8 w-8 text-amoura-red-soft" />
      </div>

      <h1 className="amoura-serif text-4xl text-amoura-cream">{title}</h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-amoura-muted">
        {text}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onClick}
          disabled={disabled}
          className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-amoura-red-soft/20 bg-black/35 px-6 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

function InfoLine({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-3">
      <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" />
      <span>{text}</span>
    </p>
  )
}

function EmptyShots() {
  return (
    <div className="mt-5 rounded-2xl border border-white/5 bg-black/25 p-6 text-center">
      <Camera className="mx-auto mb-3 h-8 w-8 text-amoura-red-soft" />
      <p className="text-sm leading-6 text-amoura-muted">
        Your shots will appear here after the countdown starts.
      </p>
    </div>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}