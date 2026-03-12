import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkedAI - AI LinkedIn Content Scheduler & Ghostwriter",
  description: "Generate a week's worth of engaging LinkedIn posts with AI. Schedule and publish directly to LinkedIn without limits.",
  keywords: ["LinkedIn AI", "Content Scheduler", "Ghostwriter", "AI Marketing", "LinkedIn Automation", "Personal Branding"],
  authors: [{ name: "LinkedAI Team" }],
  creator: "LinkedAI",
  publisher: "LinkedAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ai-linked.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LinkedAI - AI LinkedIn Content Scheduler",
    description: "Your personal LinkedIn ghostwriter. Generate, schedule, and optimize your LinkedIn presence.",
    url: "https://ai-linked.vercel.app",
    siteName: "LinkedAI",
    images: [
      {
        url: "/linkedai-logo.png",
        width: 1200,
        height: 630,
        alt: "LinkedAI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedAI - AI LinkedIn Content Scheduler",
    description: "Your personal LinkedIn ghostwriter. Generate, schedule, and optimize your LinkedIn presence.",
    images: ["/linkedai-logo.png"],
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
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: "ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        <SessionProvider>
          <PostHogProvider>
            <Toaster position="top-right" />
            {children}
            <Analytics />
            <SpeedInsights />
          </PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
