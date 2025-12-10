import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Search, BookOpen, MessageCircle, Mail, FileText, Video, HelpCircle } from 'lucide-react'
import Link from 'next/link'

const helpCategories = [
  { icon: BookOpen, title: 'Getting Started', description: 'Learn the basics of using LinkedAI', href: '/guides' },
  { icon: FileText, title: 'Documentation', description: 'Detailed guides and API docs', href: '/guides' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step video guides', href: '/guides' },
  { icon: MessageCircle, title: 'Community', description: 'Connect with other users', href: '/community' },
]

const faqs = [
  { q: 'How do I connect my LinkedIn account?', a: 'Go to Settings > LinkedIn Connection and click "Connect LinkedIn" to authorize access.' },
  { q: 'Can I edit AI-generated content?', a: 'Yes! All generated content can be fully edited before publishing.' },
  { q: 'How many posts can I generate?', a: 'It depends on your plan. Free users get 5 posts/month, Pro users get unlimited.' },
  { q: 'Is my data secure?', a: 'Yes, we use enterprise-grade encryption and never share your data with third parties.' },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">How can we help you today?</p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {helpCategories.map((cat, index) => (
              <Link key={index} href={cat.href} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-[#0a66c2]/30 hover:shadow-lg transition-all">
                <cat.icon className="w-8 h-8 text-[#0a66c2] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-gray-600">{cat.description}</p>
              </Link>
            ))}
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-[#0a66c2] flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 ml-7">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0a66c2] rounded-2xl p-8 text-center text-white">
            <Mail className="w-10 h-10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-white/80 mb-6">Our support team is here to assist you</p>
            <Link href="/contact" className="inline-block bg-white text-[#0a66c2] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
              Contact Support
            </Link>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
