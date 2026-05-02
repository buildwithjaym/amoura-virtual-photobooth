"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  MessageCircleHeart,
  RefreshCcw,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"

type StripDesign = {
  id: string
  name: string
  tagline: string
  brand: string
  accent: string
  background: string
  photoBorder: string
  textColor: string
  mutedTextColor: string
  previewDot: string
  canvas: {
    background: string
    border: string
    photoBorder: string
    text: string
    mutedText: string
    accent: string
    decoration: "hearts" | "stars" | "film" | "minimal" | "flowers"
  }
}

type FilterOption = {
  id: string
  name: string
  tagline: string
  cssFilter: string
  canvasFilter: string
}

const STORAGE_KEY = "amoreframe_single_photos"
const MAX_CAPTION = 50

const STRIP_WIDTH = 900
const PHOTO_WIDTH = 760
const PHOTO_HEIGHT = 540
const TOP_PADDING = 90
const GAP = 30
const BOTTOM_PADDING = 185
const STRIP_HEIGHT =
  TOP_PADDING + PHOTO_HEIGHT * 4 + GAP * 3 + BOTTOM_PADDING

const STRIP_DESIGNS: StripDesign[] = [
  {
    id: "amore-blush",
    name: "Soft Romance",
    tagline: "Soft pink, sweet, and dreamy.",
    brand: "AmoreFrame",
    accent: "♥",
    background:
      "bg-[radial-gradient(circle_at_top,#ffe4ec_0%,#fff7f9_38%,#ffd6e0_100%)] border-pink-200",
    photoBorder: "border-white shadow-[0_12px_30px_rgba(190,24,93,0.18)]",
    textColor: "text-rose-800",
    mutedTextColor: "text-rose-600",
    previewDot: "bg-pink-200",
    canvas: {
      background: "#fff1f5",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#9f1239",
      mutedText: "#be185d",
      accent: "#e11d48",
      decoration: "hearts",
    },
  },
  {
    id: "classic-white",
    name: "Pure White",
    tagline: "Clean, timeless, and elegant.",
    brand: "AmoreFrame",
    accent: "♡",
    background: "bg-[#fbfaf8] border-neutral-300",
    photoBorder: "border-neutral-200 shadow-[0_10px_25px_rgba(0,0,0,0.12)]",
    textColor: "text-neutral-900",
    mutedTextColor: "text-neutral-500",
    previewDot: "bg-neutral-200",
    canvas: {
      background: "#fbfaf8",
      border: "#d4d4d4",
      photoBorder: "#e5e5e5",
      text: "#171717",
      mutedText: "#737373",
      accent: "#111111",
      decoration: "minimal",
    },
  },
  {
    id: "noir-romance",
    name: "Noir Date",
    tagline: "Dark, cinematic, and intimate.",
    brand: "AmoreFrame",
    accent: "♥",
    background:
      "bg-[radial-gradient(circle_at_top,#3b0a13_0%,#141014_42%,#050505_100%)] border-rose-900/50",
    photoBorder: "border-rose-300/25 shadow-[0_15px_40px_rgba(0,0,0,0.45)]",
    textColor: "text-rose-100",
    mutedTextColor: "text-rose-300",
    previewDot: "bg-rose-500",
    canvas: {
      background: "#09090b",
      border: "#7f1d1d",
      photoBorder: "#881337",
      text: "#ffe4e6",
      mutedText: "#fda4af",
      accent: "#e11d48",
      decoration: "stars",
    },
  },
  {
    id: "vintage-film",
    name: "Vintage Film",
    tagline: "Warm nostalgic tones and grainy charm.",
    brand: "AmoreFrame",
    accent: "✦",
    background:
      "bg-[linear-gradient(to_bottom,#ead7b7,#d6b98f,#ead7b7)] border-amber-900/25",
    photoBorder: "border-amber-950/20 shadow-[0_12px_30px_rgba(92,52,18,0.22)]",
    textColor: "text-amber-950",
    mutedTextColor: "text-amber-900",
    previewDot: "bg-amber-300",
    canvas: {
      background: "#dfc39a",
      border: "#92400e",
      photoBorder: "#78350f",
      text: "#451a03",
      mutedText: "#78350f",
      accent: "#92400e",
      decoration: "film",
    },
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    tagline: "Bold black, luxe mood, and date-night glow.",
    brand: "AmoreFrame",
    accent: "✦",
    background:
      "bg-[radial-gradient(circle_at_top,#3b2f18_0%,#111015_42%,#050505_100%)] border-amber-500/30",
    photoBorder: "border-amber-300/25 shadow-[0_15px_40px_rgba(0,0,0,0.45)]",
    textColor: "text-amber-100",
    mutedTextColor: "text-amber-300",
    previewDot: "bg-amber-400",
    canvas: {
      background: "#09090b",
      border: "#b45309",
      photoBorder: "#fbbf24",
      text: "#fef3c7",
      mutedText: "#fcd34d",
      accent: "#f59e0b",
      decoration: "stars",
    },
  },
  {
    id: "barkada-pop",
    name: "Barkada Fun",
    tagline: "Bright, playful, and memory-filled.",
    brand: "AmoreFrame",
    accent: "✿",
    background:
      "bg-[radial-gradient(circle_at_top,#fff7ad_0%,#fffdf0_35%,#ffd6a5_100%)] border-orange-200",
    photoBorder: "border-white shadow-[0_12px_30px_rgba(234,88,12,0.16)]",
    textColor: "text-orange-950",
    mutedTextColor: "text-orange-700",
    previewDot: "bg-orange-300",
    canvas: {
      background: "#fff7d6",
      border: "#fdba74",
      photoBorder: "#ffffff",
      text: "#431407",
      mutedText: "#c2410c",
      accent: "#f97316",
      decoration: "flowers",
    },
  },
]

