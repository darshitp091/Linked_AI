'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileJson, FileSpreadsheet, CheckSquare, Square, Filter } from 'lucide-react'

interface Lead {
  id: string
  linkedin_url: string
  full_name: string
  headline: string
  company: string
  job_title: string
  location: string
  status: string
  lead_score: number
  tags: string[]
  notes: string
  created_at: string
}

interface LeadList {
  id: string
  name: string
  lead_ids: string[]
}

interface Props {
  leads: Lead[]
  leadLists: LeadList[]
  userPlan: string
}

export default function LeadExportClient({ leads: initialLeads, leadLists, userPlan }: Props) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterList, setFilterList] = useState<string>('all')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const filteredLeads = initialLeads.filter(lead => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false
    if (filterList !== 'all') {
      const list = leadLists.find(l => l.id === filterList)
      if (!list || !(list.lead_ids || []).includes(lead.id)) return false
    }
    return true
  })

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleExport = () => {
    const leadsToExport = filteredLeads.filter(lead => selectedLeads.has(lead.id))

    if (leadsToExport.length === 0) {
      alert('Please select at least one lead to export')
      return
    }

    if (exportFormat === 'csv') {
      exportToCSV(leadsToExport)
    } else {
      exportToJSON(leadsToExport)
    }
  }

  const exportToCSV = (leads: Lead[]) => {
    const headers = [
      'Name',
      'Job Title',
      'Company',
      'Location',
      'Status',
      'Lead Score',
      'LinkedIn URL',
      'Headline',
      'Tags',
      'Notes',
      'Created Date'
    ]

    const rows = leads.map(lead => [
      lead.full_name || '',
      lead.job_title || '',
      lead.company || '',
      lead.location || '',
      lead.status || '',
      lead.lead_score || 0,
      lead.linkedin_url || '',
      lead.headline || '',
      (lead.tags || []).join('; '),
      lead.notes || '',
      new Date(lead.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const str = String(cell)
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, 'text/csv', 'leads_export.csv')
  }

  const exportToJSON = (leads: Lead[]) => {
    const jsonContent = JSON.stringify(leads, null, 2)
    downloadFile(jsonContent, 'application/json', 'leads_export.json')
  }

  const downloadFile = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
        <h1 className="text-3xl font-bold mb-2">Export Leads</h1>
        <p className="text-gray-600">
          Export your leads to CSV or JSON for CRM integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-4">Export Options</h2>

            <div className="space-y-4">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`w-full px-4 py-3 border rounded-lg flex items-center gap-3 ${
                      exportFormat === 'csv'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-gray-600">Excel compatible</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setExportFormat('json')}
                    className={`w-full px-4 py-3 border rounded-lg flex items-center gap-3 ${
                      exportFormat === 'json'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileJson className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-600">API integration</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
              </div>

              {userPlan !== 'free' && leadLists.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by List
                  </label>
                  <select
                    value={filterList}
                    onChange={(e) => setFilterList(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Lists</option>
                    {leadLists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Export Summary */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Total leads:</span>
                  <span className="font-semibold">{initialLeads.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Filtered:</span>
                  <span className="font-semibold">{filteredLeads.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected:</span>
                  <span className="font-semibold text-blue-600">{selectedLeads.size}</span>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={selectedLeads.size === 0}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export {selectedLeads.size} Lead{selectedLeads.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Select Leads to Export</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} available
                </p>
              </div>

              <button
                onClick={handleSelectAll}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center text-sm"
              >
                {selectedLeads.size === filteredLeads.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Select All
                  </>
                )}
              </button>
            </div>

            {filteredLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        {/* Checkbox column */}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedLeads.has(lead.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSelectLead(lead.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {lead.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.location || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.job_title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.lead_score}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No leads match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRM Integration Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">CRM Integration Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>CSV Format</strong>: Best for Salesforce, HubSpot, Pipedrive, and Excel</li>
          <li>• <strong>JSON Format</strong>: Best for custom API integrations and Zapier</li>
          <li>• <strong>Lead Score</strong>: Use to prioritize outreach (70+ = hot leads)</li>
          <li>• <strong>Tags</strong>: Help segment campaigns in your CRM</li>
        </ul>
      </div>
    </div>
  )
}
