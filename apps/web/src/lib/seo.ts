import type { Metadata } from "next"

const METADATA_BASE = new URL("https://love2trip.vercel.app")
const SITE_NAME = "LOVETRIP"
const DEFAULT_OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "LOVETRIP - 여행 계획 서비스" }

export const metadataBase = METADATA_BASE

export interface PageMetaInput {
  title: string
  description: string
  path?: string
  canonical?: string
  ogImage?: { url: string; width?: number; height?: number; alt?: string }
  keywords?: string[]
  noindex?: boolean
}

/**
 * 페이지별 metadata 생성 시 공통 openGraph/twitter/robots 조합 반환.
 * generateMetadata 또는 metadata export에서 사용.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const path = input.path ?? input.canonical ?? ""
  const url = path ? new URL(path, METADATA_BASE).href : METADATA_BASE.href
  const canonical = input.canonical ?? path

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: input.title.includes(SITE_NAME) ? input.title : `${input.title} | ${SITE_NAME}`,
      description: input.description,
      url,
      siteName: SITE_NAME,
      images: [input.ogImage ?? DEFAULT_OG_IMAGE],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [input.ogImage?.url ?? "/og-image.png"],
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
