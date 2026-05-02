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
  backgroundClass: string
  outerBorderClass: string
  innerCardClass: string
  titleClass: string
  subtitleClass: string
  canvas: {
    background: string
    border: string
    photoBorder: string
    text: string
    mutedText: string
    accent: string
    decoration: "hearts" | "stars" | "film" | "minimal" | "flowers" | "party"
  }
}

type FilterOption = {
  id: string
  name: string
  subtitle: string
  cssFilter: string
  canvasFilter: string
}

type FillerOption = {
  id: string
  name: string
  subtitle: string
  emoji: string
}

const STORAGE_KEY = "amoreframe_single_photos"
const MAX_PHOTOS = 3
const MAX_CAPTION = 50
const MAX_ACTIVE_FILLERS = 2

const STRIP_WIDTH = 900
const PHOTO_WIDTH = 760
const PHOTO_HEIGHT = 560
const TOP_PADDING = 112
const GAP = 38
const BOTTOM_PADDING = 200
const STRIP_HEIGHT =
  TOP_PADDING + PHOTO_HEIGHT * MAX_PHOTOS + GAP * (MAX_PHOTOS - 1) + BOTTOM_PADDING

const STRIP_DESIGNS: StripDesign[] = [
  {
    id: "soft-romance",
    name: "Soft Romance",
    subtitle: "Pink, sweet, and made for love.",
    brand: "AmoreFrame",
    accent: "♥",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffe4ee_0%,#fff7fa_42%,#ffd6e3_100%)]",
    outerBorderClass: "border-pink-200/80",
    innerCardClass: "border-white shadow-[0_14px_35px_rgba(190,24,93,0.16)]",
    titleClass: "text-rose-900",
    subtitleClass: "text-rose-700",
    canvas: {
      background: "#fff1f5",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#881337",
      mutedText: "#be185d",
      accent: "#e11d48",
      decoration: "hearts",
    },
  },
  {
    id: "noir-date",
    name: "Noir Date",
    subtitle: "Dark, intimate, and cinematic.",
    brand: "AmoreFrame",
    accent: "♥",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#4b0d1b_0%,#180b12_42%,#050505_100%)]",
    outerBorderClass: "border-rose-900/60",
    innerCardClass:
      "border-rose-300/20 shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
    titleClass: "text-rose-100",
    subtitleClass: "text-rose-300",
    canvas: {
      background: "#0a0a0b",
      border: "#7f1d1d",
      photoBorder: "#881337",
      text: "#ffe4e6",
      mutedText: "#fda4af",
      accent: "#fb7185",
      decoration: "stars",
    },
  },
  {
    id: "barkada-fun",
    name: "Barkada Fun",
    subtitle: "Colorful, playful, and full of energy.",
    brand: "AmoreFrame",
    accent: "✿",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff6ab_0%,#fffef1_36%,#ffd49d_100%)]",
    outerBorderClass: "border-orange-200/80",
    innerCardClass:
      "border-white shadow-[0_12px_28px_rgba(234,88,12,0.18)]",
    titleClass: "text-orange-950",
    subtitleClass: "text-orange-700",
    canvas: {
      background: "#fff7d1",
      border: "#fdba74",
      photoBorder: "#ffffff",
      text: "#431407",
      mutedText: "#c2410c",
      accent: "#f97316",
      decoration: "party",
    },
  },
  {
    id: "vintage-love",
    name: "Vintage Love",
    subtitle: "Warm nostalgia with film charm.",
    brand: "AmoreFrame",
    accent: "✦",
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ead7b7,#d7bc91,#efdcbc)]",
    outerBorderClass: "border-amber-800/35",
    innerCardClass:
      "border-amber-950/20 shadow-[0_14px_32px_rgba(92,52,18,0.2)]",
    titleClass: "text-amber-950",
    subtitleClass: "text-amber-900",
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
    id: "pure-white",
    name: "Pure White",
    subtitle: "Minimal, clean, and elegant.",
    brand: "AmoreFrame",
    accent: "♡",
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#fcfcfb,#f8f7f4,#f4f1ec)]",
    outerBorderClass: "border-neutral-300/80",
    innerCardClass: "border-neutral-200 shadow-[0_14px_32px_rgba(0,0,0,0.12)]",
    titleClass: "text-neutral-900",
    subtitleClass: "text-neutral-500",
    canvas: {
      background: "#fafaf9",
      border: "#d4d4d4",
      photoBorder: "#e5e5e5",
      text: "#171717",
      mutedText: "#6b7280",
      accent: "#111827",
      decoration: "minimal",
    },
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    subtitle: "Elegant black with a luxe glow.",
    brand: "AmoreFrame",
    accent: "✦",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#352713_0%,#141016_40%,#050505_100%)]",
    outerBorderClass: "border-amber-500/30",
    innerCardClass:
      "border-amber-300/20 shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
    titleClass: "text-amber-100",
    subtitleClass: "text-amber-300",
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

const FILLERS: FillerOption[] = [
  {
    id: "hearts",
    name: "Hearts",
    subtitle: "Romantic border",
    emoji: "💖",
  },
  {
    id: "tiny-hearts",
    name: "Tiny Hearts",
    subtitle: "Soft love pattern",
    emoji: "💕",
  },
  {
    id: "flowers",
    name: "Flowers",
    subtitle: "Sweet romance",
    emoji: "🌸",
  },
  {
    id: "sparkles",
    name: "Sparkles",
    subtitle: "Dreamy shine",
    emoji: "✨",
  },
  {
    id: "fireworks",
    name: "Fireworks",
    subtitle: "Barkada celebration",
    emoji: "🎆",
  },
  {
    id: "teddy",
    name: "Teddy Bear",
    subtitle: "Cute and cozy",
    emoji: "🧸",
  },
  {
    id: "cat",
    name: "Cat",
    subtitle: "Playful cute vibe",
    emoji: "🐱",
  },
  {
    id: "bow",
    name: "Bow",
    subtitle: "Pretty and charming",
    emoji: "🎀",
  },
]

const PREVIEW_FILLER_POINTS = [
  { top: "5%", left: "6%" },
  { top: "5%", right: "6%" },
  { top: "17%", left: "5%" },
  { top: "17%", right: "5%" },
  { top: "31%", left: "5%" },
  { top: "31%", right: "5%" },
  { top: "45%", left: "5%" },
  { top: "45%", right: "5%" },
  { top: "59%", left: "5%" },
  { top: "59%", right: "5%" },
  { top: "73%", left: "5%" },
  { top: "73%", right: "5%" },
  { bottom: "6%", left: "8%" },
  { bottom: "6%", right: "8%" },
]

export default function ResultClient() {
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedDesignId, setSelectedDesignId] = useState("noir-date")
  const [selectedFilterId, setSelectedFilterId] = useState("original")
  const [selectedFillers, setSelectedFillers] = useState<string[]>(["hearts"])
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

  function toggleFiller(id: string) {
    setSelectedFillers((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id)
      }

      if (previous.length >= MAX_ACTIVE_FILLERS) {
        return [...previous.slice(1), id]
      }

      return [...previous, id]
    })
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
        fillers: selectedFillers,
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
                    Theme, filter, fillers, caption
                  </p>
                </div>
              </div>
            </header>

            <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(280px,0.82fr)_minmax(400px,1.18fr)]">
              <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-3 backdrop-blur-xl sm:p-5">
                <div className="flex h-[500px] items-center justify-center sm:h-[610px] lg:h-[calc(100vh-9.5rem)] lg:min-h-[540px] lg:max-h-[700px]">
                  <PhotostripPreview
                    photos={previewPhotos}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={caption}
                    fillers={selectedFillers}
                  />
                </div>
              </section>

              <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 sm:p-5 lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/25 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink">
                  <Sparkles className="h-4 w-4" />
                  Customize Your Strip
                </div>

                <h1 className="amoura-serif mt-4 text-3xl leading-tight text-amoura-cream sm:text-4xl">
                  Every vibe. Every moment.
                </h1>

                <p className="mt-3 text-sm leading-6 text-amoura-muted">
                  Pick a booth theme, apply a cute filter, add up to 2 border
                  fillers, write a short caption, and download your final strip.
                </p>

                <section className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
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
                          onClick={() => setSelectedDesignId(design.id)}
                          className={`rounded-[1.2rem] border p-3 text-left transition ${
                            active
                              ? "border-amoura-red-soft bg-amoura-red/10 shadow-[0_0_30px_rgba(194,31,58,0.14)]"
                              : "border-amoura-red-soft/15 bg-black/25 hover:border-amoura-red-soft/35"
                          }`}
                        >
                          <ThemeCardPreview
                            design={design}
                            photo={previewPhotos[0]}
                            filter={selectedFilter}
                          />

                          <div className="mt-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-amoura-cream">
                                {design.name}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs leading-4 text-amoura-muted">
                                {design.subtitle}
                              </p>
                            </div>

                            {active ? (
                              <div className="shrink-0 rounded-full border border-amoura-red-soft/30 bg-amoura-red/10 p-1 text-amoura-red-soft">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="mt-8">
                  <div className="mb-4 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-amoura-red-soft" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                      Cute Filters
                    </h2>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amoura-red-soft" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                        Border Fillers
                      </h2>
                    </div>

                    <span className="text-xs text-amoura-muted">
                      {selectedFillers.length}/{MAX_ACTIVE_FILLERS}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {FILLERS.map((filler) => {
                      const active = selectedFillers.includes(filler.id)

                      return (
                        <button
                          key={filler.id}
                          onClick={() => toggleFiller(filler.id)}
                          className={`rounded-2xl border px-3 py-3 text-left transition ${
                            active
                              ? "border-amoura-red-soft bg-amoura-red/10"
                              : "border-amoura-red-soft/15 bg-black/25 hover:border-amoura-red-soft/35"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="mb-2 text-2xl">
                                {filler.emoji}
                              </div>
                              <p className="truncate text-sm font-semibold text-amoura-cream">
                                {filler.name}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-amoura-muted">
                                {filler.subtitle}
                              </p>
                            </div>

                            {active ? (
                              <Check className="mt-1 h-4 w-4 shrink-0 text-amoura-red-soft" />
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-amoura-muted">
                    Fillers decorate the borders automatically. Choose up to 2.
                  </p>
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
  fillers,
}: {
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  fillers: string[]
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative h-full max-h-full w-auto max-w-full overflow-hidden rounded-[1.55rem] border p-3 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <PreviewDecorations design={design} />
        <PreviewFillers fillers={fillers} />

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
              className={`overflow-hidden rounded-[1rem] border-[4px] bg-black/10 ${design.innerCardClass}`}
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

function PreviewFillers({ fillers }: { fillers: string[] }) {
  const selected = fillers
    .map((id) => FILLERS.find((item) => item.id === id))
    .filter(Boolean) as FillerOption[]

  return (
    <>
      {selected.flatMap((filler, fillerIndex) =>
        PREVIEW_FILLER_POINTS.map((point, index) => {
          const shouldSkip = fillerIndex === 1 && index % 2 === 0

          if (shouldSkip) return null

          return (
            <span
              key={`${filler.id}-${index}`}
              className="pointer-events-none absolute z-20 text-[clamp(0.9rem,0.9vw+0.55rem,1.5rem)] opacity-90 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              style={point}
            >
              {filler.emoji}
            </span>
          )
        })
      )}
    </>
  )
}

function ThemeCardPreview({
  design,
  photo,
  filter,
}: {
  design: StripDesign
  photo?: string
  filter: FilterOption
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1rem] border p-2 ${design.backgroundClass} ${design.outerBorderClass}`}
    >
      <div className="text-center">
        <p className={`text-[9px] font-semibold ${design.titleClass}`}>
          {design.brand}
        </p>
      </div>

      <div className="mt-2 grid gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`overflow-hidden rounded-md border-[2px] ${design.innerCardClass}`}
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

      <div className="mt-2 text-center">
        <p
          className={`text-[8px] uppercase tracking-[0.2em] ${design.subtitleClass}`}
        >
          {design.accent}
        </p>
      </div>
    </div>
  )
}

function PreviewDecorations({ design }: { design: StripDesign }) {
  if (design.canvas.decoration === "minimal") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-[1.4rem] border border-black/10" />
      </div>
    )
  }

  if (design.canvas.decoration === "film") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-2 top-0 h-full w-4 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_9px,transparent_9px,transparent_18px)]" />
        <div className="absolute right-2 top-0 h-full w-4 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_9px,transparent_9px,transparent_18px)]" />
      </div>
    )
  }

  return null
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
  fillers,
}: {
  ctx: CanvasRenderingContext2D
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  fillers: string[]
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
  drawCanvasFillers(ctx, fillers)

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 54px Georgia, serif"
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 74)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 108)

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
    const captionBoxY = STRIP_HEIGHT - 135
    const captionBoxWidth = STRIP_WIDTH - 240
    const captionBoxHeight = 56

    ctx.save()
    ctx.globalAlpha = 0.18
    drawRoundedRect(
      ctx,
      captionBoxX,
      captionBoxY,
      captionBoxWidth,
      captionBoxHeight,
      28,
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
      28
    )
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = design.canvas.text
    ctx.font = "500 24px Arial, sans-serif"
    ctx.fillText(caption, STRIP_WIDTH / 2, STRIP_HEIGHT - 98)
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 42px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 42)
}

