import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // In production, this would fetch from LinkedIn API or a trending topics service
    // For now, we'll update existing topics with simulated trend changes

    const { data: topics, error: fetchError } = await supabase
      .from('trending_topics')
      .select('*')

    if (fetchError) {
      console.error('Error fetching trending topics:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
    }

    let updatedCount = 0
    const errors: string[] = []

    for (const topic of topics || []) {
      try {
        // Simulate trend score changes
        const scoreChange = Math.floor(Math.random() * 20) - 10
        const newScore = Math.max(0, Math.min(100, topic.trend_score + scoreChange))

        const newVelocity = scoreChange > 5 ? 'rising' :
                           scoreChange < -5 ? 'falling' : 'stable'

        const { error: updateError } = await supabase
          .from('trending_topics')
          .update({
            trend_score: newScore,
            velocity: newVelocity,
            post_count: topic.post_count + Math.floor(Math.random() * 50),
            last_updated_at: new Date().toISOString()
          })
          .eq('id', topic.id)

        if (updateError) {
          errors.push(`Topic ${topic.id}: ${updateError.message}`)
        } else {
          updatedCount++
        }

      } catch (error) {
        errors.push(`Topic ${topic.id}: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    console.log(`✅ Trending topics updated: ${updatedCount} topics`)

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: topics?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Trending topics cron error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
