'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, X, Lightbulb, Copy, Check, Save, Edit3, Hash, MessageSquare, Target, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { trackPostGenerated, trackPostSavedAsDraft, trackPostEdited } from '@/lib/analytics/posthog'
import { PostTemplate } from '@/lib/templates'
import { useSearchParams } from 'next/navigation'

const toneOptions = [
  { value: 'professional', label: 'Professional', icon: '💼', desc: 'Clear and business-focused' },
  { value: 'casual', label: 'Casual & Friendly', icon: '😊', desc: 'Approachable and warm' },
  { value: 'thought-leader', label: 'Thought Leader', icon: '🎯', desc: 'Authoritative insights' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖', desc: 'Engaging narratives' },
  { value: 'educational', label: 'Educational', icon: '📚', desc: 'Teach and inform' },
]

interface GeneratedPost {
  topic: string
  hook: string
  body: string
  cta: string
  full_post: string
  suggested_hashtags: string[]
}

export default function GeneratePage() {
  const searchParams = useSearchParams()

  // New state variables for redesigned layout
  const [topicDescription, setTopicDescription] = useState('')
  const [mainTopic, setMainTopic] = useState('')
  const [niche, setNiche] = useState('')
  const [targetAudience, setTargetAudience] = useState('')

  // Existing state variables
  const [tone, setTone] = useState('professional')
  const [postsCount, setPostsCount] = useState(7)
  const [loading, setLoading] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [postsRemaining, setPostsRemaining] = useState<number>(5)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)

  useEffect(() => {
    fetchPostsRemaining()

    // Check if user came from templates page
    const templateParam = searchParams?.get('template')
    if (templateParam === 'true') {
      const storedTemplate = localStorage.getItem('selectedTemplate')
      if (storedTemplate) {
        try {
          const template: PostTemplate = JSON.parse(storedTemplate)
          setSelectedTemplate(template)

          // Pre-fill with template data
          if (template.tone) {
            setTone(template.tone)
          }

          // Clear the stored template
          localStorage.removeItem('selectedTemplate')

          toast.success(`Template "${template.name}" loaded!`)
        } catch (error) {
          console.error('Error parsing template:', error)
        }
      }
    }
  }, [searchParams])

  const fetchPostsRemaining = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('ai_generations_limit, ai_generations_used')
        .eq('user_id', user.id)
        .single()

      if (subscription) {
        const remaining = (subscription.ai_generations_limit || 5) - (subscription.ai_generations_used || 0)
        setPostsRemaining(Math.max(0, remaining))
      }
    }
  }

  // Helper function to construct topics array from new input fields
  const constructTopicsArray = () => {
    const parts = []

    if (topicDescription.trim()) {
      parts.push(topicDescription.trim())
    }

    if (mainTopic.trim() || niche.trim() || targetAudience.trim()) {
      const metadata = []
      if (mainTopic.trim()) metadata.push(`Main Topic: ${mainTopic}`)
      if (niche.trim()) metadata.push(`Niche: ${niche}`)
      if (targetAudience.trim()) metadata.push(`Target Audience: ${targetAudience}`)
      parts.push(metadata.join(', '))
    }

    return parts
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSaveDraft = async (post: GeneratedPost, index: number) => {
    try {
      const res = await fetch('/api/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.full_post,
          topic: post.topic,
          status: 'draft',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save draft')
      }

      // Track event in PostHog
      trackPostSavedAsDraft({
        postId: data.post?.id,
        topic: post.topic,
        contentLength: post.full_post.length,
      })

      toast.success('Post saved to drafts!')

      // Remove the saved post from the generated posts list
      setGeneratedPosts(prev => prev.filter((_, i) => i !== index))
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft')
    }
  }

  const handleEdit = (post: GeneratedPost, index: number) => {
    setEditingIndex(index)
    setEditedContent(post.full_post)
  }

  const handleSaveEdit = (index: number) => {
    if (editedContent.trim() !== '') {
      setGeneratedPosts(prev =>
        prev.map((p, i) =>
          i === index
            ? { ...p, full_post: editedContent }
            : p
        )
      )

      // Track edit event in PostHog
      trackPostEdited(`generated-${index}`)

      toast.success('Post updated!')
    }
    setEditingIndex(null)
    setEditedContent('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedContent('')
  }

  const handleGenerate = async () => {
    if (!topicDescription.trim() && !selectedTemplate) {
      toast.error('Please describe what you want to write about')
      return
    }

    setLoading(true)
    try {
      const topics = constructTopicsArray()

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          tone,
          postsCount,
          template: selectedTemplate ? {
            name: selectedTemplate.name,
            template: selectedTemplate.template,
            variables: selectedTemplate.variables,
          } : undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate posts')
      }

      setGeneratedPosts(data.posts)
      toast.success(`Generated ${data.posts.length} posts!`)

      // Refresh posts remaining after generation
      await fetchPostsRemaining()

      // Track generation event in PostHog
      trackPostGenerated({
        topics,
        style: 'professional',
        tone,
        length: 3,
        postsCount: data.posts.length,
        postsRemaining: postsRemaining - data.posts.length,
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearTemplate = () => {
    setSelectedTemplate(null)
    toast.success('Template cleared')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">AI Content Generator</h1>
          </div>
          <p className="text-gray-500">Create engaging LinkedIn posts powered by AI in seconds</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{postsRemaining} posts remaining</span>
        </div>
      </div>

      {/* Template Indicator */}
      {selectedTemplate && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Template
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
                <div className="bg-white/50 rounded-lg p-3 text-xs text-gray-700 max-h-20 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">
                    {selectedTemplate.template.slice(0, 150)}
                    {selectedTemplate.template.length > 150 && '...'}
                  </pre>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClearTemplate}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Section - Full Width Cards */}
      <div className="space-y-6 mb-8">
        {/* Topic Description Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0a66c2]" />
              <h2 className="font-semibold text-gray-900">What do you want to write about?</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Describe your topic in detail. Be specific about what you want to communicate.
            </p>
          </div>

          <div className="p-5">
            <textarea
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              placeholder="Example: Write a post about AI in healthcare, focusing on how machine learning helps doctors make better diagnoses. Emphasize patient outcomes and the future of medical technology..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{topicDescription.length} characters</span>
              <span>Be as detailed as you like</span>
            </div>
          </div>
        </div>

        {/* Niche Specification Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0a66c2]" />
              <h2 className="font-semibold text-gray-900">Specify Your Focus</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Help us understand your content niche better (optional)
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="inline w-4 h-4 mr-1" />
                  Main Topic
                </label>
                <input
                  type="text"
                  value={mainTopic}
                  onChange={(e) => setMainTopic(e.target.value)}
                  placeholder="e.g., Artificial Intelligence"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors"
                />
              </div>

              {/* Niche/Sub-topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="inline w-4 h-4 mr-1" />
                  Niche/Sub-topic
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Healthcare Applications"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="inline w-4 h-4 mr-1" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Healthcare Professionals"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tone Selection & Posts Count Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tone Dropdown */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#0a66c2]" />
                  Writing Style & Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label} - {option.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posts Count */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Number of Posts</label>
                  <span className="text-2xl font-bold text-[#0a66c2]">{postsCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={postsCount}
                  onChange={(e) => setPostsCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#0a66c2]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>14</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <Button
                onClick={handleGenerate}
                disabled={loading || (!topicDescription.trim() && !selectedTemplate)}
                className="w-full h-12 text-base gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {postsCount} Posts
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Posts Section - Full Width */}
      <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Generated Posts</h2>
            {generatedPosts.length > 0 && (
              <span className="text-sm text-gray-500">{generatedPosts.length} posts</span>
            )}
          </div>

          {generatedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0a66c2]/10 to-[#0a66c2]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-[#0a66c2]/40" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to create?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add your topics, choose a writing style, and let AI generate engaging LinkedIn posts for you.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">1</div>
                    Add topics
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">2</div>
                    Pick style
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">3</div>
                    Generate
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {generatedPosts.map((post, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Post Header */}
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0a66c2]/10 flex items-center justify-center text-xs font-medium text-[#0a66c2]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{post.topic}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(post.full_post, index)}
                        className="p-2 text-gray-400 hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5">
                    {editingIndex === index ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full min-h-[200px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors resize-none"
                        placeholder="Edit your post..."
                      />
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {post.full_post}
                      </p>
                    )}

                    {/* Hashtags */}
                    {!editingIndex && post.suggested_hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Hash className="w-4 h-4 text-gray-300" />
                        {post.suggested_hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-[#0a66c2] hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center gap-2">
                    {editingIndex === index ? (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleEdit(post, index)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleSaveDraft(post, index)}
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Draft
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
