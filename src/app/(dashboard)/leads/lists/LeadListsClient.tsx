'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Edit2, Users, Tag, FolderOpen, Download } from 'lucide-react'

interface Lead {
  id: string
  full_name: string
  job_title: string
  company: string
  status: string
  lead_score: number
  tags: string[]
}

interface LeadList {
  id: string
  name: string
  description: string
  lead_ids: string[]
  created_at: string
}

interface Props {
  lists: LeadList[]
  leads: Lead[]
  userPlan: string
}

export default function LeadListsClient({ lists: initialLists, leads, userPlan }: Props) {
  const [lists, setLists] = useState<LeadList[]>(initialLists)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedList, setSelectedList] = useState<LeadList | null>(null)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setError('List name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/leads/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create list')
      }

      setLists([data.list, ...lists])
      setSuccessMessage('List created successfully!')
      setShowCreateModal(false)
      setNewListName('')
      setNewListDescription('')

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) {
      return
    }

    try {
      const response = await fetch(`/api/leads/lists/${listId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      setLists(lists.filter(l => l.id !== listId))
      setSuccessMessage('List deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete list')
    }
  }

  const handleAddLeadToList = async (listId: string, leadId: string) => {
    try {
      const response = await fetch(`/api/leads/lists/${listId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add lead')
      }

      // Update local state
      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, lead_ids: [...(list.lead_ids || []), leadId] }
          : list
      ))

      setSuccessMessage('Lead added to list!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to add lead')
    }
  }

  const handleRemoveLeadFromList = async (listId: string, leadId: string) => {
    try {
      const response = await fetch(`/api/leads/lists/${listId}/leads/${leadId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove lead')
      }

      // Update local state
      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, lead_ids: (list.lead_ids || []).filter(id => id !== leadId) }
          : list
      ))

      setSuccessMessage('Lead removed from list!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to remove lead')
    }
  }

  const getLeadsForList = (list: LeadList) => {
    return leads.filter(lead => (list.lead_ids || []).includes(lead.id))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/leads"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lead Lists</h1>
            <p className="text-gray-600">
              Organize your leads into custom lists for better management
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create List
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lists Grid */}
      {lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => {
            const listLeads = getLeadsForList(list)

            return (
              <div key={list.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold">{list.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {listLeads.length} leads
                  </div>
                </div>

                <div className="p-6">
                  {listLeads.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {listLeads.slice(0, 3).map((lead) => (
                        <div key={lead.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{lead.full_name}</p>
                            <p className="text-xs text-gray-600 truncate">{lead.job_title}</p>
                            <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveLeadFromList(list.id, lead.id)}
                            className="text-gray-400 hover:text-red-600 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {listLeads.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{listLeads.length - 3} more leads
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No leads in this list</p>
                    </div>
                  )}

                  {/* Add Lead to List */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddLeadToList(list.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg mb-2"
                  >
                    <option value="">Add lead to this list...</option>
                    {leads
                      .filter(lead => !(list.lead_ids || []).includes(lead.id))
                      .map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.full_name} - {lead.company}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => {
                      // Export list to CSV
                      const csvContent = [
                        ['Name', 'Job Title', 'Company', 'Status', 'Score'].join(','),
                        ...listLeads.map(lead =>
                          [lead.full_name, lead.job_title, lead.company, lead.status, lead.lead_score].join(',')
                        )
                      ].join('\n')

                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${list.name.replace(/\s+/g, '_')}_leads.csv`
                      a.click()
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export List
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Lists Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create custom lists to organize your leads by campaign, industry, or status
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First List
          </button>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New List</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Hot Prospects, Tech CEOs"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Describe the purpose of this list..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewListName('')
                  setNewListDescription('')
                  setError('')
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={loading || !newListName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
