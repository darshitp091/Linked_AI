import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - LinkedAI | AI Ghostwriter & Content Intelligence',
  description: 'Discover how LinkedAI uses advanced AI to generate, schedule, and optimize your LinkedIn content automatically.',
  openGraph: {
    title: 'LinkedAI Features - AI Content Intelligence',
    description: 'Advanced AI content generation, smart scheduling, and deep analytics for LinkedIn.',
    url: 'https://ai-linked.vercel.app/features',
    type: 'website',
  }
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
