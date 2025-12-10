'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  action_url?: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const url =
        filter === 'unread'
          ? '/api/notifications?unreadOnly=true'
          : '/api/notifications'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        toast.success('Notification deleted')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'post_published':
        return 'border-l-green-500 bg-green-50'
      case 'post_failed':
        return 'border-l-red-500 bg-red-50'
      case 'support_reply':
        return 'border-l-blue-500 bg-blue-50'
      case 'plan_upgraded':
        return 'border-l-purple-500 bg-purple-50'
      case 'team_invite':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your posts, support tickets, and account activity
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between border border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'secondary' : 'outline'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'secondary' : 'outline'}
              size="sm"
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="ghost" size="sm">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : 'You\'ll see notifications here when you have updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border-l-4 ${getNotificationColor(
                  notification.type
                )} p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.read ? 'border-2 border-blue-200' : 'border border-gray-200'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {formatTime(notification.created_at)}
                      </span>
                      {notification.action_url && (
                        <span className="text-sm text-purple-600 font-medium">
                          Click to view →
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
