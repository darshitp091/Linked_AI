'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Building2, MapPin, Briefcase, Filter, Plus, Star, ArrowLeft, Loader2 } from 'lucide-react'

interface Lead {
  id: string
  linkedin_url: string
  full_name: string
  headline: string
  company: string
  job_title: string
  location: string
  connection_degree: number
  lead_score: number
}

interface LeadList {
  id: string
  name: string
}

interface Props {
  weeklyLimit: number
  weeklyUsed: number
  weeklyRemaining: number
  userPlan: string
  leadLists: LeadList[]
}

export default function LeadDiscoveryClient({
  weeklyLimit,
  weeklyUsed,
  weeklyRemaining,
  userPlan,
  leadLists
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Lead[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearch = async () => {
    if (weeklyRemaining <= 0) {
      setError(`You've reached your weekly limit of ${weeklyLimit} lead discoveries.`)
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (jobTitle) params.append('jobTitle', jobTitle)
      if (company) params.append('company', company)
      if (location) params.append('location', location)
      if (industry) params.append('industry', industry)

      const response = await fetch(`/api/leads/search?${params.toString()}`, {
        method: 'GET',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search leads')
      }

      setResults(data.leads || [])

      if (data.leads && data.leads.length === 0) {
        setError('No leads found matching your criteria. Try different filters.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search leads')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async (lead: Lead, listId?: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedin_url: lead.linkedin_url,
          full_name: lead.full_name,
          headline: lead.headline,
          company: lead.company,
          job_title: lead.job_title,
          location: lead.location,
          connection_degree: lead.connection_degree,
          lead_score: lead.lead_score,
          list_id: listId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add lead')
      }

      setSuccessMessage(`Added ${lead.full_name} to your leads!`)
      setTimeout(() => setSuccessMessage(''), 3000)

      // Remove from results
      setResults(results.filter(r => r.linkedin_url !== lead.linkedin_url))
    } catch (err: any) {
      setError(err.message || 'Failed to add lead')
    }
  }

  const isFreePlan = userPlan === 'free'
  const hasAdvancedFilters = userPlan === 'pro' || userPlan === 'standard'

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
        <h1 className="text-3xl font-bold mb-2">Discover Leads</h1>
        <p className="text-gray-600">
          Search LinkedIn for potential leads by job title, company, and industry
        </p>
      </div>

      {/* Usage Alert */}
      <div className={`mb-6 p-4 rounded-lg border ${
        weeklyRemaining === 0 ? 'bg-red-50 border-red-200' :
        weeklyRemaining <= 2 ? 'bg-orange-50 border-orange-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${
              weeklyRemaining === 0 ? 'text-red-900' :
              weeklyRemaining <= 2 ? 'text-orange-900' :
              'text-blue-900'
            }`}>
              {weeklyRemaining === 0 ? 'Weekly Limit Reached' :
               weeklyRemaining <= 2 ? 'Almost at Weekly Limit' :
               'Lead Discovery Available'}
            </h3>
            <p className={`text-sm mt-1 ${
              weeklyRemaining === 0 ? 'text-red-700' :
              weeklyRemaining <= 2 ? 'text-orange-700' :
              'text-blue-700'
            }`}>
              {weeklyUsed}/{weeklyLimit} discoveries used this week • {weeklyRemaining} remaining
            </p>
          </div>
          {isFreePlan && (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Upgrade for More
            </Link>
          )}
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

      {/* Search Form */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* General Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              General Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Marketing Manager in SaaS"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., CEO, Marketing Manager"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Microsoft"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, Remote"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!hasAdvancedFilters}
            />
            {!hasAdvancedFilters && (
              <p className="text-xs text-gray-500 mt-1">⚠️ Pro feature</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!hasAdvancedFilters}
            >
              <option value="">All Industries</option>
              <option value="technology">Technology</option>
              <option value="saas">SaaS</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="ecommerce">E-commerce</option>
            </select>
            {!hasAdvancedFilters && (
              <p className="text-xs text-gray-500 mt-1">⚠️ Pro feature</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || weeklyRemaining === 0 || (!searchQuery && !jobTitle && !company)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Searching LinkedIn...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Discover Leads
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Search Results</h2>
            <p className="text-sm text-gray-600 mt-1">
              Found {results.length} potential leads
            </p>
          </div>

          <div className="divide-y">
            {results.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{lead.full_name}</h3>
                      {lead.lead_score >= 70 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Hot Lead
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-2">{lead.headline}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {lead.job_title && (
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {lead.job_title}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {lead.company}
                        </div>
                      )}
                      {lead.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {lead.location}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Lead Score: {lead.lead_score}/100
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {lead.connection_degree === 1 ? '1st connection' :
                         lead.connection_degree === 2 ? '2nd connection' :
                         lead.connection_degree === 3 ? '3rd connection' : 'Out of network'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAddLead(lead)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lead
                    </button>

                    {leadLists.length > 0 && hasAdvancedFilters && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddLead(lead, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="px-4 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Add to list...</option>
                        {leadLists.map(list => (
                          <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                      </select>
                    )}

                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center text-sm"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Discovering Leads
          </h3>
          <p className="text-gray-600 mb-4">
            Enter search criteria above to find potential leads on LinkedIn
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2"><strong>Tips for better results:</strong></p>
            <ul className="text-left max-w-md mx-auto space-y-1">
              <li>• Be specific with job titles (e.g., "VP of Marketing" vs "Marketing")</li>
              <li>• Combine filters for targeted results</li>
              <li>• Use company names for competitor employee searches</li>
              <li>• Try different keyword combinations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
