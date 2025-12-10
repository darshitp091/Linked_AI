'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Palette, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivational and uplifting' },
  { value: 'informative', label: 'Informative', description: 'Educational and factual' },
  { value: 'thought-leader', label: 'Thought Leader', description: 'Insightful and visionary' },
]

const lengthOptions = [
  { value: 'short', label: 'Short', description: '1-2 paragraphs (100-200 words)' },
  { value: 'medium', label: 'Medium', description: '2-4 paragraphs (200-400 words)' },
  { value: 'long', label: 'Long', description: '4+ paragraphs (400+ words)' },
]

const styleOptions = [
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative-driven content' },
  { value: 'listicle', label: 'Listicle', description: 'Numbered or bulleted lists' },
  { value: 'question', label: 'Question-based', description: 'Starts with engaging questions' },
  { value: 'statistic', label: 'Data-driven', description: 'Backed by facts and numbers' },
]

export function BrandVoiceSettings() {
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [preferences, setPreferences] = useState({
    tone: 'professional',
    length: 'medium',
    style: 'storytelling',
    useEmojis: true,
    includeHashtags: true,
    includeCallToAction: true,
    customInstructions: '',
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('profiles')
          .select('content_preferences')
          .eq('id', user.id)
          .single()

        if (data?.content_preferences) {
          setPreferences({
            ...preferences,
            ...data.content_preferences
          })
        }
      }
    }
    fetchPreferences()
  }, [])

  const handleSave = async () => {
    if (!userId) return

    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        content_preferences: preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to save brand voice settings')
      console.error(error)
    } else {
      toast.success('Brand voice settings saved!')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Brand Voice</h2>
            <p className="text-sm text-gray-600">Customize your content style and tone</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Tone of Voice</label>
          <div className="grid md:grid-cols-2 gap-3">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPreferences({ ...preferences, tone: option.value })}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  preferences.tone === option.value
                    ? 'border-[#0a66c2] bg-[#0a66c2]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Post Length */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Post Length</label>
          <div className="grid grid-cols-3 gap-3">
            {lengthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPreferences({ ...preferences, length: option.value })}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  preferences.length === option.value
                    ? 'border-[#0a66c2] bg-[#0a66c2]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Writing Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Writing Style</label>
          <div className="grid md:grid-cols-2 gap-3">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPreferences({ ...preferences, style: option.value })}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  preferences.style === option.value
                    ? 'border-[#0a66c2] bg-[#0a66c2]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Use Emojis</div>
              <div className="text-sm text-gray-600">Add relevant emojis to posts</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.useEmojis}
              onChange={(e) => setPreferences({ ...preferences, useEmojis: e.target.checked })}
              className="w-5 h-5 text-[#0a66c2] rounded focus:ring-[#0a66c2]"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Include Hashtags</div>
              <div className="text-sm text-gray-600">Automatically suggest relevant hashtags</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.includeHashtags}
              onChange={(e) => setPreferences({ ...preferences, includeHashtags: e.target.checked })}
              className="w-5 h-5 text-[#0a66c2] rounded focus:ring-[#0a66c2]"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Include Call-to-Action</div>
              <div className="text-sm text-gray-600">End posts with engagement prompts</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.includeCallToAction}
              onChange={(e) => setPreferences({ ...preferences, includeCallToAction: e.target.checked })}
              className="w-5 h-5 text-[#0a66c2] rounded focus:ring-[#0a66c2]"
            />
          </label>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={preferences.customInstructions}
            onChange={(e) => setPreferences({ ...preferences, customInstructions: e.target.value })}
            placeholder="Add any specific instructions for your content (e.g., 'Always mention sustainability', 'Avoid jargon', etc.)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] resize-none"
            rows={4}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Brand Voice
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
