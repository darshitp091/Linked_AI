import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ai-linked.vercel.app'
  
  // Define static marketing routes
  const routes = [
    '',
    '/pricing',
    '/features',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Fetch dynamic solution slugs from DB
  const { data: keywords } = await supabase
    .from('trending_keywords')
    .select('slug, updated_at')
    
  const solutionRoutes = (keywords || []).filter(k => k.slug).map((k) => ({
    url: `${baseUrl}/solutions/${k.slug}`,
    lastModified: k.updated_at ? new Date(k.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...solutionRoutes]
}
