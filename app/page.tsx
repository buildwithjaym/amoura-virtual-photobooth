"use client"

import React, { memo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import {
  ArrowRight,
  Camera,
  Check,
  Download,
  Heart,
  Image as ImageIcon,
  Menu,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react"

const BRAND_NAME = "AmoreFrame"

const NAV_ITEMS = [
  { label: "Why AmoreFrame", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Dual Mode", href: "#dual-mode" },
  { label: "Themes", href: "#themes" },
  { label: "For who", href: "#for-who" },
  { label: "FAQ", href: "#faq" },
]

const THEMES = [
  {
    name: "Noir Date",
    text: "A cinematic black-and-red booth style for intimate date-night memories.",
  },
  {
    name: "Soft Romance",
    text: "Warm pink tones, soft glow, and gentle frames for sweet couple moments.",
  },
  {
    name: "Vintage Film",
    text: "Nostalgic grain, film texture, and timeless photostrip styling.",
  },
  {
    name: "Barkada Fun",
    text: "Playful frames for friends, birthdays, graduations, and online bonding.",
  },
]

const REASONS = [
  {
    icon: Heart,
    title: "Made for love, not just selfies",
    text: "AmoreFrame turns photo-taking into a romantic experience with themes, countdowns, poses, and photostrips that feel worth keeping.",
  },
  {
    icon: Camera,
    title: "Feels like a real photobooth",
    text: "Users follow a familiar booth flow: choose a theme, pose with the countdown, capture their shots, and get an instant strip.",
  },
  {
    icon: Users,
    title: "Built for long-distance moments",
    text: "Dual Mode lets two people join one booth session remotely, follow one countdown, and create a connected memory together.",
  },
  {
    icon: Download,
    title: "Designed to be shared",
    text: "Every session creates a polished photostrip users can download, send, post, print, or save in their memory gallery.",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Choose a booth theme",
    text: "Pick a mood that fits the moment — romantic, cinematic, vintage, soft, or fun.",
  },
  {
    number: "02",
    title: "Follow the countdown",
    text: "AmoreFrame guides each shot with a real photobooth-style countdown so the session feels exciting and intentional.",
  },
  {
    number: "03",
    title: "Capture solo or together",
    text: "Use Single Mode for yourself or Dual Mode to create a shared strip with someone from another place.",
  },
  {
    number: "04",
    title: "Download your strip",
    text: "Get a beautiful photostrip that is ready to save, share, post, or keep as a memory.",
  },
]

const AUDIENCES = [
  "Long-distance couples",
  "Date nights",
  "Anniversaries",
  "Birthdays",
  "Best friends",
  "Solo portraits",
  "Graduations",
  "Online celebrations",
]

const FAQS = [
  {
    q: "What is AmoreFrame?",
    a: "AmoreFrame is a romantic virtual photobooth that lets users create beautiful photostrips using their phone or laptop camera.",
  },
  {
    q: "Is AmoreFrame only for couples?",
    a: "No. AmoreFrame is designed for couples first, but it also works for friends, solo portraits, barkada memories, birthdays, graduations, anniversaries, and online celebrations.",
  },
  {
    q: "What makes AmoreFrame different from a selfie app?",
    a: "A selfie app simply takes pictures. AmoreFrame creates an experience — with themes, countdowns, guided captures, Dual Mode, and a final photostrip users actually want to keep.",
  },
  {
    q: "What is Dual Mode?",
    a: "Dual Mode lets two people join the same booth session remotely, follow one shared countdown, and create a connected photostrip even when they are in different places.",
  },
  {
    q: "Do users need to install an app?",
    a: "No. AmoreFrame can be built as a Progressive Web App, so users can open it in the browser and later add it to their home screen.",
  },
]

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
}

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <main className="amoura-page min-h-screen">
      <Header open={isNavOpen} setOpen={setIsNavOpen} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28">
        <BackgroundGlow />

        <div className="amoura-container relative grid min-h-[calc(100vh-7rem)] items-center gap-12 pb-16 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={FADE_UP}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/30 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink shadow-[0_0_45px_rgba(194,31,58,0.15)] sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>A romantic virtual photobooth for love, dates, and memories</span>
            </div>

            <h1 className="amoura-serif text-5xl leading-[0.92] text-amoura-cream sm:text-6xl md:text-7xl xl:text-8xl">
              Create romantic photostrips{" "}
              <span className="amoura-script">together, even from afar.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-amoura-muted sm:text-lg">
              AmoreFrame turns your camera into a premium romantic photobooth —
              with guided countdowns, cinematic themes, instant photostrips, and
              Dual Mode for shared memories from anywhere.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create-account"
                className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                Create your first strip <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#dual-mode"
                className="amoura-btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                <Play className="h-5 w-5" /> See Dual Mode
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm text-amoura-muted sm:grid-cols-3">
              <TrustPill icon={Camera} text="Real booth flow" />
              <TrustPill icon={Heart} text="Made for love" />
              <TrustPill icon={ShieldCheck} text="No app store needed" />
            </div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      {/* Quick Value */}
      <section className="amoura-container py-10 sm:py-14">
        <div className="grid gap-4 rounded-[2rem] border border-amoura-red-soft/20 bg-white/[0.035] p-5 sm:grid-cols-3 sm:p-6">
          <StatCard value="3–4" label="guided shots per strip" />
          <StatCard value="2 modes" label="single and dual sessions" />
          <StatCard value="1 link" label="to start a shared booth" />
        </div>
      </section>

      {/* Why */}
      <section id="why" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="Why AmoreFrame"
          title="Because romantic photos should feel like an experience."
          text="People do not pay for another camera button. They pay for a memory that feels special. AmoreFrame makes photo-taking feel intentional, emotional, and easy to share."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {REASONS.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={FADE_UP}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="amoura-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amoura-red-soft/45"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amoura-red-soft/30 bg-amoura-red/15 text-amoura-red-soft transition-transform group-hover:scale-105">
                <item.icon className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-semibold text-amoura-cream">{item.title}</h3>
              <p className="mt-3 leading-7 text-amoura-muted">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="How it works"
          title="A simple booth flow users already understand."
          text="No confusing setup. No heavy editing. Just choose a mood, follow the countdown, and leave with a beautiful photostrip."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.article
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={FADE_UP}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-6"
            >
              <p className="mb-8 text-sm font-bold text-amoura-red-soft">{step.number}</p>
              <h3 className="text-xl font-semibold text-amoura-cream">{step.title}</h3>
              <p className="mt-3 leading-7 text-amoura-muted">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Dual Mode */}
      <section id="dual-mode" className="relative py-20 sm:py-24">
        <BackgroundGlow />

        <div className="amoura-container relative">
          <div className="amoura-glass overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FADE_UP}
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
                  Dual Mode
                </p>

                <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                  One countdown. Two places. One memory.
                </h2>

                <p className="mt-6 text-lg leading-8 text-amoura-muted">
                  This is what makes AmoreFrame more than a normal photobooth.
                  Two people can join the same session remotely, pose at the same
                  time, and create a strip that feels connected.
                </p>

                <div className="mt-8 space-y-4">
                  <SellingPoint text="Perfect for long-distance couples and online dates." />
                  <SellingPoint text="A shared countdown makes the moment feel synchronized." />
                  <SellingPoint text="The final strip feels like one memory, not two separate selfies." />
                  <SellingPoint text="Easy to download, post, send, or save privately." />
                </div>

                <Link
                  href="/create-account"
                  className="amoura-btn-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold"
                >
                  Try Dual Mode <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <DualModePreview />
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="Booth themes"
          title="Every strip should match the feeling."
          text="Themes make AmoreFrame more than a filter tool. Users are choosing the mood of the memory — romantic, nostalgic, cinematic, or fun."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((theme, index) => (
            <motion.article
              key={theme.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/35"
            >
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-amoura-red/30 via-black to-amoura-red-deep/40">
                <div className="absolute inset-6 rounded-2xl border border-white/10 bg-black/35" />

                <div className="relative grid w-24 gap-2 rounded-xl border border-amoura-red-soft/30 bg-black/50 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-md bg-amoura-cream/20" />
                  ))}
                  <p className="amoura-serif pt-2 text-center text-base text-amoura-red-soft">
                    Amore
                  </p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-amoura-cream">{theme.name}</h3>
                <p className="mt-2 leading-6 text-amoura-muted">{theme.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* For Who */}
      <section id="for-who" className="amoura-container py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
              Who it is for
            </p>

            <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
              Built for moments people already want to remember.
            </h2>

            <p className="mt-6 text-lg leading-8 text-amoura-muted">
              The strongest market is romance: couples, online dates,
              anniversaries, and long-distance relationships. But AmoreFrame can
              also grow into birthdays, friends, graduations, and online celebrations.
            </p>

            <div className="mt-8 space-y-4">
              <SellingPoint text="Clear value: users instantly understand love + photos + frames." />
              <SellingPoint text="Shareable output: photostrips are easy to post and send." />
              <SellingPoint text="Stronger hook: Dual Mode gives the app a unique reason to exist." />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AUDIENCES.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-amoura-red-soft/20 bg-white/[0.035] px-5 py-4 text-amoura-cream"
              >
                <Check className="mb-3 h-5 w-5 text-amoura-red-soft" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="amoura-container py-20 sm:py-24">
        <div className="amoura-card-highlight rounded-[2rem] p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Quote className="mb-6 h-10 w-10 text-amoura-red-soft" />

              <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                AmoreFrame is not about taking more photos. It is about making
                one moment feel unforgettable.
              </h2>
            </div>

            <div className="space-y-4 text-lg leading-8 text-amoura-muted">
              <p>
                A selfie captures what you looked like. A photobooth captures how
                the moment felt.
              </p>
              <p>
                That is the promise of AmoreFrame: open the booth, follow the
                countdown, and leave with something worth saving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="FAQ"
          title="Simple answers before users create their first strip."
          text="AmoreFrame is built to feel easy, emotional, and instantly understandable."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-3xl border border-amoura-red-soft/20 bg-white/[0.035] p-6 transition-all"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold text-amoura-cream">
                {faq.q}
                <span className="text-amoura-red-soft transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-4 leading-7 text-amoura-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="amoura-container pb-24 pt-8">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-amoura-red-soft/30 bg-gradient-to-br from-amoura-red-deep/50 via-amoura-black-soft to-black p-8 text-center shadow-[0_0_90px_rgba(194,31,58,0.22)] sm:p-14">
          <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-72 w-72 rounded-full bg-amoura-red/40 blur-[90px]" />

          <div className="relative">
            <Star className="mx-auto mb-6 h-10 w-10 fill-amoura-pink text-amoura-pink" />

            <h2 className="amoura-serif mx-auto max-w-4xl text-4xl leading-tight text-amoura-cream sm:text-6xl">
              Your love story deserves more than a screenshot.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-amoura-muted">
              Create romantic photostrips, share memories from anywhere, and make
              every little moment feel worth keeping.
            </p>

            <Link
              href="/create-account"
              className="amoura-btn-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 font-semibold"
            >
              Create your first strip <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

const Header = memo(
  ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <nav className="amoura-container flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 leading-none">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-amoura-red-soft/30 bg-black/40 shadow-[0_0_18px_rgba(194,31,58,0.18)]">
              <Image
                src="/images/amoreframe-og.png"
                alt="AmoreFrame logo"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div>
              <p className="amoura-serif text-3xl text-amoura-red-soft transition-colors group-hover:text-amoura-pink">
                {BRAND_NAME}
              </p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-amoura-muted">
                Romantic Photobooth
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-amoura-muted lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link
              href="/create-account"
              className="amoura-btn-primary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Create Account
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amoura-red-soft/25 text-amoura-cream lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </nav>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 border-t border-white/5 bg-black/95 px-6 py-5 lg:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 text-amoura-muted hover:text-white"
              >
                {item.label}
              </a>
            ))}

            <Link
              href="/create-account"
              className="amoura-btn-primary mt-2 rounded-full px-5 py-3 text-center text-sm font-semibold"
            >
              Create Account
            </Link>
          </motion.div>
        )}
      </header>
    )
  }
)

