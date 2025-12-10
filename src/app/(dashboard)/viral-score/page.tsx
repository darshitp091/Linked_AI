'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Target, TrendingUp, Sparkles, AlertCircle, Zap, Users, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ViralScorePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [postContent, setPostContent] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [viralScore, setViralScore] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const analyzeViralPotential = async () => {
    if (!postContent.trim()) return

    setAnalyzing(true)

    try {
      // Call API to analyze viral potential using AI
      const response = await fetch('/api/posts/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze post')
      }

      const data = await response.json()
      setViralScore(data)
    } catch (error) {
      console.error('Error analyzing viral potential:', error)
      // Fallback to basic analysis if API fails
      setViralScore({
        score: 0,
        factors: {
          engagement: 0,
          timing: 0,
          relevance: 0,
          emotion: 0,
        },
        predictions: {
          likes: 0,
          comments: 0,
          shares: 0,
          reach: 0,
        },
        suggestions: [
          'Unable to analyze post. Please try again.',
        ],
      })
    }

    setAnalyzing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Viral Potential'
    if (score >= 60) return 'Medium Viral Potential'
    return 'Low Viral Potential'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Viral Predictor</h1>
              <p className="text-gray-600">AI-powered prediction of your post's viral potential</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Paste your LinkedIn post content here to analyze its viral potential..."
            className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {postContent.length} characters
            </span>
            <Button
              onClick={analyzeViralPotential}
              disabled={!postContent.trim() || analyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Predict Viral Score
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {viralScore && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getScoreColor(viralScore.score)}`}>
                <TrendingUp className="w-4 h-4" />
                {getScoreLabel(viralScore.score)}
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {viralScore.score}
              </div>
              <p className="text-gray-600">out of 100</p>
            </div>

            {/* Score Factors */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(viralScore.factors).map(([factor, score]: [string, any]) => (
                  <div key={factor}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {factor}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Engagement Predictions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Heart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{viralScore.predictions.likes}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{viralScore.predictions.comments}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Share2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{viralScore.predictions.shares}</div>
                  <div className="text-sm text-gray-600">Shares</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{viralScore.predictions.reach.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Reach</div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-start gap-3 mb-4">
                <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Optimization Tips</h3>
                  <p className="text-sm text-gray-600">
                    Follow these suggestions to increase your viral potential
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {viralScore.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!viralScore && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How It Works</h3>
                <p className="text-sm text-gray-700">
                  Our AI analyzes your post content using machine learning to predict its viral potential.
                  We evaluate factors like engagement hooks, emotional appeal, timing relevance, and content structure
                  to give you a comprehensive viral score and actionable suggestions for improvement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
