# ❤️ Amoura — Virtual Photobooth PWA

> **Capture the moment, beautifully.**

Amoura is a premium virtual photobooth Progressive Web App (PWA) designed to transform everyday moments into cinematic, aesthetic photostrips — whether you're alone, with friends, or connected from anywhere in the world.

---

## ✨ Overview

Amoura delivers a **real photobooth experience on the web**, combining elegant design, emotional storytelling, and modern web technologies.

Unlike typical camera apps, Amoura focuses on:

* Shared experiences
* Beautiful outputs
* Emotional connection
* Premium aesthetics

---

## 🎯 Core Features

### 📸 Photobooth Experience

* Countdown-based auto capture
* Multi-shot sessions (photostrip format)
* Live photostrip preview
* Download & share outputs

### 🎭 Booth Themes

* Noir Date (cinematic black & red)
* Soft Romance (warm & dreamy)
* Vintage Film (grainy retro)
* Barkada Fun (colorful & energetic)

### 👤 Single Mode

* Solo sessions or same-device group photos
* Instant capture and preview

### 💞 Dual Mode *(Coming Soon)*

* Connect with someone remotely
* Synced countdown capture
* Combined photostrip output

### 💾 Memory Archive *(Planned)*

* Save and organize your sessions
* Personal gallery

---

## 💎 Premium Plan — ₱99/month

Unlock everything with Amoura Premium:

* Unlimited sessions
* Access to all premium themes
* HD downloads
* No watermark
* Dual Mode access

---

## 🧱 Tech Stack

### Frontend

* **Next.js (App Router)**
* **React + TypeScript**
* **Tailwind CSS**
* **Framer Motion**
* **shadcn/ui**

### Core Features

* **WebRTC (getUserMedia)** — Camera access
* **Canvas API** — Photostrip generation

### Backend & Services

* **Supabase**

  * Authentication
  * Database
  * Storage
  * Realtime (for Dual Mode)

### Payments

* **PayMongo** (Philippines)

### PWA

* **next-pwa**

  * Installable app
  * Offline support

---

## 📁 Project Structure

```
src/
│
├── app/            # Pages & routing (Next.js App Router)
├── components/     # UI components (buttons, cards, etc.)
├── features/       # Core features (photobooth, camera, sessions)
├── hooks/          # Custom hooks (camera, countdown)
├── lib/            # Utilities (Supabase, helpers)
└── styles/         # Global styles
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/amoura-web.git
cd amoura-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

App will run at:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

PAYMONGO_SECRET_KEY=your_secret
PAYMONGO_PUBLIC_KEY=your_public
```

---

## 🎨 Design Philosophy

Amoura is designed as a **luxury experience**, not a utility app.

### Principles:

* Cinematic visuals
* Emotional storytelling
* Minimal but expressive UI
* Dark theme with red accents
* Soft glow & motion

---

## 🛠 Roadmap

### Phase 1 (MVP)

* [x] Landing page
* [x] Single Mode
* [x] Photostrip generator
* [x] Basic themes
* [x] Download/share

### Phase 2

* [ ] Premium system (PayMongo)
* [X] Additional themes
* [ ] UI polish

### Phase 3

* [X] Dual Mode (remote sessions)
* [X] Realtime sync

### Phase 4

* [ ] Memory archive
* [ ] User accounts
* [ ] Session replay

---

## 🤝 Contributing

Currently in active development. Contributions, ideas, and feedback are welcome.

---

## 📄 License

MIT License

---

## 💡 Vision

Amoura aims to become the **go-to virtual photobooth platform** for:

* Couples
* Friends
* Long-distance relationships
* Events and celebrations

---

> Built with ❤️ to make moments last forever.
