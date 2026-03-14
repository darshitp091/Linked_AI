'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Linkedin, Mail, Lock, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Clear any invalid session on component mount
  useEffect(() => {
    const clearInvalidSession = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error && error.message.includes('Refresh Token')) {
          await supabase.auth.signOut()
          localStorage.clear()
          sessionStorage.clear()
        }
      } catch (err) {
        console.error('Session check error:', err)
      }
    }
    clearInvalidSession()
  }, [])

  const handleLinkedInSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&source=signup`,
        scopes: 'openid profile email w_member_social'
      },
    })

    if (error) {
      toast.error(error.message)
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start generating LinkedIn content today using your LinkedIn profile</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <button
            onClick={handleLinkedInSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-xl font-medium hover:bg-[#004182] transition mb-6"
          >
            <Linkedin className="w-5 h-5" />
            Continue with LinkedIn
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-[#0a66c2] hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#0a66c2] hover:underline">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0a66c2] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
