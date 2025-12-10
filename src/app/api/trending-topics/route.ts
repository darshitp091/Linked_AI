import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const velocity = searchParams.get('velocity') // rising, falling, stable
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('trending_topics')
      .select('*')
      .order('trend_score', { ascending: false })
      .limit(limit)

    if (industry) {
      query = query.eq('industry', industry)
    }

    if (velocity) {
      query = query.eq('velocity', velocity)
    }

    const { data: topics, error } = await query

    if (error) {
      console.error('Error fetching trending topics:', error)
      return NextResponse.json({ error: 'Failed to fetch trending topics' }, { status: 500 })
    }

    // Get unique industries
    const { data: allTopics } = await supabase
      .from('trending_topics')
      .select('industry')

    const industries = [...new Set(allTopics?.map(t => t.industry) || [])]

    return NextResponse.json({
      topics,
      industries,
      filters: {
        industry: industry || 'all',
        velocity: velocity || 'all'
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
