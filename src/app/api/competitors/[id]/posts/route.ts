import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitorId = params.id

    // Verify competitor belongs to user
    const { data: competitor, error: compError } = await supabase
      .from('competitor_accounts')
      .select('*')
      .eq('id', competitorId)
      .eq('user_id', user.id)
      .single()

    if (compError || !competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get competitor posts
    const { data: posts, error, count } = await supabase
      .from('competitor_posts')
      .select('*', { count: 'exact' })
      .eq('competitor_account_id', competitorId)
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching competitor posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Calculate performance summary
    const avgViews = posts?.length ?
      posts.reduce((sum, p) => sum + (p.views || 0), 0) / posts.length : 0
    const avgLikes = posts?.length ?
      posts.reduce((sum, p) => sum + (p.likes || 0), 0) / posts.length : 0
    const avgComments = posts?.length ?
      posts.reduce((sum, p) => sum + (p.comments || 0), 0) / posts.length : 0
    const avgEngagementRate = posts?.length ?
      posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length : 0

    // Get top topics
    const allTags = posts?.flatMap(p => p.topic_tags || []) || []
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)

    return NextResponse.json({
      posts,
      total: count,
      performance_summary: {
        avg_views: Math.round(avgViews),
        avg_likes: Math.round(avgLikes),
        avg_comments: Math.round(avgComments),
        avg_engagement_rate: Number(avgEngagementRate.toFixed(2)),
        top_topics: topTopics,
        total_posts: count || 0
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
