import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { determineWinner, calculateEngagementRate } from '@/lib/ab-testing'

/**
 * GET /api/ab-tests/[id] - Get specific A/B test with detailed results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch test with all related data
    const { data: test, error } = await supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(
          id,
          variant_name,
          variant_label,
          traffic_percentage,
          views,
          likes,
          comments,
          shares,
          clicks,
          engagement_rate,
          conversion_rate,
          is_winner,
          confidence_score,
          statistical_significance,
          post:posts(
            id,
            content,
            topic,
            hashtags,
            media_urls,
            status,
            published_at,
            linkedin_post_url
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching A/B test:', error)
      return NextResponse.json(
        { error: 'A/B test not found' },
        { status: 404 }
      )
    }

    // Fetch analytics snapshots for trending data
    const { data: analytics } = await supabase
      .from('ab_test_analytics')
      .select('*')
      .eq('ab_test_id', id)
      .order('snapshot_at', { ascending: true })

    // Calculate winner if test is active or completed
    let winnerAnalysis = null
    if (test.variants && test.variants.length > 0) {
      const results = test.variants.map((v: any) => ({
        variant_id: v.id,
        variant_name: v.variant_name,
        views: v.views || 0,
        likes: v.likes || 0,
        comments: v.comments || 0,
        shares: v.shares || 0,
        clicks: v.clicks || 0,
        engagement_rate: v.engagement_rate || 0,
        conversion_rate: v.conversion_rate || 0,
        statistical_significance: v.statistical_significance || false,
        confidence_score: v.confidence_score || 0,
      }))

      winnerAnalysis = determineWinner(results, test.min_sample_size, test.confidence_level)
    }

    return NextResponse.json({
      test,
      analytics: analytics || [],
      winnerAnalysis,
    })
  } catch (error) {
    console.error('Error fetching A/B test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch A/B test' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/ab-tests/[id] - Update A/B test (start, pause, select winner, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, winner_variant_id, ...updateData } = body

    // Verify ownership
    const { data: test } = await supabase
      .from('ab_tests')
      .select('*, variants:ab_test_variants(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!test) {
      return NextResponse.json(
        { error: 'A/B test not found' },
        { status: 404 }
      )
    }

    let updatedTest

    // Handle specific actions
    if (action === 'start') {
      // Start the test - publish all variant posts
      const { error: updateError } = await adminClient
        .from('ab_tests')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to start test' },
          { status: 500 }
        )
      }

      // Schedule/publish all variant posts
      for (const variant of test.variants) {
        await adminClient
          .from('posts')
          .update({
            status: 'scheduled',
            scheduled_for: new Date().toISOString(),
          })
          .eq('id', variant.post_id)
      }

      // Create initial analytics snapshot
      await adminClient.rpc('create_ab_test_snapshot', { test_id: id })

    } else if (action === 'pause') {
      // Pause the test
      await adminClient
        .from('ab_tests')
        .update({ status: 'paused' })
        .eq('id', id)

    } else if (action === 'complete') {
      // Complete the test
      await adminClient
        .from('ab_tests')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', id)

    } else if (action === 'select_winner') {
      // Select winner and optionally promote it
      if (!winner_variant_id) {
        return NextResponse.json(
          { error: 'winner_variant_id is required' },
          { status: 400 }
        )
      }

      // Update test with winner
      await adminClient
        .from('ab_tests')
        .update({
          winner_variant_id,
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Mark winner variant
      await adminClient
        .from('ab_test_variants')
        .update({ is_winner: false })
        .eq('ab_test_id', id)

      await adminClient
        .from('ab_test_variants')
        .update({ is_winner: true })
        .eq('id', winner_variant_id)

      // If auto-promote is enabled, update the winning post
      if (test.auto_promote_winner) {
        const winnerVariant = test.variants.find((v: any) => v.id === winner_variant_id)
        if (winnerVariant) {
          await adminClient
            .from('posts')
            .update({ best_performing: true })
            .eq('id', winnerVariant.post_id)
        }
      }

    } else if (action === 'sync_metrics') {
      // Sync metrics from posts to variants
      await adminClient.rpc('sync_variant_metrics')

      // Create new analytics snapshot
      await adminClient.rpc('create_ab_test_snapshot', { test_id: id })

    } else {
      // Regular update
      const { error: updateError } = await adminClient
        .from('ab_tests')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update A/B test' },
          { status: 500 }
        )
      }
    }

    // Fetch updated test
    const { data: updated } = await supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(
          id,
          variant_name,
          variant_label,
          traffic_percentage,
          views,
          likes,
          comments,
          shares,
          engagement_rate,
          is_winner,
          post:posts(id, content, status, published_at)
        )
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      test: updated,
    })
  } catch (error) {
    console.error('Error updating A/B test:', error)
    return NextResponse.json(
      { error: 'Failed to update A/B test' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ab-tests/[id] - Delete A/B test
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership and get variants
    const { data: test } = await supabase
      .from('ab_tests')
      .select('*, variants:ab_test_variants(post_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!test) {
      return NextResponse.json(
        { error: 'A/B test not found' },
        { status: 404 }
      )
    }

    // Delete associated posts (variants will be deleted via cascade)
    if (test.variants && test.variants.length > 0) {
      const postIds = test.variants.map((v: any) => v.post_id)
      await adminClient
        .from('posts')
        .delete()
        .in('id', postIds)
    }

    // Delete the test (cascade will delete variants and analytics)
    const { error } = await adminClient
      .from('ab_tests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting A/B test:', error)
      return NextResponse.json(
        { error: 'Failed to delete A/B test' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting A/B test:', error)
    return NextResponse.json(
      { error: 'Failed to delete A/B test' },
      { status: 500 }
    )
  }
}
