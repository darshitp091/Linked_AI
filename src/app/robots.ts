import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/checkout/', '/settings/'],
    },
    sitemap: 'https://ai-linked.vercel.app/sitemap.xml',
  }
}
