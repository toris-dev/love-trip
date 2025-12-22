import type { MetadataRoute } from "next"

const BASE_URL = "https://lovetrip.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/my-trips/", "/profile/", "/login", "/auth/", "/_next/", "/sw.js"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/my-trips/", "/profile/", "/login", "/auth/", "/_next/", "/sw.js"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
