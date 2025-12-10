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

    // Get all active LinkedIn accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('linkedin_accounts')
      .select('id, user_id, access_token')
      .eq('is_active', true)

    if (accountsError) {
      console.error('Error fetching LinkedIn accounts:', accountsError)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    const today = new Date().toISOString().split('T')[0]
    let syncedCount = 0
    let errors: string[] = []

    for (const account of accounts || []) {
      try {
        // In production, call LinkedIn API to get follower count
        // For now, simulate with random growth
        const { data: latestSnapshot } = await supabase
          .from('follower_snapshots')
          .select('follower_count, connection_count')
          .eq('linkedin_account_id', account.id)
          .order('snapshot_date', { ascending: false })
          .limit(1)
          .single()

        const currentFollowers = latestSnapshot ?
          latestSnapshot.follower_count + Math.floor(Math.random() * 10) :
          Math.floor(Math.random() * 1000) + 100

        const currentConnections = latestSnapshot ?
          latestSnapshot.connection_count + Math.floor(Math.random() * 5) :
          Math.floor(Math.random() * 500) + 50

        // TODO: Replace with actual LinkedIn API call
        // const linkedInData = await fetchLinkedInFollowerCount(account.access_token)

        // Create snapshot
        const { error: insertError } = await supabase
          .from('follower_snapshots')
          .insert({
            linkedin_account_id: account.id,
            follower_count: currentFollowers,
            connection_count: currentConnections,
            snapshot_date: today
          })

        if (insertError) {
          // Ignore unique constraint errors (already synced today)
          if (!insertError.message.includes('duplicate')) {
            errors.push(`Account ${account.id}: ${insertError.message}`)
          }
        } else {
          syncedCount++
        }

      } catch (error) {
        errors.push(`Account ${account.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`✅ Follower sync complete: ${syncedCount} accounts synced`)

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      total: accounts?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Follower sync cron error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
