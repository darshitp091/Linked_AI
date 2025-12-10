import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Code, Key, Book, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-[#0a66c2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-[#0a66c2]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">API Access</h1>
            <p className="text-xl text-gray-600 mb-8">Build custom integrations with the LinkedAI API</p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Get API Key</Button>
              </Link>
              <Button size="lg" variant="outline">View Docs</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Key className="w-8 h-8 text-[#0a66c2] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication</h3>
              <p className="text-gray-600">Simple API key authentication for secure access</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Zap className="w-8 h-8 text-[#0a66c2] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-gray-600">Low latency endpoints for real-time applications</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Book className="w-8 h-8 text-[#0a66c2] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600">Comprehensive docs with code examples</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-gray-400 text-sm mb-2"># Generate a post</p>
            <code className="text-green-400 text-sm">
              curl -X POST https://api.linkedai.com/v1/generate \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \<br />
              &nbsp;&nbsp;-d &apos;&#123;&quot;topic&quot;: &quot;leadership&quot;, &quot;tone&quot;: &quot;professional&quot;&#125;&apos;
            </code>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
