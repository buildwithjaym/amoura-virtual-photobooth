"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  WandSparkles,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Why Amoura", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Dual Mode", href: "#dual-mode" },
  { label: "Themes", href: "#themes" },
  { label: "FAQ", href: "#faq" },
];

const themes = [
  {
    name: "Noir Date",
    text: "Cinematic black and red for intimate moments.",
  },
  {
    name: "Soft Romance",
    text: "Warm pink tones for sweet memories.",
  },
  {
    name: "Vintage Film",
    text: "Nostalgic grain and timeless photostrip texture.",
  },
  {
    name: "Barkada Fun",
    text: "Playful frames for friends and celebrations.",
  },
];

const reasons = [
  {
    icon: Heart,
    title: "Emotion-first, not filter-first",
    text: "Amoura is designed around how a moment feels — closeness, excitement, nostalgia, and the joy of having something worth keeping.",
  },
  {
    icon: Camera,
    title: "Feels like a real booth",
    text: "Countdowns, poses, photo sets, and instant strips make the experience feel intentional — not just another selfie.",
  },
  {
    icon: Users,
    title: "Made for distance",
    text: "Dual Mode is built for couples and friends who want to capture the same moment even when they are not in the same place.",
  },
  {
    icon: Download,
    title: "Designed to be saved",
    text: "Every session ends with a polished photostrip that feels ready to post, send, print, or keep in your memories.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your mood",
    text: "Pick a booth theme that matches the moment — romantic, cinematic, vintage, soft, or fun.",
  },
  {
    number: "02",
    title: "Pose with the countdown",
    text: "Amoura guides the session like a real booth so every shot feels natural and exciting.",
  },
  {
    number: "03",
    title: "Capture solo or together",
    text: "Use Single Mode for yourself or Dual Mode to connect with someone from anywhere.",
  },
  {
    number: "04",
    title: "Keep the strip",
    text: "Get a beautiful photostrip that is ready to save, share, or look back on later.",
  },
];

const audiences = [
  "Long-distance couples",
  "Date nights",
  "Best friends",
  "Solo portraits",
  "Birthdays",
  "Anniversaries",
  "Graduations",
  "Online celebrations",
];