function drawCanvasFillers(ctx: CanvasRenderingContext2D, fillers: string[]) {
  const selected = fillers
    .map((id) => FILLERS.find((item) => item.id === id))
    .filter(Boolean) as FillerOption[]

  const points = [
    { x: 82, y: 150 },
    { x: STRIP_WIDTH - 82, y: 150 },
    { x: 72, y: 310 },
    { x: STRIP_WIDTH - 72, y: 310 },
    { x: 72, y: 520 },
    { x: STRIP_WIDTH - 72, y: 520 },
    { x: 72, y: 750 },
    { x: STRIP_WIDTH - 72, y: 750 },
    { x: 72, y: 980 },
    { x: STRIP_WIDTH - 72, y: 980 },
    { x: 72, y: 1210 },
    { x: STRIP_WIDTH - 72, y: 1210 },
    { x: 92, y: STRIP_HEIGHT - 115 },
    { x: STRIP_WIDTH - 92, y: STRIP_HEIGHT - 115 },
  ]

  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  selected.forEach((filler, fillerIndex) => {
    points.forEach((point, index) => {
      if (fillerIndex === 1 && index % 2 === 0) return

      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.25)"
      ctx.shadowBlur = 14
      ctx.globalAlpha = 0.92
      ctx.font = `38px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
      ctx.fillText(filler.emoji, point.x, point.y)
      ctx.restore()
    })
  })

  ctx.restore()
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}