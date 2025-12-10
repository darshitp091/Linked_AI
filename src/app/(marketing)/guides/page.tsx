import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const guides = [
  { title: 'Getting Started with LinkedAI', description: 'Learn how to set up your account and generate your first post', time: '5 min read', category: 'Basics' },
  { title: 'Connecting Your LinkedIn Account', description: 'Step-by-step guide to linking your LinkedIn profile', time: '3 min read', category: 'Setup' },
  { title: 'Writing Effective LinkedIn Posts', description: 'Best practices for creating engaging content', time: '8 min read', category: 'Content' },
  { title: 'Understanding Analytics', description: 'How to track and improve your post performance', time: '6 min read', category: 'Analytics' },
  { title: 'Scheduling Posts for Maximum Reach', description: 'Optimal posting times and scheduling strategies', time: '5 min read', category: 'Strategy' },
  { title: 'Customizing AI Tone and Style', description: 'Make AI-generated content match your voice', time: '4 min read', category: 'AI' },
]

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#0a66c2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-[#0a66c2]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Guides & Tutorials</h1>
            <p className="text-xl text-gray-600">Learn how to make the most of LinkedAI</p>
          </div>

          <div className="space-y-4">
            {guides.map((guide, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-[#0a66c2]/30 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-[#0a66c2] bg-[#0a66c2]/10 px-2 py-1 rounded-full">{guide.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2 group-hover:text-[#0a66c2] transition-colors">{guide.title}</h3>
                    <p className="text-gray-600 mb-3">{guide.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {guide.time}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0a66c2] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
