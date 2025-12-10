'use client'

import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LinkedInPreviewProps {
  content: string
  authorName?: string
  authorTitle?: string
  authorAvatar?: string
  timestamp?: string
}

export function LinkedInPreview({
  content,
  authorName,
  authorTitle,
  authorAvatar,
  timestamp = 'Just now'
}: LinkedInPreviewProps) {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, job_title, avatar_url')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const displayName = authorName || profile?.full_name || 'Your Name'
  const displayTitle = authorTitle || profile?.job_title || 'Your Title'
  const displayAvatar = authorAvatar || profile?.avatar_url

  // Extract hashtags from content
  const hashtags = content.match(/#\w+/g) || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-blue-700 flex items-center justify-center flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Author Info */}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm hover:text-[#0a66c2] hover:underline cursor-pointer">
                {displayName}
              </h4>
              <p className="text-xs text-gray-600">{displayTitle}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <span>{timestamp}</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* More Options */}
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="text-sm text-gray-900 whitespace-pre-wrap mb-3">
          {content.split(' ').map((word, i) => {
            if (word.startsWith('#')) {
              return (
                <span key={i} className="text-[#0a66c2] font-medium hover:underline cursor-pointer">
                  {word}{' '}
                </span>
              )
            }
            if (word.startsWith('@')) {
              return (
                <span key={i} className="text-[#0a66c2] font-medium hover:underline cursor-pointer">
                  {word}{' '}
                </span>
              )
            }
            return word + ' '
          })}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-b border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-[#0a66c2] flex items-center justify-center border-2 border-white">
                <ThumbsUp className="w-3 h-3 text-white fill-white" />
              </div>
              <div className="w-5 h-5 rounded-full bg-[#057642] flex items-center justify-center border-2 border-white">
                <span className="text-[10px] text-white">❤️</span>
              </div>
            </div>
            <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">
              23 reactions
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">5 comments</span>
            <span>•</span>
            <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">2 reposts</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1.5">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 rounded transition text-gray-600 hover:text-gray-900">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Like</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 rounded transition text-gray-600 hover:text-gray-900">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 rounded transition text-gray-600 hover:text-gray-900">
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Repost</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 rounded transition text-gray-600 hover:text-gray-900">
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
