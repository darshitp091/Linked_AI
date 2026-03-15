import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - LinkedAI | Simple & Transparent AI Post Scheduling',
  description: 'Choose the perfect plan for your LinkedIn growth. Start free with 5 AI posts per month or upgrade for unlimited scheduling and advanced analytics.',
  openGraph: {
    title: 'LinkedAI Pricing - Simple & Transparent Plans',
    description: 'Grow your LinkedIn presence with AI. Compare our free, pro, and standard plans.',
    url: 'https://ai-linked.vercel.app/pricing',
    type: 'website',
  }
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
