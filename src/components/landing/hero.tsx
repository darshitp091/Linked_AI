'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, CheckCircle2, Sparkles, Calendar, BarChart3 } from 'lucide-react'
import gsap from 'gsap'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in animations
      gsap.from('.hero-content > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })

      // Float animation for the mockup
      gsap.to('.hero-mockup', {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Subtle pulse for badge
      gsap.to('.hero-badge', {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden gradient-mesh">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0a66c2]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#057642]/5 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="hero-content">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Content Creation</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Grow Your LinkedIn Presence with{' '}
              <span className="text-[#0a66c2]">AI-Generated Content</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Generate a week&apos;s worth of engaging LinkedIn posts in minutes.
              Our AI understands your expertise and creates content that resonates with your audience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/signup">
                <Button size="lg" className="group w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#057642]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#057642]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#057642]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className="hero-mockup relative">
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-400 border">
                    app.linkedai.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-gray-50">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Posts Generated</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                    <p className="text-xs text-[#057642]">+12% this week</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">89%</p>
                    <p className="text-xs text-[#057642]">+5% increase</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">14</p>
                    <p className="text-xs text-gray-500">Next 7 days</p>
                  </div>
                </div>

                {/* Post Preview */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center">
                      <span className="text-white font-semibold">JD</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-500">AI Generated Draft</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The best leaders I&apos;ve worked with share one trait: they listen more than they speak.
                    <br /><br />
                    Here&apos;s what I learned about building high-performing teams...
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#leadership</span>
                    <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg border animate-float">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0a66c2]" />
                <span className="text-sm font-medium">Auto-scheduled!</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg border animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#057642]" />
                <span className="text-sm font-medium">+156% reach</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted by professionals at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
              <span key={company} className="text-xl font-semibold text-gray-400">{company}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
