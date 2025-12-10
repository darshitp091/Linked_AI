import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Users, Target, Heart, Zap } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We help professionals build their personal brand and grow their network on LinkedIn.',
  },
  {
    icon: Users,
    title: 'User-Focused',
    description: 'Every feature we build starts with understanding what our users truly need.',
  },
  {
    icon: Heart,
    title: 'Quality First',
    description: 'We believe in creating content that adds value, not just noise.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI to make content creation effortless.',
  },
]

const team = [
  { name: 'Sarah Chen', role: 'CEO & Co-founder', image: 'SC' },
  { name: 'Michael Park', role: 'CTO & Co-founder', image: 'MP' },
  { name: 'Emily Rodriguez', role: 'Head of Product', image: 'ER' },
  { name: 'David Kim', role: 'Head of AI', image: 'DK' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            About Us
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Building the future of LinkedIn content
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We are on a mission to help professionals share their expertise and grow their influence on LinkedIn.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-4">
              LinkedAI was born from a simple observation: professionals know their expertise, but struggle to consistently share it on LinkedIn. Many spend hours crafting posts, only to see minimal engagement.
            </p>
            <p className="mb-4">
              We built LinkedAI to solve this problem. Our AI understands your industry, your voice, and what resonates with your audience. It helps you create content that sounds like you wrote it, because the best ideas still come from you.
            </p>
            <p>
              Today, thousands of professionals use LinkedAI to build their personal brand, share insights, and grow their network, all while saving hours every week.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-[#0a66c2]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind LinkedAI</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#0a66c2] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{member.image}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
