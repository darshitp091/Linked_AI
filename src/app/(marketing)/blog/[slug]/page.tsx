import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0a66c2] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
              {post.category || 'Insights'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-500 border-y border-gray-100 py-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium text-gray-900">{post.author || 'LinkedAI Team'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.published_at ? format(parseISO(post.published_at), 'MMMM d, yyyy') : 'Recently Published'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>10 min read</span>
              </div>
            </div>
          </header>

          {post.image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-gray-100 shadow-md">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="prose prose-lg prose-blue max-w-none">
            {/* Simple Markdown rendering - for production use a proper library like react-markdown */}
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed space-y-4">
              {post.content}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Want to grow on LinkedIn like a pro?</h3>
              <p className="text-gray-600 mb-6">Our AI tool helps you brainstorm, draft, and schedule posts that actually get engagement.</p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-8 py-4 bg-[#0a66c2] text-white rounded-full font-bold hover:bg-[#004182] transition-colors"
              >
                Start Free Today
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
