"use client"

import Link from "next/link"
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
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

type DesignCategoryId =
  | "trending"
  | "romance"
  | "aesthetic"
  | "cute"
  | "gaming"
  | "movies"
  | "nature"
  | "retro"
  | "seasonal"
  | "premium"

type DesignBadge = "NEW" | "LIMITED" | "TRENDING"

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
  categories: DesignCategoryId[]
  collection: string
  badge?: DesignBadge
}

type StripDecoration =
  | "noir"
  | "romance"
  | "vintage"
  | "barkada"
  | "white"
  | "midnight"
  | "kawaii"
  | "retro"
  | "pixel"
  | "arcade"
  | "sakura"
  | "festival"
  | "moonlight"
  | "ocean"
  | "sky"
  | "christmas"
  | "halloween"
  | "graduation"
  | "summer"
  | "valentine"

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
    decoration: StripDecoration
  }
}

type CardDesign = BaseDesign & {
  kind: "card"
  typeLabel: string
  typeIcon: string
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
type StickerPackId =
  | "none"
  | "hearts"
  | "flowers"
  | "sparkles"
  | "cute"
  | "gaming"
  | "retro"
  | "space"
  | "food"

type StickerPack = {
  id: StickerPackId
  name: string
  subtitle: string
  stickers: StickerMap
}

type CaptionPosition = "top" | "bottom" | "hidden"
type DateStampMode = "none" | "date" | "date-time" | "date-time-brand"
type DateStyle = "long" | "numeric"
type FilmNumberMode = "none" | "frame" | "roll" | "serial"
type WizardStep = "design" | "stickers" | "filters" | "caption" | "download"

const STORAGE_KEY = "amoreframe_single_photos"
const MAX_PHOTOS = 3
const MAX_CAPTION = 50

const STRIP_WIDTH = 900
const PHOTO_WIDTH = 760
const PHOTO_HEIGHT = 560
const STRIP_GAP = 30
const STRIP_HEIGHT = 2200

const CARD_WIDTH = 760
const CARD_HEIGHT = 1120

const STICKER_SLOTS: StickerSlot[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
]

const DESIGN_CATEGORIES: {
  id: DesignCategoryId
  label: string
  emoji: string
}[] = [
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "romance", label: "Romance", emoji: "❤️" },
  { id: "aesthetic", label: "Aesthetic", emoji: "✨" },
  { id: "cute", label: "Cute", emoji: "🎀" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "movies", label: "Movies", emoji: "🎬" },
  { id: "nature", label: "Nature", emoji: "🌸" },
  { id: "retro", label: "Retro", emoji: "📼" },
  { id: "seasonal", label: "Seasonal", emoji: "🎄" },
  { id: "premium", label: "Premium", emoji: "⭐" },
]

const STICKER_PACKS: StickerPack[] = [
  {
    id: "none",
    name: "None",
    subtitle: "Clean and minimal",
    stickers: {},
  },
  {
    id: "hearts",
    name: "Hearts",
    subtitle: "Soft romantic accents",
    stickers: {
      topLeft: "❤️",
      topRight: "💕",
      bottomLeft: "💗",
      bottomRight: "💖",
    },
  },
  {
    id: "flowers",
    name: "Flowers",
    subtitle: "Fresh floral corners",
    stickers: {
      topLeft: "🌸",
      topRight: "🌷",
      bottomLeft: "🌼",
      bottomRight: "🌺",
    },
  },
  {
    id: "sparkles",
    name: "Sparkles",
    subtitle: "A subtle glow",
    stickers: {
      topLeft: "✨",
      topRight: "⭐",
      bottomLeft: "✦",
      bottomRight: "💫",
    },
  },
  {
    id: "cute",
    name: "Cute",
    subtitle: "Sweet diary energy",
    stickers: {
      topLeft: "🎀",
      topRight: "🧸",
      bottomLeft: "☁️",
      bottomRight: "🍓",
    },
  },
  {
    id: "gaming",
    name: "Gaming",
    subtitle: "Original arcade energy",
    stickers: {
      topLeft: "🎮",
      topRight: "🕹️",
      bottomLeft: "💥",
      bottomRight: "🏆",
    },
  },
  {
    id: "retro",
    name: "Retro",
    subtitle: "Analog and nostalgic",
    stickers: {
      topLeft: "📼",
      topRight: "📻",
      bottomLeft: "📺",
      bottomRight: "💿",
    },
  },
  {
    id: "space",
    name: "Space",
    subtitle: "Dreamy cosmic details",
    stickers: {
      topLeft: "🌙",
      topRight: "🪐",
      bottomLeft: "🚀",
      bottomRight: "🌌",
    },
  },
  {
    id: "food",
    name: "Food",
    subtitle: "Playful snack mood",
    stickers: {
      topLeft: "🍓",
      topRight: "🍰",
      bottomLeft: "🍒",
      bottomRight: "🧋",
    },
  },
]

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "stickers", label: "Stickers" },
  { id: "filters", label: "Filters" },
  { id: "caption", label: "Details" },
  { id: "download", label: "Ready" },
]

