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
  Wand2,
  X,
} from "lucide-react"

type DualResultData = {
  roomCode: string
  hostName: string
  partnerName: string
  hostPhotos: string[]
  partnerPhotos: string[]
  createdAt: string
}

type DualTheme = {
  id: string
  name: string
  subtitle: string
  accent: string
  backgroundClass: string
  borderClass: string
  titleClass: string
  mutedClass: string
  canvas: {
    background: string
    border: string
    photoBorder: string
    text: string
    muted: string
    accent: string
    decoration: "romance" | "noir" | "barkada" | "white"
  }
}

type FilterOption = {
  id: string
  name: string
  cssFilter: string
  canvasFilter: string
}

const DUAL_RESULT_KEY = "amoreframe_dual_photos"
const MAX_CAPTION = 50

const STRIP_WIDTH = 1100
const STRIP_HEIGHT = 1650
const ROW_X = 105
const ROW_WIDTH = 890
const PHOTO_GAP = 24
const PHOTO_WIDTH = (ROW_WIDTH - PHOTO_GAP) / 2
const PHOTO_HEIGHT = 330
const FIRST_ROW_Y = 190
const ROW_GAP = 50

const THEMES: DualTheme[] = [
  {
    id: "romance",
    name: "Soft Romance",
    subtitle: "Sweet, warm, and made for two.",
    accent: "♥",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffe4ee_0%,#fff7fa_42%,#ffd1df_100%)]",
    borderClass: "border-pink-200/90",
    titleClass: "text-rose-900",
    mutedClass: "text-rose-700",
    canvas: {
      background: "#fff1f5",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#881337",
      muted: "#be185d",
      accent: "#e11d48",
      decoration: "romance",
    },
  },
  {
    id: "noir",
    name: "Noir Date",
    subtitle: "Dark, cinematic, and intimate.",
    accent: "♥",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#44101a_0%,#13080d_42%,#030303_100%)]",
    borderClass: "border-rose-900/70",
    titleClass: "text-rose-100",
    mutedClass: "text-rose-300",
    canvas: {
      background: "#070707",
      border: "#7f1d1d",
      photoBorder: "#881337",
      text: "#ffe4e6",
      muted: "#fda4af",
      accent: "#fb7185",
      decoration: "noir",
    },
  },
  {
    id: "barkada",
    name: "Barkada Fun",
    subtitle: "Bright, playful, and full of energy.",
    accent: "✿",
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff6ab_0%,#fffef1_36%,#ffbf83_100%)]",
    borderClass: "border-orange-200/90",
    titleClass: "text-orange-950",
    mutedClass: "text-orange-700",
    canvas: {
      background: "#fff7d1",
      border: "#fb923c",
      photoBorder: "#ffffff",
      text: "#431407",
      muted: "#c2410c",
      accent: "#f97316",
      decoration: "barkada",
    },
  },
  {
    id: "white",
    name: "Pure White",
    subtitle: "Clean, minimal, and timeless.",
    accent: "♡",
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ffffff,#f8f7f4,#f1eee8)]",
    borderClass: "border-neutral-300/90",
    titleClass: "text-neutral-900",
    mutedClass: "text-neutral-500",
    canvas: {
      background: "#fafaf9",
      border: "#d4d4d4",
      photoBorder: "#e5e5e5",
      text: "#171717",
      muted: "#737373",
      accent: "#111111",
      decoration: "white",
    },
  },
]

const FILTERS: FilterOption[] = [
  {
    id: "original",
    name: "Original",
    cssFilter: "none",
    canvasFilter: "none",
  },
  {
    id: "warm",
    name: "Warm",
    cssFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
    canvasFilter: "sepia(18%) saturate(118%) brightness(103%) contrast(102%)",
  },
  {
    id: "dreamy",
    name: "Dreamy",
    cssFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
    canvasFilter:
      "saturate(112%) brightness(104%) contrast(98%) sepia(8%) hue-rotate(-10deg)",
  },
  {
    id: "film",
    name: "B&W",
    cssFilter: "grayscale(100%) contrast(108%) brightness(102%)",
    canvasFilter: "grayscale(100%) contrast(108%) brightness(102%)",
  },
]

