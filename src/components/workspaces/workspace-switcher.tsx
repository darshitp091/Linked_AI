'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, Plus, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  plan: string
}

export default function WorkspaceSwitcher() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])

        // Set first workspace as active if any exist
        if (data.workspaces && data.workspaces.length > 0) {
          const savedWorkspaceId = localStorage.getItem('activeWorkspaceId')
          const active = savedWorkspaceId
            ? data.workspaces.find((w: Workspace) => w.id === savedWorkspaceId) || data.workspaces[0]
            : data.workspaces[0]
          setActiveWorkspace(active)
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
    localStorage.setItem('activeWorkspaceId', workspace.id)
    setIsOpen(false)
    toast.success(`Switched to ${workspace.name}`)

    // Optionally refresh the page to reload data for new workspace
    // router.refresh()
  }

  const handleCreateWorkspace = () => {
    setIsOpen(false)
    router.push('/workspaces/new')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <button
        onClick={handleCreateWorkspace}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Create Workspace</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors min-w-[180px]"
      >
        <Building2 className="w-4 h-4 text-gray-600" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 truncate">
            {activeWorkspace?.name || 'Select Workspace'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {activeWorkspace?.plan || 'No plan'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {/* Workspace List */}
            <div className="max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {workspace.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {workspace.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {workspace.plan} plan
                    </div>
                  </div>
                  {activeWorkspace?.id === workspace.id && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={handleCreateWorkspace}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/workspaces')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Manage Workspaces
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
