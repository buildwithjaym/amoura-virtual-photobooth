"use client"

import Link from "next/link"
import {
  memo,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Download,
  Loader2,
  LockKeyhole,
  MoveHorizontal,
  PartyPopper,
  Pencil,
  RefreshCcw,
  Rows3,
  Sparkles,
  Type,
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
  preview: string
  stickers: StickerMap
}

type CaptionPosition = "top" | "bottom" | "hidden"
type DateStampMode = "none" | "date" | "date-time" | "date-time-brand"
type FilmNumberMode = "none" | "frame" | "roll" | "serial"
type WizardStep =
  | "design"
  | "stickers"
  | "filters"
  | "caption"
  | "details"
  | "download"

type EditorState = {
  activeTab: "strips" | "cards"
  selectedCategory: DesignCategoryId
  selectedDesignId: string
  selectedPhotoIndex: number
  selectedStickerPackId: StickerPackId
  stickers: StickerMap
  selectedFilterId: string
  caption: string
  captionPosition: CaptionPosition
  dateStampMode: DateStampMode
  filmNumberMode: FilmNumberMode
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

const WIZARD_STEPS: { id: WizardStep; label: string; shortLabel: string }[] = [
  { id: "design", label: "Choose a design", shortLabel: "Design" },
  { id: "stickers", label: "Pick a sticker pack", shortLabel: "Stickers" },
  { id: "filters", label: "Choose a filter", shortLabel: "Filter" },
  { id: "caption", label: "Add your words", shortLabel: "Text" },
  { id: "details", label: "Add film details", shortLabel: "Details" },
  { id: "download", label: "Review your memory", shortLabel: "Ready" },
]

const DEFAULT_EDITOR_STATE: EditorState = {
  activeTab: "strips",
  selectedCategory: "trending",
  selectedDesignId: "noir-date",
  selectedPhotoIndex: 0,
  selectedStickerPackId: "none",
  stickers: {},
  selectedFilterId: "original",
  caption: "",
  captionPosition: "bottom",
  dateStampMode: "none",
  filmNumberMode: "none",
}

const DESIGN_CATEGORIES: {
  id: DesignCategoryId
  label: string
  emoji: string
  designIds: string[]
}[] = [
  {
    id: "trending",
    label: "Trending",
    emoji: "🔥",
    designIds: [
      "noir-date",
      "soft-romance",
      "barkada-fun",
      "sakura-dream",
      "electric-match",
      "monster-match",
    ],
  },
  {
    id: "romance",
    label: "Romance",
    emoji: "❤️",
    designIds: [
      "soft-romance",
      "noir-date",
      "kawaii-love",
      "cherry-blossom",
      "mythic-bloom",
      "electric-match",
    ],
  },
  {
    id: "aesthetic",
    label: "Aesthetic",
    emoji: "✨",
    designIds: [
      "pure-white",
      "golden-hour",
      "ocean-breeze",
      "sakura-dream",
      "festival-night",
      "cosmic-vow",
    ],
  },
  {
    id: "cute",
    label: "Cute",
    emoji: "🎀",
    designIds: [
      "kawaii-love",
      "barkada-fun",
      "cherry-blossom",
      "sakura-dream",
      "mythic-bloom",
      "monster-match",
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    designIds: [
      "pixel-adventure",
      "retro-pop",
      "electric-match",
      "monster-match",
      "arcade-duo",
      "cosmic-vow",
    ],
  },
  {
    id: "movies",
    label: "Movies",
    emoji: "🎬",
    designIds: [
      "noir-date",
      "vintage-film",
      "midnight-luxe",
      "festival-night",
      "cosmic-vow",
    ],
  },
  {
    id: "nature",
    label: "Nature",
    emoji: "🌸",
    designIds: [
      "golden-hour",
      "ocean-breeze",
      "cherry-blossom",
      "sakura-dream",
      "mythic-bloom",
    ],
  },
  {
    id: "retro",
    label: "Retro",
    emoji: "📼",
    designIds: [
      "vintage-film",
      "retro-pop",
      "pixel-adventure",
      "arcade-duo",
    ],
  },
  {
    id: "seasonal",
    label: "Seasonal",
    emoji: "🎄",
    designIds: ["christmas-starlight", "cherry-blossom", "golden-hour"],
  },
  {
    id: "premium",
    label: "Premium",
    emoji: "⭐",
    designIds: [
      "midnight-luxe",
      "pure-white",
      "noir-date",
      "cosmic-vow",
      "electric-match",
    ],
  },
]

const DESIGN_BADGES: Partial<Record<string, DesignBadge>> = {
  "noir-date": "TRENDING",
  "sakura-dream": "NEW",
  "pixel-adventure": "NEW",
  "christmas-starlight": "LIMITED",
  "electric-match": "TRENDING",
  "monster-match": "NEW",
}

const STICKER_PACKS: StickerPack[] = [
  {
    id: "none",
    name: "None",
    subtitle: "Keep the frame clean",
    preview: "Clean",
    stickers: {},
  },
  {
    id: "hearts",
    name: "Hearts",
    subtitle: "Soft romantic corners",
    preview: "❤️ 💕 💗",
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
    subtitle: "Fresh floral details",
    preview: "🌸 🌷 🌼",
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
    subtitle: "Light and polished",
    preview: "✨ ⭐ 💫",
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
    subtitle: "Sweet diary details",
    preview: "🎀 🧸 🍓",
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
    preview: "🎮 🕹️ 🏆",
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
    subtitle: "Analog nostalgia",
    preview: "📼 📻 💿",
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
    preview: "🌙 🪐 🚀",
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
    preview: "🍓 🍰 🧋",
    stickers: {
      topLeft: "🍓",
      topRight: "🍰",
      bottomLeft: "🍒",
      bottomRight: "🧋",
    },
  },
]

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



const EXTRA_STRIP_DESIGNS: StripDesign[] = [
  {
    kind: "strip",
    id: "pixel-adventure",
    name: "Pixel Adventure",
    subtitle: "A bright original quest made from tiny memories.",
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
    canvas: {
      background: "#120b2d",
      border: "#22d3ee",
      photoBorder: "#7c3aed",
      text: "#ecfeff",
      mutedText: "#a5f3fc",
      accent: "#facc15",
      decoration: "retro",
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
    canvas: {
      background: "#fff1f7",
      border: "#f9a8d4",
      photoBorder: "#ffffff",
      text: "#701a75",
      mutedText: "#c026d3",
      accent: "#f472b6",
      decoration: "kawaii",
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
    canvas: {
      background: "#1f102f",
      border: "#f59e0b",
      photoBorder: "#fb7185",
      text: "#fffbeb",
      mutedText: "#fed7aa",
      accent: "#f59e0b",
      decoration: "midnight",
    },
  },
  {
    kind: "strip",
    id: "christmas-starlight",
    name: "Christmas Starlight",
    subtitle: "Deep green, warm gold, and soft winter light.",
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
    canvas: {
      background: "#052e16",
      border: "#fbbf24",
      photoBorder: "#166534",
      text: "#fefce8",
      mutedText: "#fde68a",
      accent: "#fbbf24",
      decoration: "midnight",
    },
  },
]

const EXTRA_CARD_DESIGNS: CardDesign[] = [
  {
    kind: "card",
    id: "monster-match",
    name: "Monster Match",
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
    typeLabel: "Wild Bond",
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
    id: "arcade-duo",
    name: "Arcade Duo",
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
    typeLabel: "Arcade",
    hp: 190,
    moveName: "High Score Bond",
    moveDamage: 130,
    moveDescription: "Combo memories multiply whenever both players smile.",
    rarity: "▲",
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

const ALL_STRIP_DESIGNS = [...STRIP_DESIGNS, ...EXTRA_STRIP_DESIGNS]
const ALL_CARD_DESIGNS = [...CARD_DESIGNS, ...EXTRA_CARD_DESIGNS]
const ALL_DESIGNS: DesignOption[] = [
  ...ALL_STRIP_DESIGNS,
  ...ALL_CARD_DESIGNS,
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



const imagePromiseCache = new Map<string, Promise<HTMLImageElement>>()

export default function ResultClient() {
  const [photos, setPhotos] = useState<string[]>([])
  const [editor, setEditor] = useState<EditorState>(DEFAULT_EDITOR_STATE)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStartStep, setWizardStartStep] = useState(0)
  const [previewRevision, setPreviewRevision] = useState(0)

  const captureDate = useRef(new Date()).current

  const selectedDesign = useMemo(
    () => getDesignById(editor.selectedDesignId),
    [editor.selectedDesignId]
  )
  const selectedFilter = useMemo(
    () => getFilterById(editor.selectedFilterId),
    [editor.selectedFilterId]
  )
  const previewPhotos = useMemo(() => photos.slice(0, MAX_PHOTOS), [photos])
  const dateStampText = useMemo(
    () => formatDateStamp(captureDate, editor.dateStampMode),
    [captureDate, editor.dateStampMode]
  )
  const filmNumberText = useMemo(
    () => formatFilmNumber(captureDate, editor.filmNumberMode),
    [captureDate, editor.filmNumberMode]
  )

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      window.location.href = "/booth/single"
      return
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      const validPhotos = Array.isArray(parsed)
        ? parsed.filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0
          )
        : []

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
    if (photos.length === 0) return

    const timer = window.setTimeout(() => {
      photos.forEach((photo) => {
        void loadImage(photo).catch(() => undefined)
      })
    }, 80)

    return () => window.clearTimeout(timer)
  }, [photos])

  const openWizardAt = useCallback((stepId: WizardStep) => {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId)
    setWizardStartStep(index === -1 ? 0 : index)
    setWizardOpen(true)
  }, [])

  const closeWizard = useCallback(() => setWizardOpen(false), [])

  const applyEditorChanges = useCallback((nextEditor: EditorState) => {
    setEditor(nextEditor)
    setPreviewRevision((current) => current + 1)
    setWizardOpen(false)
  }, [])

  const retakePhotos = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    window.location.href = "/booth/single"
  }, [])

  const handleDownload = useCallback(
    async (state: EditorState = editor) => {
      if (previewPhotos.length === 0 || isDownloading) return

      try {
        setIsDownloading(true)

        const design = getDesignById(state.selectedDesignId)
        const filter = getFilterById(state.selectedFilterId)
        const canvas = document.createElement("canvas")
        const stateDateStampText = formatDateStamp(
          captureDate,
          state.dateStampMode
        )
        const stateFilmNumberText = formatFilmNumber(
          captureDate,
          state.filmNumberMode
        )

        if (design.kind === "strip") {
          canvas.width = STRIP_WIDTH
          canvas.height = STRIP_HEIGHT

          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Canvas context is unavailable")

          await drawStrip({
            ctx,
            photos: previewPhotos,
            design,
            filter,
            caption: state.caption,
            captionPosition: state.captionPosition,
            dateStampText: stateDateStampText,
            filmNumberText: stateFilmNumberText,
            stickers: state.stickers,
          })
        } else {
          canvas.width = CARD_WIDTH
          canvas.height = CARD_HEIGHT

          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Canvas context is unavailable")

          const photo =
            previewPhotos[state.selectedPhotoIndex] ?? previewPhotos[0]

          await drawCard({
            ctx,
            photo,
            design,
            filter,
            caption: state.caption,
            captionPosition: state.captionPosition,
            dateStampText: stateDateStampText,
            filmNumberText: stateFilmNumberText,
            stickers: state.stickers,
          })
        }

        const blob = await canvasToBlob(canvas)
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = url
        link.download = `amoreframe-${design.id}-${filter.id}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (error) {
        console.error("Download error:", error)
        window.alert("We could not download your memory. Please try again.")
      } finally {
        setIsDownloading(false)
      }
    },
    [captureDate, editor, isDownloading, previewPhotos]
  )

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

  const filledStickerCount = STICKER_SLOTS.filter(
    (slot) => editor.stickers[slot]
  ).length
  const stickerPack =
    STICKER_PACKS.find((pack) => pack.id === editor.selectedStickerPackId) ??
    STICKER_PACKS[0]

  return (
    <>
      <style jsx global>{`
        @keyframes previewApply {
          from {
            opacity: 0.72;
            transform: translateY(5px) scale(0.992);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sheetIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.992);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-preview-apply {
          animation: previewApply 240ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .animate-sheet-in {
          animation: sheetIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .amore-rail {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior-inline: contain;
        }

        .amore-rail::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-preview-apply,
          .animate-sheet-in {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <main className="amoura-page min-h-screen overflow-x-hidden pb-24 lg:pb-6">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#080406]/88 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:pt-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 lg:rounded-[1.35rem] lg:border lg:border-amoura-red-soft/20 lg:bg-black/45 lg:px-5 lg:py-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-amoura-muted outline-none transition hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
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
                Private preview, processed on your device
              </p>
            </div>
          </div>
        </header>

        <section className="px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(300px,0.8fr)_minmax(420px,1.2fr)]">
              <section className="relative rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-2.5 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:min-h-[620px] lg:max-h-[850px]">
                <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amoura-cream backdrop-blur-md sm:left-6 sm:top-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live preview
                </div>

                <div className="flex h-[61svh] min-h-[410px] items-center justify-center sm:h-[69svh] sm:min-h-[520px] lg:h-full lg:min-h-0">
                  <div
                    key={previewRevision}
                    className="animate-preview-apply flex h-full w-full items-center justify-center"
                    aria-live="polite"
                    aria-label={`${selectedDesign.name} preview`}
                  >
                    {selectedDesign.kind === "strip" ? (
                      <StripPreview
                        photos={previewPhotos}
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={editor.caption}
                        captionPosition={editor.captionPosition}
                        dateStampText={dateStampText}
                        filmNumberText={filmNumberText}
                        stickers={editor.stickers}
                      />
                    ) : (
                      <CardPreview
                        photo={
                          previewPhotos[editor.selectedPhotoIndex] ??
                          previewPhotos[0]
                        }
                        design={selectedDesign}
                        filter={selectedFilter}
                        caption={editor.caption}
                        captionPosition={editor.captionPosition}
                        dateStampText={dateStampText}
                        filmNumberText={filmNumberText}
                        stickers={editor.stickers}
                      />
                    )}
                  </div>
                </div>
              </section>

              <aside className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-6 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
                <section>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-amoura-red-soft">
                    Your final frame
                  </p>
                  <h1 className="amoura-serif mt-2 text-[clamp(2rem,4vw,3.35rem)] leading-[0.96] text-amoura-cream">
                    Make this memory feel like yours.
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-amoura-muted sm:text-base">
                    Move through one choice at a time. Your main preview updates
                    only after you apply the changes, which keeps the editor
                    fast and calm.
                  </p>
                </section>

                <button
                  type="button"
                  onClick={() => openWizardAt("design")}
                  className="amoura-btn-primary mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
                >
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                  Customize your memory
                </button>

                <section className="mt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amoura-cream">
                        Your look
                      </p>
                      <p className="mt-0.5 text-xs text-amoura-muted">
                        Tap a section to edit it
                      </p>
                    </div>
                    <SwipeHint className="lg:hidden" />
                  </div>

                  <HorizontalRail
                    label="Quick customization sections"
                    className="mt-3 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pr-0"
                  >
                    <QuickEditCard
                      label="Design"
                      value={selectedDesign.name}
                      icon={<Rows3 className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => openWizardAt("design")}
                    />
                    <QuickEditCard
                      label="Stickers"
                      value={
                        filledStickerCount === 0
                          ? "None"
                          : `${stickerPack.name}, ${filledStickerCount} placed`
                      }
                      icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => openWizardAt("stickers")}
                    />
                    <QuickEditCard
                      label="Filter"
                      value={selectedFilter.name}
                      icon={<Wand2 className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => openWizardAt("filters")}
                    />
                    <QuickEditCard
                      label="Text and details"
                      value={
                        editor.caption || dateStampText || filmNumberText || "Not set"
                      }
                      icon={<Type className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => openWizardAt("caption")}
                    />
                  </HorizontalRail>
                </section>

                <section className="mt-5 rounded-2xl border border-amoura-red-soft/15 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
                        Ready to save
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-amoura-cream">
                        {selectedDesign.kind === "card"
                          ? "Collectible card PNG"
                          : "Three-photo strip PNG"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDownload()}
                      disabled={isDownloading}
                      className="amoura-btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold outline-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      Save
                    </button>
                  </div>
                </section>

                <section className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3">
                  <div className="flex gap-3">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-100">
                        Photos stay on this device
                      </p>
                      <p className="mt-1 text-xs leading-5 text-emerald-100/65">
                        Preview and export happen locally inside your browser.
                      </p>
                    </div>
                  </div>
                </section>

                <button
                  type="button"
                  onClick={retakePhotos}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/30 px-5 text-sm font-semibold text-amoura-cream outline-none transition hover:border-amoura-red-soft/45 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Retake photos
                </button>
              </aside>
            </section>
          </div>
        </section>
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#090507]/94 px-3 pt-3 backdrop-blur-2xl lg:hidden"
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
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/25 bg-black/55 text-amoura-cream outline-none transition active:scale-95 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
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
          initialState={editor}
          initialStepIndex={wizardStartStep}
          captureDate={captureDate}
          onClose={closeWizard}
          onApply={applyEditorChanges}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          onRetake={retakePhotos}
        />
      ) : null}
    </>
  )
}

function QuickEditCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string
  value: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-20 w-[72vw] max-w-[260px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-3 text-left outline-none transition hover:border-amoura-red-soft/30 focus-visible:ring-2 focus-visible:ring-amoura-red-soft lg:w-auto lg:max-w-none"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amoura-red-soft/15 bg-amoura-red/10 text-amoura-red-soft">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.14em] text-amoura-muted">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm font-semibold text-amoura-cream">
          {value}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-amoura-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  )
}

function SwipeHint({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-amoura-muted ${className}`}
    >
      <MoveHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
      Swipe
    </span>
  )
}

function HorizontalRail({
  children,
  label,
  className = "",
}: {
  children: ReactNode
  label: string
  className?: string
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0b0608] to-transparent lg:hidden" />
      <div
        className={`amore-rail flex snap-x snap-mandatory gap-2.5 overflow-x-auto pr-10 ${className}`}
        aria-label={label}
      >
        {children}
      </div>
    </div>
  )
}

function WizardModal({
  photos,
  initialState,
  initialStepIndex,
  captureDate,
  onClose,
  onApply,
  onDownload,
  isDownloading,
  onRetake,
}: {
  photos: string[]
  initialState: EditorState
  initialStepIndex: number
  captureDate: Date
  onClose: () => void
  onApply: (state: EditorState) => void
  onDownload: (state: EditorState) => Promise<void>
  isDownloading: boolean
  onRetake: () => void
}) {
  const [draft, setDraft] = useState<EditorState>(initialState)
  const [stepIndex, setStepIndex] = useState(initialStepIndex)
  const deferredCaption = useDeferredValue(draft.caption)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const step = WIZARD_STEPS[stepIndex]?.id ?? "design"
  const selectedDesign = useMemo(
    () => getDesignById(draft.selectedDesignId),
    [draft.selectedDesignId]
  )
  const selectedFilter = useMemo(
    () => getFilterById(draft.selectedFilterId),
    [draft.selectedFilterId]
  )
  const dateStampText = useMemo(
    () => formatDateStamp(captureDate, draft.dateStampMode),
    [captureDate, draft.dateStampMode]
  )
  const filmNumberText = useMemo(
    () => formatFilmNumber(captureDate, draft.filmNumberMode),
    [captureDate, draft.filmNumberMode]
  )

  const patchDraft = useCallback((patch: Partial<EditorState>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }, [])

  const removeDraftSticker = useCallback((slot: StickerSlot) => {
    setDraft((current) => {
      const stickers = { ...current.stickers }
      delete stickers[slot]
      return { ...current, stickers }
    })
  }, [])

  const addDraftSticker = useCallback((emoji: string) => {
    setDraft((current) => {
      const nextSlot = STICKER_SLOTS.find((slot) => !current.stickers[slot])
      if (!nextSlot) return current

      return {
        ...current,
        selectedStickerPackId: "none",
        stickers: { ...current.stickers, [nextSlot]: emoji },
      }
    })
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  const isFirst = stepIndex === 0
  const isLast = stepIndex === WIZARD_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/68 p-1.5 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="amore-editor-title"
        className="animate-sheet-in flex max-h-[78dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-amoura-red-soft/20 bg-[#0b0608] shadow-2xl sm:max-h-[82vh] sm:rounded-[1.75rem]"
      >
        <div className="shrink-0 px-4 pt-2 sm:hidden">
          <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        </div>

        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/5 px-4 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amoura-red-soft">
              Step {stepIndex + 1} of {WIZARD_STEPS.length}
            </p>
            <h2
              id="amore-editor-title"
              className="amoura-serif mt-1 truncate text-xl text-amoura-cream sm:text-2xl"
            >
              {WIZARD_STEPS[stepIndex]?.label}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-amoura-muted outline-none transition hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
            aria-label="Close editor and discard unapplied changes"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="shrink-0 px-4 py-2.5 sm:px-5">
          <div className="flex gap-1.5" aria-label="Customization progress">
            {WIZARD_STEPS.map((wizardStep, index) => (
              <button
                key={wizardStep.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`h-1.5 flex-1 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                  index === stepIndex
                    ? "bg-amoura-red-soft"
                    : index < stepIndex
                      ? "bg-amoura-red-soft/45"
                      : "bg-white/10"
                }`}
                aria-label={`Go to ${wizardStep.shortLabel}`}
                aria-current={index === stepIndex ? "step" : undefined}
              />
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 sm:px-5">
          {step !== "download" ? (
            <div className="mb-3 rounded-2xl border border-white/6 bg-black/20 p-2.5">
              <div className="flex h-32 items-center justify-center sm:h-40">
                {selectedDesign.kind === "strip" ? (
                  <StripPreview
                    photos={photos}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={deferredCaption}
                    captionPosition={draft.captionPosition}
                    dateStampText={dateStampText}
                    filmNumberText={filmNumberText}
                    stickers={draft.stickers}
                    onRemoveSticker={removeDraftSticker}
                  />
                ) : (
                  <CardPreview
                    photo={photos[draft.selectedPhotoIndex] ?? photos[0]}
                    design={selectedDesign}
                    filter={selectedFilter}
                    caption={deferredCaption}
                    captionPosition={draft.captionPosition}
                    dateStampText={dateStampText}
                    filmNumberText={filmNumberText}
                    stickers={draft.stickers}
                    onRemoveSticker={removeDraftSticker}
                  />
                )}
              </div>
            </div>
          ) : null}

          {step === "design" ? (
            <DesignStep
              state={draft}
              photos={photos}
              filter={selectedFilter}
              onChange={patchDraft}
            />
          ) : null}

          {step === "stickers" ? (
            <StickerStep
              state={draft}
              onChange={patchDraft}
              onAddSticker={addDraftSticker}
            />
          ) : null}

          {step === "filters" ? (
            <FilterStep
              previewPhoto={photos[draft.selectedPhotoIndex] ?? photos[0]}
              selectedFilterId={draft.selectedFilterId}
              onSelect={(selectedFilterId) =>
                patchDraft({ selectedFilterId })
              }
            />
          ) : null}

          {step === "caption" ? (
            <CaptionStep state={draft} onChange={patchDraft} />
          ) : null}

          {step === "details" ? (
            <DetailsStep
              state={draft}
              dateStampText={dateStampText}
              filmNumberText={filmNumberText}
              onChange={patchDraft}
            />
          ) : null}

          {step === "download" ? (
            <DownloadStep
              state={draft}
              photos={photos}
              selectedDesign={selectedDesign}
              selectedFilter={selectedFilter}
              dateStampText={dateStampText}
              filmNumberText={filmNumberText}
              isDownloading={isDownloading}
              onDownload={() => onDownload(draft)}
              onApply={() => onApply(draft)}
              onRetake={onRetake}
            />
          ) : null}
        </div>

        {!isLast ? (
          <footer
            className="flex shrink-0 items-center justify-between gap-2.5 border-t border-white/5 bg-[#0b0608]/96 px-4 pt-3 backdrop-blur-xl sm:px-5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.9rem)" }}
          >
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border border-amoura-red-soft/20 bg-black/35 px-4 text-sm font-semibold text-amoura-cream outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                isFirst ? "invisible" : ""
              }`}
              tabIndex={isFirst ? -1 : 0}
              aria-hidden={isFirst}
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
              className="amoura-btn-primary inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
            >
              {step === "details" ? "Review" : "Next"}
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  )
}