Header.displayName = "Header"

const HeroVisual = memo(() => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
    className="relative mx-auto w-full max-w-[620px]"
  >
    <div className="absolute inset-8 rounded-full bg-amoura-red/30 blur-[100px]" />

    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <Image
        src="/images/amoreframe-hero.png"
        alt="AmoreFrame romantic virtual photobooth preview"
        width={900}
        height={900}
        priority
        className="relative z-10 h-auto w-full object-contain drop-shadow-[0_0_55px_rgba(194,31,58,0.35)]"
      />
    </motion.div>

    <div className="amoura-glass absolute right-2 top-8 hidden rounded-2xl px-4 py-3 sm:block">
      <div className="flex items-center gap-3">
        <ImageIcon className="h-5 w-5 text-amoura-red-soft" />
        <div>
          <p className="font-semibold text-amoura-cream">Instant Strip</p>
          <p className="text-xs text-amoura-muted">Ready to save</p>
        </div>
      </div>
    </div>

    <div className="amoura-glass absolute bottom-10 left-2 hidden rounded-2xl px-4 py-3 sm:block">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-amoura-red-soft" />
        <div>
          <p className="font-semibold text-amoura-cream">Dual Mode</p>
          <p className="text-xs text-amoura-muted">Together anywhere</p>
        </div>
      </div>
    </div>
  </motion.div>
))

