'use client'

import { useState } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Product Demo
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            See LinkedAI in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how our AI-powered platform helps you create and schedule engaging LinkedIn content in minutes
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#0a66c2] rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-[#004182] transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="text-white text-lg font-medium">Watch Product Demo</p>
                <p className="text-gray-400 text-sm mt-2">5 minutes overview</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span className="text-sm">0:00 / 5:00</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Description */}
          <div className="mt-8 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll see in this demo</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                <span>How to generate AI-powered LinkedIn posts based on your expertise and topics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                <span>Customizing content style and tone to match your brand voice</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                <span>Scheduling posts for optimal engagement times</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
                <span>Tracking performance with built-in analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">5</span>
                <span>Managing multiple LinkedIn accounts from one dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a66c2] to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free 14-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0a66c2] hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Personal Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
