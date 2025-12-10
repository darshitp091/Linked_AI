'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  Plus,
  ArrowRight,
  Building2,
  Crown,
  Shield,
  Eye,
  Edit3,
} from 'lucide-react'
import { Workspace } from '@/lib/workspaces'
import toast from 'react-hot-toast'

interface WorkspaceListProps {
  onCreateClick?: () => void
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  editor: Edit3,
  viewer: Eye,
}

const roleColors = {
  owner: 'from-amber-500 to-orange-600',
  admin: 'from-blue-500 to-indigo-600',
  editor: 'from-emerald-500 to-green-600',
  viewer: 'from-gray-400 to-gray-500',
}

export default function WorkspaceList({ onCreateClick }: WorkspaceListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workspaces')
      const data = await response.json()

      if (response.ok) {
        setWorkspaces(data.workspaces || [])
        // Fetch user role for each workspace
        const roles: Record<string, string> = {}
        for (const workspace of data.workspaces || []) {
          const membersResponse = await fetch(
            `/api/workspaces/${workspace.id}/members`
          )
          if (membersResponse.ok) {
            const membersData = await membersResponse.json()
            const currentUserMember = membersData.members.find(
              (m: any) => m.userId === workspace.ownerId || true // Simplified
            )
            if (currentUserMember) {
              roles[workspace.id] = currentUserMember.role
            }
          }
        }
        setUserRole(roles)
      } else {
        toast.error(data.error || 'Failed to load workspaces')
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
      toast.error('Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]"></div>
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0a66c2]/10 to-[#004182]/10 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-[#0a66c2]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No workspaces yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create a workspace to collaborate with your team and manage LinkedIn
            content together.
          </p>
          <Button onClick={onCreateClick} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Workspace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => {
        const role = userRole[workspace.id] || 'viewer'
        const RoleIcon = roleIcons[role as keyof typeof roleIcons]
        const roleColor = roleColors[role as keyof typeof roleColors]

        return (
          <Link
            key={workspace.id}
            href={`/workspaces/${workspace.slug}`}
            className="group"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300">
              {/* Header with role badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center`}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${roleColor} bg-opacity-10`}
                >
                  <RoleIcon className="w-3.5 h-3.5 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700 capitalize">
                    {role}
                  </span>
                </div>
              </div>

              {/* Workspace info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0a66c2] transition-colors">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {workspace.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {workspace.maxMembers === 999
                      ? 'Unlimited'
                      : `Up to ${workspace.maxMembers}`}{' '}
                    members
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#0a66c2] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Plan badge */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {workspace.plan} Plan
                </span>
              </div>
            </div>
          </Link>
        )
      })}

      {/* Add new workspace card */}
      <button
        onClick={onCreateClick}
        className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 hover:border-[#0a66c2] hover:bg-[#0a66c2]/5 transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] group"
      >
        <div className="w-12 h-12 rounded-xl bg-[#0a66c2]/10 flex items-center justify-center mb-4 group-hover:bg-[#0a66c2] transition-colors">
          <Plus className="w-6 h-6 text-[#0a66c2] group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create New Workspace
        </h3>
        <p className="text-sm text-gray-500 text-center">
          Start collaborating with a new team
        </p>
      </button>
    </div>
  )
}