function DesignStep({
  state,
  photos,
  filter,
  onChange,
}: {
  state: EditorState
  photos: string[]
  filter: FilterOption
  onChange: (patch: Partial<EditorState>) => void
}) {
  const list = state.activeTab === "strips" ? ALL_STRIP_DESIGNS : ALL_CARD_DESIGNS
  const availableCategories = DESIGN_CATEGORIES.filter((category) =>
    list.some((design) => category.designIds.includes(design.id))
  )
  const effectiveCategory = availableCategories.some(
    (category) => category.id === state.selectedCategory
  )
    ? state.selectedCategory
    : availableCategories[0]?.id ?? "trending"
  const activeCategory =
    DESIGN_CATEGORIES.find((category) => category.id === effectiveCategory) ??
    DESIGN_CATEGORIES[0]
  const filteredDesigns = list.filter((design) =>
    activeCategory.designIds.includes(design.id)
  )

  function selectCategory(categoryId: DesignCategoryId) {
    const category = DESIGN_CATEGORIES.find((item) => item.id === categoryId)
    const currentIsVisible = category?.designIds.includes(state.selectedDesignId)
    const firstDesign = list.find((design) =>
      category?.designIds.includes(design.id)
    )

    onChange({
      selectedCategory: categoryId,
      selectedDesignId:
        currentIsVisible || !firstDesign ? state.selectedDesignId : firstDesign.id,
    })
  }

  function switchType(activeTab: "strips" | "cards") {
    const targetList = activeTab === "strips" ? ALL_STRIP_DESIGNS : ALL_CARD_DESIGNS
    const currentDesign = getDesignById(state.selectedDesignId)
    const targetKind = activeTab === "strips" ? "strip" : "card"
    const category = DESIGN_CATEGORIES.find(
      (item) => item.id === state.selectedCategory
    )
    const nextDesign =
      targetList.find((design) => category?.designIds.includes(design.id)) ??
      targetList[0]

    onChange({
      activeTab,
      selectedDesignId:
        currentDesign.kind === targetKind ? currentDesign.id : nextDesign.id,
    })
  }

  return (
    <div className="pb-1">
      <div className="inline-flex w-full items-center gap-1 rounded-full border border-amoura-red-soft/15 bg-black/25 p-1">
        <button
          type="button"
          onClick={() => switchType("strips")}
          className={tabClass(state.activeTab === "strips")}
          aria-pressed={state.activeTab === "strips"}
        >
          <Rows3 className="h-4 w-4" aria-hidden="true" />
          Photo strips
        </button>
        <button
          type="button"
          onClick={() => switchType("cards")}
          className={tabClass(state.activeTab === "cards")}
          aria-pressed={state.activeTab === "cards"}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Holo cards
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Browse collections
        </p>
        <SwipeHint />
      </div>

      <HorizontalRail label="Design categories" className="mt-2.5">
        {availableCategories.map((category) => {
          const active = category.id === effectiveCategory

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.id)}
              className={`min-h-10 shrink-0 snap-start rounded-full border px-3.5 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/15 text-amoura-cream"
                  : "border-white/10 bg-black/20 text-amoura-muted hover:border-white/20 hover:text-amoura-cream"
              }`}
              aria-pressed={active}
            >
              <span aria-hidden="true">{category.emoji}</span> {category.label}
            </button>
          )
        })}
      </HorizontalRail>

      {state.activeTab === "cards" && photos.length > 1 ? (
        <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
              Card photo
            </p>
            <SwipeHint />
          </div>
          <HorizontalRail label="Choose a card photo" className="mt-2.5">
            {photos.map((photo, index) => {
              const active = state.selectedPhotoIndex === index

              return (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => onChange({ selectedPhotoIndex: index })}
                  className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                    active
                      ? "border-amoura-red-soft"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  aria-label={`Use captured shot ${index + 1}`}
                  aria-pressed={active}
                >
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
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
          </HorizontalRail>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amoura-cream">
            {activeCategory.emoji} {activeCategory.label}
          </p>
          <p className="mt-0.5 text-xs text-amoura-muted">
            The next design peeks in to invite a swipe
          </p>
        </div>
        <SwipeHint />
      </div>

      <HorizontalRail label={`${activeCategory.label} designs`} className="mt-3 pb-2">
        {filteredDesigns.map((design) => {
          const active = state.selectedDesignId === design.id

          return (
            <button
              key={design.id}
              type="button"
              onClick={() => onChange({ selectedDesignId: design.id })}
              className={`w-[41vw] max-w-[170px] shrink-0 snap-start rounded-2xl border p-2 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft sm:w-40 ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/10"
                  : "border-white/8 bg-black/20 hover:border-white/18"
              } [content-visibility:auto] [contain-intrinsic-size:160px_280px]`}
              aria-label={`Select ${design.name}`}
              aria-pressed={active}
            >
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
                  photo={photos[state.selectedPhotoIndex] ?? photos[0]}
                  filter={filter}
                  active={active}
                />
              )}
              <p className="mt-2 truncate text-sm font-semibold text-amoura-cream">
                {design.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-amoura-muted">
                {design.subtitle}
              </p>
            </button>
          )
        })}
      </HorizontalRail>
    </div>
  )
}

function StickerStep({
  state,
  onChange,
  onAddSticker,
}: {
  state: EditorState
  onChange: (patch: Partial<EditorState>) => void
  onAddSticker: (emoji: string) => void
}) {
  const filledCount = STICKER_SLOTS.filter((slot) => state.stickers[slot]).length

  return (
    <div className="pb-1">
      <div className="rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3">
        <p className="text-sm leading-5 text-amoura-muted">
          Pick one balanced pack. You can remove any placed sticker by tapping
          it in the preview.
        </p>
        <p className="mt-1.5 text-xs font-semibold text-amoura-cream">
          {filledCount === 0 ? "No stickers placed" : `${filledCount} stickers placed`}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Sticker packs
        </p>
        <SwipeHint />
      </div>

      <HorizontalRail label="Sticker packs" className="mt-2.5 pb-2">
        {STICKER_PACKS.map((pack) => {
          const active = state.selectedStickerPackId === pack.id

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() =>
                onChange({
                  selectedStickerPackId: pack.id,
                  stickers: { ...pack.stickers },
                })
              }
              className={`min-h-28 w-36 shrink-0 snap-start rounded-2xl border p-3 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/12"
                  : "border-white/8 bg-black/20 hover:border-white/20"
              }`}
              aria-pressed={active}
            >
              <div className="min-h-7 text-lg" aria-hidden="true">
                {pack.preview}
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
      </HorizontalRail>

      <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
              Quick add
            </p>
            <p className="mt-0.5 text-[11px] text-amoura-muted">
              Keeps the original single-sticker option
            </p>
          </div>
          <span className="text-xs text-amoura-muted">
            {Math.max(0, STICKER_SLOTS.length - filledCount)} spots left
          </span>
        </div>
        <HorizontalRail label="Individual stickers" className="mt-2.5">
          {STICKER_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onAddSticker(emoji)}
              disabled={filledCount >= STICKER_SLOTS.length}
              className="flex h-12 w-12 shrink-0 snap-start items-center justify-center rounded-xl border border-white/8 bg-black/25 text-xl outline-none transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
              aria-label={`Add ${emoji} sticker`}
            >
              {emoji}
            </button>
          ))}
        </HorizontalRail>
      </div>
    </div>
  )
}

function FilterStep({
  previewPhoto,
  selectedFilterId,
  onSelect,
}: {
  previewPhoto?: string
  selectedFilterId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="pb-1">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amoura-cream">
            Keep the edit subtle
          </p>
          <p className="mt-0.5 text-xs text-amoura-muted">
            Swipe through natural, warm, dreamy, and film looks
          </p>
        </div>
        <SwipeHint />
      </div>

      <HorizontalRail label="Photo filters" className="mt-3 pb-2">
        {FILTERS.map((filter) => {
          const active = selectedFilterId === filter.id

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onSelect(filter.id)}
              className={`w-36 shrink-0 snap-start overflow-hidden rounded-2xl border text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
                active
                  ? "border-amoura-red-soft bg-amoura-red/10"
                  : "border-white/8 bg-black/20 hover:border-white/20"
              }`}
              aria-pressed={active}
            >
              <div className="aspect-[4/3] overflow-hidden bg-black/30">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: filter.cssFilter }}
                    loading="lazy"
                    decoding="async"
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
      </HorizontalRail>
    </div>
  )
}

function CaptionStep({
  state,
  onChange,
}: {
  state: EditorState
  onChange: (patch: Partial<EditorState>) => void
}) {
  const kind = getDesignById(state.selectedDesignId).kind
  const placeholder =
    kind === "card" ? "For example: Ken and Faye" : "My favorite memory ♥"

  return (
    <div className="pb-1">
      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <label
          htmlFor="amore-caption"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted"
        >
          {kind === "card" ? "Card name" : "Caption"}
        </label>
        <textarea
          id="amore-caption"
          value={state.caption}
          onChange={(event) =>
            onChange({ caption: event.target.value.slice(0, MAX_CAPTION) })
          }
          maxLength={MAX_CAPTION}
          rows={3}
          placeholder={placeholder}
          className="mt-2 w-full resize-none rounded-2xl border border-amoura-red-soft/15 bg-black/35 px-4 py-3 text-base text-amoura-cream outline-none transition placeholder:text-amoura-muted focus:border-amoura-red-soft/45 focus:ring-2 focus:ring-amoura-red-soft/20"
        />
        <p className="mt-2 text-right text-xs text-amoura-muted">
          {state.caption.length}/{MAX_CAPTION}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Position
        </p>
        <OptionPills
          value={state.captionPosition}
          options={[
            { id: "top", label: "Top" },
            { id: "bottom", label: "Bottom" },
            { id: "hidden", label: "Hidden" },
          ]}
          onChange={(value) =>
            onChange({ captionPosition: value as CaptionPosition })
          }
          columns={3}
        />
      </div>
    </div>
  )
}

function DetailsStep({
  state,
  dateStampText,
  filmNumberText,
  onChange,
}: {
  state: EditorState
  dateStampText: string
  filmNumberText: string
  onChange: (patch: Partial<EditorState>) => void
}) {
  return (
    <div className="space-y-3 pb-1">
      <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Date stamp
        </p>
        <OptionPills
          value={state.dateStampMode}
          options={[
            { id: "none", label: "None" },
            { id: "date", label: "Date" },
            { id: "date-time", label: "Date + time" },
            { id: "date-time-brand", label: "+ AmoreFrame" },
          ]}
          onChange={(value) =>
            onChange({ dateStampMode: value as DateStampMode })
          }
          columns={2}
        />
        {dateStampText ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-xs text-amoura-muted">
            {dateStampText}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amoura-muted">
          Film metadata
        </p>
        <OptionPills
          value={state.filmNumberMode}
          options={[
            { id: "none", label: "None" },
            { id: "frame", label: "FRAME 024" },
            { id: "roll", label: "ROLL 03" },
            { id: "serial", label: "AF serial" },
          ]}
          onChange={(value) =>
            onChange({ filmNumberMode: value as FilmNumberMode })
          }
          columns={2}
        />
        {filmNumberText ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2 font-mono text-xs text-amoura-muted">
            {filmNumberText}
          </p>
        ) : null}
      </section>
    </div>
  )
}

function OptionPills({
  value,
  options,
  onChange,
  columns,
}: {
  value: string
  options: { id: string; label: string }[]
  onChange: (value: string) => void
  columns: 2 | 3
}) {
  return (
    <div
      className={`mt-3 grid gap-2 ${
        columns === 3 ? "grid-cols-3" : "grid-cols-2"
      }`}
    >
      {options.map((option) => {
        const active = option.id === value

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`min-h-11 rounded-xl border px-2.5 py-2 text-xs font-semibold leading-4 outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft ${
              active
                ? "border-amoura-red-soft bg-amoura-red/15 text-amoura-cream"
                : "border-white/8 bg-black/20 text-amoura-muted hover:border-white/20 hover:text-amoura-cream"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function DownloadStep({
  state,
  photos,
  selectedDesign,
  selectedFilter,
  dateStampText,
  filmNumberText,
  isDownloading,
  onDownload,
  onApply,
  onRetake,
}: {
  state: EditorState
  photos: string[]
  selectedDesign: DesignOption
  selectedFilter: FilterOption
  dateStampText: string
  filmNumberText: string
  isDownloading: boolean
  onDownload: () => Promise<void>
  onApply: () => void
  onRetake: () => void
}) {
  return (
    <div className="pb-2 text-center">
      <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-amoura-red-soft/30 bg-amoura-red/15">
        <PartyPopper className="h-5 w-5 text-amoura-red-soft" aria-hidden="true" />
      </div>
      <h3 className="amoura-serif text-2xl text-amoura-cream">
        Your memory is ready
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-5 text-amoura-muted">
        Review the draft, save it, or apply it to the main preview.
      </p>

      <div className="mx-auto mt-3 flex h-52 items-center justify-center rounded-2xl border border-white/6 bg-black/20 p-2.5 sm:h-60">
        {selectedDesign.kind === "strip" ? (
          <StripPreview
            photos={photos}
            design={selectedDesign}
            filter={selectedFilter}
            caption={state.caption}
            captionPosition={state.captionPosition}
            dateStampText={dateStampText}
            filmNumberText={filmNumberText}
            stickers={state.stickers}
          />
        ) : (
          <CardPreview
            photo={photos[state.selectedPhotoIndex] ?? photos[0]}
            design={selectedDesign}
            filter={selectedFilter}
            caption={state.caption}
            captionPosition={state.captionPosition}
            dateStampText={dateStampText}
            filmNumberText={filmNumberText}
            stickers={state.stickers}
          />
        )}
      </div>

      <div className="mt-3 grid gap-2.5">
        <button
          type="button"
          onClick={() => void onDownload()}
          disabled={isDownloading}
          className="amoura-btn-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold outline-none disabled:opacity-65 focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amoura-red-soft/20 bg-black/35 px-4 text-sm font-semibold text-amoura-cream outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Retake
          </button>
          <button
            type="button"
            onClick={onApply}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amoura-red-soft/35 bg-amoura-red/12 px-4 text-sm font-semibold text-amoura-cream outline-none transition focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Apply and close
          </button>
        </div>
      </div>
    </div>
  )
}

function tabClass(active: boolean) {
  return `inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold outline-none transition sm:text-sm ${
    active
      ? "bg-amoura-red-soft text-black shadow-[0_8px_24px_rgba(194,31,58,0.22)]"
      : "text-amoura-muted hover:text-amoura-cream focus-visible:ring-2 focus-visible:ring-amoura-red-soft"
  }`
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

        if (!onRemove) {
          return (
            <span
              key={slot}
              className={`pointer-events-none absolute z-30 flex h-8 w-8 items-center justify-center text-base leading-none sm:h-10 sm:w-10 sm:text-xl ${className}`}
              aria-hidden="true"
            >
              {emoji}
            </span>
          )
        }

        return (
          <button
            key={slot}
            type="button"
            onClick={() => onRemove(slot)}
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
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.4rem] border p-2.5 shadow-2xl transition-all duration-200 sm:p-3 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${STRIP_WIDTH} / ${STRIP_HEIGHT}` }}
      >
        <StripDecorations design={design} />
        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />
        {DESIGN_BADGES[design.id] ? (
          <EditionBadge badge={DESIGN_BADGES[design.id]!} />
        ) : null}

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
                style={{ filter: filter.cssFilter, transition: "filter 180ms ease" }}
                decoding="async"
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
          {dateStampText ? (
            <p
              className={`mt-1 line-clamp-2 text-[0.33rem] uppercase tracking-[0.07em] sm:text-[0.41rem] ${design.subtitleClass}`}
            >
              {dateStampText}
            </p>
          ) : (
            <p
              className={`mt-0.5 text-[0.34rem] uppercase tracking-[0.14em] sm:text-[0.42rem] ${design.subtitleClass}`}
            >
              Captured with love
            </p>
          )}
          {filmNumberText ? (
            <p
              className={`mt-0.5 font-mono text-[0.33rem] uppercase tracking-[0.12em] sm:text-[0.4rem] ${design.subtitleClass}`}
            >
              {filmNumberText}
            </p>
          ) : null}
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
        className={`relative flex h-[96%] max-h-[96%] w-auto max-w-full flex-col overflow-hidden rounded-[1.55rem] border-[3px] p-3 shadow-2xl transition-all duration-200 sm:p-4 ${design.backgroundClass} ${design.outerBorderClass}`}
        style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(
              ", "
            )})`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[7px] z-[1] rounded-[1.2rem] border border-white/25"
        />

        <StickerOverlay stickers={stickers} onRemove={onRemoveSticker} />
        {DESIGN_BADGES[design.id] ? (
          <EditionBadge badge={DESIGN_BADGES[design.id]!} />
        ) : null}

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span
            className={`rounded-full border border-white/20 bg-white/20 px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-wide backdrop-blur-sm sm:text-[0.6rem] ${design.subtitleClass}`}
          >
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
              style={{ filter: filter.cssFilter, transition: "filter 180ms ease" }}
              decoding="async"
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
            <p
              className={`truncate text-[0.58rem] font-bold sm:text-xs ${design.titleClass}`}
            >
              {design.moveName}
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
              className={`mt-1 line-clamp-1 text-[0.33rem] uppercase tracking-[0.07em] sm:text-[0.41rem] ${design.subtitleClass}`}
            >
              {dateStampText}
            </p>
          ) : null}
          <p
            className={`mt-0.5 font-mono text-[0.31rem] uppercase tracking-[0.1em] sm:text-[0.39rem] ${design.subtitleClass}`}
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
    <span className="absolute left-1/2 top-1 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[0.31rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-sm sm:top-1.5 sm:text-[0.38rem]">
      {badge}
    </span>
  )
}

const StripPoster = memo(function StripPoster({
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
      className={`relative mx-auto aspect-[9/22] w-full max-w-[145px] overflow-hidden rounded-[1rem] border p-2 transition ${design.backgroundClass} ${
        active ? "border-amoura-red-soft" : design.outerBorderClass
      }`}
    >
      <StripDecorations design={design} small />
      {DESIGN_BADGES[design.id] ? (
        <EditionBadge badge={DESIGN_BADGES[design.id]!} />
      ) : null}

      {active ? (
        <div className="absolute right-2 top-2 z-30 rounded-full bg-amoura-red-soft p-1 text-black">
          <Check className="h-3 w-3" aria-hidden="true" />
        </div>
      ) : null}

      <div className="relative z-10 pt-1 text-center">
        <p className={`truncate text-[9px] font-bold ${design.titleClass}`}>
          {design.brand}
        </p>
      </div>

      <div className="relative z-10 mt-1.5 grid gap-1.5">
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
                loading="lazy"
                decoding="async"
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
})

const CardPoster = memo(function CardPoster({
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
      className={`relative mx-auto w-full max-w-[145px] overflow-hidden rounded-[1rem] border-[2.5px] p-2 transition ${design.backgroundClass} ${
        active ? "border-amoura-red-soft" : design.outerBorderClass
      }`}
      style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(135deg, ${design.holoGradient.join(
            ", "
          )})`,
        }}
      />
      {DESIGN_BADGES[design.id] ? (
        <EditionBadge badge={DESIGN_BADGES[design.id]!} />
      ) : null}

      {active ? (
        <div className="absolute right-2 top-2 z-30 rounded-full bg-amoura-red-soft p-1 text-black">
          <Check className="h-3 w-3" aria-hidden="true" />
        </div>
      ) : null}

      <div className="relative z-10 flex items-center justify-between pt-1">
        <span className={`text-[7px] font-bold uppercase ${design.subtitleClass}`}>
          {design.typeLabel}
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
            loading="lazy"
            decoding="async"
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
})

