import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: November 21, 2024</p>
          </div>

          <div className="space-y-10">
            <p className="text-lg text-gray-600 leading-relaxed">
              At LinkedAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. Please read this policy carefully to understand our practices regarding your personal data.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect information in several ways when you use our Services:
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><span className="font-semibold">Account Information:</span> Name, email address, password, and profile information when you create an account</li>
                <li><span className="font-semibold">Payment Information:</span> Billing address, credit card details (processed securely by our payment provider)</li>
                <li><span className="font-semibold">Content:</span> Posts, drafts, and other content you create using our Services</li>
                <li><span className="font-semibold">Communications:</span> Information you provide when you contact us for support or feedback</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><span className="font-semibold">Usage Data:</span> How you interact with our Services, features you use, and actions you take</li>
                <li><span className="font-semibold">Device Information:</span> Browser type, operating system, device identifiers, and IP address</li>
                <li><span className="font-semibold">Cookies:</span> We use cookies and similar technologies to enhance your experience</li>
                <li><span className="font-semibold">Analytics:</span> Aggregated data about Service usage patterns and performance</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">1.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><span className="font-semibold">LinkedIn:</span> When you connect your LinkedIn account, we receive profile information and posting capabilities as authorized</li>
                <li><span className="font-semibold">Authentication Providers:</span> If you sign in via Google or other providers, we receive basic profile information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><span className="font-semibold">Provide Services:</span> To operate, maintain, and deliver our AI content generation and scheduling features</li>
                <li><span className="font-semibold">Personalization:</span> To customize content suggestions based on your industry, tone preferences, and usage patterns</li>
                <li><span className="font-semibold">Improve Services:</span> To analyze usage patterns and improve our AI models and user experience</li>
                <li><span className="font-semibold">Communications:</span> To send you service updates, security alerts, and support messages</li>
                <li><span className="font-semibold">Marketing:</span> To send promotional content (with your consent, where required)</li>
                <li><span className="font-semibold">Security:</span> To detect, prevent, and address technical issues and fraudulent activity</li>
                <li><span className="font-semibold">Legal Compliance:</span> To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><span className="font-semibold">Service Providers:</span> With third-party vendors who assist us in operating our Services (hosting, payment processing, analytics)</li>
                <li><span className="font-semibold">LinkedIn Integration:</span> Content you choose to publish is shared with LinkedIn per your instructions</li>
                <li><span className="font-semibold">Legal Requirements:</span> When required by law, court order, or governmental authority</li>
                <li><span className="font-semibold">Business Transfers:</span> In connection with a merger, acquisition, or sale of assets</li>
                <li><span className="font-semibold">With Your Consent:</span> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure authentication mechanisms and access controls</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures for potential breaches</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you Services. We may retain certain information as required by law or for legitimate business purposes, such as resolving disputes and enforcing agreements. When you delete your account, we will delete or anonymize your data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><span className="font-semibold">Access:</span> Request a copy of the personal information we hold about you</li>
                <li><span className="font-semibold">Correction:</span> Request correction of inaccurate or incomplete information</li>
                <li><span className="font-semibold">Deletion:</span> Request deletion of your personal information</li>
                <li><span className="font-semibold">Portability:</span> Request your data in a portable, machine-readable format</li>
                <li><span className="font-semibold">Restriction:</span> Request restriction of processing in certain circumstances</li>
                <li><span className="font-semibold">Objection:</span> Object to processing based on legitimate interests</li>
                <li><span className="font-semibold">Withdraw Consent:</span> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@linkedai.com or through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Keep you logged in and remember your preferences</li>
                <li>Understand how you use our Services</li>
                <li>Improve and personalize your experience</li>
                <li>Measure the effectiveness of our marketing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your data internationally, we implement appropriate safeguards such as Standard Contractual Clauses to ensure your information remains protected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our Services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by businesses</li>
                <li>Right to opt-out of sale of personal information (we do not sell your data)</li>
                <li>Right to non-discrimination for exercising your CCPA rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. European Privacy Rights (GDPR)</h2>
              <p className="text-gray-600 leading-relaxed">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR). LinkedAI, Inc. is the data controller of your personal information. We process your data based on: contract performance, legitimate interests, consent, and legal obligations. You may lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes. Your continued use of our Services after changes become effective constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">LinkedAI, Inc.</p>
                <p className="text-gray-600">Privacy Officer: privacy@linkedai.com</p>
                <p className="text-gray-600">General Inquiries: hello@linkedai.com</p>
                <p className="text-gray-600 mt-2">Address: 123 Market Street, Suite 500</p>
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
