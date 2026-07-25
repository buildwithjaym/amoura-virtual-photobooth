"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  PartyPopper,
  Pencil,
  RefreshCcw,
  Rows3,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"

type BaseDesign = {
  id: string
  name: string
  subtitle: string
  brand: string
  palette: string[]
  backgroundClass: string
  outerBorderClass: string
  photoFrameClass: string
  titleClass: string
  subtitleClass: string
}

type StripDesign = BaseDesign & {
  kind: "strip"
  accent: string
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

type CardDesign = BaseDesign & {
  kind: "card"
  typeLabel: string
  hp: number
  moveName: string
  moveDamage: number
  moveDescription: string
  rarity: string
  holoGradient: string[]
  canvas: {
    background: string
    border: string
    photoBorder: string
    text: string
    mutedText: string
    accent: string
  }
}

type DesignOption = StripDesign | CardDesign

type FilterOption = {
  id: string
  name: string
  subtitle: string
  cssFilter: string
  canvasFilter: string
}

type StickerSlot = "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
type StickerMap = Partial<Record<StickerSlot, string>>

type WizardStep = "design" | "stickers" | "filters" | "caption" | "download"

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
  TOP_PADDING +
  PHOTO_HEIGHT * MAX_PHOTOS +
  GAP * (MAX_PHOTOS - 1) +
  BOTTOM_PADDING

const CARD_WIDTH = 760
const CARD_HEIGHT = 1120

const STICKER_SLOTS: StickerSlot[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
]

const STICKER_OPTIONS = ["❤️", "✨", "🔥", "😂", "🎉", "📸", "🌸", "⭐"]

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "stickers", label: "Stickers" },
  { id: "filters", label: "Filters" },
  { id: "caption", label: "Caption" },
  { id: "download", label: "Ready" },
]

const STEP_TITLES: Record<WizardStep, string> = {
  design: "Pick your design",
  stickers: "Add a sticker",
  filters: "Choose a filter",
  caption: "Write a caption",
  download: "Your memory is ready",
}

