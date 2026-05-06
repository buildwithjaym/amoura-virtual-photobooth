import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import PWARegister from "@/components/pwa-register"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const siteUrl = "https://www.amoreframephotobooth.site"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "AmoreFrame — Romantic Virtual Photobooth",
    template: "%s | AmoreFrame",
  },

  description:
    "AmoreFrame is a romantic virtual photobooth for couples, dates, anniversaries, friends, and long-distance memories. Create beautiful photostrips together, even when apart.",

  applicationName: "AmoreFrame",

  keywords: [
    "AmoreFrame",
    "romantic virtual photobooth",
    "virtual photobooth",
    "online photobooth",
    "couple photobooth",
    "date night photobooth",
    "long distance couple app",
    "long distance photobooth",
    "photo strip maker",
    "photostrip maker",
    "mobile photobooth",
    "browser photobooth",
    "PWA photobooth",
    "romantic photo booth",
    "online photo strip",
  ],

  authors: [{ name: "AmoreFrame", url: siteUrl }],
  creator: "AmoreFrame",
  publisher: "AmoreFrame",

  category: "photo",
  classification: "Virtual Photobooth Application",

  alternates: {
    canonical: "/",
  },

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },

  openGraph: {
    title: "AmoreFrame — Romantic Virtual Photobooth",
    description:
      "Create romantic photostrips together, even from afar. AmoreFrame is made for couples, dates, anniversaries, friends, and long-distance memories.",
    type: "website",
    url: "/",
    siteName: "AmoreFrame",
    locale: "en_US",
    images: [
      {
        url: "/images/amoreframe-og.png",
        width: 1200,
        height: 630,
        alt: "AmoreFrame romantic virtual photobooth preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AmoreFrame — Romantic Virtual Photobooth",
    description:
      "Create beautiful photobooth memories with someone you love, even when apart.",
    images: ["/images/amoreframe-og.png"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    capable: true,
    title: "AmoreFrame",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0B0507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#0B0507] text-amoura-cream antialiased`}
      >
        <PWARegister />
        1<Analytics />
        {children}
      </body>
    </html>
  )
}