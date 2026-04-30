"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Camera,
  Check,
  Crown,
  Download,
  Heart,
  Image as ImageIcon,
  Lock,
  Menu,
  MessageCircleHeart,
  MousePointer2,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WandSparkles,
  X,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Why Amoura", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Dual Mode", href: "#dual-mode" },
  { label: "FAQ", href: "#faq" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const features = [
  {
    icon: Heart,
    title: "Made for couples first",
    text: "Amoura is built around connection — cute dates, anniversaries, late-night calls, and long-distance memories that deserve more than screenshots.",
  },
  {
    icon: Users,
    title: "Together, even apart",
    text: "Dual Mode lets two people join the same booth session from different places and capture a shared photostrip moment.",
  },
  {
    icon: WandSparkles,
    title: "Aesthetic by default",
    text: "No complicated editing. Choose a booth theme and let Amoura handle the mood, layout, countdown, and final strip.",
  },
  {
    icon: Download,
    title: "Built for keepsakes",
    text: "Every session ends with something worth saving, posting, printing, or sending to someone special.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Start your Amoura space and keep your future booth memories in one place.",
  },
  {
    number: "02",
    title: "Choose a booth mood",
    text: "Pick romantic, cinematic, playful, minimal, vintage, or event-inspired themes.",
  },
  {
    number: "03",
    title: "Invite or go solo",
    text: "Use Single Mode for yourself or Dual Mode to capture with someone far away.",
  },
  {
    number: "04",
    title: "Pose, capture, keep",
    text: "Follow the countdown, capture your set, and receive a polished photostrip.",
  },
]

const audiences = [
  "Long-distance couples",
  "Date nights",
  "Solo portraits",
  "Friends and barkada",
  "Birthdays",
  "Anniversaries",
  "Graduations",
  "Online celebrations",
]

const faqs = [
  {
    q: "What is Amoura?",
    a: "Amoura is a browser-based virtual photobooth that helps you create beautiful photostrip memories using your phone or laptop camera.",
  },
  {
    q: "What makes Amoura different?",
    a: "Dual Mode. Two people can join the same session from different places, follow the same countdown, and create a shared photobooth memory together.",
  },
  {
    q: "Do users need to install an app?",
    a: "No. Amoura is designed as a PWA, so users can open it in the browser and later add it to their home screen.",
  },
  {
    q: "Is Amoura only for couples?",
    a: "Couples are the main focus, but Amoura also works for solo portraits, friends, families, birthdays, graduations, and online celebrations.",
  },
  {
    q: "Is the product already available?",
    a: "Amoura is currently being built. The landing page should focus on account creation, early access, and building excitement around Dual Mode.",
  },
]

export default function HomePage() {
  const [open, setOpen] = useState(false)

  return (
    <main className="amoura-page min-h-screen overflow-hidden">
      <Header open={open} setOpen={setOpen} />

      <section className="relative min-h-screen overflow-hidden pt-28">
        <SideGlow />

        <div className="amoura-container relative grid min-h-[calc(100vh-7rem)] items-center gap-16 pb-20 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amoura-red-soft/30 bg-white/[0.04] px-4 py-2 text-sm text-amoura-pink shadow-[0_0_45px_rgba(194,31,58,0.15)]">
              <Sparkles className="h-4 w-4" />
              The virtual photobooth for people who miss each other
            </div>

            <h1 className="amoura-serif text-5xl leading-[0.92] text-amoura-cream sm:text-7xl lg:text-8xl">
              Capture the moment{" "}
              <span className="amoura-script">together</span>, even when
              you’re apart.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-amoura-muted sm:text-xl">
              Amoura turns your camera into a premium photobooth experience for
              couples, friends, and solo memories — with guided countdowns,
              beautiful booth themes, instant photostrips, and Dual Mode for
              long-distance moments.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create-account"
                className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                Create your account
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#dual-mode"
                className="amoura-btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                <Play className="h-5 w-5" />
                See Dual Mode
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm text-amoura-muted sm:grid-cols-3">
              <TrustPill icon={Camera} text="No booth rental" />
              <TrustPill icon={Heart} text="Made for memories" />
              <TrustPill icon={ShieldCheck} text="PWA-ready experience" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            <HeroBoothMockup />
          </motion.div>
        </div>
      </section>

      <section id="why" className="amoura-container py-24">
        <SectionIntro
          eyebrow="Why Amoura"
          title="Because memories deserve more than another selfie."
          text="People do not fall in love with camera tools. They fall in love with how a moment feels. Amoura is designed to make every capture feel intentional, cinematic, and worth keeping."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="amoura-card group p-6 transition duration-300 hover:-translate-y-1 hover:border-amoura-red-soft/45"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amoura-red-soft/30 bg-amoura-red/15 text-amoura-red-soft transition group-hover:scale-105">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-amoura-cream">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-amoura-muted">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="dual-mode" className="relative py-24">
        <SideGlow />
        <div className="amoura-container relative">
          <div className="amoura-glass overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
                  Our edge
                </p>
                <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                  The photobooth for two people in two places.
                </h2>
                <p className="mt-6 text-lg leading-8 text-amoura-muted">
                  Long-distance couples should not have to settle for blurry
                  screenshots and awkward video call photos. With Dual Mode,
                  Amoura creates a shared booth moment — same countdown, same
                  theme, same memory.
                </p>

                <div className="mt-8 space-y-4">
                  <SellingPoint text="Perfect for couples who want cute matching memories." />
                  <SellingPoint text="Built for online dates, monthsaries, anniversaries, and surprise sessions." />
                  <SellingPoint text="Makes distance feel less like distance." />
                </div>

                <Link
                  href="/create-account"
                  className="amoura-btn-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold"
                >
                  Create account for early access
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <DualModeMockup />
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="amoura-container py-24">
        <SectionIntro
          eyebrow="How to use it"
          title="A real photobooth flow, rebuilt for your browser."
          text="Amoura should feel simple the first time and exciting every time after. Open it, choose the mood, pose with the countdown, and keep the strip."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/25 p-6"
            >
              <p className="mb-8 text-sm font-bold text-amoura-red-soft">
                {step.number}
              </p>
              <h3 className="text-xl font-semibold text-amoura-cream">
                {step.title}
              </h3>
              <p className="mt-3 leading-7 text-amoura-muted">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="amoura-container py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
              Who it is for
            </p>
            <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
              For the moments people already want to remember.
            </h2>
            <p className="mt-6 text-lg leading-8 text-amoura-muted">
              Amoura is not limited to events. It is for everyday romance,
              spontaneous selfies, online dates, friend groups, birthdays,
              graduations, and the small moments that become important later.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {audiences.map((item) => (
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

      <section className="amoura-container py-24">
        <div className="amoura-card-highlight rounded-[2rem] p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Quote className="mb-6 h-10 w-10 text-amoura-red-soft" />
              <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                The promise is simple: open Amoura and leave with something
                worth keeping.
              </h2>
            </div>

            <div className="space-y-4 text-lg leading-8 text-amoura-muted">
              <p>
                The best product story for Amoura is not “we have filters.” It
                is: “we help people feel close, cute, and remembered.”
              </p>
              <p>
                That is what makes the amoura unique. The camera is only the
                tool. The real product is the memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="amoura-container py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
            About Amoura
          </p>
          <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
            A premium photobooth experience for a world that connects online.
          </h2>
          <p className="mt-6 text-lg leading-8 text-amoura-muted">
            Physical photobooths are fun, but they are not always nearby,
            affordable, or available when the moment happens. Amoura brings that
            same excitement to your phone — designed for couples, friends, solo
            portraits, and people who want beautiful memories without needing a
            physical booth.
          </p>
        </div>
      </section>

      <section id="faq" className="amoura-container py-24">
        <SectionIntro
          eyebrow="FAQ"
          title="Questions people may ask before creating an account."
          text="Keep this section direct. The goal is to remove hesitation and make the product feel easy to understand."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-3xl border border-amoura-red-soft/20 bg-white/[0.035] p-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold text-amoura-cream">
                {faq.q}
                <span className="text-amoura-red-soft transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 leading-7 text-amoura-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="amoura-container pb-24 pt-10">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-amoura-red-soft/30 bg-gradient-to-br from-amoura-red-deep/50 via-amoura-black-soft to-black p-8 text-center shadow-[0_0_90px_rgba(194,31,58,0.22)] sm:p-14">
          <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-72 w-72 rounded-full bg-amoura-red/40 blur-[90px]" />
          <div className="relative">
            <Crown className="mx-auto mb-6 h-10 w-10 text-amoura-pink" />
            <h2 className="amoura-serif mx-auto max-w-4xl text-4xl leading-tight text-amoura-cream sm:text-6xl">
              Be one of the first to create memories with Amoura.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-amoura-muted">
              Create your account today and get ready for early access to the
              virtual photobooth made for love, distance, friendship, and
              unforgettable little moments.
            </p>

            <Link
              href="/create-account"
              className="amoura-btn-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 font-semibold"
            >
              Create your account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Header({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/55 backdrop-blur-xl">
      <nav className="amoura-container flex h-20 items-center justify-between">
        <Link href="/" className="leading-none">
          <p className="amoura-serif text-3xl text-amoura-red-soft">Amoura</p>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-amoura-muted">
            Virtual Photobooth
          </p>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-amoura-muted md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            href="/create-account"
            className="amoura-btn-primary rounded-full px-5 py-3 text-sm font-semibold"
          >
            Create Account
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amoura-red-soft/25 text-amoura-cream md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-black/90 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-amoura-muted">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 hover:text-white"
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
          </div>
        </div>
      )}
    </header>
  )
}

function SideGlow() {
  return (
    <>
      <div className="pointer-events-none absolute right-[-18%] top-[12%] h-[620px] w-[620px] rounded-full bg-amoura-red/30 blur-[150px]" />
      <div className="pointer-events-none absolute right-[4%] top-[42%] h-[240px] w-[240px] rounded-full bg-amoura-red-soft/10 blur-[90px]" />
    </>
  )
}

function HeroBoothMockup() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-lg">
      <div className="absolute inset-0 rounded-full bg-amoura-red/20 blur-[100px]" />

      <div className="relative rotate-2 rounded-[2rem] border border-amoura-red-soft/40 bg-gradient-to-b from-[#8b1226] to-[#210509] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,95,122,0.16),rgba(255,255,255,0.03))]" />
              <div className="relative flex gap-5">
                <Avatar />
                <Avatar delay />
              </div>
              <p className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-amoura-pink">
                pose {item}
              </p>
            </div>
          ))}
        </div>

        <div className="py-6 text-center">
          <p className="amoura-serif text-4xl text-amoura-pink">Amoura</p>
          <div className="mt-2 flex justify-center gap-2 text-amoura-red-soft">
            <Heart className="h-4 w-4 fill-current" />
            <Sparkles className="h-4 w-4" />
            <Heart className="h-4 w-4 fill-current" />
          </div>
        </div>
      </div>

      <div className="amoura-glass absolute -left-6 bottom-20 hidden rounded-2xl p-4 sm:block">
        <div className="flex items-center gap-3">
          <MessageCircleHeart className="h-5 w-5 text-amoura-red-soft" />
          <div>
            <p className="font-semibold text-amoura-cream">Dual Mode</p>
            <p className="text-sm text-amoura-muted">Together from anywhere</p>
          </div>
        </div>
      </div>

      <div className="amoura-glass absolute -right-4 top-12 hidden rounded-2xl p-4 sm:block">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-amoura-red-soft" />
          <div>
            <p className="font-semibold text-amoura-cream">Instant Strip</p>
            <p className="text-sm text-amoura-muted">Ready to save</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DualModeMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-amoura-red-soft/25 bg-black/35 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-amoura-muted">Partner A</p>
            <span className="rounded-full bg-amoura-red/20 px-3 py-1 text-xs text-amoura-pink">
              Ready
            </span>
          </div>
          <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-white/[0.04]">
            <Avatar />
          </div>
        </div>

        <div className="rounded-[2rem] border border-amoura-red-soft/25 bg-black/35 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-amoura-muted">Partner B</p>
            <span className="rounded-full bg-amoura-red/20 px-3 py-1 text-xs text-amoura-pink">
              Synced
            </span>
          </div>
          <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-white/[0.04]">
            <Avatar delay />
          </div>
        </div>
      </div>

      <div className="amoura-card-highlight mx-auto -mt-8 max-w-sm rounded-3xl p-5 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amoura-red-soft">
          Countdown
        </p>
        <p className="mt-2 text-5xl font-bold text-amoura-cream">3</p>
        <p className="mt-2 text-sm text-amoura-muted">
          Same moment. Same booth. Same memory.
        </p>
      </div>
    </motion.div>
  )
}

