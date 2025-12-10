'use client'

import { useState } from 'react'
import { DateTimePicker } from './date-time-picker'
import { X, Calendar, CheckCircle2 } from 'lucide-react'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    content: string
    topic?: string
  }
  onSchedule: (postId: string, scheduledFor: Date, syncToGoogleCalendar: boolean) => Promise<void>
}

export function ScheduleModal({ isOpen, onClose, post, onSchedule }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [syncToGoogleCalendar, setSyncToGoogleCalendar] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSchedule = async () => {
    if (!selectedDate) {
      setError('Please select a date and time')
      return
    }

    if (selectedDate < new Date()) {
      setError('Please select a future date and time')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSchedule(post.id, selectedDate, syncToGoogleCalendar)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to schedule post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Schedule Post</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Post Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {post.topic && (
                <p className="text-sm font-medium text-blue-600 mb-2">
                  {post.topic}
                </p>
              )}
              <p className="text-gray-800 whitespace-pre-wrap line-clamp-6">
                {post.content}
              </p>
              {post.content.length > 300 && (
                <p className="text-sm text-gray-500 mt-2">
                  {post.content.length} characters
                </p>
              )}
            </div>
          </div>

          {/* Date Time Picker */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              When should we publish this post?
            </h3>
            <DateTimePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          {/* Google Calendar Sync Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToGoogleCalendar}
                onChange={(e) => setSyncToGoogleCalendar(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-blue-900">
                  Sync to Google Calendar
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Create a calendar event to remind you when this post will be published.
                  The event will include the post content and a link to edit it.
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!selectedDate || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Schedule Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
