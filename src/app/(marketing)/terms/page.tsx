import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-500">Last updated: November 21, 2024</p>
          </div>

          <div className="space-y-10">
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to LinkedAI. These Terms of Service (&quot;Terms&quot;) govern your access to and use of LinkedAI&apos;s website, products, and services (&quot;Services&quot;). Please read these Terms carefully before using our Services.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our Services. If you are using our Services on behalf of an organization, you are agreeing to these Terms for that organization and representing that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                LinkedAI provides an AI-powered platform for creating, scheduling, and managing LinkedIn content. Our Services include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>AI-generated content creation for LinkedIn posts</li>
                <li>Content scheduling and calendar management</li>
                <li>Analytics and performance tracking</li>
                <li>Post optimization and hashtag suggestions</li>
                <li>Integration with LinkedIn for direct publishing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use certain features of our Services, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Payments</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Some of our Services require a paid subscription. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><span className="font-semibold">Billing:</span> You will be billed in advance on a recurring basis (monthly or annually) depending on your subscription plan.</li>
                <li><span className="font-semibold">Auto-Renewal:</span> Your subscription will automatically renew unless you cancel before the renewal date.</li>
                <li><span className="font-semibold">Price Changes:</span> We may change subscription prices with 30 days notice. Continued use after price changes constitutes acceptance.</li>
                <li><span className="font-semibold">Refunds:</span> Refunds are provided in accordance with our Refund Policy. Generally, subscription fees are non-refundable except as required by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You retain ownership of any content you create or upload to our Services (&quot;User Content&quot;). By using our Services, you grant us a limited license to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Store and process your User Content to provide the Services</li>
                <li>Use anonymized data to improve our AI models and Services</li>
                <li>Display your User Content as necessary for the Services to function</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                You are solely responsible for your User Content and represent that you have all necessary rights to use and share it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. AI-Generated Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our Services use artificial intelligence to generate content suggestions. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>AI-generated content is provided as suggestions and should be reviewed before publishing</li>
                <li>You are responsible for reviewing and editing all content before posting to LinkedIn</li>
                <li>We do not guarantee the accuracy, completeness, or appropriateness of AI-generated content</li>
                <li>You own the rights to AI-generated content created using your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use our Services to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Generate or distribute spam, misleading, or harmful content</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt our Services or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated means to access our Services without permission</li>
                <li>Violate LinkedIn&apos;s Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Integrations</h2>
              <p className="text-gray-600 leading-relaxed">
                Our Services integrate with third-party platforms, including LinkedIn. Your use of these integrations is subject to the third party&apos;s terms of service. We are not responsible for the actions or policies of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Services and all associated intellectual property rights are owned by LinkedAI. This includes our software, algorithms, designs, trademarks, and other proprietary materials. You may not copy, modify, distribute, or reverse engineer any part of our Services without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LINKEDAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY. OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless LinkedAI and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Services, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may suspend or terminate your access to the Services at any time for any reason, including violation of these Terms. Upon termination, your right to use the Services will immediately cease. You may cancel your account at any time through your account settings. Sections that by their nature should survive termination will remain in effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website or sending you an email. Your continued use of the Services after changes become effective constitutes your acceptance of the modified Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law and Disputes</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Services shall be resolved exclusively in the state or federal courts located in San Francisco County, California, and you consent to the personal jurisdiction of such courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">LinkedAI, Inc.</p>
                <p className="text-gray-600">Email: legal@linkedai.com</p>
                <p className="text-gray-600">Address: 123 Market Street, Suite 500</p>
                <p className="text-gray-600">San Francisco, CA 94105, United States</p>
              </div>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
