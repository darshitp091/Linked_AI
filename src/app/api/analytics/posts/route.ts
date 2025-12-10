/**
 * Post Analytics API
 * Returns detailed analytics for individual posts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'published_at'
    const order = searchParams.get('order') || 'desc'
    const status = searchParams.get('status') || 'published'

    // Validate sort field
    const validSortFields = [
      'published_at',
      'views',
      'likes',
      'comments',
      'shares',
      'engagement_rate',
    ]
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'published_at'

    // Build query based on sort field
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        content,
        published_at,
        status,
        linkedin_post_id,
        post_analytics (
          views,
          likes,
          comments,
          shares,
          clicks,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .eq('status', status)
      .not('published_at', 'is', null)

    // For analytics sorting, we need to handle it differently
    if (sortField === 'published_at') {
      query = query.order('published_at', { ascending: order === 'asc' })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Transform the data and apply sorting if needed
    let transformedPosts = (posts || []).map((post) => {
      const analytics = Array.isArray(post.post_analytics)
        ? post.post_analytics[0]
        : post.post_analytics

      // Calculate engagement rate and CTR
      const views = analytics?.views || 0
      const likes = analytics?.likes || 0
      const comments = analytics?.comments || 0
      const shares = analytics?.shares || 0
      const clicks = analytics?.clicks || 0

      const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0
      const clickThroughRate = views > 0 ? (clicks / views) * 100 : 0

      return {
        id: post.id,
        content: post.content,
        publishedAt: post.published_at,
        status: post.status,
        linkedinPostId: post.linkedin_post_id,
        analytics: analytics
          ? {
              views,
              likes,
              comments,
              shares,
              clicks,
              engagementRate,
              clickThroughRate,
              updatedAt: analytics.created_at,
            }
          : null,
      }
    })

    // Sort by analytics field if requested
    if (sortField !== 'published_at' && transformedPosts.length > 0) {
      transformedPosts.sort((a, b) => {
        const aValue = a.analytics?.[sortField as keyof typeof a.analytics] || 0
        const bValue = b.analytics?.[sortField as keyof typeof b.analytics] || 0

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue
        }
        return 0
      })
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', status)
      .not('published_at', 'is', null)

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error: any) {
    console.error('Error fetching post analytics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch post analytics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
