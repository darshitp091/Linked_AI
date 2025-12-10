'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewWorkspacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Workspace name is required')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Workspace created successfully!')
        router.push(`/workspaces/${data.workspace.slug}`)
      } else {
        if (response.status === 403) {
          toast.error(data.error || 'Workspaces require Standard or Custom plan')
          router.push('/pricing')
        } else {
          throw new Error(data.error || 'Failed to create workspace')
        }
      }
    } catch (error: any) {
      console.error('Error creating workspace:', error)
      toast.error(error.message || 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Workspaces</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Workspace</h1>
          </div>
          <p className="text-gray-600">
            Set up a new workspace to collaborate with your team
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              {/* Workspace Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing Team, Sales Department"
                  maxLength={50}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this workspace for?"
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Invite team members with different roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Collaborate on LinkedIn content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Manage permissions and access control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Track team activity and analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Create Workspace
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