export default function DualResultClient() {
  const [data, setData] = useState<DualResultData | null>(null)
  const [themeId, setThemeId] = useState("romance")
  const [filterId, setFilterId] = useState("original")
  const [caption, setCaption] = useState("")
  const [draftCaption, setDraftCaption] = useState("")
  const [captionOpen, setCaptionOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]
  const filter = FILTERS.find((item) => item.id === filterId) ?? FILTERS[0]

  useEffect(() => {
    const raw = sessionStorage.getItem(DUAL_RESULT_KEY)

    if (!raw) {
      window.location.href = "/booth/dual"
      return
    }

    try {
      const parsed = JSON.parse(raw) as DualResultData

      if (
        !parsed.hostPhotos?.length ||
        !parsed.partnerPhotos?.length ||
        parsed.hostPhotos.length < 3 ||
        parsed.partnerPhotos.length < 3
      ) {
        window.location.href = "/booth/dual"
        return
      }

      setData(parsed)
    } catch {
      window.location.href = "/booth/dual"
    }
  }, [])

  const rows = useMemo(() => {
    if (!data) return []

    return [0, 1, 2].map((index) => ({
      host: data.hostPhotos[index],
      partner: data.partnerPhotos[index],
    }))
  }, [data])

  function openCaption() {
    setDraftCaption(caption)
    setCaptionOpen(true)
  }

  function saveCaption() {
    setCaption(draftCaption.trim().slice(0, MAX_CAPTION))
    setCaptionOpen(false)
  }

  function retake() {
    sessionStorage.removeItem(DUAL_RESULT_KEY)
    window.location.href = "/booth/dual"
  }

  async function downloadDualStrip() {
    if (!data || downloading) return

    try {
      setDownloading(true)

      const canvas = document.createElement("canvas")
      canvas.width = STRIP_WIDTH
      canvas.height = STRIP_HEIGHT

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      await drawDualStrip({
        ctx,
        data,
        theme,
        filter,
        caption,
      })

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `amoreframe-dual-${theme.id}-${Date.now()}.png`
      link.click()
    } catch (err) {
      console.error(err)
      alert("We could not download your dual strip. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (!data) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-amoura-red-soft" />
      </main>
    )
  }

  return (
    <>
      <main className="amoura-page min-h-screen overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
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
                  Dual Strip
                </p>
                <p className="text-xs text-amoura-muted">
                  Choose theme, filter, caption, download
                </p>
              </div>
            </div>
          </header>

          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(300px,0.75fr)_minmax(420px,1.25fr)]">
            <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-3 backdrop-blur-xl sm:p-5">
              <div className="flex h-[520px] items-center justify-center sm:h-[650px] lg:h-[calc(100vh-9.75rem)] lg:min-h-[570px] lg:max-h-[720px]">
                <DualStripPreview
                  data={data}
                  rows={rows}
                  theme={theme}
                  filter={filter}
                  caption={caption}
                />
              </div>
            </section>

            <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 sm:p-5 lg:max-h-[calc(100vh-9.75rem)] lg:overflow-y-auto">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-amoura-red-soft">
                  Dual Photobooth
                </p>
                <h1 className="amoura-serif mt-3 text-4xl leading-none text-amoura-cream sm:text-5xl">
                  Together in one strip.
                </h1>
                <p className="mt-3 text-base text-amoura-muted">
                  {data.hostName} + {data.partnerName}
                </p>
              </div>

              <section className="mt-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amoura-muted">
                  Booth Themes
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {THEMES.map((item) => {
                    const active = item.id === theme.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => setThemeId(item.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-amoura-red-soft bg-amoura-red/10"
                            : "border-amoura-red-soft/15 bg-black/25 hover:border-amoura-red-soft/35"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="amoura-serif text-xl text-amoura-cream">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-amoura-muted">
                              {item.subtitle}
                            </p>
                          </div>

                          {active ? (
                            <Check className="h-5 w-5 text-amoura-red-soft" />
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
                    Filters
                  </h2>
                </div>

                <div className="grid gap-2 sm:grid-cols-4">
                  {FILTERS.map((item) => {
                    const active = item.id === filter.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => setFilterId(item.id)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-amoura-red-soft bg-amoura-red/10 text-amoura-cream"
                            : "border-amoura-red-soft/15 bg-black/25 text-amoura-muted hover:border-amoura-red-soft/35"
                        }`}
                      >
                        {item.name}
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
                      onClick={openCaption}
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
                  onClick={downloadDualStrip}
                  disabled={downloading}
                  className="amoura-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {downloading ? (
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
                  onClick={retake}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-6 py-4 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                >
                  <RefreshCcw className="h-4 w-4" />
                  New Dual Session
                </button>
              </section>
            </aside>
          </section>
        </section>
      </main>

      {captionOpen ? (
        <CaptionModal
          value={draftCaption}
          onChange={setDraftCaption}
          onClose={() => setCaptionOpen(false)}
          onSave={saveCaption}
        />
      ) : null}
    </>
  )
}

function DualStripPreview({
  data,
  rows,
  theme,
  filter,
  caption,
}: {
  data: DualResultData
  rows: { host: string; partner: string }[]
  theme: DualTheme
  filter: FilterOption
  caption: string
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-visible">
      <div
        className={`relative flex h-[94%] max-h-[94%] w-auto max-w-full flex-col overflow-hidden rounded-[1.45rem] border p-3 shadow-2xl ${theme.backgroundClass} ${theme.borderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <ThemeDecorations theme={theme} />

        <div className="relative z-10 shrink-0 text-center">
          <p className={`text-xl font-bold ${theme.titleClass}`}>AmoreFrame</p>
          <p className={`mt-0.5 text-[0.52rem] uppercase tracking-[0.22em] ${theme.mutedClass}`}>
            {theme.name}
          </p>
        </div>

        <div className="relative z-10 mt-3 grid min-h-0 flex-1 grid-rows-3 gap-2">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid min-h-0 grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/15 p-2"
            >
              <img
                src={row.host}
                alt={`${data.hostName} shot ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
                style={{ filter: filter.cssFilter }}
              />
              <img
                src={row.partner}
                alt={`${data.partnerName} shot ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
                style={{ filter: filter.cssFilter }}
              />
            </div>
          ))}
        </div>

        {caption ? (
          <div className="relative z-10 mt-2 shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-center">
            <p className={`truncate text-[0.64rem] ${theme.titleClass}`}>
              {caption}
            </p>
          </div>
        ) : null}

        <div className={`relative z-10 mt-2 shrink-0 text-center ${theme.titleClass}`}>
          <p className="text-lg leading-none">{theme.accent}</p>
          <p className={`mt-1 text-[0.46rem] uppercase tracking-[0.16em] ${theme.mutedClass}`}>
            Captured together
          </p>
        </div>
      </div>
    </div>
  )
}

function ThemeDecorations({ theme }: { theme: DualTheme }) {
  if (theme.canvas.decoration === "barkada") {
    return (
      <div className="pointer-events-none absolute inset-0 text-sm opacity-90">
        <span className="absolute left-3 top-4">🌼</span>
        <span className="absolute right-3 top-8">😊</span>
        <span className="absolute left-3 bottom-4">✿</span>
        <span className="absolute right-3 bottom-4">🌈</span>
      </div>
    )
  }

  if (theme.canvas.decoration === "noir") {
    return (
      <div className="pointer-events-none absolute inset-0 text-sm opacity-80">
        <span className="absolute left-3 top-3">✦</span>
        <span className="absolute right-3 top-5">☾</span>
        <span className="absolute left-3 bottom-4">✧</span>
        <span className="absolute right-3 bottom-3">✦</span>
      </div>
    )
  }

  if (theme.canvas.decoration === "romance") {
    return (
      <div className="pointer-events-none absolute inset-0 text-sm opacity-80">
        <span className="absolute left-3 top-3">♥</span>
        <span className="absolute right-3 top-3">♥</span>
        <span className="absolute left-3 bottom-3">♡</span>
        <span className="absolute right-3 bottom-3">♡</span>
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
              Write a short caption for your dual strip. Maximum of 50 characters.
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
            placeholder="For example: Together from anywhere ♥"
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

async function drawDualStrip({
  ctx,
  data,
  theme,
  filter,
  caption,
}: {
  ctx: CanvasRenderingContext2D
  data: DualResultData
  theme: DualTheme
  filter: FilterOption
  caption: string
}) {
  drawRoundedRect(ctx, 0, 0, STRIP_WIDTH, STRIP_HEIGHT, 70, theme.canvas.background)
  drawBorder(ctx, 28, 28, STRIP_WIDTH - 56, STRIP_HEIGHT - 56, 48, theme.canvas.border, 8)

  drawCanvasDecorations(ctx, theme)

  ctx.textAlign = "center"
  ctx.fillStyle = theme.canvas.text
  ctx.font = "bold 58px Georgia, serif"
  ctx.fillText("AmoreFrame", STRIP_WIDTH / 2, 86)

  ctx.fillStyle = theme.canvas.muted
  ctx.font = "bold 20px Arial, sans-serif"
  ctx.fillText(theme.name.toUpperCase(), STRIP_WIDTH / 2, 124)

  ctx.font = "500 22px Arial, sans-serif"
  ctx.fillText(`${data.hostName} + ${data.partnerName}`, STRIP_WIDTH / 2, 154)

  for (let index = 0; index < 3; index++) {
    const y = FIRST_ROW_Y + index * (PHOTO_HEIGHT + ROW_GAP)
    const hostImage = await loadImage(data.hostPhotos[index])
    const partnerImage = await loadImage(data.partnerPhotos[index])

    drawRoundedRect(ctx, ROW_X, y, ROW_WIDTH, PHOTO_HEIGHT + 28, 30, theme.canvas.photoBorder)

    drawImageCover(
      ctx,
      hostImage,
      ROW_X + 14,
      y + 14,
      PHOTO_WIDTH,
      PHOTO_HEIGHT,
      filter.canvasFilter
    )

    drawImageCover(
      ctx,
      partnerImage,
      ROW_X + 14 + PHOTO_WIDTH + PHOTO_GAP,
      y + 14,
      PHOTO_WIDTH,
      PHOTO_HEIGHT,
      filter.canvasFilter
    )
  }

  if (caption) {
    const captionBoxX = 150
    const captionBoxY = STRIP_HEIGHT - 140
    const captionBoxWidth = STRIP_WIDTH - 300
    const captionBoxHeight = 58

    ctx.save()
    ctx.globalAlpha = 0.18
    drawRoundedRect(ctx, captionBoxX, captionBoxY, captionBoxWidth, captionBoxHeight, 28, "#000000")
    ctx.restore()

    ctx.strokeStyle = theme.canvas.border
    ctx.lineWidth = 2
    roundedPath(ctx, captionBoxX, captionBoxY, captionBoxWidth, captionBoxHeight, 28)
    ctx.stroke()

    ctx.fillStyle = theme.canvas.text
    ctx.font = "500 24px Arial, sans-serif"
    ctx.fillText(caption, STRIP_WIDTH / 2, STRIP_HEIGHT - 102)
  }

  ctx.fillStyle = theme.canvas.accent
  ctx.font = "bold 46px Georgia, serif"
  ctx.fillText(theme.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 44)
}

function drawCanvasDecorations(ctx: CanvasRenderingContext2D, theme: DualTheme) {
  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = theme.canvas.accent
  ctx.globalAlpha = 0.8

  if (theme.canvas.decoration === "romance") {
    ctx.font = "36px Georgia, serif"
    ctx.fillText("♥", 90, 92)
    ctx.fillText("♥", STRIP_WIDTH - 90, 92)
    ctx.fillText("♡", 90, STRIP_HEIGHT - 80)
    ctx.fillText("♡", STRIP_WIDTH - 90, STRIP_HEIGHT - 80)
  }

  if (theme.canvas.decoration === "noir") {
    ctx.font = "36px Georgia, serif"
    ctx.fillText("✦", 90, 92)
    ctx.fillText("☾", STRIP_WIDTH - 90, 92)
    ctx.fillText("✧", 90, STRIP_HEIGHT - 80)
    ctx.fillText("✦", STRIP_WIDTH - 90, STRIP_HEIGHT - 80)
  }

  if (theme.canvas.decoration === "barkada") {
    ctx.font = "34px Arial"
    ctx.fillText("🌼", 90, 92)
    ctx.fillText("😊", STRIP_WIDTH - 90, 92)
    ctx.fillText("✿", 90, STRIP_HEIGHT - 80)
    ctx.fillText("🌈", STRIP_WIDTH - 90, STRIP_HEIGHT - 80)
  }

  if (theme.canvas.decoration === "white") {
    ctx.globalAlpha = 0.18
    ctx.strokeStyle = theme.canvas.text
    ctx.lineWidth = 2
    drawRoundedBorder(ctx, 52, 52, STRIP_WIDTH - 104, STRIP_HEIGHT - 104, 42)
  }

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