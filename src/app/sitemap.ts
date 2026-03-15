import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-linked.vercel.app'
  
  // Define all static marketing routes
  const routes = [
    '',
    '/pricing',
    '/features',
    '/blog',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Blog posts - in a real app these would be fetched from a DB
  const blogPosts = [
    '/blog/linkedin-posts-engagement',
    '/blog/ai-content-creation-guide',
    '/blog/personal-brand-linkedin',
  ].map((post) => ({
    url: `${baseUrl}${post}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...routes, ...blogPosts]
}
