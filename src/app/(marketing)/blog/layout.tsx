import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - LinkedAI | LinkedIn Growth Tips & AI Strategies',
  description: 'Read the latest insights on LinkedIn marketing, personal branding, and how AI is transforming content creation.',
  openGraph: {
    title: 'LinkedAI Blog - Insights & Resources',
    description: 'Strategies and tips to help you dominate LinkedIn using AI.',
    url: 'https://ai-linked.vercel.app/blog',
    type: 'website',
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
