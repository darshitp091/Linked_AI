import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, User, Clock } from 'lucide-react'

const blogPosts = [
  {
    title: 'How to Write LinkedIn Posts That Get Engagement',
    excerpt: 'The first two lines of your LinkedIn post are the most critical. This is where users decide whether to click "see more." High-engagement hooks usually evoke curiosity, challenge a common belief, or offer immediate value.',
    category: 'Content Strategy',
    author: 'Patel Darshit',
    date: 'March 15, 2024',
    readTime: '8 min read',
    slug: 'linkedin-posts-engagement',
    image: '/blog/linkedin-automation-cover-1.png'
  },
  {
    title: 'AI in Content Creation: A Complete Guide for Professionals',
    excerpt: 'Artificial Intelligence is no longer a futuristic concept; it\'s a present-day tool that is revolutionizing how we work. For LinkedIn creators, AI is the ultimate co-pilot for brainstorming, drafting, and optimizing content.',
    category: 'AI & Technology',
    author: 'Anshul Singh Baghel',
    date: 'March 12, 2024',
    readTime: '10 min read',
    slug: 'ai-content-creation-guide',
    image: '/blog/ai-content-creation-cover-2.png'
  },
  {
    title: 'Building Your Personal Brand on LinkedIn in 2024',
    excerpt: 'Your personal brand is what people say about you when you\'re not in the room. On LinkedIn, your brand is your digital reputation. It’s the difference between being a commodity and being an authority.',
    category: 'Personal Branding',
    author: 'Rishi Jain',
    date: 'March 10, 2024',
    readTime: '12 min read',
    slug: 'personal-brand-linkedin',
    image: '/blog/personal-branding-cover-3.png'
  }
]

const categories = ['All', 'Content Strategy', 'AI & Technology', 'Personal Branding']

export default function BlogPage() {
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="group">
                <div className="relative aspect-video rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
                  <Image
                    src={post.image || '/blog/placeholder.png'}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Load More Articles
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
