'use client'

import { useEffect, useRef } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import {
  Sparkles, TrendingUp, Clock, Edit, BarChart, Users, Zap, CheckCircle2,
  Calendar, Hash, Send, Eye, PieChart, Bell, Target, LineChart,
  MessageSquare, Lightbulb, Shield, Brain, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const allFeatures = [
  // CORE FEATURES
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate engaging LinkedIn posts with our advanced AI powered by Groq (100% FREE).',
    details: ['Multiple writing styles', 'Industry-specific content', 'Tone customization', 'Hook optimization'],
    mockup: 'ai-generation',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule posts at optimal times when your audience is most active.',
    details: ['Best time suggestions', 'Queue management', 'Auto-posting', 'Time zone support'],
    mockup: 'scheduling',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: Edit,
    title: 'Post Editor & Templates',
    description: 'Edit and refine AI-generated content with 12+ professional templates.',
    details: ['Live preview', 'Character counter', 'Hashtag suggestions', '12+ templates'],
    mockup: 'editor',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Track performance with detailed analytics and insights.',
    details: ['Engagement metrics', 'Growth tracking', 'Content performance', 'Audience demographics'],
    mockup: 'analytics',
    badge: 'Core',
    plan: 'Pro'
  },
  {
    icon: Lightbulb,
    title: 'AI Content Ideas',
    description: 'Never run out of ideas. AI suggests personalized topics weekly.',
    details: ['5 ideas/week (Free)', '20 ideas/week (Pro)', 'Trending integration', 'Predicted virality'],
    mockup: 'content-ideas',
    badge: 'New',
    plan: 'Free'
  },
]

function FeatureMockup({ type }: { type: string }) {
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mockupRef.current) return

    // Hover animation
    const element = mockupRef.current

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        rotateY: 5,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Render specific mockups based on type
  if (type === 'ai-generation') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#0a66c2]" />
          </div>
          <span className="font-medium text-gray-900">AI Writing</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#leadership</span>
          <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#growth</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full w-[85%]" />
          </div>
          <span className="text-xs text-green-600 font-medium">85% optimized</span>
        </div>
      </div>
    )
  }

  if (type === 'scheduling') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Content Calendar</span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => {
            const hasPost = [2, 5, 9, 12, 16, 19, 23, 26, 30].includes(i)
            const isScheduled = [5, 12, 19, 26].includes(i)
            const isPublished = [2, 9, 16, 23].includes(i)
            const isBestTime = [12, 26].includes(i)
            return (
              <div
                key={i}
                className={`aspect-square rounded flex items-center justify-center text-xs relative ${
                  i < 5 ? 'text-gray-300' :
                  hasPost ? (isScheduled ? 'bg-blue-500 text-white' : 'bg-green-500 text-white') :
                  'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i >= 5 && i - 4}
                {isBestTime && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-[8px]">⭐</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600">Published</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-gray-600">Best time</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'editor') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Post Editor</span>
          <Edit className="w-5 h-5 text-gray-400" />
        </div>
        <div className="mb-4 flex gap-2 pb-3 border-b border-gray-200">
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <span className="text-sm font-bold">B</span>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <span className="text-sm italic">I</span>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Hash className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-3 min-h-[120px]">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold">🚀 Just launched our new product!</span>
            <br /><br />
            After months of hard work, we're excited to share this with the world.
            <br /><br />
            <span className="text-[#0a66c2]">#ProductLaunch #Innovation #StartupLife</span>
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">156 characters</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-green-600" />
              <span className="text-green-600 font-medium">92% score</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'analytics') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Analytics Dashboard</span>
          <BarChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Views</span>
            </div>
            <div className="text-xl font-bold text-gray-900">24.5K</div>
            <div className="text-xs text-green-600">+18% vs last week</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Engagement</span>
            </div>
            <div className="text-xl font-bold text-gray-900">3.8%</div>
            <div className="text-xs text-green-600">+0.4% vs avg</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-gray-600">Performance by type</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700">Thought Leadership</span>
                <span className="font-medium text-gray-900">4.2%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[84%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'content-ideas') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">AI Content Ideas</span>
          <Lightbulb className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-2">
          {[
            { topic: 'How AI is transforming B2B sales in 2025', score: 94, trend: 'hot' },
            { topic: 'My biggest leadership lesson from failure', score: 89, trend: 'rising' },
            { topic: '5 mistakes I see SaaS founders make', score: 87, trend: 'hot' },
          ].map((idea, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-2 mb-1">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 font-medium mb-1">{idea.topic}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-purple-600" />
                      <span className="text-purple-600 font-medium">{idea.score}% viral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Fallback for any missing mockups
  return <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu h-64 flex items-center justify-center text-gray-400">Mockup: {type}</div>
}

export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
    }

    // Feature cards scroll animation
    if (featuresRef.current) {
      const features = featuresRef.current.querySelectorAll('.feature-card')

      features.forEach((feature, index) => {
        gsap.from(feature, {
          scrollTrigger: {
            trigger: feature,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          x: index % 2 === 0 ? -50 : 50,
          duration: 0.8,
          ease: 'power3.out'
        })
      })
    }
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Features
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            The Most Complete LinkedIn Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI content generation, smart scheduling, templates, and more—all in one platform.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Free Today - 5 Posts/Month</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {allFeatures.map((feature, index) => (
              <div key={index} className={`feature-card grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-[#0a66c2]" />
                    </div>
                    <div>
                      {feature.badge && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                          feature.badge === 'New' ? 'bg-green-100 text-green-700' :
                          feature.badge === 'Core' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {feature.badge}
                        </span>
                      )}
                      {feature.plan && (
                        <span className="ml-2 text-xs text-gray-500">· {feature.plan}</span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#057642] flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`flex items-center justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <FeatureMockup type={feature.mockup} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a66c2] to-[#004182]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to dominate LinkedIn?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands using LinkedAI to automate their LinkedIn presence.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#0a66c2] hover:bg-gray-100">
              Start Free - 5 AI Posts/Month
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