function StripDecorations({
  design,
  small = false,
}: {
  design: StripDesign
  small?: boolean
}) {
  const size = small ? "text-[9px]" : "text-xs sm:text-sm"

  if (design.canvas.decoration === "vintage") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-2 top-0 h-full w-2.5 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)] sm:w-3" />
        <div className="absolute right-2 top-0 h-full w-2.5 bg-[repeating-linear-gradient(to_bottom,#451a03_0px,#451a03_8px,transparent_8px,transparent_17px)] sm:w-3" />
      </div>
    )
  }

  const cornerSets: Partial<
    Record<StripDesign["canvas"]["decoration"], [string, string, string, string]>
  > = {
    barkada: ["🌼", "😊", "✿", "🌈"],
    romance: ["♥", "♥", "♡", "♡"],
    kawaii: ["🎀", "♡", "☁", "✿"],
    midnight: ["✦", "☾", "✧", "✦"],
    noir: ["✦", "☾", "✧", "✦"],
    retro: ["★", "●", "◆", "★"],
  }

  const corners = cornerSets[design.canvas.decoration]

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

  if (DESIGN_BADGES[design.id]) {
    drawCanvasBadge(ctx, DESIGN_BADGES[design.id]!, STRIP_WIDTH / 2, 38)
  }

  ctx.textAlign = "center"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 54px Georgia, serif"
  ctx.fillText(design.brand, STRIP_WIDTH / 2, 82)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText(design.name.toUpperCase(), STRIP_WIDTH / 2, 114)

  const showCaption = caption.trim().length > 0 && captionPosition !== "hidden"
  const hasTopCaption = showCaption && captionPosition === "top"
  const hasBottomCaption = showCaption && captionPosition === "bottom"
  const topY = hasTopCaption ? 186 : TOP_PADDING + 28
  const footerStart = STRIP_HEIGHT - 160
  const bottomCaptionSpace = hasBottomCaption ? 72 : 0
  const availablePhotoHeight =
    footerStart -
    bottomCaptionSpace -
    topY -
    GAP * Math.max(photos.length - 1, 0)
  const photoHeight = Math.min(
    PHOTO_HEIGHT,
    Math.floor(availablePhotoHeight / Math.max(photos.length, 1))
  )

  if (hasTopCaption) {
    drawCaptionPill(
      ctx,
      caption,
      120,
      126,
      STRIP_WIDTH - 240,
      48,
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

    y += photoHeight + GAP
  }

  if (hasBottomCaption) {
    drawCaptionPill(
      ctx,
      caption,
      120,
      y - 4,
      STRIP_WIDTH - 240,
      50,
      design.canvas.text,
      design.canvas.border
    )
  }

  ctx.fillStyle = design.canvas.accent
  ctx.font = "bold 40px Georgia, serif"
  ctx.fillText(design.accent, STRIP_WIDTH / 2, STRIP_HEIGHT - 112)

  ctx.fillStyle = design.canvas.mutedText
  ctx.font = "bold 15px Arial, sans-serif"
  if (dateStampText) {
    drawCenteredWrappedText(
      ctx,
      dateStampText.toUpperCase(),
      STRIP_WIDTH / 2,
      STRIP_HEIGHT - 82,
      STRIP_WIDTH - 220,
      20,
      2
    )
  } else {
    ctx.fillText("CAPTURED WITH LOVE", STRIP_WIDTH / 2, STRIP_HEIGHT - 80)
  }

  if (filmNumberText) {
    ctx.font = "bold 14px monospace"
    ctx.fillText(filmNumberText, STRIP_WIDTH / 2, STRIP_HEIGHT - 40)
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

  if (DESIGN_BADGES[design.id]) {
    drawCanvasBadge(ctx, DESIGN_BADGES[design.id]!, CARD_WIDTH / 2, 42)
  }

  ctx.textAlign = "left"
  ctx.fillStyle = design.canvas.text
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillText(design.typeLabel.toUpperCase(), 64, 92)

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
      photoY + photoH - 86,
      photoW - 68,
      56,
      20,
      "#000000"
    )
    ctx.restore()

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 23px Arial, sans-serif"
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
  ctx.fillText(design.moveName, 88, moveY + 44)

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
  } else {
    const cornerSets: Partial<
      Record<StripDesign["canvas"]["decoration"], [string, string, string, string]>
    > = {
      barkada: ["🌼", "😊", "✿", "🌈"],
      romance: ["♥", "♥", "♡", "♡"],
      kawaii: ["🎀", "♡", "☁", "✿"],
      midnight: ["✦", "☾", "✧", "✦"],
      noir: ["✦", "☾", "✧", "✦"],
      retro: ["★", "●", "◆", "★"],
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
  const height = 28

  ctx.save()
  ctx.globalAlpha = 0.72
  drawRoundedRect(ctx, centerX - width / 2, y - 17, width, height, 14, "#000000")
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
  ctx.font = "500 22px Arial, sans-serif"
  ctx.fillText(
    fitCanvasText(ctx, caption, width - 48),
    x + width / 2,
    y + height / 2
  )
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

function formatDateStamp(date: Date, mode: DateStampMode) {
  if (mode === "none") return ""

  const formattedDate = new Intl.DateTimeFormat("en-US", {
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

function getDesignById(id: string) {
  return ALL_DESIGNS.find((design) => design.id === id) ?? ALL_DESIGNS[0]
}

function getFilterById(id: string) {
  return FILTERS.find((filter) => filter.id === id) ?? FILTERS[0]
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Canvas export failed"))
      }
    }, "image/png")
  })
}

function loadImage(src: string) {
  const cached = imagePromiseCache.get(src)
  if (cached) return cached

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      resolve(image)
    }

    image.crossOrigin = "anonymous"
    image.onload = finish
    image.onerror = () => {
      imagePromiseCache.delete(src)
      reject(new Error("Image failed to load"))
    }
    image.src = src

    if (typeof image.decode === "function") {
      void image.decode().then(finish).catch(() => undefined)
    }
  })

  imagePromiseCache.set(src, promise)
  return promise
}