const faqs = [
  {
    q: "What is Amoura?",
    a: "Amoura is a virtual photobooth PWA that lets people create beautiful photostrips using their phone or laptop camera.",
  },
  {
    q: "Is Amoura only for couples?",
    a: "No. Amoura is perfect for couples, friends, solo portraits, barkada memories, celebrations, and online moments.",
  },
  {
    q: "What is Dual Mode?",
    a: "Dual Mode lets two people join the same booth session remotely, follow one shared countdown, and create a connected photostrip experience.",
  },
  {
    q: "Do users need to install an app?",
    a: "No. Amoura is built as a Progressive Web App, so users can open it in the browser and later add it to their home screen.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="amoura-page min-h-screen overflow-hidden">
      <Header open={open} setOpen={setOpen} />

      <section className="relative overflow-hidden pt-28">
        <BackgroundGlow />

        <div className="amoura-container relative grid min-h-[calc(100vh-7rem)] items-center gap-12 pb-16 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 max-w-3xl"
          >
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-amoura-red-soft/30 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amoura-pink shadow-[0_0_45px_rgba(194,31,58,0.15)] sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>The virtual photobooth for moments that matter</span>
            </div>

            <h1 className="amoura-serif text-5xl leading-[0.92] text-amoura-cream sm:text-6xl md:text-7xl xl:text-8xl">
              Feel close, even when you’re{" "}
              <span className="amoura-script">far apart.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-amoura-muted sm:text-lg">
              Amoura turns your camera into a premium photobooth experience —
              with guided countdowns, cinematic themes, instant photostrips,
              and Dual Mode for shared memories from anywhere.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create-account"
                className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                Create your first memory
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
              <TrustPill icon={Camera} text="Real booth flow" />
              <TrustPill icon={Heart} text="Made for memories" />
              <TrustPill icon={ShieldCheck} text="No app store needed" />
            </div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      <section id="why" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="Why Amoura"
          title="Because the best memories should feel intentional."
          text="People do not fall in love with camera tools. They fall in love with how a moment feels. Amoura makes every capture feel cinematic, emotional, and worth saving."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.07 }}
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

      <section id="how" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="How it works"
          title="A real photobooth flow, rebuilt for your browser."
          text="Open Amoura, choose the mood, follow the countdown, and leave with a polished photostrip you actually want to keep."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-white/[0.035] p-6"
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

      <section id="dual-mode" className="relative py-20 sm:py-24">
        <BackgroundGlow />

        <div className="amoura-container relative">
          <div className="amoura-glass overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
                  Dual Mode
                </p>
                <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                  One booth feeling, even from two places.
                </h2>
                <p className="mt-6 text-lg leading-8 text-amoura-muted">
                  Dual Mode is designed to make distance feel smaller. Two
                  people join one session, follow one countdown, and create a
                  connected photostrip that feels like it happened in the same
                  booth.
                </p>

                <div className="mt-8 space-y-4">
                  <SellingPoint text="Perfect for long-distance couples and online dates." />
                  <SellingPoint text="Shared countdown makes the capture feel synchronized." />
                  <SellingPoint text="The final strip is designed to feel connected, not split." />
                </div>

                <a
                  href="#faq"
                  className="amoura-btn-secondary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold"
                >
                  Learn how it works
                  <ArrowRight className="h-5 w-5" />
                </a>
              </motion.div>

              <DualModePreview />
            </div>
          </div>
        </div>
      </section>

      <section id="themes" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="Booth themes"
          title="Every strip should match the mood."
          text="Amoura themes are not just filters. Each theme changes the feeling of the session — frame, tone, texture, and final output."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((theme, index) => (
            <motion.article
              key={theme.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/35"
            >
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-amoura-red/30 via-black to-amoura-red-deep/40">
                <div className="absolute inset-6 rounded-2xl border border-white/10 bg-black/35" />
                <div className="relative grid w-24 gap-2 rounded-xl border border-amoura-red-soft/30 bg-black/50 p-2">
                  <div className="aspect-[4/3] rounded-md bg-amoura-cream/20" />
                  <div className="aspect-[4/3] rounded-md bg-amoura-cream/20" />
                  <div className="aspect-[4/3] rounded-md bg-amoura-cream/20" />
                  <p className="amoura-serif pt-2 text-center text-lg text-amoura-red-soft">
                    Amoura
                  </p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-amoura-cream">
                  {theme.name}
                </h3>
                <p className="mt-2 leading-6 text-amoura-muted">
                  {theme.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="amoura-container py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amoura-red-soft">
              Who it is for
            </p>
            <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
              For moments people already want to remember.
            </h2>
            <p className="mt-6 text-lg leading-8 text-amoura-muted">
              Amoura works for romantic dates, solo portraits, online bonding,
              friend groups, birthdays, graduations, anniversaries, and small
              moments that become important later.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <section className="amoura-container py-20 sm:py-24">
        <div className="amoura-card-highlight rounded-[2rem] p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Quote className="mb-6 h-10 w-10 text-amoura-red-soft" />
              <h2 className="amoura-serif text-4xl leading-tight text-amoura-cream sm:text-6xl">
                Amoura is not about taking more photos. It is about making one
                moment feel unforgettable.
              </h2>
            </div>

            <div className="space-y-4 text-lg leading-8 text-amoura-muted">
              <p>
                A selfie captures what you looked like. A photobooth captures
                how the moment felt.
              </p>
              <p>
                That is the promise of Amoura: open the booth and leave with
                something you want to save.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="amoura-container py-20 sm:py-24">
        <SectionIntro
          eyebrow="FAQ"
          title="Simple answers before you create your first memory."
          text="Amoura is built to feel easy, emotional, and accessible from the first visit."
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

      <section className="amoura-container pb-24 pt-8">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-amoura-red-soft/30 bg-gradient-to-br from-amoura-red-deep/50 via-amoura-black-soft to-black p-8 text-center shadow-[0_0_90px_rgba(194,31,58,0.22)] sm:p-14">
          <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-72 w-72 rounded-full bg-amoura-red/40 blur-[90px]" />
          <div className="relative">
            <Star className="mx-auto mb-6 h-10 w-10 fill-amoura-pink text-amoura-pink" />
            <h2 className="amoura-serif mx-auto max-w-4xl text-4xl leading-tight text-amoura-cream sm:text-6xl">
              Your next memory deserves more than a screenshot.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-amoura-muted">
              Create your account and be ready for the virtual photobooth made
              for love, distance, friendship, and unforgettable little moments.
            </p>

            <Link
              href="/create-account"
              className="amoura-btn-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 font-semibold"
            >
              Create your first memory
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <nav className="amoura-container flex h-20 items-center justify-between">
        <Link href="/" className="leading-none">
          <p className="amoura-serif text-3xl text-amoura-red-soft">Amoura</p>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-amoura-muted">
            Virtual Photobooth
          </p>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-amoura-muted lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
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
        <div className="border-t border-white/5 bg-black/95 px-6 py-5 lg:hidden">
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
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.85, ease: "easeOut", delay: 0.1 }}
      className="relative mx-auto w-full max-w-[620px]"
    >
      <div className="absolute inset-8 rounded-full bg-amoura-red/30 blur-[100px]" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <Image
          src="/images/amoura-hero.png"
          alt="Amoura romantic virtual photobooth strips"
          width={900}
          height={900}
          priority
          className="relative z-10 w-full object-contain drop-shadow-[0_0_55px_rgba(194,31,58,0.35)]"
        />
      </motion.div>

      <div className="amoura-glass absolute right-2 top-8 hidden rounded-2xl px-4 py-3 sm:block">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-amoura-red-soft" />
          <div>
            <p className="font-semibold text-amoura-cream">Instant Strip</p>
            <p className="text-sm text-amoura-muted">Ready to save</p>
          </div>
        </div>
      </div>

      <div className="amoura-glass absolute bottom-10 left-2 hidden rounded-2xl px-4 py-3 sm:block">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-amoura-red-soft" />
          <div>
            <p className="font-semibold text-amoura-cream">Dual Mode</p>
            <p className="text-sm text-amoura-muted">Together anywhere</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DualModePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative"
    >
      <div className="rounded-[2rem] border border-amoura-red-soft/30 bg-black/40 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-black via-[#17070b] to-black p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-amoura-cream">
              Shared booth session
            </p>
            <span className="rounded-full bg-amoura-red/20 px-3 py-1 text-xs text-amoura-pink">
              Synced
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <Avatar />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-amoura-muted">
                You
              </span>
            </div>

            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <Avatar delay />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-amoura-muted">
                Them
              </span>
            </div>
          </div>

          <div className="amoura-card-highlight mx-auto -mt-6 max-w-sm rounded-3xl p-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amoura-red-soft">
              Countdown
            </p>
            <p className="mt-2 text-5xl font-bold text-amoura-cream">3</p>
            <p className="mt-2 text-sm text-amoura-muted">
              Same moment. Same booth feeling.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
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
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute right-[-18%] top-[12%] h-[620px] w-[620px] rounded-full bg-amoura-red/30 blur-[150px]" />
      <div className="pointer-events-none absolute left-[-16%] top-[28%] h-[380px] w-[380px] rounded-full bg-amoura-red-deep/25 blur-[130px]" />
    </>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
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
  );
}

function TrustPill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amoura-red-soft/20 bg-white/[0.035] px-4 py-3">
      <Icon className="h-4 w-4 text-amoura-red-soft" />
      <span>{text}</span>
    </div>
  );
}

function SellingPoint({ text }: { text: string }) {
  return (
    <p className="flex gap-3 text-amoura-muted">
      <Check className="mt-1 h-5 w-5 shrink-0 text-amoura-red-soft" />
      <span>{text}</span>
    </p>
  );
}
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="amoura-container flex flex-col gap-8 text-sm text-amoura-muted md:flex-row md:items-center md:justify-between">
        
        {/* LEFT: Brand */}
        <div>
          <p className="amoura-serif text-3xl text-amoura-red-soft">Amoura</p>
          <p className="mt-1">Virtual photobooth for moments together.</p>
        </div>

        {/* CENTER: Navigation */}
        <div className="flex flex-wrap gap-5">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        {/* RIGHT: Credit */}
        <div className="text-xs text-amoura-muted/70 md:text-right">
          © 2026 Jaymar Maruji
        </div>
      </div>
    </footer>
  );
}