import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Newspaper, Download, Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pressReleases = [
  { date: 'Nov 2024', title: 'LinkedAI Launches AI-Powered Content Generation Platform', excerpt: 'New platform helps professionals create engaging LinkedIn content effortlessly.' },
  { date: 'Oct 2024', title: 'LinkedAI Raises $5M Seed Round', excerpt: 'Funding will accelerate product development and team growth.' },
  { date: 'Sep 2024', title: 'LinkedAI Beta Reaches 10,000 Users', excerpt: 'Strong early adoption validates demand for AI content tools.' },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-[#0a66c2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Newspaper className="w-8 h-8 text-[#0a66c2]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Press & Media</h1>
            <p className="text-xl text-gray-600">News and resources for journalists</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Download className="w-8 h-8 text-[#0a66c2] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Press Kit</h3>
              <p className="text-gray-600 mb-4">Download logos, screenshots, and brand guidelines</p>
              <Button variant="outline">Download Kit</Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Mail className="w-8 h-8 text-[#0a66c2] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Media Inquiries</h3>
              <p className="text-gray-600 mb-4">For press inquiries, please contact our team</p>
              <Button variant="outline">press@linkedai.com</Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent News</h2>
          <div className="space-y-4">
            {pressReleases.map((pr, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0a66c2]/30 hover:shadow-lg transition-all group cursor-pointer">
                <span className="text-sm text-[#0a66c2] font-medium">{pr.date}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2 group-hover:text-[#0a66c2] transition-colors flex items-center gap-2">
                  {pr.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-gray-600">{pr.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
