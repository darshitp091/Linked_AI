import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle2, Sparkles, ArrowRight, Linkedin, Zap, Shield, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface SolutionPageProps {
  params: Promise<{ slug: string }>
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Find the keyword record for this slug
  const { data: keywordData } = await supabase
    .from('trending_keywords')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!keywordData && slug !== 'test-solution') {
    notFound() 
  }

  const industry = keywordData?.category || 'Professional Services'
  const keyword = keywordData?.keyword || slug.split('-').join(' ')
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-mesh relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-semibold rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                Solution for {industry}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                The Best <span className="text-[#0a66c2]">{keyword}</span> for {industry} Professionals
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Scale your LinkedIn presence in the {industry} sector with LinkedAI. Automatically generate industry-compliant content, schedule posts, and drive high-quality leads without spending hours on social media.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-[#0a66c2] text-white rounded-full font-bold hover:bg-[#004182] transition-all shadow-lg shadow-blue-500/25">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all">
                  Watch Demo
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-[#0a66c2] rounded-xl flex items-center justify-center text-white">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">AI Post Generator</h3>
                    <p className="text-gray-500 text-sm">Optimized for {industry}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400 italic text-sm">Generating industry-specific hook for {keyword}...</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-1/3 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-8 w-1/4 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why {industry} Experts Choose LinkedAI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built specialized models for {industry} that understand your unique terminology and compliance needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Industry Precision',
                desc: `Our AI is trained on thousands of successful LinkedIn posts from top ${industry} leaders.`,
                icon: Zap
              },
              {
                title: 'Advanced Analytics',
                desc: 'See exactly which posts are driving leads and engagement in your niche.',
                icon: Search
              },
              {
                title: 'Full Compliance',
                desc: `Stay within ${industry} regulations with our built-in ethical AI guardrails.`,
                icon: Shield
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-[#0a66c2] rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#0a66c2] rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 blur-3xl -ml-32 -mb-32" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Join 500+ {industry} Pros Using LinkedAI
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Transform your LinkedIn from a digital resume into a high-converting sales funnel. Start your free trial today.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center px-10 py-5 bg-white text-[#0a66c2] rounded-full font-extrabold text-lg hover:bg-blue-50 transition-all shadow-xl">
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
