import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Amoura — Virtual Photobooth for Moments Together",
  description:
    "Amoura is a premium virtual photobooth made for couples, friends, solo portraits, and long-distance memories. Capture beautiful photostrips together, even when apart.",
  applicationName: "Amoura",
  keywords: [
    "virtual photobooth",
    "online photobooth",
    "couple photobooth",
    "long distance couple app",
    "photo strip maker",
    "mobile photobooth",
    "Amoura",
  ],
  authors: [{ name: "Amoura" }],
  creator: "Amoura",
  manifest: "/manifest.json",
  openGraph: {
    title: "Amoura — Virtual Photobooth for Moments Together",
    description:
      "A premium browser-based photobooth for couples, friends, and memories together — even from different places.",
    type: "website",
    siteName: "Amoura",
    images: [
      {
        url: "/images/AMOURA.png",
        width: 1200,
        height: 630,
        alt: "Amoura Virtual Photobooth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amoura — Virtual Photobooth for Moments Together",
    description:
      "Create beautiful photobooth memories with someone you love, even when apart.",
    images: ["/images/AMOURA.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}