const STRIP_DESIGNS: StripDesign[] = [
  {
    kind: "strip",
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
    kind: "strip",
    id: "soft-romance",
    name: "Soft Romance",
    subtitle: "Warm, tender, and full of love.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#ffd6e3", "#fff4f7", "#f9a8d4", "#e85d75"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffe4ee_0%,#fff7fa_42%,#ffd1df_100%)]",
    outerBorderClass: "border-pink-200/90",
    photoFrameClass:
      "border-white shadow-[0_14px_35px_rgba(190,24,93,0.16)]",
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
    kind: "strip",
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
    kind: "strip",
    id: "barkada-fun",
    name: "Barkada Fun",
    subtitle: "Vibrant, playful, and made for memories.",
    brand: "AmoreFrame",
    accent: "✿",
    palette: ["#ff7a30", "#7ac957", "#6ecbff", "#ffd84d", "#c77dff"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff6ab_0%,#fffef1_36%,#ffbf83_100%)]",
    outerBorderClass: "border-orange-200/90",
    photoFrameClass:
      "border-white shadow-[0_12px_28px_rgba(234,88,12,0.18)]",
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
    kind: "strip",
    id: "pure-white",
    name: "Pure White",
    subtitle: "Clean, minimal, and elegantly yours.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#ffffff", "#f2f2f2", "#d4d4d4", "#111111"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ffffff,#f8f7f4,#f1eee8)]",
    outerBorderClass: "border-neutral-300/90",
    photoFrameClass:
      "border-neutral-200 shadow-[0_14px_32px_rgba(0,0,0,0.12)]",
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
    kind: "strip",
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
    kind: "strip",
    id: "kawaii-love",
    name: "Kawaii Love",
    subtitle: "Cute, soft, and sweet like a sticker diary.",
    brand: "AmoreFrame",
    accent: "♡",
    palette: ["#ffc7e1", "#fff1f8", "#c7d2fe", "#f9a8d4"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#ffd8eb_0%,#fff4fa_45%,#dbe4ff_100%)]",
    outerBorderClass: "border-pink-200/80",
    photoFrameClass:
      "border-white shadow-[0_14px_35px_rgba(236,72,153,0.14)]",
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
    kind: "strip",
    id: "retro-pop",
    name: "Retro Pop",
    subtitle: "Bright, funky, and fun for barkada shots.",
    brand: "AmoreFrame",
    accent: "★",
    palette: ["#ff5b45", "#ffd447", "#3ecf8e", "#5bbcff"],
    backgroundClass:
      "bg-[linear-gradient(135deg,#ffdf6e,#ff8f70_45%,#6ee7b7)]",
    outerBorderClass: "border-yellow-300/70",
    photoFrameClass:
      "border-white shadow-[0_12px_30px_rgba(255,91,69,0.2)]",
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
  {
    kind: "strip",
    id: "golden-hour",
    name: "Golden Hour",
    subtitle: "Sunset warmth for a timeless glow.",
    brand: "AmoreFrame",
    accent: "☀",
    palette: ["#ff9a56", "#ffce54", "#a83279", "#3a1c47"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#3a1c47,#a83279_45%,#ff9a56_85%,#ffce54)]",
    outerBorderClass: "border-orange-300/60",
    photoFrameClass:
      "border-amber-100/30 shadow-[0_16px_36px_rgba(168,50,121,0.28)]",
    titleClass: "text-amber-50",
    subtitleClass: "text-orange-200",
    canvas: {
      background: "#3a1c47",
      border: "#ff9a56",
      photoBorder: "#ffce54",
      text: "#fff7ed",
      mutedText: "#fed7aa",
      accent: "#ff9a56",
      decoration: "vintage",
    },
  },
  {
    kind: "strip",
    id: "ocean-breeze",
    name: "Ocean Breeze",
    subtitle: "Cool blues for a calm, clean look.",
    brand: "AmoreFrame",
    accent: "❋",
    palette: ["#e0f7fa", "#4fc3f7", "#0277bd", "#ffffff"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#f0fbff,#dff3fb,#cdeaf7)]",
    outerBorderClass: "border-sky-300/80",
    photoFrameClass: "border-white shadow-[0_14px_32px_rgba(2,119,189,0.16)]",
    titleClass: "text-sky-950",
    subtitleClass: "text-sky-600",
    canvas: {
      background: "#f0fbff",
      border: "#38bdf8",
      photoBorder: "#ffffff",
      text: "#0c4a6e",
      mutedText: "#0369a1",
      accent: "#0284c7",
      decoration: "white",
    },
  },
  {
    kind: "strip",
    id: "cherry-blossom",
    name: "Cherry Blossom",
    subtitle: "Soft pastel petals, springtime feel.",
    brand: "AmoreFrame",
    accent: "❀",
    palette: ["#ffe3ec", "#ffb6c9", "#c9e4b5", "#fff9f2"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff0f4_0%,#ffe3ec_45%,#f4f9ec_100%)]",
    outerBorderClass: "border-rose-200/80",
    photoFrameClass: "border-white shadow-[0_12px_28px_rgba(255,182,201,0.3)]",
    titleClass: "text-rose-800",
    subtitleClass: "text-rose-500",
    canvas: {
      background: "#fff0f4",
      border: "#ffb6c9",
      photoBorder: "#ffffff",
      text: "#831843",
      mutedText: "#be185d",
      accent: "#f472b6",
      decoration: "kawaii",
    },
  },
]

const CARD_DESIGNS: CardDesign[] = [
  {
    kind: "card",
    id: "electric-match",
    name: "Electric Match",
    subtitle: "Sparks fly \u2014 holo edition.",
    brand: "AmoreFrame",
    palette: ["#fef08a", "#facc15", "#1d4ed8", "#111827"],
    backgroundClass:
      "bg-[linear-gradient(150deg,#fef9c3_0%,#fde68a_45%,#bfdbfe_100%)]",
    outerBorderClass: "border-yellow-400/70",
    photoFrameClass: "border-blue-700/40 shadow-[0_14px_32px_rgba(29,78,216,0.2)]",
    titleClass: "text-blue-950",
    subtitleClass: "text-amber-800",
    typeLabel: "Electric",
    hp: 180,
    moveName: "Perfect Spark",
    moveDamage: 120,
    moveDescription: "Two hearts charge together and never lose power.",
    rarity: "⚡",
    holoGradient: ["#facc15", "#fca5a5", "#93c5fd", "#c4b5fd", "#facc15"],
    canvas: {
      background: "#fde68a",
      border: "#eab308",
      photoBorder: "#1d4ed8",
      text: "#1f2937",
      mutedText: "#78350f",
      accent: "#1d4ed8",
    },
  },
  {
    kind: "card",
    id: "mythic-bloom",
    name: "Mythic Bloom",
    subtitle: "Rose-gold foil, straight from a fairytale.",
    brand: "AmoreFrame",
    palette: ["#fbcfe8", "#f9a8d4", "#fde68a", "#831843"],
    backgroundClass:
      "bg-[linear-gradient(150deg,#fff1f8_0%,#fbcfe8_45%,#fde68a_100%)]",
    outerBorderClass: "border-pink-300/70",
    photoFrameClass: "border-pink-600/30 shadow-[0_14px_32px_rgba(219,39,119,0.2)]",
    titleClass: "text-pink-950",
    subtitleClass: "text-pink-700",
    typeLabel: "Fairy",
    hp: 150,
    moveName: "Adventure Together",
    moveDamage: 100,
    moveDescription: "A bond so strong it blooms wherever they go.",
    rarity: "✦",
    holoGradient: ["#f9a8d4", "#fde68a", "#c4b5fd", "#f9a8d4"],
    canvas: {
      background: "#fbcfe8",
      border: "#db2777",
      photoBorder: "#fde68a",
      text: "#500724",
      mutedText: "#9d174d",
      accent: "#db2777",
    },
  },
  {
    kind: "card",
    id: "cosmic-vow",
    name: "Cosmic Vow",
    subtitle: "A promise written in the stars.",
    brand: "AmoreFrame",
    palette: ["#1e1b4b", "#4c1d95", "#7dd3fc", "#f5d0fe"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#312e81_0%,#1e1b4b_45%,#0b0620_100%)]",
    outerBorderClass: "border-indigo-400/50",
    photoFrameClass: "border-indigo-200/25 shadow-[0_16px_36px_rgba(0,0,0,0.4)]",
    titleClass: "text-indigo-100",
    subtitleClass: "text-purple-300",
    typeLabel: "Psychic",
    hp: 200,
    moveName: "Starbound Promise",
    moveDamage: 140,
    moveDescription: "Written across galaxies, made real right here.",
    rarity: "☾",
    holoGradient: ["#7dd3fc", "#c4b5fd", "#f5d0fe", "#7dd3fc"],
    canvas: {
      background: "#1e1b4b",
      border: "#818cf8",
      photoBorder: "#c4b5fd",
      text: "#ede9fe",
      mutedText: "#c4b5fd",
      accent: "#a5b4fc",
    },
  },
]

const ALL_DESIGNS: DesignOption[] = [...STRIP_DESIGNS, ...CARD_DESIGNS]

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
  const [activeTab, setActiveTab] = useState<"strips" | "cards">("strips")
  const [selectedDesignId, setSelectedDesignId] = useState("noir-date")
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [stickers, setStickers] = useState<StickerMap>({})
  const [selectedFilterId, setSelectedFilterId] = useState("original")
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStepIndex, setWizardStepIndex] = useState(0)

  const hasAutoOpened = useRef(false)

  const selectedDesign =
    ALL_DESIGNS.find((design) => design.id === selectedDesignId) ??
    ALL_DESIGNS[0]

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

  useEffect(() => {
    if (!loading && photos.length > 0 && !hasAutoOpened.current) {
      hasAutoOpened.current = true
      setWizardOpen(true)
      setWizardStepIndex(0)
    }
  }, [loading, photos])

  const previewPhotos = useMemo(() => photos.slice(0, MAX_PHOTOS), [photos])

  const filledStickerCount = STICKER_SLOTS.filter(
    (slot) => stickers[slot]
  ).length

  function retakePhotos() {
    sessionStorage.removeItem(STORAGE_KEY)
    window.location.href = "/booth/single"
  }

  function openWizardAt(stepId: WizardStep) {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId)
    setWizardStepIndex(index === -1 ? 0 : index)
    setWizardOpen(true)
  }

  function addSticker(emoji: string) {
    setStickers((current) => {
      const nextSlot = STICKER_SLOTS.find((slot) => !current[slot])
      if (!nextSlot) return current
      return { ...current, [nextSlot]: emoji }
    })
  }

  function removeSticker(slot: StickerSlot) {
    setStickers((current) => {
      const updated = { ...current }
      delete updated[slot]
      return updated
    })
  }

  async function handleDownload() {
    if (previewPhotos.length === 0 || isDownloading) return

    try {
      setIsDownloading(true)

      const canvas = document.createElement("canvas")

      if (selectedDesign.kind === "strip") {
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
          stickers,
        })
      } else {
        canvas.width = CARD_WIDTH
        canvas.height = CARD_HEIGHT

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const photo = previewPhotos[selectedPhotoIndex] ?? previewPhotos[0]

        await drawCard({
          ctx,
          photo,
          design: selectedDesign,
          filter: selectedFilter,
          caption,
          stickers,
        })
      }

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `amoreframe-${selectedDesign.id}-${selectedFilter.id}-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error("Download error:", error)
      alert("We could not download your memory. Please try again.")
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

  const captionLabel = selectedDesign.kind === "card" ? "Card name" : "Caption"
  const stickerSummary =
    filledStickerCount === 0
      ? "None yet"
      : `${filledStickerCount} added`

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>

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
                    Memory Booth
                  </p>
                  <p className="text-xs text-amoura-muted">
                    Design → Sticker → Filter → Caption → Download
                  </p>
                </div>
              </div>
            </header>

            <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(230px,0.68fr)_minmax(360px,1fr)]">
              <section className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-3 backdrop-blur-xl sm:p-5">
                <div className="flex h-[500px] items-center justify-center sm:h-[590px] lg:h-[calc(100vh-9.75rem)] lg:min-h-[520px] lg:max-h-[680px]">
                  <div
                    key={`${selectedDesignId}-${selectedFilterId}-${caption}-${JSON.stringify(
                      stickers
                    )}-${selectedPhotoIndex}`}
                    className="animate-fadeIn flex h-full w-full items-center justify-center"
                  >
                    {selectedDesign.kind === "strip" ? (
                      <StripPreview
                        photos={previewPhotos}
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={caption}
                        stickers={stickers}
                        onRemoveSticker={removeSticker}
                      />
                    ) : (
                      <CardPreview
                        photo={
                          previewPhotos[selectedPhotoIndex] ??
                          previewPhotos[0]
                        }
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={caption}
                        stickers={stickers}
                        onRemoveSticker={removeSticker}
                      />
                    )}
                  </div>
                </div>
              </section>

              <aside className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 lg:max-h-[calc(100vh-9.75rem)] lg:overflow-y-auto">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-amoura-red-soft">
                    Virtual Memory Booth
                  </p>
                  <h1 className="amoura-serif mt-3 text-3xl leading-none text-amoura-cream sm:text-4xl">
                    Your memory, your way.
                  </h1>
                  <p className="mt-3 text-sm text-amoura-muted">
                    Design, sticker, filter, and caption it — one guided step
                    at a time.
                  </p>
                </div>

                <button
                  onClick={() => openWizardAt("design")}
                  className="amoura-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold"
                >
                  <Wand2 className="h-4 w-4" />
                  Customize Your Memory
                </button>

                <div className="mt-6 grid gap-3 rounded-2xl border border-amoura-red-soft/15 bg-black/25 p-4">
                  <SummaryRow
                    label="Design"
                    value={selectedDesign.name}
                    onEdit={() => openWizardAt("design")}
                  />
                  <SummaryRow
                    label="Stickers"
                    value={stickerSummary}
                    onEdit={() => openWizardAt("stickers")}
                  />
                  <SummaryRow
                    label="Filter"
                    value={selectedFilter.name}
                    onEdit={() => openWizardAt("filters")}
                  />
                  <SummaryRow
                    label={captionLabel}
                    value={caption || "Not set"}
                    onEdit={() => openWizardAt("caption")}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </button>

                  <button
                    onClick={retakePhotos}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3.5 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Retake
                  </button>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </main>

      {wizardOpen ? (
        <WizardModal
          photos={previewPhotos}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDesign={selectedDesign}
          selectedDesignId={selectedDesignId}
          setSelectedDesignId={setSelectedDesignId}
          selectedPhotoIndex={selectedPhotoIndex}
          setSelectedPhotoIndex={setSelectedPhotoIndex}
          stickers={stickers}
          onAddSticker={addSticker}
          onRemoveSticker={removeSticker}
          selectedFilter={selectedFilter}
          selectedFilterId={selectedFilterId}
          setSelectedFilterId={setSelectedFilterId}
          caption={caption}
          setCaption={setCaption}
          stepIndex={wizardStepIndex}
          setStepIndex={setWizardStepIndex}
          onClose={() => setWizardOpen(false)}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          onRetake={retakePhotos}
        />
      ) : null}
    </>
  )
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-amoura-muted">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-amoura-cream">
          {value}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 rounded-full border border-white/10 p-1.5 text-amoura-muted transition hover:text-amoura-cream"
        aria-label={`Edit ${label}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function tabClass(active: boolean) {
  return `inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
    active
      ? "bg-amoura-red-soft text-black"
      : "text-amoura-muted hover:text-amoura-cream"
  }`
}

function WizardModal({
  photos,
  activeTab,
  setActiveTab,
  selectedDesign,
  selectedDesignId,
  setSelectedDesignId,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  stickers,
  onAddSticker,
  onRemoveSticker,
  selectedFilter,
  selectedFilterId,
  setSelectedFilterId,
  caption,
  setCaption,
  stepIndex,
  setStepIndex,
  onClose,
  onDownload,
  isDownloading,
  onRetake,
}: {
  photos: string[]
  activeTab: "strips" | "cards"
  setActiveTab: (tab: "strips" | "cards") => void
  selectedDesign: DesignOption
  selectedDesignId: string
  setSelectedDesignId: (id: string) => void
  selectedPhotoIndex: number
  setSelectedPhotoIndex: (index: number) => void
  stickers: StickerMap
  onAddSticker: (emoji: string) => void
  onRemoveSticker: (slot: StickerSlot) => void
  selectedFilter: FilterOption
  selectedFilterId: string
  setSelectedFilterId: (id: string) => void
  caption: string
  setCaption: (value: string) => void
  stepIndex: number
  setStepIndex: (updater: number | ((current: number) => number)) => void
  onClose: () => void
  onDownload: () => void
  isDownloading: boolean
  onRetake: () => void
}) {
  const step = WIZARD_STEPS[stepIndex].id
  const isFirst = stepIndex === 0
  const isBeforeLast = stepIndex === WIZARD_STEPS.length - 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4">
      <div className="animate-scaleIn flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-[#0b0608] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 pb-4 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
              Virtual Memory Booth
            </p>
            <h3 className="amoura-serif mt-1 text-2xl text-amoura-cream">
              {STEP_TITLES[step]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 p-2 text-amoura-muted transition hover:text-amoura-cream"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 py-3">
          {WIZARD_STEPS.map((wizardStep, index) => (
            <button
              key={wizardStep.id}
              onClick={() => setStepIndex(index)}
              aria-label={`Go to ${wizardStep.label}`}
              className={`h-1.5 rounded-full transition-all ${
                index === stepIndex
                  ? "w-6 bg-amoura-red-soft"
                  : index < stepIndex
                    ? "w-1.5 bg-amoura-red-soft/50"
                    : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {step !== "download" && (
            <div
              key={`${selectedDesignId}-${selectedFilterId}-${selectedPhotoIndex}-${caption}-${JSON.stringify(
                stickers
              )}`}
              className="animate-fadeIn mb-5 flex h-40 items-center justify-center sm:h-48"
            >
              {selectedDesign.kind === "strip" ? (
                <StripPreview
                  photos={photos}
                  design={selectedDesign}
                  filter={selectedFilter}
                  caption={caption}
                  stickers={stickers}
                  onRemoveSticker={onRemoveSticker}
                />
              ) : (
                <CardPreview
                  photo={photos[selectedPhotoIndex] ?? photos[0]}
                  design={selectedDesign}
                  filter={selectedFilter}
                  caption={caption}
                  stickers={stickers}
                  onRemoveSticker={onRemoveSticker}
                />
              )}
            </div>
          )}

          {step === "design" && (
            <DesignStep
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedDesignId={selectedDesignId}
              setSelectedDesignId={setSelectedDesignId}
              previewPhoto={photos[0]}
              filter={selectedFilter}
            />
          )}

          {step === "stickers" && (
            <StickerStep stickers={stickers} onAdd={onAddSticker} />
          )}

          {step === "filters" && (
            <FilterStep
              selectedFilterId={selectedFilterId}
              setSelectedFilterId={setSelectedFilterId}
            />
          )}

          {step === "caption" && (
            <CaptionStep
              kind={selectedDesign.kind}
              caption={caption}
              setCaption={setCaption}
            />
          )}

          {step === "download" && (
            <DownloadStep
              selectedDesign={selectedDesign}
              photo={photos[selectedPhotoIndex] ?? photos[0]}
              photos={photos}
              filter={selectedFilter}
              caption={caption}
              stickers={stickers}
              onRemoveSticker={onRemoveSticker}
              onDownload={onDownload}
              isDownloading={isDownloading}
              onRetake={onRetake}
              onClose={onClose}
            />
          )}
        </div>

        {step !== "download" && (
          <div
            className="flex items-center justify-between gap-3 border-t border-white/5 px-5 pt-4"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
          >
            <button
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              className={`inline-flex items-center gap-1.5 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45 ${
                isFirst ? "invisible" : ""
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={() =>
                setStepIndex((current) =>
                  Math.min(WIZARD_STEPS.length - 1, current + 1)
                )
              }
              className="amoura-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              {isBeforeLast ? "Review & Download" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DesignStep({
  activeTab,
  setActiveTab,
  selectedDesignId,
  setSelectedDesignId,
  previewPhoto,
  filter,
}: {
  activeTab: "strips" | "cards"
  setActiveTab: (tab: "strips" | "cards") => void
  selectedDesignId: string
  setSelectedDesignId: (id: string) => void
  previewPhoto?: string
  filter: FilterOption
}) {
  const list: DesignOption[] = activeTab === "strips" ? STRIP_DESIGNS : CARD_DESIGNS

  return (
    <div>
      <div className="mb-4 inline-flex w-full items-center gap-1 rounded-full border border-amoura-red-soft/15 bg-black/25 p-1">
        <button onClick={() => setActiveTab("strips")} className={tabClass(activeTab === "strips")}>
          <Rows3 className="h-4 w-4" />
          Strips
        </button>
        <button onClick={() => setActiveTab("cards")} className={tabClass(activeTab === "cards")}>
          <Sparkles className="h-4 w-4" />
          Cards
        </button>
      </div>

      <div key={activeTab} className="animate-fadeIn grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3">
        {list.map((design) => {
          const active = selectedDesignId === design.id

          return (
            <button
              key={design.id}
              onClick={() => setSelectedDesignId(design.id)}
              className={`text-left transition ${
                active ? "scale-[1.02]" : "hover:-translate-y-0.5"
              }`}
            >
              {design.kind === "strip" ? (
                <StripPoster
                  design={design}
                  photo={previewPhoto}
                  filter={filter}
                  active={active}
                />
              ) : (
                <CardPoster
                  design={design}
                  photo={previewPhoto}
                  filter={filter}
                  active={active}
                />
              )}
              <p className="mt-2 truncate text-center text-xs font-semibold text-amoura-cream">
                {design.name}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StickerStep({
  stickers,
  onAdd,
}: {
  stickers: StickerMap
  onAdd: (emoji: string) => void
}) {
  const filledCount = STICKER_SLOTS.filter((slot) => stickers[slot]).length
  const remaining = STICKER_SLOTS.length - filledCount

  return (
    <div className="pb-2">
      <p className="text-sm leading-6 text-amoura-muted">
        Tap a sticker to drop it in a corner. Tap a placed sticker on the
        preview above to remove it. {remaining} spot
        {remaining === 1 ? "" : "s"} left.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {STICKER_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAdd(emoji)}
            className="flex aspect-square items-center justify-center rounded-2xl border border-amoura-red-soft/15 bg-black/25 text-2xl transition hover:scale-105 hover:border-amoura-red-soft/40 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

function FilterStep({
  selectedFilterId,
  setSelectedFilterId,
}: {
  selectedFilterId: string
  setSelectedFilterId: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 pb-2 sm:grid-cols-3">
      {FILTERS.map((filter) => {
        const active = selectedFilterId === filter.id

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
  )
}

function CaptionStep({
  kind,
  caption,
  setCaption,
}: {
  kind: "strip" | "card"
  caption: string
  setCaption: (value: string) => void
}) {
  const placeholder =
    kind === "card" ? "e.g., Ken & Faye" : "For example: My favorite memory ♥"

  return (
    <div className="pb-2">
      <p className="text-sm leading-6 text-amoura-muted">
        {kind === "card"
          ? "Give your card a name — like a nickname for the two of you."
          : "Add a short line under your strip. Totally optional."}
      </p>

      <textarea
        value={caption}
        onChange={(event) => setCaption(event.target.value.slice(0, MAX_CAPTION))}
        maxLength={MAX_CAPTION}
        rows={3}
        placeholder={placeholder}
        className="mt-4 w-full resize-none rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-3 text-sm text-amoura-cream outline-none transition placeholder:text-amoura-muted focus:border-amoura-red-soft/45"
      />

      <div className="mt-2 text-right text-xs text-amoura-muted">
        {caption.length}/{MAX_CAPTION}
      </div>
    </div>
  )
}

function DownloadStep({
  selectedDesign,
  photo,
  photos,
  filter,
  caption,
  stickers,
  onRemoveSticker,
  onDownload,
  isDownloading,
  onRetake,
  onClose,
}: {
  selectedDesign: DesignOption
  photo?: string
  photos: string[]
  filter: FilterOption
  caption: string
  stickers: StickerMap
  onRemoveSticker: (slot: StickerSlot) => void
  onDownload: () => void
  isDownloading: boolean
  onRetake: () => void
  onClose: () => void
}) {
  return (
    <div className="pb-2 text-center">
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-amoura-red-soft/30" />
        <span
          className="animate-fadeIn absolute -top-2 -left-6 text-lg"
          style={{ animationDelay: "80ms" }}
        >
          ✨
        </span>
        <span
          className="animate-fadeIn absolute -top-1 -right-6 text-lg"
          style={{ animationDelay: "180ms" }}
        >
          🎉
        </span>
        <span
          className="animate-fadeIn absolute -bottom-2 left-1/2 -translate-x-1/2 text-base"
          style={{ animationDelay: "260ms" }}
        >
          💕
        </span>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/15">
          <PartyPopper className="h-7 w-7 text-amoura-red-soft" />
        </div>
      </div>

      <h4 className="amoura-serif text-2xl text-amoura-cream">
        Your memory is ready! 🎉
      </h4>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-amoura-muted">
        Take a look, then download it to keep forever.
      </p>

      <div className="animate-scaleIn relative mx-auto mt-5 flex h-56 items-center justify-center sm:h-64">
        {selectedDesign.kind === "strip" ? (
          <StripPreview
            photos={photos}
            design={selectedDesign}
            filter={filter}
            caption={caption}
            stickers={stickers}
            onRemoveSticker={onRemoveSticker}
          />
        ) : (
          <CardPreview
            photo={photo}
            design={selectedDesign}
            filter={filter}
            caption={caption}
            stickers={stickers}
            onRemoveSticker={onRemoveSticker}
          />
        )}
      </div>

      <div className="mt-6 grid gap-2.5">
        <button
          onClick={onDownload}
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
              Download {selectedDesign.kind === "card" ? "Card" : "Strip"}
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onRetake}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
          >
            <RefreshCcw className="h-4 w-4" />
            Retake
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3 text-sm font-semibold text-amoura-cream transition hover:border-amoura-red-soft/45"
          >
            <Check className="h-4 w-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function StickerOverlay({
  stickers,
  onRemove,
}: {
  stickers: StickerMap
  onRemove?: (slot: StickerSlot) => void
}) {
  const positions: { slot: StickerSlot; className: string }[] = [
    { slot: "topLeft", className: "left-1.5 top-1.5 sm:left-2 sm:top-2" },
    { slot: "topRight", className: "right-1.5 top-1.5 sm:right-2 sm:top-2" },
    { slot: "bottomLeft", className: "left-1.5 bottom-1.5 sm:left-2 sm:bottom-2" },
    { slot: "bottomRight", className: "right-1.5 bottom-1.5 sm:right-2 sm:bottom-2" },
  ]

  return (
    <>
      {positions.map(({ slot, className }) => {
        const emoji = stickers[slot]
        if (!emoji) return null

        return (
          <button
            key={slot}
            type="button"
            onClick={() => onRemove?.(slot)}
            className={`absolute z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-base leading-none backdrop-blur-sm transition hover:scale-110 sm:h-9 sm:w-9 sm:text-xl ${className}`}
            aria-label={`Remove ${emoji} sticker`}
          >
            {emoji}
          </button>
        )
      })}
    </>
  )
}

function StripPreview({
  photos,
  design,
  filter,
  caption,
  stickers,
  onRemoveSticker,
}: {
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  stickers: StickerMap
  onRemoveSticker?: (slot: StickerSlot) => void
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.45rem] border p-2.5 shadow-2xl sm:p-3 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <StripDecorations design={design} />
        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />

        <div className="relative z-10 shrink-0 text-center">
          <p
            className={`text-[clamp(0.82rem,0.75vw+0.5rem,1.35rem)] font-bold ${design.titleClass}`}
          >
            {design.brand}
          </p>
          <p
            className={`mt-0.5 text-[0.42rem] uppercase tracking-[0.22em] sm:text-[0.5rem] ${design.subtitleClass}`}
          >
            {design.name}
          </p>
        </div>

        <div className="relative z-10 mt-2 grid min-h-0 flex-1 grid-rows-3 gap-1.5 sm:gap-2">
          {photos.slice(0, MAX_PHOTOS).map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className={`min-h-0 overflow-hidden rounded-[0.8rem] border-[3px] bg-black/10 sm:border-[4px] ${design.photoFrameClass}`}
            >
              <img
                src={photo}
                alt={`Captured shot ${index + 1}`}
                className="h-full w-full object-cover"
                style={{ filter: filter.cssFilter, transition: "filter 300ms ease" }}
              />
            </div>
          ))}
        </div>

        {caption ? (
          <div className="relative z-10 mt-2 shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-center">
            <p
              className={`truncate text-[0.52rem] leading-3 sm:text-[0.66rem] sm:leading-4 ${design.titleClass}`}
            >
              {caption}
            </p>
          </div>
        ) : null}

        <div className={`relative z-10 mt-2 shrink-0 text-center ${design.titleClass}`}>
          <p className="text-base leading-none sm:text-lg">{design.accent}</p>
          <p
            className={`mt-0.5 text-[0.38rem] uppercase tracking-[0.16em] sm:text-[0.46rem] ${design.subtitleClass}`}
          >
            Captured with love
          </p>
        </div>
      </div>
    </div>
  )
}

function CardPreview({
  photo,
  design,
  filter,
  caption,
  stickers,
  onRemoveSticker,
}: {
  photo?: string
  design: CardDesign
  filter: FilterOption
  caption: string
  stickers: StickerMap
  onRemoveSticker?: (slot: StickerSlot) => void
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.75rem] border-[3px] p-3 shadow-2xl sm:p-4 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(", ")})`,
          }}
        />

        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />

        <div className="relative z-10 flex items-center justify-between">
          <span
            className={`rounded-full border px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wide sm:text-[0.62rem] ${design.subtitleClass}`}
          >
            {design.typeLabel}
          </span>
          <span className={`text-sm font-bold sm:text-base ${design.titleClass}`}>
            {design.hp} HP
          </span>
        </div>

        <p
          className={`relative z-10 mt-2 text-center text-[clamp(1rem,1.6vw+0.6rem,1.6rem)] font-bold ${design.titleClass}`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {caption || "Two Hearts"}
        </p>

        <div
          className={`relative z-10 mt-2 min-h-0 flex-1 overflow-hidden rounded-[1rem] border-[3px] bg-black/10 sm:border-[4px] ${design.photoFrameClass}`}
        >
          {photo ? (
            <img
              src={photo}
              alt="Selected shot"
              className="h-full w-full object-cover"
              style={{ filter: filter.cssFilter, transition: "filter 300ms ease" }}
            />
          ) : null}
        </div>

        <div className="relative z-10 mt-2 shrink-0 rounded-xl border border-white/10 bg-black/15 px-3 py-2">
          <div className="flex items-center justify-between">
            <p className={`text-[0.6rem] font-bold sm:text-xs ${design.titleClass}`}>
              {design.moveName}
            </p>
            <p className={`text-[0.6rem] font-bold sm:text-xs ${design.titleClass}`}>
              {design.moveDamage}
            </p>
          </div>
          <p
            className={`mt-1 truncate text-[0.5rem] italic leading-3 sm:text-[0.58rem] ${design.subtitleClass}`}
          >
            {design.moveDescription}
          </p>
        </div>

        <div className={`relative z-10 mt-2 shrink-0 text-center ${design.titleClass}`}>
          <p className="text-sm leading-none sm:text-base">
            {design.rarity} {design.rarity} {design.rarity}
          </p>
        </div>
      </div>
    </div>
  )
}

function StripPoster({
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
        <p className={`text-[10px] font-bold ${design.titleClass}`}>{design.brand}</p>
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

function CardPoster({
  design,
  photo,
  filter,
  active,
}: {
  design: CardDesign
  photo?: string
  filter: FilterOption
  active: boolean
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[170px] overflow-hidden rounded-[1.2rem] border-[2.5px] p-2.5 transition ${design.backgroundClass} ${
        active
          ? "border-amoura-red-soft shadow-[0_0_35px_rgba(194,31,58,0.2)]"
          : design.outerBorderClass
      }`}
      style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] mix-blend-overlay"
        style={{ backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(", ")})` }}
      />

      {active ? (
        <div className="absolute right-2 top-2 z-20 rounded-full border border-amoura-red-soft/40 bg-black/40 p-1 text-amoura-red-soft backdrop-blur">
          <Check className="h-3.5 w-3.5" />
        </div>
      ) : null}

      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[8px] font-bold uppercase ${design.subtitleClass}`}>
          {design.typeLabel}
        </span>
        <span className={`text-[9px] font-bold ${design.titleClass}`}>{design.hp} HP</span>
      </div>

      <div className={`relative z-10 mt-1.5 overflow-hidden rounded-md border-[2px] ${design.photoFrameClass}`}>
        {photo ? (
          <img
            src={photo}
            alt=""
            className="aspect-[4/5] w-full object-cover"
            style={{ filter: filter.cssFilter }}
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-black/10" />
        )}
      </div>

      <div className="relative z-10 mt-1.5 text-center">
        <p className={`text-[9px] ${design.titleClass}`}>{design.rarity}</p>
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

  if (
    design.canvas.decoration === "romance" ||
    design.canvas.decoration === "kawaii"
  ) {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">♥</span>
        <span className="absolute right-3 top-3">♥</span>
        <span className="absolute left-3 bottom-3">♡</span>
        <span className="absolute right-3 bottom-3">♡</span>
      </div>
    )
  }

  if (
    design.canvas.decoration === "midnight" ||
    design.canvas.decoration === "noir"
  ) {
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

async function drawStrip({
  ctx,
  photos,
  design,
  filter,
  caption,
  stickers,
}: {
  ctx: CanvasRenderingContext2D
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  stickers: StickerMap
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
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 76)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 110)

  let y = TOP_PADDING

  for (let index = 0; index < photos.length; index += 1) {
    const image = await loadImage(photos[index])
    const x = (STRIP_WIDTH - PHOTO_WIDTH) / 2

    drawPhotoFrame(ctx, x, y, PHOTO_WIDTH, PHOTO_HEIGHT, design.canvas.photoBorder)
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
    ctx.fillText(caption, STRIP_WIDTH / 2, STRIP_HEIGHT - 100)
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 42px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 42)

  drawStickers(ctx, stickers, STRIP_WIDTH, STRIP_HEIGHT, 46, 64)
}

async function drawCard({
  ctx,
  photo,
  design,
  filter,
  caption,
  stickers,
}: {
  ctx: CanvasRenderingContext2D
  photo: string
  design: CardDesign
  filter: FilterOption
  caption: string
  stickers: StickerMap
}) {
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 48, design.canvas.background)

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  design.holoGradient.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(design.holoGradient.length - 1, 1), color)
  })

  ctx.save()
  ctx.globalAlpha = 0.16
  roundedPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 48)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.restore()

  drawBorder(ctx, 20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40, 38, design.canvas.border, 10)
  drawBorder(ctx, 32, 32, CARD_WIDTH - 64, CARD_HEIGHT - 64, 30, design.canvas.accent, 2)

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.fillText(design.typeLabel.toUpperCase(), 64, 90)

  ctx.textAlign = "right"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 40px Georgia, serif"
  ctx.fillText(`${design.hp} HP`, CARD_WIDTH - 64, 92)

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 52px Georgia, serif"
  ctx.fillText(caption || "Two Hearts", CARD_WIDTH / 2, 150)

  const photoX = 64
  const photoY = 190
  const photoW = CARD_WIDTH - 128
  const photoH = 600

  drawPhotoFrame(ctx, photoX, photoY, photoW, photoH, design.canvas.photoBorder)
  const image = await loadImage(photo)
  drawImageCover(
    ctx,
    image,
    photoX + 14,
    photoY + 14,
    photoW - 28,
    photoH - 28,
    filter.canvasFilter
  )

  const moveY = photoY + photoH + 30
  const moveH = 200

  ctx.save()
  ctx.globalAlpha = 0.14
  drawRoundedRect(ctx, 64, moveY, CARD_WIDTH - 128, moveH, 24, "#000000")
  ctx.restore()

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 30px Arial, sans-serif"
  ctx.fillText(design.moveName, 90, moveY + 46)

  ctx.textAlign = "right"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 34px Georgia, serif"
  ctx.fillText(`${design.moveDamage}`, CARD_WIDTH - 90, moveY + 46)

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "italic 22px Arial, sans-serif"
  wrapCanvasText(ctx, design.moveDescription, 90, moveY + 84, CARD_WIDTH - 180, 30, 3)

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "34px Georgia, serif"
  ctx.fillText(`${design.rarity}  ${design.rarity}  ${design.rarity}`, CARD_WIDTH / 2, CARD_HEIGHT - 60)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "16px Arial, sans-serif"
  ctx.fillText("AmoreFrame · Captured with love", CARD_WIDTH / 2, CARD_HEIGHT - 30)

  drawStickers(ctx, stickers, CARD_WIDTH, CARD_HEIGHT, 46, 60)
}

function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: StickerMap,
  width: number,
  height: number,
  inset: number,
  fontSize: number
) {
  ctx.save()
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
  ctx.textBaseline = "middle"

  if (stickers.topLeft) {
    ctx.textAlign = "left"
    ctx.fillText(stickers.topLeft, inset, inset + fontSize / 2)
  }

  if (stickers.topRight) {
    ctx.textAlign = "right"
    ctx.fillText(stickers.topRight, width - inset, inset + fontSize / 2)
  }

  if (stickers.bottomLeft) {
    ctx.textAlign = "left"
    ctx.fillText(stickers.bottomLeft, inset, height - inset - fontSize / 2)
  }

  if (stickers.bottomRight) {
    ctx.textAlign = "right"
    ctx.fillText(stickers.bottomRight, width - inset, height - inset - fontSize / 2)
  }

  ctx.restore()
}

function drawCanvasDecorations(
  ctx: CanvasRenderingContext2D,
  design: StripDesign
) {
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
  photoBorderColor: string
) {
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.25)"
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  drawRoundedRect(ctx, x, y, width, height, 28, photoBorderColor)
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

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
) {
  const words = text.split(" ")
  let line = ""
  let lines: string[] = []

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const { width } = ctx.measureText(testLine)

    if (width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }

  if (line) lines.push(line)
  lines = lines.slice(0, maxLines)

  lines.forEach((textLine, index) => {
    ctx.fillText(textLine, x, y + index * lineHeight)
  })

  return lines.length
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