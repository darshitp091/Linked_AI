import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ai-linked.vercel.app'
  const supabase = await createClient()
  
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

  // Fetch dynamic blog posts from DB
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)

  const dynamicRoutes = (blogPosts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...routes, ...dynamicRoutes]
}
