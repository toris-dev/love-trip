import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { GoogleAnalytics } from "@next/third-parties/google"
import "./globals.css"
import { Toaster } from "@lovetrip/ui/components/sonner"
import { ThemeProvider } from "@/components/shared/theme-provider-wrapper"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"
import { ServiceWorkerScript } from "@/components/shared/service-worker-script"
import { Header } from "@/components/layout/header"
import { FooterWrapper } from "@/components/layout/footer-wrapper"
import { MSWProvider } from "@/components/shared/msw-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: {
    default: "LOVETRIP - 여행 계획 서비스",
    template: "%s | LOVETRIP",
  },
  description:
    "맞춤형 여행 계획 서비스. 네이버 지도 기반으로 데이트 코스, 숙박, 교통편을 추천하고 예산을 관리하세요.",
  keywords: ["여행", "데이트코스", "여행계획", "예산관리", "네이버지도", "여행추천"],
  authors: [{ name: "LOVETRIP Team" }],
  creator: "LOVETRIP",
  publisher: "LOVETRIP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://love2trip.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LOVETRIP - 여행 계획 서비스",
    description:
      "맞춤형 여행 계획 서비스. 네이버 지도 기반으로 데이트 코스, 숙박, 교통편을 추천하고 예산을 관리하세요.",
    url: "https://love2trip.vercel.app",
    siteName: "LOVETRIP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LOVETRIP - 여행 계획 서비스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOVETRIP - 여행 계획 서비스",
    description: "맞춤형 여행 계획 서비스",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EE1D85" },
    { media: "(prefers-color-scheme: dark)", color: "#EE1D85" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  /** 병렬 라우트: 모달 슬롯 (예: 로그인 오버레이). @modal 폴더와 default.tsx 필요 */
  modal?: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "LOVETRIP",
              description: "맞춤형 여행 계획 서비스",
              url: "https://love2trip.vercel.app",
              applicationCategory: "TravelApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        ) : null}
        <ServiceWorkerScript />
        <MSWProvider>
          <ThemeProvider>
            <LayoutWrapper>
              <Suspense
                fallback={
                  <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                    <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </header>
                }
              >
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              {modal}
              <FooterWrapper />
            </LayoutWrapper>
            <Toaster />
          </ThemeProvider>
        </MSWProvider>
      </body>
    </html>
  )
}
