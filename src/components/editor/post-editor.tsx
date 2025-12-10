'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2, Save, Calendar, Copy, Linkedin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  onSchedule?: (content: string) => void
}

export function PostEditor({ initialContent = '', onSave, onSchedule }: PostEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [improving, setImproving] = useState(false)

  const charCount = content.length
  const maxChars = 3000

  const handleImprove = async () => {
    if (!content.trim()) {
      toast.error('Add some content first')
      return
    }

    setImproving(true)
    try {
      const res = await fetch('/api/generate/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, instruction: 'Make it more engaging' }),
      })

      const data = await res.json()
      if (data.improved) {
        setContent(data.improved)
        toast.success('Post improved!')
      }
    } catch {
      toast.error('Failed to improve post')
    } finally {
      setImproving(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Editor */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your LinkedIn post here..."
          className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-between mt-2 text-sm">
          <span className={charCount > 2500 ? 'text-orange-400' : 'text-gray-500'}>
            {charCount} / {maxChars} characters
          </span>
          {charCount > 2500 && (
            <span className="text-orange-400">LinkedIn truncates posts over 2500 chars</span>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">Your Name</div>
            <div className="text-sm text-gray-500">Your headline</div>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-gray-300 text-sm">
          {content || 'Your post preview will appear here...'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleImprove} variant="outline" disabled={improving}>
          {improving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          Improve with AI
        </Button>
        <Button onClick={handleCopy} variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <Button onClick={() => onSave?.(content)} variant="outline">
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={() => onSchedule?.(content)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </div>
    </div>
  )
}
