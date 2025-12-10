import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Linkedin, Calendar, BarChart, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const integrations = [
  {
    icon: Linkedin,
    name: 'LinkedIn',
    description: 'Publish posts directly to your LinkedIn profile and company pages',
    status: 'Available',
    features: ['Direct publishing', 'Profile analytics', 'Company page support', 'Multi-account'],
  },
  {
    icon: Calendar,
    name: 'Google Calendar',
    description: 'Sync your content calendar with Google Calendar',
    status: 'Coming Soon',
    features: ['Two-way sync', 'Event reminders', 'Team calendars'],
  },
  {
    icon: BarChart,
    name: 'Google Analytics',
    description: 'Track traffic from your LinkedIn posts to your website',
    status: 'Coming Soon',
    features: ['UTM tracking', 'Conversion tracking', 'Custom dashboards'],
  },
  {
    icon: Zap,
    name: 'Zapier',
    description: 'Connect LinkedAI with 5,000+ apps through Zapier',
    status: 'Coming Soon',
    features: ['Automated workflows', 'Custom triggers', 'No-code setup'],
  },
]

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Integrations</h1>
            <p className="text-xl text-gray-600 mb-8">Connect LinkedAI with your favorite tools</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0a66c2]/10 rounded-xl flex items-center justify-center">
                    <integration.icon className="w-6 h-6 text-[#0a66c2]" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${integration.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {integration.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-gray-600 mb-4">{integration.description}</p>
                <ul className="space-y-2">
                  {integration.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-[#057642]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