const FILTERS: FilterOption[] = [
  {
    id: "none",
    name: "Original",
    tagline: "Natural look",
    cssFilter: "none",
    canvasFilter: "none",
  },
  {
    id: "warm",
    name: "Warm Glow",
    tagline: "Soft and cozy",
    cssFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
    canvasFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
  },
  {
    id: "dreamy",
    name: "Dreamy Pink",
    tagline: "Romantic tint",
    cssFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
    canvasFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
  },
  {
    id: "bw",
    name: "B&W Film",
    tagline: "Classic mono",
    cssFilter: "grayscale(100%) contrast(108%) brightness(102%)",
    canvasFilter: "grayscale(100%) contrast(108%) brightness(102%)",
  },
  {
    id: "cool",
    name: "Cool Breeze",
    tagline: "Fresh and airy",
    cssFilter: "saturate(106%) brightness(103%) hue-rotate(10deg)",
    canvasFilter: "saturate(106%) brightness(103%) hue-rotate(10deg)",
  },
]

export default function ResultClient() {
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedDesign, setSelectedDesign] = useState<StripDesign>(
    STRIP_DESIGNS[2]
  )
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTERS[0])
  const [caption, setCaption] = useState("")
  const [draftCaption, setDraftCaption] = useState("")
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      window.location.href = "/booth/single"
      return
    }

    try {
      const parsed = JSON.parse(raw)

      if (!Array.isArray(parsed) || parsed.length === 0) {
        window.location.href = "/booth/single"
        return
      }

      setPhotos(parsed.slice(0, 4))
    } catch {
      window.location.href = "/booth/single"
      return
    } finally {
      setLoading(false)
    }
  }, [])

  const previewPhotos = useMemo(() => photos.slice(0, 4), [photos])

  function retakePhotos() {
    sessionStorage.removeItem(STORAGE_KEY)
    window.location.href = "/booth/single"
  }

  function openCaptionModal() {
    setDraftCaption(caption)
    setIsCaptionModalOpen(true)
  }

  function saveCaption() {
    setCaption(draftCaption.trim().slice(0, MAX_CAPTION))
    setIsCaptionModalOpen(false)
  }

  async function downloadStrip() {
    if (previewPhotos.length === 0 || isDownloading) return

    try {
      setIsDownloading(true)

      const canvas = document.createElement("canvas")
      canvas.width = STRIP_WIDTH
      canvas.height = STRIP_HEIGHT

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      await drawStrip({
        ctx,
        photos: previewPhotos,
        design: selectedDesign,
        filter: selectedFilter,
        caption,
      })

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `amoreframe-${selectedDesign.id}-${selectedFilter.id}-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error("Download strip error:", error)
      alert("We could not download your strip. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amoura-red-soft" />
          <p className="mt-4 text-amoura-muted">
            Preparing your strip preview...
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="amoura-page min-h-screen overflow-x-hidden">
        <section className="relative min-h-screen px-4 py-4 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute right-[-10%] top-[-8%] h-[280px] w-[280px] rounded-full bg-amoura-red/20 blur-[110px]" />
          <div className="pointer-events-none absolute left-[-12%] bottom-[-8%] h-[240px] w-[240px] rounded-full bg-amoura-red-deep/20 blur-[100px]" />

          <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
            <header className="shrink-0 rounded-[1.35rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>

                <div className="text-right">
                  <p className="amoura-serif text-xl leading-none text-amoura-red-soft sm:text-2xl">
                    Strip Editor
                  </p>
                  <p className="text-xs text-amoura-muted">
                    Customize and download
                  </p>
                </div>
              </div>
            </header>

            <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(260px,0.72fr)_minmax(360px,1fr)] xl:grid-cols-[minmax(300px,0.7fr)_minmax(420px,1fr)]">
              <section className="order-1 flex min-h-[360px] items-center justify-center rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-3 backdrop-blur-xl sm:min-h-[420px] sm:p-5 lg:order-1 lg:min-h-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden">
                  <PhotostripPreview
                    photos={previewPhotos}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={caption}
                  />
                </div>
              </section>

              <aside className="order-2 flex min-h-0 flex-col rounded-[1.6rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 sm:p-5 lg:order-2 lg:max-h-[calc(100vh-6.25rem)]">
                <div className="shrink-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
                    <Sparkles className="h-4 w-4" />
                    Customize Your Strip
                  </div>

                  <h1 className="amoura-serif mt-4 text-3xl leading-tight text-amoura-cream sm:text-4xl">
                    Every vibe. Every moment.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-amoura-muted">
                    Choose your booth theme, apply a cute filter, add a short
                    caption, then download your final photostrip.
                  </p>
                </div>

                <div className="mt-5 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amoura-muted">
                        Booth Themes
                      </h2>
                      <span className="text-xs text-amoura-muted">
                        {STRIP_DESIGNS.length} styles
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {STRIP_DESIGNS.map((design) => {
                        const active = selectedDesign.id === design.id

                        return (
                          <button
                            key={design.id}
                            onClick={() => setSelectedDesign(design)}
                            className={`group rounded-[1.2rem] border p-3 text-left transition ${
                              active
                                ? "border-amoura-red-soft bg-amoura-red/10 shadow-[0_0_30px_rgba(194,31,58,0.14)]"
                                : "border-amoura-red-soft/15 bg-black/25 hover:border-amoura-red-soft/40"
                            }`}
                          >
                            <div
                              className={`mb-3 flex h-24 flex-col items-center justify-between rounded-[0.95rem] border p-2 ${design.background}`}
                            >
                              <div className="text-[8px] font-semibold opacity-80">
                                {design.brand}
                              </div>

                              <div className="grid w-full gap-1">
                                <div className="h-3 rounded-md bg-black/30" />
                                <div className="h-3 rounded-md bg-black/20" />
                                <div className="h-3 rounded-md bg-black/25" />
                              </div>

                              <div className="text-[8px] opacity-70">
                                {design.accent}
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-amoura-cream">
                                  {design.name}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-4 text-amoura-muted">
                                  {design.tagline}
                                </p>
                              </div>

                              {active && (
                                <div className="shrink-0 rounded-full border border-amoura-red-soft/30 bg-amoura-red/10 p-1 text-amoura-red-soft">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-amoura-red-soft" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amoura-muted">
                        Cute Filters
                      </h2>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      {FILTERS.map((filter) => {
                        const active = selectedFilter.id === filter.id

                        return (
                          <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-amoura-red-soft bg-amoura-red/10"
                                : "border-amoura-red-soft/15 bg-black/25 hover:border-amoura-red-soft/35"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-amoura-cream">
                                  {filter.name}
                                </p>
                                <p className="truncate text-xs text-amoura-muted">
                                  {filter.tagline}
                                </p>
                              </div>

                              {active && (
                                <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <MessageCircleHeart className="h-4 w-4 text-amoura-red-soft" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amoura-muted">
                        Caption
                      </h2>
                    </div>

                    <div className="rounded-[1.25rem] border border-amoura-red-soft/15 bg-black/25 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amoura-cream">
                            {caption || "No caption added yet."}
                          </p>
                          <p className="mt-1 text-xs text-amoura-muted">
                            Maximum {MAX_CAPTION} characters.
                          </p>
                        </div>

                        <button
                          onClick={openCaptionModal}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                        >
                          <MessageCircleHeart className="h-4 w-4" />
                          {caption ? "Edit" : "Add Caption"}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="mt-5 grid shrink-0 gap-3 border-t border-white/5 pt-5 sm:grid-cols-2">
                  <button
                    onClick={downloadStrip}
                    disabled={isDownloading}
                    className="amoura-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Strip
                      </>
                    )}
                  </button>

                  <button
                    onClick={retakePhotos}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-6 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Retake
                  </button>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </main>

      {isCaptionModalOpen ? (
        <CaptionModal
          value={draftCaption}
          onChange={setDraftCaption}
          onClose={() => setIsCaptionModalOpen(false)}
          onSave={saveCaption}
        />
      ) : null}
    </>
  )
}

function PhotostripPreview({
  photos,
  design,
  filter,
  caption,
}: {
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative w-[min(42vw,32vh,260px)] overflow-hidden rounded-[1.35rem] border p-2 shadow-2xl sm:w-[min(36vw,42vh,300px)] sm:rounded-[1.6rem] sm:p-3 lg:w-[min(28vw,72vh,330px)] xl:w-[min(24vw,74vh,340px)] ${design.background}`}
      >
        <PreviewDecorations design={design} />

        <div className={`relative z-10 mb-2 text-center sm:mb-3 ${design.textColor}`}>
          <p className="text-base font-bold tracking-wide sm:text-xl">
            {design.brand}
          </p>
          <p
            className={`mt-0.5 text-[0.52rem] uppercase tracking-[0.18em] sm:text-[0.62rem] ${design.mutedTextColor}`}
          >
            {design.name}
          </p>
        </div>

        <div className="relative z-10 grid gap-1.5 sm:gap-2">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className={`overflow-hidden rounded-lg border-[3px] bg-black/10 sm:rounded-xl sm:border-[4px] ${design.photoBorder}`}
            >
              <img
                src={photo}
                alt={`Captured shot ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
                style={{ filter: filter.cssFilter }}
              />
            </div>
          ))}
        </div>

        {caption ? (
          <div className="relative z-10 mt-2 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-center sm:mt-3 sm:px-3 sm:py-2">
            <p className={`text-[0.62rem] sm:text-xs ${design.textColor}`}>
              {caption}
            </p>
          </div>
        ) : null}

        <div className={`relative z-10 mt-2 text-center sm:mt-3 ${design.textColor}`}>
          <p className="text-xl leading-none sm:text-2xl">{design.accent}</p>
          <p
            className={`mt-1 text-[0.5rem] uppercase tracking-[0.18em] sm:text-[0.58rem] ${design.mutedTextColor}`}
          >
            Captured with love
          </p>
        </div>
      </div>
    </div>
  )
}

function PreviewDecorations({ design }: { design: StripDesign }) {
  if (design.canvas.decoration === "minimal") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[1.5rem] border border-black/10" />
      </div>
    )
  }

  if (design.canvas.decoration === "film") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-1.5 top-0 h-full w-3 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_7px,transparent_7px,transparent_16px)] sm:left-2 sm:w-4" />
        <div className="absolute right-1.5 top-0 h-full w-3 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_7px,transparent_7px,transparent_16px)] sm:right-2 sm:w-4" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <span className="absolute left-3 top-3 text-sm sm:text-lg">
        {design.canvas.decoration === "flowers" ? "🌸" : design.accent}
      </span>
      <span className="absolute right-3 top-3 text-sm sm:text-lg">
        {design.canvas.decoration === "flowers" ? "🌼" : design.accent}
      </span>
      <span className="absolute bottom-3 left-3 text-sm sm:text-lg">
        {design.canvas.decoration === "flowers" ? "🌷" : "✦"}
      </span>
      <span className="absolute bottom-3 right-3 text-sm sm:text-lg">
        {design.canvas.decoration === "flowers" ? "🌸" : "♥"}
      </span>
    </div>
  )
}

function CaptionModal({
  value,
  onChange,
  onClose,
  onSave,
}: {
  value: string
  onChange: (value: string) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3 pt-10 backdrop-blur-md sm:items-center sm:p-4">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.6rem] border border-amoura-red-soft/20 bg-[#0b0608] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
              Add Caption
            </p>
            <h3 className="amoura-serif mt-2 text-3xl text-amoura-cream">
              Make it personal
            </h3>
            <p className="mt-2 text-sm leading-6 text-amoura-muted">
              Write a short caption for your strip. Maximum of 50 characters.
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 p-2 text-amoura-muted transition hover:text-amoura-cream"
            aria-label="Close caption modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <textarea
            value={value}
            onChange={(event) =>
              onChange(event.target.value.slice(0, MAX_CAPTION))
            }
            maxLength={MAX_CAPTION}
            rows={4}
            placeholder="For example: Our favorite memory ♥"
            className="w-full resize-none rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-3 text-sm text-amoura-cream outline-none transition placeholder:text-amoura-muted focus:border-amoura-red-soft/45"
          />
          <div className="mt-2 text-right text-xs text-amoura-muted">
            {value.length}/{MAX_CAPTION}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onClose}
            className="rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="amoura-btn-primary rounded-full px-5 py-3 text-sm font-semibold"
          >
            Save Caption
          </button>
        </div>
      </div>
    </div>
  )
}

async function drawStrip({
  ctx,
  photos,
  design,
  filter,
  caption,
}: {
  ctx: CanvasRenderingContext2D
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
}) {
  drawRoundedRect(
    ctx,
    0,
    0,
    STRIP_WIDTH,
    STRIP_HEIGHT,
    64,
    design.canvas.background
  )

  drawBorder(
    ctx,
    24,
    24,
    STRIP_WIDTH - 48,
    STRIP_HEIGHT - 48,
    46,
    design.canvas.border,
    8
  )

  drawCanvasDecorations(ctx, design)

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 54px Georgia, serif"
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 68)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 102)

  let y = TOP_PADDING

  for (let index = 0; index < photos.length; index += 1) {
    const image = await loadImage(photos[index])
    const x = (STRIP_WIDTH - PHOTO_WIDTH) / 2

    drawPhotoFrame(ctx, x, y, PHOTO_WIDTH, PHOTO_HEIGHT, design)
    drawImageCover(
      ctx,
      image,
      x + 14,
      y + 14,
      PHOTO_WIDTH - 28,
      PHOTO_HEIGHT - 28,
      filter.canvasFilter
    )

    y += PHOTO_HEIGHT + GAP
  }

  if (caption) {
    const captionBoxX = 120
    const captionBoxY = STRIP_HEIGHT - 130
    const captionBoxWidth = STRIP_WIDTH - 240
    const captionBoxHeight = 52

    ctx.save()
    ctx.globalAlpha = 0.2
    drawRoundedRect(
      ctx,
      captionBoxX,
      captionBoxY,
      captionBoxWidth,
      captionBoxHeight,
      26,
      "#000000"
    )
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = design.canvas.border
    ctx.lineWidth = 2
    roundedPath(
      ctx,
      captionBoxX,
      captionBoxY,
      captionBoxWidth,
      captionBoxHeight,
      26
    )
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = design.canvas.text
    ctx.font = "500 24px Arial, sans-serif"
    ctx.fillText(caption, STRIP_WIDTH / 2, STRIP_HEIGHT - 96)
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 42px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 42)
}

function drawCanvasDecorations(
  ctx: CanvasRenderingContext2D,
  design: StripDesign
) {
  const decoration = design.canvas.decoration

  ctx.save()
  ctx.fillStyle = design.canvas.accent
  ctx.strokeStyle = design.canvas.accent
  ctx.globalAlpha = 0.45

  if (decoration === "hearts") {
    drawHeart(ctx, 70, 70, 18)
    drawHeart(ctx, STRIP_WIDTH - 70, 70, 18)
    drawHeart(ctx, 70, STRIP_HEIGHT - 70, 18)
    drawHeart(ctx, STRIP_WIDTH - 70, STRIP_HEIGHT - 70, 18)
  }

  if (decoration === "stars") {
    drawStar(ctx, 70, 70, 24)
    drawStar(ctx, STRIP_WIDTH - 70, 70, 24)
    drawStar(ctx, 70, STRIP_HEIGHT - 70, 24)
    drawStar(ctx, STRIP_WIDTH - 70, STRIP_HEIGHT - 70, 24)
  }

  if (decoration === "film") {
    ctx.globalAlpha = 0.3

    for (let y = 44; y < STRIP_HEIGHT - 44; y += 44) {
      drawRoundedRect(ctx, 34, y, 24, 20, 5, design.canvas.text)
      drawRoundedRect(
        ctx,
        STRIP_WIDTH - 58,
        y,
        24,
        20,
        5,
        design.canvas.text
      )
    }
  }

  if (decoration === "flowers") {
    ctx.globalAlpha = 0.9
    ctx.font = "32px Arial"
    ctx.fillText("🌸", 70, 78)
    ctx.fillText("🌼", STRIP_WIDTH - 70, 78)
    ctx.fillText("🌷", 70, STRIP_HEIGHT - 64)
    ctx.fillText("🌸", STRIP_WIDTH - 70, STRIP_HEIGHT - 64)
  }

  if (decoration === "minimal") {
    ctx.globalAlpha = 0.16
    ctx.strokeStyle = design.canvas.text
    ctx.lineWidth = 2
    drawRoundedBorder(ctx, 44, 44, STRIP_WIDTH - 88, STRIP_HEIGHT - 88, 36)
  }

  ctx.restore()
}

function drawPhotoFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  design: StripDesign
) {
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.25)"
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  drawRoundedRect(ctx, x, y, width, height, 28, design.canvas.photoBorder)
  ctx.restore()
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  filter: string
) {
  const imageRatio = image.width / image.height
  const boxRatio = width / height

  let sourceWidth = image.width
  let sourceHeight = image.height
  let sourceX = 0
  let sourceY = 0

  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / boxRatio
    sourceY = (image.height - sourceHeight) / 2
  }

  ctx.save()
  roundedClip(ctx, x, y, width, height, 18)
  ctx.filter = filter
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  )
  ctx.restore()
  ctx.filter = "none"
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string
) {
  roundedPath(ctx, x, y, width, height, radius)
  ctx.fillStyle = fill
  ctx.fill()
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth: number
) {
  ctx.save()
  roundedPath(ctx, x, y, width, height, radius)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
}

function drawRoundedBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  roundedPath(ctx, x, y, width, height, radius)
  ctx.stroke()
}

function roundedClip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  roundedPath(ctx, x, y, width, height, radius)
  ctx.clip()
}

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x, y + size / 3)
  ctx.bezierCurveTo(
    x - size,
    y - size / 2,
    x - size * 1.5,
    y + size / 2,
    x,
    y + size * 1.4
  )
  ctx.bezierCurveTo(
    x + size * 1.5,
    y + size / 2,
    x + size,
    y - size / 2,
    x,
    y + size / 3
  )
  ctx.fill()
  ctx.restore()
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save()
  ctx.beginPath()

  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? size : size / 2.4
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const pointX = x + Math.cos(angle) * radius
    const pointY = y + Math.sin(angle) * radius

    if (i === 0) ctx.moveTo(pointX, pointY)
    else ctx.lineTo(pointX, pointY)
  }

  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}