function Avatar({ delay = false }: { delay?: boolean }) {
  return (
    <motion.div
      animate={{ y: delay ? [0, -5, 0] : [0, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center"
    >
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amoura-pink to-amoura-red" />
      <div className="mt-2 h-12 w-24 rounded-t-full bg-gradient-to-br from-amoura-red/80 to-amoura-red-deep" />
    </motion.div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
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
}

function TrustPill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amoura-red-soft/20 bg-white/[0.035] px-4 py-3">
      <Icon className="h-4 w-4 text-amoura-red-soft" />
      <span>{text}</span>
    </div>
  )
}

function SellingPoint({ text }: { text: string }) {
  return (
    <p className="flex gap-3 text-amoura-muted">
      <Check className="mt-1 h-5 w-5 shrink-0 text-amoura-red-soft" />
      <span>{text}</span>
    </p>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="amoura-container flex flex-col justify-between gap-6 text-sm text-amoura-muted md:flex-row md:items-center">
        <div>
          <p className="amoura-serif text-3xl text-amoura-red-soft">Amoura</p>
          <p className="mt-1">Virtual photobooth for moments together.</p>
        </div>

        <div className="flex flex-wrap gap-5">
          <a href="#why" className="hover:text-white">
            Why Amoura
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#dual-mode" className="hover:text-white">
            Dual Mode
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  )
}