HeroVisual.displayName = "HeroVisual"

const DualModePreview = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="relative"
  >
    <div className="rounded-[2rem] border border-amoura-red-soft/30 bg-black/40 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-black via-[#17070b] to-black p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-amoura-cream">Shared booth session</p>
          <span className="rounded-full bg-amoura-red/20 px-3 py-1 text-xs text-amoura-pink">
            Synced
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <BoothPerson label="You" />
          <BoothPerson label="Them" delay />
        </div>

        <div className="amoura-card-highlight mx-auto -mt-6 max-w-sm rounded-3xl p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amoura-red-soft">Countdown</p>
          <p className="mt-2 text-5xl font-bold text-amoura-cream">3</p>
          <p className="mt-2 text-xs text-amoura-muted">Same moment. Same booth feeling.</p>
        </div>
      </div>
    </div>
  </motion.div>
))

DualModePreview.displayName = "DualModePreview"

const BoothPerson = memo(({ label, delay = false }: { label: string; delay?: boolean }) => (
  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
    <Avatar delay={delay} />
    <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-amoura-muted">
      {label}
    </span>
  </div>
))

BoothPerson.displayName = "BoothPerson"

const Avatar = memo(({ delay = false }: { delay?: boolean }) => (
  <motion.div
    animate={{ y: delay ? [0, -5, 0] : [0, 5, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="flex flex-col items-center"
  >
    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amoura-pink to-amoura-red" />
    <div className="mt-2 h-12 w-24 rounded-t-full bg-gradient-to-br from-amoura-red/80 to-amoura-red-deep" />
  </motion.div>
))

Avatar.displayName = "Avatar"

const SectionIntro = memo(
  ({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) => (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
        {eyebrow}
      </p>
      <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
        {title}
      </h2>
      <p className="mt-6 text-lg leading-8 text-amoura-muted">{text}</p>
    </div>
  )
)

SectionIntro.displayName = "SectionIntro"

const TrustPill = memo(({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-amoura-red-soft/20 bg-white/[0.035] px-4 py-3">
    <Icon className="h-4 w-4 text-amoura-red-soft" />
    <span className="text-sm sm:text-base">{text}</span>
  </div>
))

TrustPill.displayName = "TrustPill"

const SellingPoint = memo(({ text }: { text: string }) => (
  <p className="flex gap-3 text-amoura-muted">
    <Check className="mt-1 h-5 w-5 shrink-0 text-amoura-red-soft" />
    <span>{text}</span>
  </p>
))

SellingPoint.displayName = "SellingPoint"

const StatCard = memo(({ value, label }: { value: string; label: string }) => (
  <div className="rounded-[1.5rem] border border-white/5 bg-black/25 p-5 text-center">
    <p className="amoura-serif text-4xl text-amoura-cream">{value}</p>
    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amoura-muted">{label}</p>
  </div>
))

StatCard.displayName = "StatCard"

const BackgroundGlow = memo(() => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute right-[-18%] top-[12%] h-[620px] w-[620px] rounded-full bg-amoura-red/30 blur-[150px]" />
    <div className="absolute left-[-16%] top-[28%] h-[380px] w-[380px] rounded-full bg-amoura-red-deep/25 blur-[130px]" />
  </div>
))

BackgroundGlow.displayName = "BackgroundGlow"

const Footer = memo(() => (
  <footer className="border-t border-white/5 py-10">
    <div className="amoura-container flex flex-col gap-8 text-sm text-amoura-muted md:flex-row md:items-center md:justify-between">
      <div>
        <p className="amoura-serif text-3xl text-amoura-red-soft">{BRAND_NAME}</p>
        <p className="mt-1">Romantic virtual photobooth for moments together.</p>
      </div>

      <div className="flex flex-wrap gap-5">
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href} className="transition-colors hover:text-white">
            {item.label}
          </a>
        ))}
      </div>

      <div className="text-xs text-amoura-muted/70 md:text-right">© 2026 Jaymar Maruji</div>
    </div>
  </footer>
))

Footer.displayName = "Footer"