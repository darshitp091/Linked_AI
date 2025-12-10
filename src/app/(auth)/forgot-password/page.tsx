'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Failed to send reset email')
        setLoading(false)
        return
      }

      setEmailSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-6">
              <Image
                src="/linkedai-logo.png"
                alt="LinkedAI Logo"
                width={180}
                height={48}
                className="h-12 w-auto"
                unoptimized
              />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the reset password link</li>
                <li>Enter your new password</li>
              </ol>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-[#0a66c2] hover:underline"
              >
                try again
              </button>
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#0a66c2] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image
              src="/linkedai-logo.png"
              alt="LinkedAI Logo"
              width={180}
              height={48}
              className="h-12 w-auto"
              unoptimized
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
