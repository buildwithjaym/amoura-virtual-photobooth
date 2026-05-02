import type { MetadataRoute } from "next"

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.amoreframephotobooth.site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/auth/",
          "/login",
          "/create-account",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/auth/",
          "/login",
          "/create-account",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/auth/",
          "/login",
          "/create-account",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}