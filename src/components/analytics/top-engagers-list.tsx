'use client'

import { useEffect, useState } from 'react'
import { Users, Star, UserPlus, ExternalLink, Loader2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

interface Engager {
  id: string
  engager_name: string
  engager_headline: string
  engager_linkedin_url: string
  engager_profile_picture: string
  engagement_count: number
  influence_score: number
  is_converted_to_lead: boolean
}

interface Insights {
  total_unique_engagers: number
  total_engagements: number
  avg_engagement_per_person: number
  superfan_count: number
  influencer_count: number
}

export default function TopEngagersList() {
  const [engagers, setEngagers] = useState<Engager[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [convertingId, setConvertingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTopEngagers()
  }, [])

  const fetchTopEngagers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/top-engagers?limit=5')
      if (response.ok) {
        const data = await response.json()
        setEngagers(data.engagers || [])
        setInsights(data.insights)
      } else {
        throw new Error('Failed to fetch top engagers')
      }
    } catch (error) {
      console.error('Error fetching top engagers:', error)
      toast.error('Failed to load top engagers')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToLead = async (engager: Engager) => {
    try {
      setConvertingId(engager.id)
      const response = await fetch('/api/analytics/top-engagers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engager_id: engager.id }),
      })

      if (response.ok) {
        toast.success(`${engager.engager_name} converted to lead!`)
        setEngagers(engagers.map(e => 
          e.id === engager.id ? { ...e, is_converted_to_lead: true } : e
        ))
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to convert to lead')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setConvertingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading top engagers...</p>
      </div>
    )
  }

  if (engagers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Engagers Identified</h3>
        <p className="text-sm text-gray-600">
          Sync your analytics to see who engages most with your content
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Engagers</h3>
            <p className="text-sm text-gray-600">Your most active audience members</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {engagers.map((engager, index) => (
          <div key={engager.id} className="p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                    {engager.engager_profile_picture ? (
                      <img src={engager.engager_profile_picture} alt={engager.engager_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-sm">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    {engager.engager_name}
                    {engager.influence_score >= 80 && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                        High Influence
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-md">{engager.engager_headline || 'LinkedIn Member'}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {engager.engagement_count} Engagements
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-medium text-blue-600">
                      Sync Score: {engager.influence_score}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={engager.engager_linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {!engager.is_converted_to_lead ? (
                  <button
                    onClick={() => handleConvertToLead(engager)}
                    disabled={convertingId === engager.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {convertingId === engager.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    Lead
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                    Lead added
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
          View All Audience Insights
        </button>
      </div>
    </div>
  )
}
