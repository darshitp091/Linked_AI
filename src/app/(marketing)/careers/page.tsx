import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { MapPin, Briefcase, Heart, Zap, Users, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'

const perks = [
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision coverage' },
  { icon: Zap, title: 'Flexible Work', description: 'Remote-first with optional office space' },
  { icon: Users, title: 'Great Team', description: 'Collaborate with talented, passionate people' },
  { icon: Coffee, title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
]

const openings = [
  { title: 'Senior Full Stack Engineer', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', location: 'San Francisco / Remote', type: 'Full-time' },
  { title: 'ML Engineer', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Manager', location: 'Remote', type: 'Full-time' },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600">Help us build the future of LinkedIn content creation</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-[#0a66c2]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <perk.icon className="w-6 h-6 text-[#0a66c2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                  <p className="text-gray-600 text-sm">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0a66c2]/30 hover:shadow-lg transition-all">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.type}</span>
                  </div>
                </div>
                <Button variant="outline">Apply</Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
