import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, User, Clock, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()
  
  // Fetch published blog posts
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const categories = ['All', 'Content Strategy', 'AI & Technology', 'Personal Branding', 'Automation']

  if (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Blog
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Insights & Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, strategies, and insights to help you succeed on LinkedIn.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
								key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-[#0a66c2] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {!blogPosts || blogPosts.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">New insights coming soon</h3>
              <p className="text-gray-500 mt-2">We're currently drafting some amazing content for you.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-video rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                      <Image
                        src={post.image_url || `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1074&auto=format&fit=crop`}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  </Link>
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs font-medium rounded-full">
                      {post.category || 'Insights'}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author || 'LinkedAI Team'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.published_at ? format(parseISO(post.published_at), 'MMM d, yyyy') : 'Recently'}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Load More */}
          {blogPosts && blogPosts.length > 9 && (
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Load More Articles
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to our newsletter</h2>
          <p className="text-gray-600 mb-6">Get the latest tips and insights delivered to your inbox.</p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 flex-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
            />
            <button className="px-6 py-3 bg-[#0a66c2] text-white rounded-full font-medium hover:bg-[#004182] transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
