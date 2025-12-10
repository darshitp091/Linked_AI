'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Users, Crown, Settings, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  plan: string
  maxMembers: number
  createdAt: string
}

export default function WorkspacesPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState('free')

  useEffect(() => {
    fetchWorkspaces()
    fetchUserPlan()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])
      } else {
        throw new Error('Failed to fetch workspaces')
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
      toast.error('Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPlan = async () => {
    // Fetch user's subscription plan
    // This would come from your user profile API
    setUserPlan('standard') // Placeholder
  }

  const handleCreateWorkspace = () => {
    // Check if user's plan allows workspaces
    if (userPlan === 'free' || userPlan === 'pro') {
      toast.error('Workspaces are available on Standard and Custom plans')
      router.push('/pricing')
      return
    }
    router.push('/workspaces/new')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              Workspaces
            </h1>
            <p className="text-gray-600 mt-2">Manage your team workspaces and collaboration</p>
          </div>
          <button
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Workspace
          </button>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workspaces Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first workspace to start collaborating with your team
            </p>
            <button
              onClick={handleCreateWorkspace}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
                onClick={() => router.push(`/workspaces/${workspace.slug}`)}
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-xl font-bold">
                        {workspace.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-blue-600 rounded-lg capitalize">
                        {workspace.plan}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {workspace.name}
                  </h3>
                  {workspace.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{workspace.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="p-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Up to {workspace.maxMembers} members</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/workspaces/${workspace.slug}/settings`)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {(userPlan === 'free' || userPlan === 'pro') && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unlock Team Collaboration
                </h3>
                <p className="text-gray-600 mb-4">
                  Workspaces are available on Standard and Custom plans. Collaborate with your team,
                  manage permissions, and scale your LinkedIn content strategy.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
