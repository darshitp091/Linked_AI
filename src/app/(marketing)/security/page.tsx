import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Shield, Lock, Server, Eye, CheckCircle2 } from 'lucide-react'

const securityFeatures = [
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 compliance.',
  },
  {
    icon: Eye,
    title: 'Access Controls',
    description: 'Strict access controls and role-based permissions protect your data from unauthorized access.',
  },
  {
    icon: Shield,
    title: 'Regular Audits',
    description: 'We conduct regular security audits and penetration testing to identify and fix vulnerabilities.',
  },
]

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-[#0a66c2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-[#0a66c2]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Security at LinkedAI</h1>
            <p className="text-xl text-gray-600">Your data security is our top priority</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <feature.icon className="w-8 h-8 text-[#0a66c2] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Practices</h2>
              <ul className="space-y-3">
                {[
                  'SOC 2 Type II compliant infrastructure',
                  'GDPR and CCPA compliant data handling',
                  'Multi-factor authentication support',
                  'Regular security training for all employees',
                  'Incident response and disaster recovery plans',
                  'Continuous monitoring and threat detection',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#057642] flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Report a Vulnerability</h2>
              <p className="text-gray-600 leading-relaxed">
                If you discover a security vulnerability, please report it to security@linkedai.com. We appreciate responsible disclosure and will work with you to address any issues promptly.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
