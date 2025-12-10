import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')
    const days = parseInt(searchParams.get('days') || '30')

    // Get user's LinkedIn accounts
    let accountIds: string[] = []
    if (accountId) {
      accountIds = [accountId]
    } else {
      const { data: accounts } = await supabase
        .from('linkedin_accounts')
        .select('id')
        .eq('user_id', user.id)

      accountIds = accounts?.map(a => a.id) || []
    }

    if (accountIds.length === 0) {
      return NextResponse.json({ error: 'No LinkedIn accounts found' }, { status: 404 })
    }

    // Get follower snapshots for the period
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: snapshots, error } = await supabase
      .from('follower_snapshots')
      .select('*')
      .in('linkedin_account_id', accountIds)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })

    if (error) {
      console.error('Error fetching snapshots:', error)
      return NextResponse.json({ error: 'Failed to fetch growth data' }, { status: 500 })
    }

    // Calculate growth metrics
    const latestSnapshot = snapshots?.[snapshots.length - 1]
    const earliestSnapshot = snapshots?.[0]

    const currentFollowers = latestSnapshot?.follower_count || 0
    const totalGrowth = currentFollowers - (earliestSnapshot?.follower_count || 0)

    // Calculate 7-day and 30-day growth rates
    const snapshot7DaysAgo = snapshots?.find(s => {
      const date = new Date(s.snapshot_date)
      const target = new Date()
      target.setDate(target.getDate() - 7)
      return date >= target
    })

    const growthRate7d = snapshot7DaysAgo?.follower_count ?
      ((currentFollowers - snapshot7DaysAgo.follower_count) / snapshot7DaysAgo.follower_count) * 100 : 0

    const growthRate30d = earliestSnapshot?.follower_count ?
      ((currentFollowers - earliestSnapshot.follower_count) / earliestSnapshot.follower_count) * 100 : 0

    const avgDailyGrowth = snapshots?.length ? totalGrowth / snapshots.length : 0
    const projectedFollowers30d = Math.round(currentFollowers + (avgDailyGrowth * 30))

    return NextResponse.json({
      snapshots,
      current_followers: currentFollowers,
      total_growth: totalGrowth,
      growth_rate_7d: Number(growthRate7d.toFixed(2)),
      growth_rate_30d: Number(growthRate30d.toFixed(2)),
      avg_daily_growth: Number(avgDailyGrowth.toFixed(2)),
      projected_followers_30d: projectedFollowers30d,
      period_days: days
    })

  } catch (error) {
    console.error('Growth analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
