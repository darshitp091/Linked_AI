/**
 * Analytics Sync API
 * Triggers synchronization of analytics from LinkedIn
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncPostAnalytics, syncAllPostAnalytics } from '@/lib/linkedin/analytics'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { postId } = body

    // Sync specific post or all posts
    if (postId) {
      // Sync single post
      const result = await syncPostAnalytics(postId, user.id)

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Post analytics synced successfully',
        analytics: result.analytics,
      })
    } else {
      // Sync all posts
      const result = await syncAllPostAnalytics(user.id)

      return NextResponse.json({
        success: true,
        message: 'All analytics synced successfully',
        synced: result.synced,
        failed: result.failed,
      })
    }
  } catch (error: any) {
    console.error('Error syncing analytics:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync analytics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST to sync analytics.',
    },
    { status: 405 }
  )
}
