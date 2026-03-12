'use client'

import { useState } from 'react'
import { Zap, TrendingUp, Sparkles, AlertCircle, Info, Loader2, Heart, MessageCircle, Share2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViralityScoreCardProps {
  content: string
}

export default function ViralityScoreCard({ content }: ViralityScoreCardProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setAnalyzing(true)
    try {
      const response = await fetch('/api/posts/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error analyzing virality:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-gray-100 text-sm">Virality Predictor</h3>
        </div>
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {!result ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-4">
              Analyze your post to see its viral potential and get improvement tips.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={!content.trim() || analyzing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm h-9"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Predict Score
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score */}
            <div className="text-center pb-4 border-b border-gray-700/50">
              <div className={`text-4xl font-black mb-1 ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Virality Score
              </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-900/50 rounded-lg text-center border border-gray-700/30">
                <Heart className="w-3 h-3 text-red-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-200">{result.predictions?.likes || 0}</div>
                <div className="text-[8px] text-gray-500 uppercase">Likes</div>
              </div>
              <div className="p-2 bg-gray-900/50 rounded-lg text-center border border-gray-700/30">
                <MessageCircle className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-200">{result.predictions?.comments || 0}</div>
                <div className="text-[8px] text-gray-500 uppercase">Comments</div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                Optimization Tips
              </h4>
              <ul className="space-y-2">
                {result.suggestions?.slice(0, 3).map((tip: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2 bg-gray-900/30 p-2 rounded-lg border border-gray-700/20">
                    <div className="w-1 h-1 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              variant="outline"
              className="w-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 text-xs h-8"
            >
              Re-analyze
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
