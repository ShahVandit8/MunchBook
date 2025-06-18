import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MunchBook | Track, Rate & Relive Your Food Adventures",
  description:
    "MunchBook is your personalized restaurant review journal. Track what you eat, rate dishes, write reviews, and get smart food recommendations with data-driven insights.",
  keywords: [
    "MunchBook",
    "restaurant review app",
    "food diary app",
    "track meals",
    "dish rating app",
    "restaurant tracker",
    "food journal",
    "where to eat app",
    "next restaurant suggestion",
    "data visualization for food",
    "restaurant review log",
    "personal food tracker",
  ],
  authors: [{ name: "Vandit Shah" }],
  creator: "Vandit Shah",
  metadataBase: new URL("https://munchbook.vercel.app"),
  openGraph: {
    title: "MunchBook | Track, Rate & Relive Your Food Adventures",
    description:
      "Log every bite, rate every dish, and let MunchBook suggest your next delicious destination. Built with Next.js and MongoDB.",
    url: "https://munchbook.vercel.app",
    siteName: "MunchBook",
    images: [
      {
        url: "https:/munchbook.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "MunchBook App - Food Review & Recommendation Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MunchBook | Discover Your Next Favorite Meal",
    description:
      "Personalized restaurant review journal with dish ratings, visit logs, and smart suggestions.",
    images: ["https://munchbook.vercel.app/og-image.png"],
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
    },
  },
  alternates: {
    canonical: "https://munchbook.vercel.app",
    languages: {
      "en-US": "https://munchbook.vercel.app",
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>🧑‍🍳</text></svg>"></link>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
