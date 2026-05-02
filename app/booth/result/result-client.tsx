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
  subtitle: string
  brand: string
  accent: string
  palette: string[]
  backgroundClass: string
  outerBorderClass: string
  photoFrameClass: string
  titleClass: string
  subtitleClass: string
  canvas: {
    background: string
    border: string
    photoBorder: string
    text: string
    mutedText: string
    accent: string
    decoration:
      | "noir"
      | "romance"
      | "vintage"
      | "barkada"
      | "white"
      | "midnight"
      | "kawaii"
      | "retro"
  }
}

type FilterOption = {
  id: string
  name: string
  subtitle: string
  cssFilter: string
  canvasFilter: string
}

const STORAGE_KEY = "amoreframe_single_photos"
const MAX_PHOTOS = 3
const MAX_CAPTION = 50

const STRIP_WIDTH = 900
const PHOTO_WIDTH = 760
const PHOTO_HEIGHT = 560
const TOP_PADDING = 110
const GAP = 34
const BOTTOM_PADDING = 190
const STRIP_HEIGHT =
  TOP_PADDING + PHOTO_HEIGHT * MAX_PHOTOS + GAP * (MAX_PHOTOS - 1) + BOTTOM_PADDING

const STRIP_DESIGNS: StripDesign[] = [
  {
    id: "noir-date",
    name: "Noir Date",
    subtitle: "Cinematic, bold, and undeniably classic.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#070707", "#e85d75", "#242424", "#f5e7e7"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#44101a_0%,#13080d_42%,#030303_100%)]",
    outerBorderClass: "border-rose-900/70",
    photoFrameClass:
      "border-rose-300/20 shadow-[0_18px_40px_rgba(0,0,0,0.48)]",
    titleClass: "text-rose-100",
    subtitleClass: "text-rose-300",
    canvas: {
      background: "#070707",
      border: "#7f1d1d",
      photoBorder: "#881337",
      text: "#ffe4e6",
      mutedText: "#fda4af",
      accent: "#fb7185",
      decoration: "noir",
    },
  },
  {
    id: "soft-romance",
    name: "Soft Romance",
    subtitle: "Warm, tender, and full of love.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#ffd6e3", "#fff4f7", "#f9a8d4", "#e85d75"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffe4ee_0%,#fff7fa_42%,#ffd1df_100%)]",
    outerBorderClass: "border-pink-200/90",
    photoFrameClass: "border-white shadow-[0_14px_35px_rgba(190,24,93,0.16)]",
    titleClass: "text-rose-900",
    subtitleClass: "text-rose-700",
    canvas: {
      background: "#fff1f5",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#881337",
      mutedText: "#be185d",
      accent: "#e11d48",
      decoration: "romance",
    },
  },
  {
    id: "vintage-film",
    name: "Vintage Film",
    subtitle: "Timeless grain, real film nostalgia.",
    brand: "AmoreFrame",
    accent: "✦",
    palette: ["#e8d2aa", "#c8a46f", "#5c3212", "#f4e5c7"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ead7b7,#d7bc91,#efdcbc)]",
    outerBorderClass: "border-amber-800/40",
    photoFrameClass:
      "border-amber-950/20 shadow-[0_14px_32px_rgba(92,52,18,0.22)]",
    titleClass: "text-amber-950",
    subtitleClass: "text-amber-900",
    canvas: {
      background: "#dfc39a",
      border: "#92400e",
      photoBorder: "#78350f",
      text: "#451a03",
      mutedText: "#78350f",
      accent: "#92400e",
      decoration: "vintage",
    },
  },
  {
    id: "barkada-fun",
    name: "Barkada Fun",
    subtitle: "Vibrant, playful, and made for memories.",
    brand: "AmoreFrame",
    accent: "✿",
    palette: ["#ff7a30", "#7ac957", "#6ecbff", "#ffd84d", "#c77dff"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff6ab_0%,#fffef1_36%,#ffbf83_100%)]",
    outerBorderClass: "border-orange-200/90",
    photoFrameClass: "border-white shadow-[0_12px_28px_rgba(234,88,12,0.18)]",
    titleClass: "text-orange-950",
    subtitleClass: "text-orange-700",
    canvas: {
      background: "#fff7d1",
      border: "#fb923c",
      photoBorder: "#ffffff",
      text: "#431407",
      mutedText: "#c2410c",
      accent: "#f97316",
      decoration: "barkada",
    },
  },
  {
    id: "pure-white",
    name: "Pure White",
    subtitle: "Clean, minimal, and elegantly yours.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#ffffff", "#f2f2f2", "#d4d4d4", "#111111"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ffffff,#f8f7f4,#f1eee8)]",
    outerBorderClass: "border-neutral-300/90",
    photoFrameClass: "border-neutral-200 shadow-[0_14px_32px_rgba(0,0,0,0.12)]",
    titleClass: "text-neutral-900",
    subtitleClass: "text-neutral-500",
    canvas: {
      background: "#fafaf9",
      border: "#d4d4d4",
      photoBorder: "#e5e5e5",
      text: "#171717",
      mutedText: "#737373",
      accent: "#111111",
      decoration: "white",
    },
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    subtitle: "Dark, luxe, and perfect for night owls.",
    brand: "AmoreFrame",
    accent: "☾",
    palette: ["#080808", "#1f1117", "#5a2a2a", "#d6a85f"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#352713_0%,#141016_40%,#050505_100%)]",
    outerBorderClass: "border-amber-500/35",
    photoFrameClass:
      "border-amber-300/20 shadow-[0_18px_40px_rgba(0,0,0,0.48)]",
    titleClass: "text-amber-100",
    subtitleClass: "text-amber-300",
    canvas: {
      background: "#09090b",
      border: "#b45309",
      photoBorder: "#fbbf24",
      text: "#fef3c7",
      mutedText: "#fcd34d",
      accent: "#f59e0b",
      decoration: "midnight",
    },
  },
  {
    id: "kawaii-love",
    name: "Kawaii Love",
    subtitle: "Cute, soft, and sweet like a sticker diary.",
    brand: "AmoreFrame",
    accent: "♡",
    palette: ["#ffc7e1", "#fff1f8", "#c7d2fe", "#f9a8d4"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffd8eb_0%,#fff4fa_45%,#dbe4ff_100%)]",
    outerBorderClass: "border-pink-200/80",
    photoFrameClass: "border-white shadow-[0_14px_35px_rgba(236,72,153,0.14)]",
    titleClass: "text-pink-900",
    subtitleClass: "text-pink-600",
    canvas: {
      background: "#fff0f7",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#831843",
      mutedText: "#db2777",
      accent: "#ec4899",
      decoration: "kawaii",
    },
  },
  {
    id: "retro-pop",
    name: "Retro Pop",
    subtitle: "Bright, funky, and fun for barkada shots.",
    brand: "AmoreFrame",
    accent: "★",
    palette: ["#ff5b45", "#ffd447", "#3ecf8e", "#5bbcff"],
    backgroundClass:
      "bg-[linear-gradient(135deg,#ffdf6e,#ff8f70_45%,#6ee7b7)]",
    outerBorderClass: "border-yellow-300/70",
    photoFrameClass: "border-white shadow-[0_12px_30px_rgba(255,91,69,0.2)]",
    titleClass: "text-zinc-950",
    subtitleClass: "text-zinc-800",
    canvas: {
      background: "#ffd866",
      border: "#f97316",
      photoBorder: "#ffffff",
      text: "#18181b",
      mutedText: "#7c2d12",
      accent: "#ef4444",
      decoration: "retro",
    },
  },
]

const FILTERS: FilterOption[] = [
  {
    id: "original",
    name: "Original",
    subtitle: "Natural tone",
    cssFilter: "none",
    canvasFilter: "none",
  },
  {
    id: "warm",
    name: "Warm Glow",
    subtitle: "Soft and cozy",
    cssFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
    canvasFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
  },
  {
    id: "dreamy",
    name: "Dreamy Pink",
    subtitle: "Romantic tint",
    cssFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
    canvasFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
  },
  {
    id: "film",
    name: "B&W Film",
    subtitle: "Classic mono",
    cssFilter: "grayscale(100%) contrast(108%) brightness(102%)",
    canvasFilter: "grayscale(100%) contrast(108%) brightness(102%)",
  },
  {
    id: "fresh",
    name: "Fresh Air",
    subtitle: "Cool and clean",
    cssFilter: "saturate(106%) brightness(103%) hue-rotate(10deg)",
    canvasFilter: "saturate(106%) brightness(103%) hue-rotate(10deg)",
  },
]

export default function ResultClient() {
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedDesignId, setSelectedDesignId] = useState("noir-date")
  const [selectedFilterId, setSelectedFilterId] = useState("original")
  const [caption, setCaption] = useState("")
  const [draftCaption, setDraftCaption] = useState("")
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const selectedDesign =
    STRIP_DESIGNS.find((design) => design.id === selectedDesignId) ??
    STRIP_DESIGNS[0]

  const selectedFilter =
    FILTERS.find((filter) => filter.id === selectedFilterId) ?? FILTERS[0]

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

      setPhotos(parsed.slice(0, MAX_PHOTOS))
    } catch {
      window.location.href = "/booth/single"
      return
    } finally {
      setLoading(false)
    }
  }, [])

  const previewPhotos = useMemo(() => photos.slice(0, MAX_PHOTOS), [photos])

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
        <section className="relative px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
            <header className="rounded-[1.35rem] border border-amoura-red-soft/20 bg-black/45 px-4 py-3 backdrop-blur-xl sm:px-5">
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
                    Theme, filter, caption, download
                  </p>
                </div>
              </div>
            </header>

            <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(250px,0.75fr)_minmax(420px,1.25fr)]">
              <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-3 backdrop-blur-xl sm:p-5">
                <div className="flex h-[470px] items-center justify-center sm:h-[560px] lg:h-[calc(100vh-9.75rem)] lg:min-h-[500px] lg:max-h-[660px]">
                  <PhotostripPreview
                    photos={previewPhotos}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={caption}
                  />
                </div>
              </section>

              <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 sm:p-5 lg:max-h-[calc(100vh-9.75rem)] lg:overflow-y-auto">
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-amoura-red-soft">
                    Premium Booth Themes
                  </p>
                  <h1 className="amoura-serif mt-3 text-4xl leading-none text-amoura-cream sm:text-5xl">
                    Every vibe. Every moment.
                  </h1>
                  <p className="mt-3 text-base text-amoura-muted">
                    Your story, your style.
                  </p>
                </div>

                <section className="mt-8">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {STRIP_DESIGNS.map((design) => {
                      const active = selectedDesign.id === design.id

                      return (
                        <button
                          key={design.id}
                          onClick={() => setSelectedDesignId(design.id)}
                          className={`group text-left transition ${
                            active ? "scale-[1.02]" : "hover:-translate-y-1"
                          }`}
                        >
                          <ThemePoster
                            design={design}
                            photo={previewPhotos[0]}
                            filter={selectedFilter}
                            active={active}
                          />

                          <div className="mt-4 text-center">
                            <p className="amoura-serif text-xl font-semibold text-amoura-cream">
                              {design.name}
                            </p>
                            <p className="mx-auto mt-2 max-w-[170px] text-sm leading-5 text-amoura-muted">
                              {design.subtitle}
                            </p>

                            <div className="mt-3 flex justify-center gap-2">
                              {design.palette.map((color) => (
                                <span
                                  key={color}
                                  className="h-4 w-4 rounded-full border border-white/30"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="mt-10">
                  <div className="mb-4 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-amoura-red-soft" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                      Cute Filters
                    </h2>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {FILTERS.map((filter) => {
                      const active = selectedFilter.id === filter.id

                      return (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedFilterId(filter.id)}
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
                                {filter.subtitle}
                              </p>
                            </div>

                            {active ? (
                              <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" />
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="mt-8">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageCircleHeart className="h-4 w-4 text-amoura-red-soft" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                      Caption
                    </h2>
                  </div>

                  <div className="rounded-[1.25rem] border border-amoura-red-soft/15 bg-black/25 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-amoura-cream">
                          {caption || "No caption added yet."}
                        </p>
                        <p className="mt-1 text-xs text-amoura-muted">
                          Up to {MAX_CAPTION} characters.
                        </p>
                      </div>

                      <button
                        onClick={openCaptionModal}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                      >
                        <MessageCircleHeart className="h-4 w-4" />
                        {caption ? "Edit Caption" : "Add Caption"}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="mt-8 grid gap-3 border-t border-white/5 pt-5 sm:grid-cols-2">
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
        className={`relative h-full max-h-full w-auto max-w-full overflow-hidden rounded-[1.55rem] border p-3 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <StripDecorations design={design} />

        <div className="relative z-10 text-center">
          <p
            className={`text-[clamp(1rem,1vw+0.7rem,1.9rem)] font-bold ${design.titleClass}`}
          >
            {design.brand}
          </p>
          <p
            className={`mt-0.5 text-[clamp(0.48rem,0.35vw+0.35rem,0.72rem)] uppercase tracking-[0.3em] ${design.subtitleClass}`}
          >
            {design.name}
          </p>
        </div>

        <div className="relative z-10 mt-3 grid gap-2.5">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className={`overflow-hidden rounded-[1rem] border-[4px] bg-black/10 ${design.photoFrameClass}`}
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
          <div className="relative z-10 mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
            <p
              className={`text-[clamp(0.62rem,0.45vw+0.45rem,0.88rem)] ${design.titleClass}`}
            >
              {caption}
            </p>
          </div>
        ) : null}

        <div className={`relative z-10 mt-3 text-center ${design.titleClass}`}>
          <p className="text-[clamp(1.1rem,1vw+0.8rem,1.8rem)] leading-none">
            {design.accent}
          </p>
          <p
            className={`mt-1 text-[clamp(0.45rem,0.3vw+0.35rem,0.62rem)] uppercase tracking-[0.22em] ${design.subtitleClass}`}
          >
            Captured with love
          </p>
        </div>
      </div>
    </div>
  )
}

function ThemePoster({
  design,
  photo,
  filter,
  active,
}: {
  design: StripDesign
  photo?: string
  filter: FilterOption
  active: boolean
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/24] w-full max-w-[170px] overflow-hidden rounded-[1.2rem] border p-2.5 transition ${design.backgroundClass} ${
        active
          ? "border-amoura-red-soft shadow-[0_0_35px_rgba(194,31,58,0.2)]"
          : design.outerBorderClass
      }`}
    >
      <StripDecorations design={design} small />

      {active ? (
        <div className="absolute right-2 top-2 z-20 rounded-full border border-amoura-red-soft/40 bg-black/40 p-1 text-amoura-red-soft backdrop-blur">
          <Check className="h-3.5 w-3.5" />
        </div>
      ) : null}

      <div className="relative z-10 text-center">
        <p className={`text-[10px] font-bold ${design.titleClass}`}>
          {design.brand}
        </p>
      </div>

      <div className="relative z-10 mt-2 grid gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`overflow-hidden rounded-md border-[2px] ${design.photoFrameClass}`}
          >
            {photo ? (
              <img
                src={photo}
                alt=""
                className="aspect-[4/3] w-full object-cover"
                style={{ filter: filter.cssFilter }}
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-black/10" />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-2 text-center">
        <p className={`text-[10px] ${design.titleClass}`}>{design.accent}</p>
      </div>
    </div>
  )
}

function StripDecorations({
  design,
  small = false,
}: {
  design: StripDesign
  small?: boolean
}) {
  const size = small ? "text-xs" : "text-sm"

  if (design.canvas.decoration === "vintage") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-2 top-0 h-full w-3 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)]" />
        <div className="absolute right-2 top-0 h-full w-3 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)]" />
      </div>
    )
  }

  if (design.canvas.decoration === "barkada") {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-90 ${size}`}>
        <span className="absolute left-3 top-4">🌼</span>
        <span className="absolute right-3 top-8">😊</span>
        <span className="absolute left-2 top-[42%]">🌸</span>
        <span className="absolute right-2 top-[56%]">🌈</span>
        <span className="absolute bottom-4 left-3">✿</span>
        <span className="absolute bottom-4 right-3">🌼</span>
      </div>
    )
  }

  if (design.canvas.decoration === "romance" || design.canvas.decoration === "kawaii") {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">♥</span>
        <span className="absolute right-3 top-3">♥</span>
        <span className="absolute left-3 bottom-3">♡</span>
        <span className="absolute right-3 bottom-3">♡</span>
      </div>
    )
  }

  if (design.canvas.decoration === "midnight" || design.canvas.decoration === "noir") {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">✦</span>
        <span className="absolute right-3 top-5">☾</span>
        <span className="absolute left-3 bottom-4">✧</span>
        <span className="absolute right-3 bottom-3">✦</span>
      </div>
    )
  }

  if (design.canvas.decoration === "retro") {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">★</span>
        <span className="absolute right-3 top-3">●</span>
        <span className="absolute left-3 bottom-3">◆</span>
        <span className="absolute right-3 bottom-3">★</span>
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-4 rounded-[1.2rem] border border-black/10" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[1.6rem] border border-amoura-red-soft/20 bg-[#0b0608] p-5 shadow-2xl sm:p-6">
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
            placeholder="For example: My favorite memory ♥"
            className="w-full resize-none rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-3 text-sm text-amoura-cream outline-none transition placeholder:text-amoura-muted focus:border-amoura-red-soft/45"
          />

          <div className="mt-2 text-right text-xs text-amoura-muted">
            {value.length}/{MAX_CAPTION}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
  drawRoundedRect(ctx, 0, 0, STRIP_WIDTH, STRIP_HEIGHT, 64, design.canvas.background)

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
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 76)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 110)

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
    const captionBoxY = STRIP_HEIGHT - 138
    const captionBoxWidth = STRIP_WIDTH - 240
    const captionBoxHeight = 58

    ctx.save()
    ctx.globalAlpha = 0.18
    drawRoundedRect(ctx, captionBoxX, captionBoxY, captionBoxWidth, captionBoxHeight, 28, "#000000")
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = design.canvas.border
    ctx.lineWidth = 2
    roundedPath(ctx, captionBoxX, captionBoxY, captionBoxWidth, captionBoxHeight, 28)
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = design.canvas.text
    ctx.font = "500 24px Arial, sans-serif"
    ctx.fillText(caption, STRIP_WIDTH / 2, STRIP_HEIGHT - 100)
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 42px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 42)
}

function drawCanvasDecorations(ctx: CanvasRenderingContext2D, design: StripDesign) {
  const decoration = design.canvas.decoration

  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = design.canvas.accent
  ctx.strokeStyle = design.canvas.accent
  ctx.globalAlpha = 0.75

  if (decoration === "vintage") {
    ctx.globalAlpha = 0.3
    for (let y = 44; y < STRIP_HEIGHT - 44; y += 44) {
      drawRoundedRect(ctx, 34, y, 24, 20, 5, design.canvas.text)
      drawRoundedRect(ctx, STRIP_WIDTH - 58, y, 24, 20, 5, design.canvas.text)
    }
  }

  if (decoration === "romance" || decoration === "kawaii") {
    ctx.font = `34px Georgia, serif`
    ctx.fillText("♥", 80, 82)
    ctx.fillText("♥", STRIP_WIDTH - 80, 82)
    ctx.fillText("♡", 80, STRIP_HEIGHT - 72)
    ctx.fillText("♡", STRIP_WIDTH - 80, STRIP_HEIGHT - 72)
  }

  if (decoration === "noir" || decoration === "midnight") {
    ctx.font = `34px Georgia, serif`
    ctx.fillText("✦", 80, 82)
    ctx.fillText("☾", STRIP_WIDTH - 80, 88)
    ctx.fillText("✧", 80, STRIP_HEIGHT - 72)
    ctx.fillText("✦", STRIP_WIDTH - 80, STRIP_HEIGHT - 72)
  }

  if (decoration === "barkada") {
    ctx.font = `32px Arial`
    ctx.fillText("🌼", 80, 82)
    ctx.fillText("😊", STRIP_WIDTH - 80, 90)
    ctx.fillText("🌸", 76, STRIP_HEIGHT * 0.46)
    ctx.fillText("🌈", STRIP_WIDTH - 76, STRIP_HEIGHT * 0.56)
    ctx.fillText("✿", 82, STRIP_HEIGHT - 72)
    ctx.fillText("🌼", STRIP_WIDTH - 82, STRIP_HEIGHT - 72)
  }

  if (decoration === "retro") {
    ctx.font = `34px Georgia, serif`
    ctx.fillText("★", 80, 82)
    ctx.fillText("●", STRIP_WIDTH - 80, 82)
    ctx.fillText("◆", 80, STRIP_HEIGHT - 72)
    ctx.fillText("★", STRIP_WIDTH - 80, STRIP_HEIGHT - 72)
  }

  if (decoration === "white") {
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}