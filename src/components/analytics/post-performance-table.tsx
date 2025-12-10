'use client'

import { useEffect, useState } from 'react'
import { Loader2, Eye, Heart, MessageCircle, Share2, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostAnalytics {
  id: string
  content: string
  publishedAt: string
  status: string
  linkedinPostId: string | null
  analytics: {
    views: number
    likes: number
    comments: number
    shares: number
    clicks: number
    engagementRate: number
    clickThroughRate: number
    updatedAt: string
  } | null
}

export default function PostPerformanceTable() {
  const [posts, setPosts] = useState<PostAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'published_at' | 'views' | 'likes' | 'comments' | 'shares' | 'engagement_rate'>('published_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const limit = 10

  useEffect(() => {
    fetchPosts()
  }, [sortBy, sortOrder, page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/analytics/posts?limit=${limit}&offset=${page * limit}&sortBy=${sortBy}&order=${sortOrder}`
      )
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setHasMore(data.pagination.hasMore)
      } else {
        throw new Error('Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(0)
  }

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <TrendingUp className="w-4 h-4 text-blue-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-blue-600" />
    )
  }

  if (loading && page === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading posts...</p>
      </div>
    )
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-600">Publish posts to see their performance here</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-900">Post Performance</h3>
        <p className="text-sm text-gray-600">Detailed analytics for each post</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Post Content
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('published_at')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {getSortIcon('published_at')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('views')}
              >
                <div className="flex items-center gap-2">
                  Views
                  {getSortIcon('views')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('likes')}
              >
                <div className="flex items-center gap-2">
                  Likes
                  {getSortIcon('likes')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('comments')}
              >
                <div className="flex items-center gap-2">
                  Comments
                  {getSortIcon('comments')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('shares')}
              >
                <div className="flex items-center gap-2">
                  Shares
                  {getSortIcon('shares')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('engagement_rate')}
              >
                <div className="flex items-center gap-2">
                  Engagement
                  {getSortIcon('engagement_rate')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {post.analytics?.views.toLocaleString() || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {post.analytics?.likes.toLocaleString() || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {post.analytics?.comments.toLocaleString() || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {post.analytics?.shares.toLocaleString() || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {post.analytics?.engagementRate.toFixed(2)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} - {page * limit + posts.length} posts
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
