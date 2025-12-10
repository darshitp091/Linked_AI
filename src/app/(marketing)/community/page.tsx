import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Users, MessageSquare, Award, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const stats = [
  { value: '10,000+', label: 'Community Members' },
  { value: '500+', label: 'Daily Discussions' },
  { value: '50+', label: 'Expert Contributors' },
]

const features = [
  { icon: MessageSquare, title: 'Discussion Forums', description: 'Share ideas, ask questions, and learn from others' },
  { icon: Award, title: 'Expert Q&A', description: 'Get answers from LinkedIn growth experts' },
  { icon: Calendar, title: 'Weekly Events', description: 'Join live workshops and webinars' },
  { icon: Users, title: 'Networking', description: 'Connect with like-minded professionals' },
]

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-[#0a66c2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-[#0a66c2]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Join Our Community</h1>
            <p className="text-xl text-gray-600 mb-8">Connect with thousands of professionals growing their LinkedIn presence</p>
            <Link href="/signup">
              <Button size="lg">Join the Community</Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#0a66c2] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <feature.icon className="w-8 h-8 text-[#0a66c2] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