const STEP_TITLES: Record<WizardStep, string> = {
  design: "Pick your design",
  stickers: "Choose a sticker pack",
  filters: "Choose a filter",
  caption: "Add the finishing details",
  download: "Your memory is ready",
}
{/*Strip Designs*/}
const STRIP_DESIGNS: StripDesign[] = [
  {
    kind: "strip",
    id: "noir-date",
    name: "Noir Date",
    subtitle: "Cinematic, bold, and classic.",
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
    categories: ["trending", "romance", "movies", "premium"],
    collection: "Signature Collection",
    badge: "TRENDING",
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
    categories: ["romance", "aesthetic", "trending"],
    collection: "Romance Collection",
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
    subtitle: "Timeless grain and analog nostalgia.",
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
    categories: ["retro", "aesthetic", "movies"],
    collection: "Analog Collection",
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
    categories: ["cute", "trending", "aesthetic"],
    collection: "Playful Collection",
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
    subtitle: "Clean, minimal, and elegant.",
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
    categories: ["aesthetic", "premium", "romance"],
    collection: "Signature Collection",
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
    subtitle: "Dark, luxe, and made for night shots.",
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
    categories: ["premium", "movies", "romance"],
    collection: "Luxe Collection",
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
    subtitle: "Soft, sweet, and sticker-diary inspired.",
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
    categories: ["cute", "romance", "aesthetic"],
    collection: "Cute Collection",
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
    subtitle: "Bright, funky, and full of energy.",
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
    categories: ["retro", "cute", "trending"],
    collection: "Retro Collection",
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
    categories: ["nature", "aesthetic", "movies"],
    collection: "Nature Collection",
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
    photoFrameClass:
      "border-white shadow-[0_14px_32px_rgba(2,119,189,0.16)]",
    titleClass: "text-sky-950",
    subtitleClass: "text-sky-600",
    categories: ["nature", "aesthetic", "premium"],
    collection: "Nature Collection",
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
    subtitle: "Soft petals and a springtime feel.",
    brand: "AmoreFrame",
    accent: "❀",
    palette: ["#ffe3ec", "#ffb6c9", "#c9e4b5", "#fff9f2"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff0f4_0%,#ffe3ec_45%,#f4f9ec_100%)]",
    outerBorderClass: "border-rose-200/80",
    photoFrameClass:
      "border-white shadow-[0_12px_28px_rgba(255,182,201,0.3)]",
    titleClass: "text-rose-800",
    subtitleClass: "text-rose-500",
    categories: ["nature", "cute", "aesthetic"],
    collection: "Nature Collection",
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
  {
    kind: "strip",
    id: "pixel-adventure",
    name: "Pixel Adventure",
    subtitle: "A bright quest built from tiny memories.",
    brand: "AmoreFrame",
    accent: "◆",
    palette: ["#120b2d", "#7c3aed", "#22d3ee", "#facc15"],
    backgroundClass:
      "bg-[linear-gradient(145deg,#120b2d_0%,#27125e_48%,#0f766e_100%)]",
    outerBorderClass: "border-cyan-300/55",
    photoFrameClass:
      "border-cyan-200/35 shadow-[0_0_26px_rgba(34,211,238,0.22)]",
    titleClass: "text-cyan-50",
    subtitleClass: "text-cyan-200",
    categories: ["gaming", "retro", "trending"],
    collection: "Gaming Collection",
    badge: "NEW",
    canvas: {
      background: "#120b2d",
      border: "#22d3ee",
      photoBorder: "#7c3aed",
      text: "#ecfeff",
      mutedText: "#a5f3fc",
      accent: "#facc15",
      decoration: "pixel",
    },
  },
  {
    kind: "strip",
    id: "retro-arcade",
    name: "Retro Arcade",
    subtitle: "Neon scores and after-school energy.",
    brand: "AmoreFrame",
    accent: "▲",
    palette: ["#09090b", "#ec4899", "#22d3ee", "#a3e635"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#3b0764_0%,#09090b_56%,#052e16_100%)]",
    outerBorderClass: "border-fuchsia-400/55",
    photoFrameClass:
      "border-lime-300/30 shadow-[0_0_30px_rgba(236,72,153,0.24)]",
    titleClass: "text-fuchsia-100",
    subtitleClass: "text-cyan-200",
    categories: ["gaming", "retro", "movies"],
    collection: "Gaming Collection",
    canvas: {
      background: "#09090b",
      border: "#ec4899",
      photoBorder: "#22d3ee",
      text: "#fdf4ff",
      mutedText: "#a5f3fc",
      accent: "#a3e635",
      decoration: "arcade",
    },
  },
  {
    kind: "strip",
    id: "sakura-dream",
    name: "Sakura Dream",
    subtitle: "An original pastel story under falling petals.",
    brand: "AmoreFrame",
    accent: "✿",
    palette: ["#fff1f7", "#f9a8d4", "#c4b5fd", "#86efac"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff1f7_0%,#fce7f3_42%,#ede9fe_100%)]",
    outerBorderClass: "border-pink-300/65",
    photoFrameClass:
      "border-white shadow-[0_14px_34px_rgba(244,114,182,0.2)]",
    titleClass: "text-fuchsia-950",
    subtitleClass: "text-fuchsia-600",
    categories: ["aesthetic", "cute", "nature", "trending"],
    collection: "Anime Collection",
    badge: "TRENDING",
    canvas: {
      background: "#fff1f7",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#701a75",
      mutedText: "#c026d3",
      accent: "#f472b6",
      decoration: "sakura",
    },
  },
  {
    kind: "strip",
    id: "festival-night",
    name: "Festival Night",
    subtitle: "Lantern light and warm evening color.",
    brand: "AmoreFrame",
    accent: "✦",
    palette: ["#190b2d", "#7c2d12", "#f59e0b", "#fb7185"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#4c1d95_0%,#1f102f_48%,#12070d_100%)]",
    outerBorderClass: "border-orange-300/45",
    photoFrameClass:
      "border-amber-200/25 shadow-[0_16px_38px_rgba(245,158,11,0.18)]",
    titleClass: "text-amber-50",
    subtitleClass: "text-orange-200",
    categories: ["movies", "aesthetic", "romance"],
    collection: "Anime Collection",
    canvas: {
      background: "#1f102f",
      border: "#f59e0b",
      photoBorder: "#fb7185",
      text: "#fffbeb",
      mutedText: "#fed7aa",
      accent: "#f59e0b",
      decoration: "festival",
    },
  },
  {
    kind: "strip",
    id: "moonlight-letter",
    name: "Moonlight",
    subtitle: "Quiet blue light and soft star details.",
    brand: "AmoreFrame",
    accent: "☾",
    palette: ["#0f172a", "#312e81", "#818cf8", "#e0e7ff"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_52%,#020617_100%)]",
    outerBorderClass: "border-indigo-300/45",
    photoFrameClass:
      "border-indigo-100/20 shadow-[0_16px_40px_rgba(49,46,129,0.35)]",
    titleClass: "text-indigo-50",
    subtitleClass: "text-indigo-200",
    categories: ["aesthetic", "premium", "movies"],
    collection: "Anime Collection",
    canvas: {
      background: "#0f172a",
      border: "#818cf8",
      photoBorder: "#c7d2fe",
      text: "#eef2ff",
      mutedText: "#c7d2fe",
      accent: "#a5b4fc",
      decoration: "moonlight",
    },
  },
  {
    kind: "strip",
    id: "ocean-spirit",
    name: "Ocean Spirit",
    subtitle: "Flowing blues with a calm illustrated mood.",
    brand: "AmoreFrame",
    accent: "≈",
    palette: ["#ecfeff", "#67e8f9", "#0284c7", "#164e63"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#ecfeff_0%,#bae6fd_38%,#0e7490_100%)]",
    outerBorderClass: "border-cyan-200/70",
    photoFrameClass:
      "border-white/85 shadow-[0_16px_36px_rgba(14,116,144,0.22)]",
    titleClass: "text-cyan-950",
    subtitleClass: "text-cyan-800",
    categories: ["nature", "aesthetic", "premium"],
    collection: "Anime Collection",
    canvas: {
      background: "#cffafe",
      border: "#0891b2",
      photoBorder: "#ffffff",
      text: "#164e63",
      mutedText: "#0e7490",
      accent: "#0284c7",
      decoration: "ocean",
    },
  },
  {
    kind: "strip",
    id: "magical-sky",
    name: "Magical Sky",
    subtitle: "Pastel clouds and a dreamy twilight glow.",
    brand: "AmoreFrame",
    accent: "✧",
    palette: ["#f5d0fe", "#c4b5fd", "#93c5fd", "#fef3c7"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#f5d0fe_0%,#c4b5fd_48%,#93c5fd_100%)]",
    outerBorderClass: "border-purple-200/70",
    photoFrameClass:
      "border-white/80 shadow-[0_14px_32px_rgba(124,58,237,0.18)]",
    titleClass: "text-indigo-950",
    subtitleClass: "text-indigo-700",
    categories: ["cute", "aesthetic", "nature"],
    collection: "Anime Collection",
    canvas: {
      background: "#ddd6fe",
      border: "#8b5cf6",
      photoBorder: "#ffffff",
      text: "#312e81",
      mutedText: "#5b21b6",
      accent: "#f59e0b",
      decoration: "sky",
    },
  },
  {
    kind: "strip",
    id: "valentine-limited",
    name: "Valentine Note",
    subtitle: "A limited love-letter edition.",
    brand: "AmoreFrame",
    accent: "♥",
    palette: ["#fff1f2", "#fda4af", "#e11d48", "#7f1d1d"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#fff1f2_0%,#fecdd3_50%,#fb7185_100%)]",
    outerBorderClass: "border-rose-300/75",
    photoFrameClass:
      "border-white shadow-[0_14px_32px_rgba(225,29,72,0.22)]",
    titleClass: "text-rose-950",
    subtitleClass: "text-rose-700",
    categories: ["seasonal", "romance", "cute"],
    collection: "Seasonal Collection",
    badge: "LIMITED",
    canvas: {
      background: "#ffe4e6",
      border: "#e11d48",
      photoBorder: "#ffffff",
      text: "#881337",
      mutedText: "#be123c",
      accent: "#e11d48",
      decoration: "valentine",
    },
  },
  {
    kind: "strip",
    id: "graduation-glow",
    name: "Graduation Glow",
    subtitle: "A polished frame for the big milestone.",
    brand: "AmoreFrame",
    accent: "★",
    palette: ["#111827", "#1d4ed8", "#fbbf24", "#f9fafb"],
    backgroundClass:
      "bg-[linear-gradient(145deg,#111827_0%,#172554_58%,#1d4ed8_100%)]",
    outerBorderClass: "border-amber-300/55",
    photoFrameClass:
      "border-amber-200/30 shadow-[0_16px_36px_rgba(251,191,36,0.2)]",
    titleClass: "text-amber-50",
    subtitleClass: "text-amber-200",
    categories: ["seasonal", "premium", "trending"],
    collection: "Seasonal Collection",
    badge: "NEW",
    canvas: {
      background: "#111827",
      border: "#fbbf24",
      photoBorder: "#1d4ed8",
      text: "#fffbeb",
      mutedText: "#fde68a",
      accent: "#fbbf24",
      decoration: "graduation",
    },
  },
  {
    kind: "strip",
    id: "summer-postcard",
    name: "Summer Postcard",
    subtitle: "Sun, sea, and bright vacation color.",
    brand: "AmoreFrame",
    accent: "☀",
    palette: ["#fef3c7", "#fb923c", "#38bdf8", "#14b8a6"],
    backgroundClass:
      "bg-[linear-gradient(to_bottom,#fef3c7_0%,#fdba74_42%,#7dd3fc_100%)]",
    outerBorderClass: "border-orange-200/75",
    photoFrameClass:
      "border-white shadow-[0_14px_34px_rgba(14,165,233,0.18)]",
    titleClass: "text-sky-950",
    subtitleClass: "text-orange-800",
    categories: ["seasonal", "nature", "retro"],
    collection: "Seasonal Collection",
    badge: "LIMITED",
    canvas: {
      background: "#fed7aa",
      border: "#f97316",
      photoBorder: "#ffffff",
      text: "#0c4a6e",
      mutedText: "#c2410c",
      accent: "#0284c7",
      decoration: "summer",
    },
  },
  {
    kind: "strip",
    id: "halloween-afterglow",
    name: "Halloween Afterglow",
    subtitle: "Moody orange light with playful spooky details.",
    brand: "AmoreFrame",
    accent: "☾",
    palette: ["#09090b", "#581c87", "#f97316", "#facc15"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#581c87_0%,#18181b_52%,#09090b_100%)]",
    outerBorderClass: "border-orange-400/55",
    photoFrameClass:
      "border-purple-300/25 shadow-[0_16px_38px_rgba(249,115,22,0.2)]",
    titleClass: "text-orange-50",
    subtitleClass: "text-orange-200",
    categories: ["seasonal", "movies", "cute"],
    collection: "Seasonal Collection",
    badge: "LIMITED",
    canvas: {
      background: "#18181b",
      border: "#f97316",
      photoBorder: "#7e22ce",
      text: "#fff7ed",
      mutedText: "#fdba74",
      accent: "#facc15",
      decoration: "halloween",
    },
  },
  {
    kind: "strip",
    id: "christmas-starlight",
    name: "Christmas Starlight",
    subtitle: "Deep green, warm gold, and soft snow.",
    brand: "AmoreFrame",
    accent: "★",
    palette: ["#052e16", "#166534", "#fbbf24", "#fefce8"],
    backgroundClass:
      "bg-[radial-gradient(circle_at_top,#166534_0%,#052e16_58%,#02150a_100%)]",
    outerBorderClass: "border-amber-300/55",
    photoFrameClass:
      "border-amber-100/25 shadow-[0_16px_38px_rgba(251,191,36,0.18)]",
    titleClass: "text-amber-50",
    subtitleClass: "text-amber-200",
    categories: ["seasonal", "premium", "romance"],
    collection: "Seasonal Collection",
    badge: "LIMITED",
    canvas: {
      background: "#052e16",
      border: "#fbbf24",
      photoBorder: "#166534",
      text: "#fefce8",
      mutedText: "#fde68a",
      accent: "#fbbf24",
      decoration: "christmas",
    },
  },
]

const CARD_DESIGNS: CardDesign[] = [
  {
    kind: "card",
    id: "electric-match",
    name: "Electric Match",
    subtitle: "Sparks fly in this original holo edition.",
    brand: "AmoreFrame",
    palette: ["#fef08a", "#facc15", "#1d4ed8", "#111827"],
    backgroundClass:
      "bg-[linear-gradient(150deg,#fef9c3_0%,#fde68a_45%,#bfdbfe_100%)]",
    outerBorderClass: "border-yellow-400/70",
    photoFrameClass:
      "border-blue-700/40 shadow-[0_14px_32px_rgba(29,78,216,0.2)]",
    titleClass: "text-blue-950",
    subtitleClass: "text-amber-800",
    categories: ["gaming", "trending", "romance"],
    collection: "Gaming Collection",
    badge: "TRENDING",
    typeLabel: "Spark",
    typeIcon: "⚡",
    hp: 180,
    moveName: "Perfect Spark",
    moveDamage: 120,
    moveDescription: "Two hearts charge together and never lose power.",
    rarity: "✦",
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
    subtitle: "Rose-gold foil with a fairytale mood.",
    brand: "AmoreFrame",
    palette: ["#fbcfe8", "#f9a8d4", "#fde68a", "#831843"],
    backgroundClass:
      "bg-[linear-gradient(150deg,#fff1f8_0%,#fbcfe8_45%,#fde68a_100%)]",
    outerBorderClass: "border-pink-300/70",
    photoFrameClass:
      "border-pink-600/30 shadow-[0_14px_32px_rgba(219,39,119,0.2)]",
    titleClass: "text-pink-950",
    subtitleClass: "text-pink-700",
    categories: ["romance", "aesthetic", "cute"],
    collection: "Romance Collection",
    typeLabel: "Bloom",
    typeIcon: "✿",
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
    photoFrameClass:
      "border-indigo-200/25 shadow-[0_16px_36px_rgba(0,0,0,0.4)]",
    titleClass: "text-indigo-100",
    subtitleClass: "text-purple-300",
    categories: ["gaming", "aesthetic", "premium"],
    collection: "Gaming Collection",
    typeLabel: "Cosmic",
    typeIcon: "☾",
    hp: 200,
    moveName: "Starbound Promise",
    moveDamage: 140,
    moveDescription: "Written across galaxies and made real right here.",
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
  {
    kind: "card",
    id: "monster-battle",
    name: "Monster Battle",
    subtitle: "An original creature-battle inspired keepsake.",
    brand: "AmoreFrame",
    palette: ["#dcfce7", "#4ade80", "#14532d", "#fef08a"],
    backgroundClass:
      "bg-[linear-gradient(145deg,#f0fdf4_0%,#bbf7d0_48%,#fef08a_100%)]",
    outerBorderClass: "border-emerald-500/65",
    photoFrameClass:
      "border-emerald-800/35 shadow-[0_14px_32px_rgba(20,83,45,0.2)]",
    titleClass: "text-emerald-950",
    subtitleClass: "text-emerald-800",
    categories: ["gaming", "cute", "trending"],
    collection: "Gaming Collection",
    badge: "NEW",
    typeLabel: "Wild Bond",
    typeIcon: "🌿",
    hp: 170,
    moveName: "Team-Up Rush",
    moveDamage: 110,
    moveDescription: "Your best memories join forces for one perfect turn.",
    rarity: "◆",
    holoGradient: ["#4ade80", "#fef08a", "#67e8f9", "#c4b5fd", "#4ade80"],
    canvas: {
      background: "#dcfce7",
      border: "#16a34a",
      photoBorder: "#14532d",
      text: "#052e16",
      mutedText: "#166534",
      accent: "#ca8a04",
    },
  },
  {
    kind: "card",
    id: "trading-card-inspired",
    name: "Trading Card Inspired",
    subtitle: "A premium original trading-card photobooth frame.",
    brand: "AmoreFrame",
    palette: ["#fee2e2", "#fb7185", "#f59e0b", "#7c3aed"],
    backgroundClass:
      "bg-[linear-gradient(145deg,#fff7ed_0%,#fecdd3_42%,#ddd6fe_100%)]",
    outerBorderClass: "border-amber-300/75",
    photoFrameClass:
      "border-rose-700/35 shadow-[0_14px_36px_rgba(190,24,93,0.22)]",
    titleClass: "text-rose-950",
    subtitleClass: "text-rose-700",
    categories: ["gaming", "trending", "premium", "romance"],
    collection: "Gaming Collection",
    badge: "TRENDING",
    typeLabel: "Bond",
    typeIcon: "♥",
    hp: 180,
    moveName: "Perfect Match",
    moveDamage: 120,
    moveDescription: "Both players gain joy whenever this memory is viewed.",
    rarity: "★",
    holoGradient: ["#f59e0b", "#fb7185", "#67e8f9", "#a78bfa", "#f59e0b"],
    canvas: {
      background: "#ffe4e6",
      border: "#d97706",
      photoBorder: "#be123c",
      text: "#4c0519",
      mutedText: "#9f1239",
      accent: "#7c3aed",
    },
  },
  {
    kind: "card",
    id: "retro-hero",
    name: "Retro Hero",
    subtitle: "Pixel-era champion energy with foil accents.",
    brand: "AmoreFrame",
    palette: ["#111827", "#06b6d4", "#d946ef", "#a3e635"],
    backgroundClass:
      "bg-[linear-gradient(145deg,#111827_0%,#164e63_48%,#581c87_100%)]",
    outerBorderClass: "border-cyan-300/60",
    photoFrameClass:
      "border-lime-300/30 shadow-[0_0_34px_rgba(34,211,238,0.22)]",
    titleClass: "text-cyan-50",
    subtitleClass: "text-cyan-200",
    categories: ["gaming", "retro", "movies"],
    collection: "Gaming Collection",
    badge: "NEW",
    typeLabel: "Arcade",
    typeIcon: "▲",
    hp: 190,
    moveName: "High Score Bond",
    moveDamage: 130,
    moveDescription: "Combo memories multiply when both players smile.",
    rarity: "◆",
    holoGradient: ["#06b6d4", "#d946ef", "#a3e635", "#facc15", "#06b6d4"],
    canvas: {
      background: "#111827",
      border: "#22d3ee",
      photoBorder: "#a3e635",
      text: "#ecfeff",
      mutedText: "#a5f3fc",
      accent: "#f0abfc",
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
  const [selectedCategory, setSelectedCategory] =
    useState<DesignCategoryId>("trending")
  const [selectedDesignId, setSelectedDesignId] = useState("noir-date")
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [stickers, setStickers] = useState<StickerMap>({})
  const [selectedStickerPackId, setSelectedStickerPackId] =
    useState<StickerPackId>("none")
  const [selectedFilterId, setSelectedFilterId] = useState("original")
  const [caption, setCaption] = useState("")
  const [captionPosition, setCaptionPosition] =
    useState<CaptionPosition>("bottom")
  const [dateStampMode, setDateStampMode] =
    useState<DateStampMode>("none")
  const [dateStyle, setDateStyle] = useState<DateStyle>("long")
  const [filmNumberMode, setFilmNumberMode] =
    useState<FilmNumberMode>("none")
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStepIndex, setWizardStepIndex] = useState(0)

  const hasAutoOpened = useRef(false)
  const captureDate = useRef(new Date()).current

  const selectedDesign = useMemo(
    () =>
      ALL_DESIGNS.find((design) => design.id === selectedDesignId) ??
      ALL_DESIGNS[0],
    [selectedDesignId]
  )

  const selectedFilter = useMemo(
    () =>
      FILTERS.find((filter) => filter.id === selectedFilterId) ?? FILTERS[0],
    [selectedFilterId]
  )

  const selectedStickerPack = useMemo(
    () =>
      STICKER_PACKS.find((pack) => pack.id === selectedStickerPackId) ??
      STICKER_PACKS[0],
    [selectedStickerPackId]
  )

  const dateStampText = useMemo(
    () => formatDateStamp(captureDate, dateStampMode, dateStyle),
    [captureDate, dateStampMode, dateStyle]
  )

  const filmNumberText = useMemo(
    () => formatFilmNumber(captureDate, filmNumberMode),
    [captureDate, filmNumberMode]
  )

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      window.location.href = "/booth/single"
      return
    }

    try {
      const parsed: unknown = JSON.parse(raw)

      if (!Array.isArray(parsed) || parsed.length === 0) {
        window.location.href = "/booth/single"
        return
      }

      const validPhotos = parsed.filter(
        (value): value is string => typeof value === "string" && value.length > 0
      )

      if (validPhotos.length === 0) {
        window.location.href = "/booth/single"
        return
      }

      setPhotos(validPhotos.slice(0, MAX_PHOTOS))
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

  const previewKey = useMemo(
    () =>
      [
        selectedDesignId,
        selectedFilterId,
        selectedStickerPackId,
        caption,
        captionPosition,
        dateStampMode,
        dateStyle,
        filmNumberMode,
        selectedPhotoIndex,
        Object.values(stickers).join(""),
      ].join("|"),
    [
      caption,
      captionPosition,
      dateStampMode,
      dateStyle,
      filmNumberMode,
      selectedDesignId,
      selectedFilterId,
      selectedPhotoIndex,
      selectedStickerPackId,
      stickers,
    ]
  )

  const filledStickerCount = useMemo(
    () => STICKER_SLOTS.filter((slot) => stickers[slot]).length,
    [stickers]
  )

  const retakePhotos = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    window.location.href = "/booth/single"
  }, [])

  const closeWizard = useCallback(() => setWizardOpen(false), [])

  const openWizardAt = useCallback((stepId: WizardStep) => {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId)
    setWizardStepIndex(index === -1 ? 0 : index)
    setWizardOpen(true)
  }, [])

  const applyStickerPack = useCallback((packId: StickerPackId) => {
    const pack = STICKER_PACKS.find((option) => option.id === packId)
    if (!pack) return

    setSelectedStickerPackId(packId)
    setStickers({ ...pack.stickers })
  }, [])

  const removeSticker = useCallback((slot: StickerSlot) => {
    setStickers((current) => {
      const updated = { ...current }
      delete updated[slot]
      return updated
    })
  }, [])

  const handleDownload = useCallback(async () => {
    if (previewPhotos.length === 0 || isDownloading) return

    try {
      setIsDownloading(true)

      const canvas = document.createElement("canvas")

      if (selectedDesign.kind === "strip") {
        canvas.width = STRIP_WIDTH
        canvas.height = STRIP_HEIGHT

        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas is unavailable")

        await drawStrip({
          ctx,
          photos: previewPhotos,
          design: selectedDesign,
          filter: selectedFilter,
          caption,
          captionPosition,
          dateStampText,
          filmNumberText,
          stickers,
        })
      } else {
        canvas.width = CARD_WIDTH
        canvas.height = CARD_HEIGHT

        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas is unavailable")

        const photo = previewPhotos[selectedPhotoIndex] ?? previewPhotos[0]

        await drawCard({
          ctx,
          photo,
          design: selectedDesign,
          filter: selectedFilter,
          caption,
          captionPosition,
          dateStampText,
          filmNumberText,
          stickers,
        })
      }

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `amoreframe-${selectedDesign.id}-${selectedFilter.id}-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error("Download error:", error)
      window.alert("We could not download your memory. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }, [
    caption,
    captionPosition,
    dateStampText,
    filmNumberText,
    isDownloading,
    previewPhotos,
    selectedDesign,
    selectedFilter,
    selectedPhotoIndex,
    stickers,
  ])

  if (loading) {
    return (
      <main className="amoura-page flex min-h-screen items-center justify-center px-6">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amoura-red-soft" />
          <p className="mt-4 text-amoura-muted">
            Preparing your private preview...
          </p>
        </div>
      </main>
    )
  }

  const captionLabel = selectedDesign.kind === "card" ? "Card name" : "Caption"
  const stickerSummary =
    filledStickerCount === 0
      ? "None"
      : `${selectedStickerPack.name} · ${filledStickerCount} placed`
  const detailSummary = [
    captionPosition === "hidden" ? "Caption hidden" : `${capitalize(captionPosition)} caption`,
    dateStampText || "No date",
    filmNumberText || "No film number",
  ].join(" · ")

  return (
    <>
      <style jsx global>{`
        @keyframes previewSwap {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
            filter: brightness(1.08);
          }
          55% {
            opacity: 1;
            filter: brightness(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes holoShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-preview-swap {
          animation: previewSwap 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .animate-modal-in {
          animation: modalIn 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .animate-holo-shift {
          animation: holoShift 8s ease-in-out infinite;
          background-size: 220% 220%;
        }

        .amore-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .amore-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-preview-swap,
          .animate-modal-in,
          .animate-holo-shift {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <main className="amoura-page min-h-screen overflow-x-hidden pb-28 lg:pb-6">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#080406]/85 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:pt-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 lg:rounded-[1.35rem] lg:border lg:border-amoura-red-soft/20 lg:bg-black/45 lg:px-5 lg:py-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-amoura-muted outline-none transition hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="min-w-0 text-right">
              <p className="amoura-serif truncate text-xl leading-none text-amoura-red-soft sm:text-2xl">
                AmoreFrame
              </p>
              <p className="mt-1 truncate text-[11px] text-amoura-muted sm:text-xs">
                Private by design. Processed only in your browser.
              </p>
            </div>
          </div>
        </header>

        <section className="px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(300px,0.78fr)_minmax(440px,1.22fr)]">
              <section className="relative rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-2.5 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:min-h-[620px] lg:max-h-[860px]">
                <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amoura-cream backdrop-blur-md sm:left-6 sm:top-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live preview
                </div>

                <div className="flex h-[64svh] min-h-[430px] items-center justify-center sm:h-[70svh] sm:min-h-[540px] lg:h-full lg:min-h-0">
                  <div
                    key={previewKey}
                    className="animate-preview-swap flex h-full w-full items-center justify-center"
                    aria-live="polite"
                    aria-label={`${selectedDesign.name} preview updated`}
                  >
                    {selectedDesign.kind === "strip" ? (
                      <StripPreview
                        photos={previewPhotos}
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={caption}
                        captionPosition={captionPosition}
                        dateStampText={dateStampText}
                        filmNumberText={filmNumberText}
                        stickers={stickers}
                        onRemoveSticker={removeSticker}
                      />
                    ) : (
                      <CardPreview
                        photo={
                          previewPhotos[selectedPhotoIndex] ?? previewPhotos[0]
                        }
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={caption}
                        captionPosition={captionPosition}
                        dateStampText={dateStampText}
                        filmNumberText={filmNumberText}
                        stickers={stickers}
                        onRemoveSticker={removeSticker}
                      />
                    )}
                  </div>
                </div>
              </section>

              <aside className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-6 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-amoura-red-soft">
                    Virtual memory booth
                  </p>
                  <h1 className="amoura-serif mt-2 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] text-amoura-cream">
                    Make the frame feel like you.
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-amoura-muted sm:text-base">
                    Pick a design, add one sticker pack, finish the details, then
                    save the final image to your device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openWizardAt("design")}
                  className="amoura-btn-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:min-h-14"
                >
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                  Customize your memory
                </button>

                <div className="mt-5 grid gap-2 rounded-2xl border border-amoura-red-soft/15 bg-black/25 p-3 sm:p-4">
                  <SummaryRow
                    label="Design"
                    value={`${selectedDesign.name} · ${selectedDesign.collection}`}
                    onEdit={() => openWizardAt("design")}
                  />
                  <SummaryRow
                    label="Sticker pack"
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
                  <SummaryRow
                    label="Details"
                    value={detailSummary}
                    onEdit={() => openWizardAt("caption")}
                  />
                </div>

                <div className="mt-5 hidden grid-cols-2 gap-3 lg:grid">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="amoura-btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-amoura-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="h-4 w-4" aria-hidden="true" />
                    )}
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={retakePhotos}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-5 py-3.5 text-sm font-semibold text-amoura-cream outline-none transition hover:border-amoura-red-soft/45 focus-visible:ring-2 focus-visible:ring-amoura-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                    Retake
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-100">
                    Your photos stay on this device.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-100/65">
                    AmoreFrame does not upload or store the photos used on this
                    page.
                  </p>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#090507]/92 px-3 pt-3 backdrop-blur-2xl lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-[1fr_auto] gap-2.5">
          <button
            type="button"
            onClick={() => openWizardAt("design")}
            className="amoura-btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Customize
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/25 bg-black/50 text-amoura-cream outline-none transition active:scale-95 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
            aria-label="Download memory"
          >
            {isDownloading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {wizardOpen ? (
        <WizardModal
          photos={previewPhotos}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDesign={selectedDesign}
          selectedDesignId={selectedDesignId}
          setSelectedDesignId={setSelectedDesignId}
          selectedPhotoIndex={selectedPhotoIndex}
          setSelectedPhotoIndex={setSelectedPhotoIndex}
          stickers={stickers}
          selectedStickerPackId={selectedStickerPackId}
          onSelectStickerPack={applyStickerPack}
          onRemoveSticker={removeSticker}
          selectedFilter={selectedFilter}
          selectedFilterId={selectedFilterId}
          setSelectedFilterId={setSelectedFilterId}
          caption={caption}
          setCaption={setCaption}
          captionPosition={captionPosition}
          setCaptionPosition={setCaptionPosition}
          dateStampMode={dateStampMode}
          setDateStampMode={setDateStampMode}
          dateStyle={dateStyle}
          setDateStyle={setDateStyle}
          filmNumberMode={filmNumberMode}
          setFilmNumberMode={setFilmNumberMode}
          dateStampText={dateStampText}
          filmNumberText={filmNumberText}
          previewKey={previewKey}
          stepIndex={wizardStepIndex}
          setStepIndex={setWizardStepIndex}
          onClose={closeWizard}
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
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-1.5 py-1">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-amoura-muted">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-amoura-cream">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-amoura-muted outline-none transition hover:border-amoura-red-soft/35 hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
        aria-label={`Edit ${label}`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

function tabClass(active: boolean) {
  return `inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold outline-none transition sm:text-sm ${
    active
      ? "bg-amoura-red-soft text-black shadow-[0_8px_24px_rgba(194,31,58,0.24)]"
      : "text-amoura-muted hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
  }`
}

function WizardModal({
  photos,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  selectedDesign,
  selectedDesignId,
  setSelectedDesignId,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  stickers,
  selectedStickerPackId,
  onSelectStickerPack,
  onRemoveSticker,
  selectedFilter,
  selectedFilterId,
  setSelectedFilterId,
  caption,
  setCaption,
  captionPosition,
  setCaptionPosition,
  dateStampMode,
  setDateStampMode,
  dateStyle,
  setDateStyle,
  filmNumberMode,
  setFilmNumberMode,
  dateStampText,
  filmNumberText,
  previewKey,
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
  selectedCategory: DesignCategoryId
  setSelectedCategory: (category: DesignCategoryId) => void
  selectedDesign: DesignOption
  selectedDesignId: string
  setSelectedDesignId: (id: string) => void
  selectedPhotoIndex: number
  setSelectedPhotoIndex: (index: number) => void
  stickers: StickerMap
  selectedStickerPackId: StickerPackId
  onSelectStickerPack: (packId: StickerPackId) => void
  onRemoveSticker: (slot: StickerSlot) => void
  selectedFilter: FilterOption
  selectedFilterId: string
  setSelectedFilterId: (id: string) => void
  caption: string
  setCaption: (value: string) => void
  captionPosition: CaptionPosition
  setCaptionPosition: (position: CaptionPosition) => void
  dateStampMode: DateStampMode
  setDateStampMode: (mode: DateStampMode) => void
  dateStyle: DateStyle
  setDateStyle: (style: DateStyle) => void
  filmNumberMode: FilmNumberMode
  setFilmNumberMode: (mode: FilmNumberMode) => void
  dateStampText: string
  filmNumberText: string
  previewKey: string
  stepIndex: number
  setStepIndex: (updater: number | ((current: number) => number)) => void
  onClose: () => void
  onDownload: () => void
  isDownloading: boolean
  onRetake: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const step = WIZARD_STEPS[stepIndex]?.id ?? "design"
  const isFirst = stepIndex === 0
  const isBeforeLast = stepIndex === WIZARD_STEPS.length - 2

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== "Tab" || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.hasAttribute("hidden") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.offsetParent !== null
      )

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="amoreframe-dialog-title"
        className="animate-modal-in flex h-[100dvh] w-full flex-col overflow-hidden border border-amoura-red-soft/20 bg-[#0b0608] shadow-2xl sm:h-auto sm:max-h-[94vh] sm:max-w-3xl sm:rounded-[2rem] lg:max-w-4xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/5 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amoura-red-soft sm:text-[11px]">
              AmoreFrame editor
            </p>
            <h2
              id="amoreframe-dialog-title"
              className="amoura-serif mt-1 truncate text-2xl text-amoura-cream sm:text-3xl"
            >
              {STEP_TITLES[step]}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-amoura-muted outline-none transition hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
            aria-label="Close editor"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3">
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Customization progress"
          >
            {WIZARD_STEPS.map((wizardStep, index) => (
              <button
                key={wizardStep.id}
                type="button"
                role="tab"
                aria-selected={index === stepIndex}
                aria-label={`Go to ${wizardStep.label}`}
                onClick={() => setStepIndex(index)}
                className={`min-h-2 flex-1 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                  index === stepIndex
                    ? "bg-amoura-red-soft"
                    : index < stepIndex
                      ? "bg-amoura-red-soft/45"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.08em] text-amoura-muted sm:text-[10px]">
            {WIZARD_STEPS.map((wizardStep, index) => (
              <span
                key={wizardStep.id}
                className={index === stepIndex ? "text-amoura-cream" : ""}
              >
                {wizardStep.label}
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
          {step !== "download" ? (
            <div className="sticky top-0 z-20 -mx-4 mb-4 border-y border-white/5 bg-[#0b0608]/92 px-4 py-2.5 backdrop-blur-xl sm:static sm:mx-0 sm:mb-5 sm:rounded-2xl sm:border sm:bg-black/20 sm:px-4 sm:py-3">
              <div
                key={previewKey}
                className="animate-preview-swap flex h-[30svh] min-h-[220px] max-h-[320px] items-center justify-center sm:h-72"
              >
                {selectedDesign.kind === "strip" ? (
                  <StripPreview
                    photos={photos}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={caption}
                    captionPosition={captionPosition}
                    dateStampText={dateStampText}
                    filmNumberText={filmNumberText}
                    stickers={stickers}
                    onRemoveSticker={onRemoveSticker}
                  />
                ) : (
                  <CardPreview
                    photo={photos[selectedPhotoIndex] ?? photos[0]}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={caption}
                    captionPosition={captionPosition}
                    dateStampText={dateStampText}
                    filmNumberText={filmNumberText}
                    stickers={stickers}
                    onRemoveSticker={onRemoveSticker}
                  />
                )}
              </div>
            </div>
          ) : null}

          {step === "design" ? (
            <DesignStep
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDesignId={selectedDesignId}
              setSelectedDesignId={setSelectedDesignId}
              photos={photos}
              selectedPhotoIndex={selectedPhotoIndex}
              setSelectedPhotoIndex={setSelectedPhotoIndex}
              filter={selectedFilter}
            />
          ) : null}

          {step === "stickers" ? (
            <StickerStep
              stickers={stickers}
              selectedStickerPackId={selectedStickerPackId}
              onSelect={onSelectStickerPack}
            />
          ) : null}

          {step === "filters" ? (
            <FilterStep
              previewPhoto={photos[selectedPhotoIndex] ?? photos[0]}
              selectedFilterId={selectedFilterId}
              setSelectedFilterId={setSelectedFilterId}
            />
          ) : null}

          {step === "caption" ? (
            <CaptionStep
              kind={selectedDesign.kind}
              caption={caption}
              setCaption={setCaption}
              captionPosition={captionPosition}
              setCaptionPosition={setCaptionPosition}
              dateStampMode={dateStampMode}
              setDateStampMode={setDateStampMode}
              dateStyle={dateStyle}
              setDateStyle={setDateStyle}
              filmNumberMode={filmNumberMode}
              setFilmNumberMode={setFilmNumberMode}
              dateStampText={dateStampText}
              filmNumberText={filmNumberText}
            />
          ) : null}

          {step === "download" ? (
            <DownloadStep
              selectedDesign={selectedDesign}
              photo={photos[selectedPhotoIndex] ?? photos[0]}
              photos={photos}
              filter={selectedFilter}
              caption={caption}
              captionPosition={captionPosition}
              dateStampText={dateStampText}
              filmNumberText={filmNumberText}
              stickers={stickers}
              onRemoveSticker={onRemoveSticker}
              onDownload={onDownload}
              isDownloading={isDownloading}
              onRetake={onRetake}
              onClose={onClose}
            />
          ) : null}
        </div>

        {step !== "download" ? (
          <div
            className="flex shrink-0 items-center justify-between gap-2.5 border-t border-white/5 bg-[#0b0608]/96 px-4 pt-3 backdrop-blur-xl sm:px-6 sm:pt-4"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
          >
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              className={`inline-flex min-h-12 items-center gap-1.5 rounded-full border border-amoura-red-soft/20 bg-black/35 px-4 text-sm font-semibold text-amoura-cream outline-none transition hover:border-amoura-red-soft/45 focus-visible:ring-2 focus-visible:ring-amoura-red-soft sm:px-5 ${
                isFirst ? "invisible" : ""
              }`}
              aria-hidden={isFirst}
              tabIndex={isFirst ? -1 : 0}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            <button
              type="button"
              onClick={() =>
                setStepIndex((current) =>
                  Math.min(WIZARD_STEPS.length - 1, current + 1)
                )
              }
              className="amoura-btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
            >
              {isBeforeLast ? "Review and download" : "Next"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DesignStep({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  selectedDesignId,
  setSelectedDesignId,
  photos,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  filter,
}: {
  activeTab: "strips" | "cards"
  setActiveTab: (tab: "strips" | "cards") => void
  selectedCategory: DesignCategoryId
  setSelectedCategory: (category: DesignCategoryId) => void
  selectedDesignId: string
  setSelectedDesignId: (id: string) => void
  photos: string[]
  selectedPhotoIndex: number
  setSelectedPhotoIndex: (index: number) => void
  filter: FilterOption
}) {
  const baseList: DesignOption[] =
    activeTab === "strips" ? STRIP_DESIGNS : CARD_DESIGNS

  const availableCategories = useMemo(
    () =>
      DESIGN_CATEGORIES.filter((category) =>
        baseList.some((design) => design.categories.includes(category.id))
      ),
    [baseList]
  )

  const effectiveCategory = availableCategories.some(
    (category) => category.id === selectedCategory
  )
    ? selectedCategory
    : availableCategories[0]?.id

  const list = useMemo(
    () =>
      baseList.filter((design) =>
        effectiveCategory
          ? design.categories.includes(effectiveCategory)
          : true
      ),
    [baseList, effectiveCategory]
  )

  function changeDesignType(tab: "strips" | "cards") {
    setActiveTab(tab)

    const currentDesign = ALL_DESIGNS.find(
      (design) => design.id === selectedDesignId
    )
    const targetKind = tab === "strips" ? "strip" : "card"

    if (currentDesign?.kind === targetKind) return

    const targetList = tab === "strips" ? STRIP_DESIGNS : CARD_DESIGNS
    const nextDesign =
      targetList.find((design) =>
        design.categories.includes(selectedCategory)
      ) ?? targetList[0]

    if (nextDesign) setSelectedDesignId(nextDesign.id)
  }

  return (
    <div className="pb-2">
      <div className="mb-4 inline-flex w-full items-center gap-1 rounded-full border border-amoura-red-soft/15 bg-black/25 p-1">
        <button
          type="button"
          onClick={() => changeDesignType("strips")}
          className={tabClass(activeTab === "strips")}
          aria-pressed={activeTab === "strips"}
        >
          <Rows3 className="h-4 w-4" aria-hidden="true" />
          Photo strips
        </button>
        <button
          type="button"
          onClick={() => changeDesignType("cards")}
          className={tabClass(activeTab === "cards")}
          aria-pressed={activeTab === "cards"}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Holo cards
        </button>
      </div>

      <div
        className="amore-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-3 sm:-mx-0 sm:px-0"
        aria-label="Design categories"
      >
        {availableCategories.map((category) => {
          const active = effectiveCategory === category.id

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={active}
              className={`min-h-11 shrink-0 snap-start rounded-full border px-3.5 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/15 text-amoura-cream"
                  : "border-white/10 bg-black/20 text-amoura-muted hover:border-white/20 hover:text-amoura-cream"
              }`}
            >
              <span aria-hidden="true">{category.emoji}</span> {category.label}
            </button>
          )
        })}
      </div>

      {activeTab === "cards" && photos.length > 1 ? (
        <div className="mb-4 rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
            Card photo
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {photos.map((photo, index) => {
              const active = selectedPhotoIndex === index

              return (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  aria-pressed={active}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                    active
                      ? "border-amoura-red-soft"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Use captured shot ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {active ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amoura-red-soft text-black">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div
        key={`${activeTab}-${effectiveCategory}`}
        className="animate-preview-swap amore-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {list.map((design) => {
          const active = selectedDesignId === design.id

          return (
            <button
              key={design.id}
              type="button"
              onClick={() => setSelectedDesignId(design.id)}
              aria-pressed={active}
              aria-label={`Select ${design.name}, ${design.collection}`}
              className={`group w-[44vw] max-w-[190px] shrink-0 snap-start rounded-2xl border p-2.5 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft sm:w-auto sm:max-w-none ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/10 shadow-[0_12px_36px_rgba(194,31,58,0.16)]"
                  : "border-white/8 bg-black/20 hover:-translate-y-0.5 hover:border-white/18"
              }`}
            >
              <div className="relative">
                {design.kind === "strip" ? (
                  <StripPoster
                    design={design}
                    photo={photos[0]}
                    filter={filter}
                    active={active}
                  />
                ) : (
                  <CardPoster
                    design={design}
                    photo={photos[selectedPhotoIndex] ?? photos[0]}
                    filter={filter}
                    active={active}
                  />
                )}
              </div>
              <div className="mt-2 min-w-0">
                <p className="truncate text-sm font-semibold text-amoura-cream">
                  {design.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-amoura-muted">
                  {design.collection}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StickerStep({
  stickers,
  selectedStickerPackId,
  onSelect,
}: {
  stickers: StickerMap
  selectedStickerPackId: StickerPackId
  onSelect: (packId: StickerPackId) => void
}) {
  const filledCount = STICKER_SLOTS.filter((slot) => stickers[slot]).length

  return (
    <div className="pb-2">
      <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
        <p className="text-sm leading-6 text-amoura-muted">
          Pick one pack. AmoreFrame places the stickers automatically, so the
          layout stays balanced. Tap any placed sticker in the preview to
          remove it.
        </p>
        <p className="mt-2 text-xs font-semibold text-amoura-cream">
          {filledCount === 0 ? "No stickers placed" : `${filledCount} stickers placed`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {STICKER_PACKS.map((pack) => {
          const active = selectedStickerPackId === pack.id
          const icons = Object.values(pack.stickers)

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => onSelect(pack.id)}
              aria-pressed={active}
              className={`min-h-28 rounded-2xl border p-3 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/12"
                  : "border-white/8 bg-black/20 hover:border-white/20"
              }`}
            >
              <div className="flex min-h-8 items-center gap-1 text-lg">
                {icons.length > 0 ? (
                  icons.slice(0, 4).map((emoji, index) => (
                    <span key={`${emoji}-${index}`} aria-hidden="true">
                      {emoji}
                    </span>
                  ))
                ) : (
                  <span className="text-xs uppercase tracking-[0.16em] text-amoura-muted">
                    Clean
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amoura-cream">
                    {pack.name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-amoura-muted">
                    {pack.subtitle}
                  </p>
                </div>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" aria-hidden="true" />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FilterStep({
  previewPhoto,
  selectedFilterId,
  setSelectedFilterId,
}: {
  previewPhoto?: string
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
            type="button"
            onClick={() => setSelectedFilterId(filter.id)}
            aria-pressed={active}
            className={`overflow-hidden rounded-2xl border text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
              active
                ? "border-amoura-red-soft bg-amoura-red/10"
                : "border-white/8 bg-black/20 hover:border-white/20"
            }`}
          >
            <div className="aspect-[4/3] overflow-hidden bg-black/30">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: filter.cssFilter }}
                />
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-amoura-cream">
                  {filter.name}
                </p>
                <p className="truncate text-[11px] text-amoura-muted">
                  {filter.subtitle}
                </p>
              </div>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-amoura-red-soft" aria-hidden="true" />
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
  captionPosition,
  setCaptionPosition,
  dateStampMode,
  setDateStampMode,
  dateStyle,
  setDateStyle,
  filmNumberMode,
  setFilmNumberMode,
  dateStampText,
  filmNumberText,
}: {
  kind: "strip" | "card"
  caption: string
  setCaption: (value: string) => void
  captionPosition: CaptionPosition
  setCaptionPosition: (position: CaptionPosition) => void
  dateStampMode: DateStampMode
  setDateStampMode: (mode: DateStampMode) => void
  dateStyle: DateStyle
  setDateStyle: (style: DateStyle) => void
  filmNumberMode: FilmNumberMode
  setFilmNumberMode: (mode: FilmNumberMode) => void
  dateStampText: string
  filmNumberText: string
}) {
  const placeholder =
    kind === "card" ? "For example: Ken and Faye" : "My favorite memory ♥"

  return (
    <div className="space-y-4 pb-2">
      <fieldset className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          {kind === "card" ? "Card name" : "Caption"}
        </legend>
        <textarea
          value={caption}
          onChange={(event) =>
            setCaption(event.target.value.slice(0, MAX_CAPTION))
          }
          maxLength={MAX_CAPTION}
          rows={3}
          placeholder={placeholder}
          className="mt-2 w-full resize-none rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-3 text-base text-amoura-cream outline-none transition placeholder:text-amoura-muted focus:border-amoura-red-soft/45 focus:ring-2 focus:ring-amoura-red-soft/20"
          aria-describedby="caption-count"
        />
        <div
          id="caption-count"
          className="mt-2 text-right text-xs text-amoura-muted"
        >
          {caption.length}/{MAX_CAPTION}
        </div>

        <OptionGroup
          label="Caption position"
          options={[
            { id: "top", label: "Top" },
            { id: "bottom", label: "Bottom" },
            { id: "hidden", label: "Hidden" },
          ]}
          value={captionPosition}
          onChange={(value) => setCaptionPosition(value as CaptionPosition)}
          columns={3}
        />
      </fieldset>

      <fieldset className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Date stamp
        </legend>
        <OptionGroup
          label="Date stamp style"
          hideLabel
          options={[
            { id: "none", label: "None" },
            { id: "date", label: "Date" },
            { id: "date-time", label: "Date + time" },
            {
              id: "date-time-brand",
              label: "Date + time + AmoreFrame",
            },
          ]}
          value={dateStampMode}
          onChange={(value) => setDateStampMode(value as DateStampMode)}
          columns={2}
        />

        {dateStampMode !== "none" ? (
          <div className="mt-3 border-t border-white/8 pt-3">
            <OptionGroup
              label="Date format"
              options={[
                { id: "long", label: "July 25, 2026" },
                { id: "numeric", label: "07.25.2026" },
              ]}
              value={dateStyle}
              onChange={(value) => setDateStyle(value as DateStyle)}
              columns={2}
            />
            <p className="mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-xs text-amoura-muted">
              Preview: {dateStampText}
            </p>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Film number
        </legend>
        <OptionGroup
          label="Film metadata"
          hideLabel
          options={[
            { id: "none", label: "None" },
            { id: "frame", label: "FRAME 024" },
            { id: "roll", label: "ROLL 03" },
            { id: "serial", label: "AF-2026-000145" },
          ]}
          value={filmNumberMode}
          onChange={(value) => setFilmNumberMode(value as FilmNumberMode)}
          columns={2}
        />
        {filmNumberText ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-xs text-amoura-muted">
            Your frame: {filmNumberText}
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}

function OptionGroup({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  columns,
}: {
  label: string
  hideLabel?: boolean
  options: { id: string; label: string }[]
  value: string
  onChange: (value: string) => void
  columns: 2 | 3
}) {
  return (
    <div className="mt-3">
      <p
        className={
          hideLabel
            ? "sr-only"
            : "mb-2 text-xs font-semibold text-amoura-muted"
        }
      >
        {label}
      </p>
      <div
        className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {options.map((option) => {
          const active = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              className={`min-h-11 rounded-xl border px-2.5 py-2 text-xs font-semibold leading-4 outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/15 text-amoura-cream"
                  : "border-white/8 bg-black/20 text-amoura-muted hover:border-white/20 hover:text-amoura-cream"
              }`}
            >
              {option.label}
            </button>
          )
        })}
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
  captionPosition,
  dateStampText,
  filmNumberText,
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
  captionPosition: CaptionPosition
  dateStampText: string
  filmNumberText: string
  stickers: StickerMap
  onRemoveSticker: (slot: StickerSlot) => void
  onDownload: () => void
  isDownloading: boolean
  onRetake: () => void
  onClose: () => void
}) {
  return (
    <div className="pb-3 text-center">
      <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-amoura-red-soft/25" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/15 sm:h-16 sm:w-16">
          <PartyPopper className="h-6 w-6 text-amoura-red-soft sm:h-7 sm:w-7" aria-hidden="true" />
        </div>
      </div>

      <h3 className="amoura-serif text-2xl text-amoura-cream sm:text-3xl">
        Your memory is ready
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-amoura-muted">
        Review the final frame, then save it directly to your device.
      </p>

      <div className="animate-preview-swap relative mx-auto mt-4 flex h-[48svh] min-h-[360px] max-h-[560px] items-center justify-center rounded-2xl border border-white/5 bg-black/20 p-3 sm:h-[54vh]">
        {selectedDesign.kind === "strip" ? (
          <StripPreview
            photos={photos}
            design={selectedDesign}
            filter={filter}
            caption={caption}
            captionPosition={captionPosition}
            dateStampText={dateStampText}
            filmNumberText={filmNumberText}
            stickers={stickers}
            onRemoveSticker={onRemoveSticker}
          />
        ) : (
          <CardPreview
            photo={photo}
            design={selectedDesign}
            filter={filter}
            caption={caption}
            captionPosition={captionPosition}
            dateStampText={dateStampText}
            filmNumberText={filmNumberText}
            stickers={stickers}
            onRemoveSticker={onRemoveSticker}
          />
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-left">
        <p className="text-xs font-semibold text-emerald-100">
          Saved locally, never uploaded
        </p>
        <p className="mt-1 text-xs leading-5 text-emerald-100/65">
          The final image is rendered inside your browser and downloaded to
          your device.
        </p>
      </div>

      <div className="mt-4 grid gap-2.5">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="amoura-btn-primary inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Preparing image...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download {selectedDesign.kind === "card" ? "card" : "strip"}
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-4 text-sm font-semibold text-amoura-cream outline-none transition hover:border-amoura-red-soft/45 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Retake
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-4 text-sm font-semibold text-amoura-cream outline-none transition hover:border-amoura-red-soft/45 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
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
    {
      slot: "bottomLeft",
      className: "bottom-1.5 left-1.5 sm:bottom-2 sm:left-2",
    },
    {
      slot: "bottomRight",
      className: "bottom-1.5 right-1.5 sm:bottom-2 sm:right-2",
    },
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
            className={`absolute z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/35 text-base leading-none backdrop-blur-sm outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10 sm:text-xl ${className}`}
            aria-label={`Remove ${emoji} sticker`}
          >
            {emoji}
          </button>
        )
      })}
    </>
  )
}

const StripPreview = memo(function StripPreview({
  photos,
  design,
  filter,
  caption,
  captionPosition,
  dateStampText,
  filmNumberText,
  stickers,
  onRemoveSticker,
}: {
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  captionPosition: CaptionPosition
  dateStampText: string
  filmNumberText: string
  stickers: StickerMap
  onRemoveSticker?: (slot: StickerSlot) => void
}) {
  const showCaption = caption.trim().length > 0 && captionPosition !== "hidden"

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.45rem] border p-2.5 shadow-2xl sm:p-3 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <StripDecorations design={design} />
        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />
        {design.badge ? <EditionBadge badge={design.badge} /> : null}

        <div className="relative z-10 shrink-0 text-center">
          <p
            className={`text-[clamp(0.78rem,0.72vw+0.48rem,1.3rem)] font-bold ${design.titleClass}`}
          >
            {design.brand}
          </p>
          <p
            className={`mt-0.5 text-[0.4rem] uppercase tracking-[0.2em] sm:text-[0.48rem] ${design.subtitleClass}`}
          >
            {design.name}
          </p>
        </div>

        {showCaption && captionPosition === "top" ? (
          <PreviewCaption caption={caption} design={design} />
        ) : null}

        <div className="relative z-10 mt-1.5 grid min-h-0 flex-1 grid-rows-3 gap-1.5 sm:mt-2 sm:gap-2">
          {photos.slice(0, MAX_PHOTOS).map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className={`min-h-0 overflow-hidden rounded-[0.75rem] border-[3px] bg-black/10 sm:border-[4px] ${design.photoFrameClass}`}
            >
              <img
                src={photo}
                alt={`Captured shot ${index + 1}`}
                className="h-full w-full object-cover"
                style={{
                  filter: filter.cssFilter,
                  transition: "filter 240ms ease",
                }}
              />
            </div>
          ))}
        </div>

        {showCaption && captionPosition === "bottom" ? (
          <PreviewCaption caption={caption} design={design} />
        ) : null}

        <div
          className={`relative z-10 mt-1.5 shrink-0 text-center sm:mt-2 ${design.titleClass}`}
        >
          <p className="text-sm leading-none sm:text-base">{design.accent}</p>
          {dateStampText || filmNumberText ? (
            <div className="mt-1 space-y-0.5">
              {dateStampText ? (
                <p
                  className={`line-clamp-2 text-[0.34rem] uppercase tracking-[0.08em] sm:text-[0.42rem] ${design.subtitleClass}`}
                >
                  {dateStampText}
                </p>
              ) : null}
              {filmNumberText ? (
                <p
                  className={`text-[0.34rem] font-bold uppercase tracking-[0.14em] sm:text-[0.42rem] ${design.subtitleClass}`}
                >
                  {filmNumberText}
                </p>
              ) : null}
            </div>
          ) : (
            <p
              className={`mt-0.5 text-[0.34rem] uppercase tracking-[0.14em] sm:text-[0.42rem] ${design.subtitleClass}`}
            >
              Captured with love
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

function PreviewCaption({
  caption,
  design,
}: {
  caption: string
  design: StripDesign
}) {
  return (
    <div className="relative z-10 mt-1.5 shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-center backdrop-blur-sm sm:mt-2 sm:py-1.5">
      <p
        className={`truncate text-[0.48rem] leading-3 sm:text-[0.62rem] sm:leading-4 ${design.titleClass}`}
      >
        {caption}
      </p>
    </div>
  )
}

const CardPreview = memo(function CardPreview({
  photo,
  design,
  filter,
  caption,
  captionPosition,
  dateStampText,
  filmNumberText,
  stickers,
  onRemoveSticker,
}: {
  photo?: string
  design: CardDesign
  filter: FilterOption
  caption: string
  captionPosition: CaptionPosition
  dateStampText: string
  filmNumberText: string
  stickers: StickerMap
  onRemoveSticker?: (slot: StickerSlot) => void
}) {
  const showCaption = caption.trim().length > 0 && captionPosition !== "hidden"
  const cardTitle = showCaption && captionPosition === "top" ? caption : design.name

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.6rem] border-[3px] p-3 shadow-2xl sm:p-4 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
      >
        <div
          aria-hidden="true"
          className="animate-holo-shift pointer-events-none absolute inset-0 z-0 opacity-[0.2] mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(", ")})`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[7px] z-[1] rounded-[1.25rem] border border-white/25"
        />

        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />
        {design.badge ? <EditionBadge badge={design.badge} /> : null}

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-wide backdrop-blur-sm sm:text-[0.6rem] ${design.subtitleClass}`}
          >
            <span aria-hidden="true">{design.typeIcon}</span>
            {design.typeLabel}
          </span>
          <span className={`text-sm font-bold sm:text-base ${design.titleClass}`}>
            {design.hp} HP
          </span>
        </div>

        <p
          className={`relative z-10 mt-1.5 truncate text-center text-[clamp(0.95rem,1.5vw+0.55rem,1.55rem)] font-bold sm:mt-2 ${design.titleClass}`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {cardTitle}
        </p>

        <div
          className={`relative z-10 mt-1.5 min-h-0 flex-1 overflow-hidden rounded-[0.9rem] border-[3px] bg-black/10 sm:mt-2 sm:border-[4px] ${design.photoFrameClass}`}
        >
          {photo ? (
            <img
              src={photo}
              alt="Selected card shot"
              className="h-full w-full object-cover"
              style={{
                filter: filter.cssFilter,
                transition: "filter 240ms ease",
              }}
            />
          ) : null}

          {showCaption && captionPosition === "bottom" ? (
            <div className="absolute inset-x-2 bottom-2 rounded-lg border border-white/15 bg-black/55 px-2 py-1.5 text-center backdrop-blur-sm sm:inset-x-3 sm:bottom-3">
              <p className="truncate text-[0.52rem] font-semibold text-white sm:text-[0.64rem]">
                {caption}
              </p>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mt-1.5 shrink-0 rounded-xl border border-white/10 bg-black/15 px-2.5 py-2 backdrop-blur-sm sm:mt-2 sm:px-3">
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-[0.58rem] font-bold sm:text-xs ${design.titleClass}`}>
              {design.typeIcon} {design.moveName}
            </p>
            <p className={`text-[0.58rem] font-bold sm:text-xs ${design.titleClass}`}>
              {design.moveDamage}
            </p>
          </div>
          <p
            className={`mt-1 line-clamp-2 text-[0.46rem] italic leading-3 sm:text-[0.56rem] ${design.subtitleClass}`}
          >
            {design.moveDescription}
          </p>
        </div>

        <div className={`relative z-10 mt-1.5 shrink-0 text-center ${design.titleClass}`}>
          <p className="text-xs leading-none sm:text-sm">
            {design.rarity} {design.rarity} {design.rarity}
          </p>
          {dateStampText ? (
            <p
              className={`mt-1 line-clamp-1 text-[0.34rem] uppercase tracking-[0.08em] sm:text-[0.42rem] ${design.subtitleClass}`}
            >
              {dateStampText}
            </p>
          ) : null}
          <p
            className={`mt-0.5 text-[0.32rem] uppercase tracking-[0.12em] sm:text-[0.4rem] ${design.subtitleClass}`}
          >
            {filmNumberText || "AmoreFrame original"}
          </p>
        </div>
      </div>
    </div>
  )
})

function EditionBadge({ badge }: { badge: DesignBadge }) {
  return (
    <span className="absolute left-1/2 top-1 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-[0.32rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:top-1.5 sm:text-[0.38rem]">
      {badge}
    </span>
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
      className={`relative mx-auto aspect-[9/22] w-full max-w-[150px] overflow-hidden rounded-[1.1rem] border p-2.5 transition ${design.backgroundClass} ${
        active
          ? "border-amoura-red-soft shadow-[0_0_35px_rgba(194,31,58,0.2)]"
          : design.outerBorderClass
      }`}
    >
      <StripDecorations design={design} small />
      {design.badge ? <EditionBadge badge={design.badge} /> : null}

      {active ? (
        <div className="absolute right-2 top-2 z-30 rounded-full border border-amoura-red-soft/40 bg-black/45 p-1 text-amoura-red-soft backdrop-blur">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      ) : null}

      <div className="relative z-10 pt-1 text-center">
        <p className={`truncate text-[9px] font-bold ${design.titleClass}`}>
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

      <div className="relative z-10 mt-1.5 text-center">
        <p className={`text-[9px] ${design.titleClass}`}>{design.accent}</p>
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
      className={`relative mx-auto w-full max-w-[150px] overflow-hidden rounded-[1.1rem] border-[2.5px] p-2.5 transition ${design.backgroundClass} ${
        active
          ? "border-amoura-red-soft shadow-[0_0_35px_rgba(194,31,58,0.2)]"
          : design.outerBorderClass
      }`}
      style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(", ")})`,
        }}
      />
      {design.badge ? <EditionBadge badge={design.badge} /> : null}

      {active ? (
        <div className="absolute right-2 top-2 z-30 rounded-full border border-amoura-red-soft/40 bg-black/45 p-1 text-amoura-red-soft backdrop-blur">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      ) : null}

      <div className="relative z-10 flex items-center justify-between pt-1">
        <span className={`text-[7px] font-bold uppercase ${design.subtitleClass}`}>
          {design.typeIcon} {design.typeLabel}
        </span>
        <span className={`text-[8px] font-bold ${design.titleClass}`}>
          {design.hp} HP
        </span>
      </div>

      <p className={`relative z-10 mt-1 truncate text-center text-[9px] font-bold ${design.titleClass}`}>
        {design.name}
      </p>

      <div
        className={`relative z-10 mt-1.5 overflow-hidden rounded-md border-[2px] ${design.photoFrameClass}`}
      >
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
        <p className={`text-[8px] ${design.titleClass}`}>
          {design.rarity} {design.rarity} {design.rarity}
        </p>
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
  const size = small ? "text-[9px]" : "text-xs sm:text-sm"
  const decoration = design.canvas.decoration

  if (decoration === "vintage") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-2 top-0 h-full w-2.5 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)] sm:w-3" />
        <div className="absolute right-2 top-0 h-full w-2.5 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)] sm:w-3" />
      </div>
    )
  }

  if (decoration === "pixel") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.35)_1px,transparent_1px)] bg-[size:16px_16px]" />
      </div>
    )
  }

  if (decoration === "arcade") {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">▲</span>
        <span className="absolute right-3 top-5">●</span>
        <span className="absolute bottom-4 left-3">◆</span>
        <span className="absolute bottom-3 right-3">■</span>
      </div>
    )
  }

  const cornerSets: Partial<Record<StripDecoration, [string, string, string, string]>> = {
    barkada: ["🌼", "😊", "✿", "🌈"],
    romance: ["♥", "♥", "♡", "♡"],
    kawaii: ["🎀", "♡", "☁", "✿"],
    midnight: ["✦", "☾", "✧", "✦"],
    noir: ["✦", "☾", "✧", "✦"],
    retro: ["★", "●", "◆", "★"],
    sakura: ["🌸", "✿", "❀", "🌸"],
    festival: ["🏮", "✦", "✧", "🏮"],
    moonlight: ["☾", "✦", "✧", "★"],
    ocean: ["≈", "◌", "◦", "≈"],
    sky: ["☁", "✧", "☆", "☁"],
    christmas: ["❄", "★", "✦", "❄"],
    halloween: ["☾", "✦", "◈", "★"],
    graduation: ["★", "✦", "◆", "★"],
    summer: ["☀", "≈", "✦", "☀"],
    valentine: ["♥", "♡", "♥", "♡"],
  }

  const corners = cornerSets[decoration]

  if (corners) {
    return (
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${size}`}>
        <span className="absolute left-3 top-3">{corners[0]}</span>
        <span className="absolute right-3 top-3">{corners[1]}</span>
        <span className="absolute bottom-3 left-3">{corners[2]}</span>
        <span className="absolute bottom-3 right-3">{corners[3]}</span>
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
  captionPosition,
  dateStampText,
  filmNumberText,
  stickers,
}: {
  ctx: CanvasRenderingContext2D
  photos: string[]
  design: StripDesign
  filter: FilterOption
  caption: string
  captionPosition: CaptionPosition
  dateStampText: string
  filmNumberText: string
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

  if (design.badge) {
    drawCanvasBadge(ctx, design.badge, STRIP_WIDTH / 2, 42)
  }

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 54px Georgia, serif"
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 88)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 120)

  const showCaption = caption.trim().length > 0 && captionPosition !== "hidden"
  const hasTopCaption = showCaption && captionPosition === "top"
  const hasBottomCaption = showCaption && captionPosition === "bottom"
  const topY = hasTopCaption ? 208 : 154
  const footerStart = STRIP_HEIGHT - 170
  const bottomCaptionSpace = hasBottomCaption ? 76 : 0
  const availablePhotoHeight =
    footerStart - bottomCaptionSpace - topY - STRIP_GAP * (photos.length - 1)
  const photoHeight = Math.min(
    PHOTO_HEIGHT,
    Math.floor(availablePhotoHeight / Math.max(photos.length, 1))
  )

  if (hasTopCaption) {
    drawCaptionPill(
      ctx,
      caption,
      120,
      138,
      STRIP_WIDTH - 240,
      52,
      design.canvas.text,
      design.canvas.border
    )
  }

  let y = topY

  for (let index = 0; index < photos.length; index += 1) {
    const image = await loadImage(photos[index])
    const x = (STRIP_WIDTH - PHOTO_WIDTH) / 2

    drawPhotoFrame(
      ctx,
      x,
      y,
      PHOTO_WIDTH,
      photoHeight,
      design.canvas.photoBorder
    )
    drawImageCover(
      ctx,
      image,
      x + 14,
      y + 14,
      PHOTO_WIDTH - 28,
      photoHeight - 28,
      filter.canvasFilter
    )

    y += photoHeight + STRIP_GAP
  }

  if (hasBottomCaption) {
    drawCaptionPill(
      ctx,
      caption,
      120,
      y - 2,
      STRIP_WIDTH - 240,
      54,
      design.canvas.text,
      design.canvas.border
    )
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 42px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 118)

  if (dateStampText) {
    ctx.fillStyle = design.canvas.mutedText
    ctx.font = "bold 15px Arial, sans-serif"
    drawCenteredWrappedText(
      ctx,
      dateStampText.toUpperCase(),
      STRIP_WIDTH / 2,
      STRIP_HEIGHT - 84,
      STRIP_WIDTH - 220,
      21,
      2
    )
  } else {
    ctx.fillStyle = design.canvas.mutedText
    ctx.font = "bold 15px Arial, sans-serif"
    ctx.fillText("CAPTURED WITH LOVE", STRIP_WIDTH / 2, STRIP_HEIGHT - 82)
  }

  if (filmNumberText) {
    ctx.fillStyle = design.canvas.mutedText
    ctx.font = "bold 14px monospace"
    ctx.fillText(filmNumberText, STRIP_WIDTH / 2, STRIP_HEIGHT - 42)
  }

  drawStickers(ctx, stickers, STRIP_WIDTH, STRIP_HEIGHT, 46, 64)
}

async function drawCard({
  ctx,
  photo,
  design,
  filter,
  caption,
  captionPosition,
  dateStampText,
  filmNumberText,
  stickers,
}: {
  ctx: CanvasRenderingContext2D
  photo: string
  design: CardDesign
  filter: FilterOption
  caption: string
  captionPosition: CaptionPosition
  dateStampText: string
  filmNumberText: string
  stickers: StickerMap
}) {
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 48, design.canvas.background)

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  design.holoGradient.forEach((color, index) => {
    gradient.addColorStop(
      index / Math.max(design.holoGradient.length - 1, 1),
      color
    )
  })

  ctx.save()
  ctx.globalAlpha = 0.18
  roundedPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 48)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.restore()

  drawBorder(
    ctx,
    20,
    20,
    CARD_WIDTH - 40,
    CARD_HEIGHT - 40,
    38,
    design.canvas.border,
    10
  )
  drawBorder(
    ctx,
    32,
    32,
    CARD_WIDTH - 64,
    CARD_HEIGHT - 64,
    30,
    design.canvas.accent,
    2
  )

  if (design.badge) {
    drawCanvasBadge(ctx, design.badge, CARD_WIDTH / 2, 44)
  }

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillText(`${design.typeIcon} ${design.typeLabel.toUpperCase()}`, 64, 92)

  ctx.textAlign = "right"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 38px Georgia, serif"
  ctx.fillText(`${design.hp} HP`, CARD_WIDTH - 64, 94)

  const showCaption = caption.trim().length > 0 && captionPosition !== "hidden"
  const title = showCaption && captionPosition === "top" ? caption : design.name

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 48px Georgia, serif"
  ctx.fillText(fitCanvasText(ctx, title, CARD_WIDTH - 140), CARD_WIDTH / 2, 150)

  const photoX = 64
  const photoY = 186
  const photoW = CARD_WIDTH - 128
  const photoH = 590

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

  if (showCaption && captionPosition === "bottom") {
    ctx.save()
    ctx.globalAlpha = 0.72
    drawRoundedRect(
      ctx,
      photoX + 34,
      photoY + photoH - 88,
      photoW - 68,
      58,
      20,
      "#000000"
    )
    ctx.restore()

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px Arial, sans-serif"
    ctx.fillText(
      fitCanvasText(ctx, caption, photoW - 120),
      CARD_WIDTH / 2,
      photoY + photoH - 50
    )
  }

  const moveY = photoY + photoH + 26
  const moveH = 170

  ctx.save()
  ctx.globalAlpha = 0.15
  drawRoundedRect(ctx, 64, moveY, CARD_WIDTH - 128, moveH, 24, "#000000")
  ctx.restore()

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 28px Arial, sans-serif"
  ctx.fillText(`${design.typeIcon} ${design.moveName}`, 88, moveY + 44)

  ctx.textAlign = "right"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 32px Georgia, serif"
  ctx.fillText(`${design.moveDamage}`, CARD_WIDTH - 88, moveY + 44)

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "italic 21px Arial, sans-serif"
  wrapCanvasText(
    ctx,
    design.moveDescription,
    88,
    moveY + 82,
    CARD_WIDTH - 176,
    29,
    3
  )

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.accent
  ctx.font = "30px Georgia, serif"
  ctx.fillText(
    `${design.rarity}  ${design.rarity}  ${design.rarity}`,
    CARD_WIDTH / 2,
    CARD_HEIGHT - 105
  )

  if (dateStampText) {
    ctx.fillStyle = design.canvas.mutedText
    ctx.font = "bold 13px Arial, sans-serif"
    ctx.fillText(
      fitCanvasText(ctx, dateStampText.toUpperCase(), CARD_WIDTH - 160),
      CARD_WIDTH / 2,
      CARD_HEIGHT - 75
    )
  }

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 13px monospace"
  ctx.fillText(
    filmNumberText || "AMOREFRAME ORIGINAL",
    CARD_WIDTH / 2,
    CARD_HEIGHT - 48
  )

  ctx.font = "13px Arial, sans-serif"
  ctx.fillText("Captured locally with AmoreFrame", CARD_WIDTH / 2, CARD_HEIGHT - 27)

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
    ctx.fillText(
      stickers.bottomRight,
      width - inset,
      height - inset - fontSize / 2
    )
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
    ctx.globalAlpha = 0.28

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
  } else if (decoration === "pixel") {
    ctx.globalAlpha = 0.22
    ctx.lineWidth = 2

    for (let x = 48; x < STRIP_WIDTH - 48; x += 48) {
      ctx.beginPath()
      ctx.moveTo(x, 42)
      ctx.lineTo(x, STRIP_HEIGHT - 42)
      ctx.stroke()
    }

    for (let y = 42; y < STRIP_HEIGHT - 42; y += 48) {
      ctx.beginPath()
      ctx.moveTo(48, y)
      ctx.lineTo(STRIP_WIDTH - 48, y)
      ctx.stroke()
    }
  } else {
    const cornerSets: Partial<
      Record<StripDecoration, [string, string, string, string]>
    > = {
      barkada: ["🌼", "😊", "✿", "🌈"],
      romance: ["♥", "♥", "♡", "♡"],
      kawaii: ["🎀", "♡", "☁", "✿"],
      midnight: ["✦", "☾", "✧", "✦"],
      noir: ["✦", "☾", "✧", "✦"],
      retro: ["★", "●", "◆", "★"],
      arcade: ["▲", "●", "◆", "■"],
      sakura: ["🌸", "✿", "❀", "🌸"],
      festival: ["🏮", "✦", "✧", "🏮"],
      moonlight: ["☾", "✦", "✧", "★"],
      ocean: ["≈", "◌", "◦", "≈"],
      sky: ["☁", "✧", "☆", "☁"],
      christmas: ["❄", "★", "✦", "❄"],
      halloween: ["☾", "✦", "◈", "★"],
      graduation: ["★", "✦", "◆", "★"],
      summer: ["☀", "≈", "✦", "☀"],
      valentine: ["♥", "♡", "♥", "♡"],
    }

    const corners = cornerSets[decoration]

    if (corners) {
      ctx.font = `34px "Apple Color Emoji", "Segoe UI Emoji", Georgia, serif`
      ctx.fillText(corners[0], 80, 82)
      ctx.fillText(corners[1], STRIP_WIDTH - 80, 82)
      ctx.fillText(corners[2], 80, STRIP_HEIGHT - 72)
      ctx.fillText(corners[3], STRIP_WIDTH - 80, STRIP_HEIGHT - 72)
    }
  }

  if (decoration === "white") {
    ctx.globalAlpha = 0.16
    ctx.strokeStyle = design.canvas.text
    ctx.lineWidth = 2
    drawRoundedBorder(ctx, 44, 44, STRIP_WIDTH - 88, STRIP_HEIGHT - 88, 36)
  }

  ctx.restore()
}

function drawCanvasBadge(
  ctx: CanvasRenderingContext2D,
  badge: DesignBadge,
  centerX: number,
  y: number
) {
  const width = badge === "TRENDING" ? 120 : 98
  const height = 30

  ctx.save()
  ctx.globalAlpha = 0.72
  drawRoundedRect(ctx, centerX - width / 2, y - 18, width, height, 15, "#000000")
  ctx.restore()

  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(badge, centerX, y - 3)
  ctx.restore()
}

function drawCaptionPill(
  ctx: CanvasRenderingContext2D,
  caption: string,
  x: number,
  y: number,
  width: number,
  height: number,
  textColor: string,
  borderColor: string
) {
  ctx.save()
  ctx.globalAlpha = 0.18
  drawRoundedRect(ctx, x, y, width, height, height / 2, "#000000")
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  roundedPath(ctx, x, y, width, height, height / 2)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = textColor
  ctx.font = "500 23px Arial, sans-serif"
  ctx.fillText(fitCanvasText(ctx, caption, width - 48), x + width / 2, y + height / 2)
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

function drawCenteredWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const previousAlign = ctx.textAlign
  ctx.textAlign = "center"

  const words = text.split(" ")
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word

    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }

  if (line) lines.push(line)

  lines.slice(0, maxLines).forEach((textLine, index) => {
    ctx.fillText(textLine, centerX, y + index * lineHeight)
  })

  ctx.textAlign = previousAlign
}

function fitCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  if (ctx.measureText(text).width <= maxWidth) return text

  let shortened = text

  while (shortened.length > 1) {
    shortened = shortened.slice(0, -1)
    const candidate = `${shortened.trim()}…`
    if (ctx.measureText(candidate).width <= maxWidth) return candidate
  }

  return "…"
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

function formatDateStamp(
  date: Date,
  mode: DateStampMode,
  style: DateStyle
) {
  if (mode === "none") return ""

  const formattedDate =
    style === "numeric"
      ? `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
          date.getDate()
        ).padStart(2, "0")}.${date.getFullYear()}`
      : new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(date)

  if (mode === "date") return formattedDate

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

  if (mode === "date-time") return `${formattedDate} · ${formattedTime}`

  return `${formattedDate} · ${formattedTime} · Captured with AmoreFrame`
}

function formatFilmNumber(date: Date, mode: FilmNumberMode) {
  if (mode === "none") return ""

  const seed = Math.abs(
    date.getFullYear() * 31 +
      (date.getMonth() + 1) * 17 +
      date.getDate() * 13 +
      date.getHours() * 7 +
      date.getMinutes()
  )

  if (mode === "frame") {
    return `FRAME ${String((seed % 999) + 1).padStart(3, "0")}`
  }

  if (mode === "roll") {
    return `ROLL ${String((seed % 99) + 1).padStart(2, "0")}`
  }

  return `AF-${date.getFullYear()}-${String((seed * 97) % 999999).padStart(
    6,
    "0"
  )}`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
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
