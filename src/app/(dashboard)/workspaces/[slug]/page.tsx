'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building2, Users, UserPlus, Crown, Shield, Edit3, Eye, Loader2, Mail, Trash2, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  plan: string
  maxMembers: number
}

interface Member {
  id: string
  userId: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: string
  joinedAt: string
  user?: {
    email: string
    full_name: string | null
  }
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    fetchWorkspaceData()
  }, [slug])

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true)

      // Fetch all workspaces and find by slug
      const workspacesRes = await fetch('/api/workspaces')
      if (workspacesRes.ok) {
        const workspacesData = await workspacesRes.json()
        const foundWorkspace = workspacesData.workspaces.find((w: Workspace) => w.slug === slug)

        if (!foundWorkspace) {
          toast.error('Workspace not found')
          router.push('/workspaces')
          return
        }

        setWorkspace(foundWorkspace)

        // Fetch members
        const membersRes = await fetch(`/api/workspaces/${foundWorkspace.id}/members`)
        if (membersRes.ok) {
          const membersData = await membersRes.json()
          setMembers(membersData.members || [])
        }
      }
    } catch (error) {
      console.error('Error fetching workspace:', error)
      toast.error('Failed to load workspace')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'editor':
        return <Edit3 className="w-4 h-4" />
      case 'viewer':
        return <Eye className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleRemoveMember = async (memberId: string, memberRole: string) => {
    if (memberRole === 'owner') {
      toast.error('Cannot remove workspace owner')
      return
    }

    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      const response = await fetch(`/api/workspaces/${workspace?.id}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Member removed successfully')
        fetchWorkspaceData()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!workspace) {
    return null
  }

  const isOwner = members.some((m) => m.role === 'owner' && m.userId === currentUserId)
  const isAdmin = members.some((m) => m.role === 'admin' && m.userId === currentUserId) || isOwner

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
                <p className="text-gray-600 mt-1">{workspace.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg capitalize">
                {workspace.plan} Plan
              </span>
              {isOwner && (
                <button
                  onClick={() => router.push(`/workspaces/${slug}/settings`)}
                  className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{members.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {workspace.maxMembers - members.length} slots available
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {members.filter((m) => m.role === 'admin' || m.role === 'owner').length}
                </div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {members.filter((m) => m.role === 'editor').length}
                </div>
                <div className="text-sm text-gray-600">Editors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-600">
                Manage who has access to this workspace
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {member.user?.full_name?.charAt(0).toUpperCase() || member.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.user?.full_name || member.user?.email || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-600">{member.user?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="text-sm font-medium capitalize">{member.role}</span>
                    </div>

                    {isAdmin && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.role)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Modal Placeholder */}
        {showInviteModal && (
          <InviteModal
            workspaceId={workspace.id}
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => {
              setShowInviteModal(false)
              fetchWorkspaceData()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Invite Modal Component
function InviteModal({
  workspaceId,
  onClose,
  onSuccess,
}: {
  workspaceId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/workspaces/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          email: email.trim(),
          role,
        }),
      })

      if (response.ok) {
        toast.success('Invitation sent successfully!')
        onSuccess()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="viewer">Viewer - Can view content</option>
                <option value="editor">Editor - Can create and edit</option>
                <option value="admin">Admin - Can manage members</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
