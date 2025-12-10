import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-500">Last updated: November 21, 2024</p>
          </div>

          <div className="space-y-10">
            <p className="text-lg text-gray-600 leading-relaxed">
              This Cookie Policy explains how LinkedAI uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-600">Required for the website to function properly. These cannot be disabled.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600">Help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600">Enable enhanced functionality and personalization, such as remembering your preferences.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-gray-600">Used to track visitors across websites to display relevant advertisements.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience and some functionality may no longer be available.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about our use of cookies, please contact us at privacy@linkedai.com.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
