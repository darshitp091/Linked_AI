/**
 * Public API v1 - Posts Endpoint
 * Requires API key authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAPIKeyFromHeader, hasScope, logAPIUsage } from '@/lib/api-keys'

/**
 * GET /api/v1/posts
 * Get user's posts
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    const auth = await verifyAPIKeyFromHeader(authHeader)

    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    // Check scope
    if (!hasScope(auth.scopes || [], 'posts:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Required scope: posts:read' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // published, scheduled, draft
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('posts')
      .select('id, content, status, scheduled_for, published_at, created_at, updated_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    const responseTime = Date.now() - startTime

    // Log usage
    await logAPIUsage({
      userId: auth.userId,
      endpoint: '/api/v1/posts',
      method: 'GET',
      statusCode: 200,
      responseTime,
    })

    return NextResponse.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts?.length || 0,
      },
    })
  } catch (error: any) {
    console.error('API Error:', error)
    const responseTime = Date.now() - startTime

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    const auth = await verifyAPIKeyFromHeader(authHeader)

    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    // Check scope
    if (!hasScope(auth.scopes || [], 'posts:write')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Required scope: posts:write' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, status, scheduled_for } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: auth.userId,
        content,
        status: status || 'draft',
        scheduled_for: scheduled_for || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const responseTime = Date.now() - startTime

    // Log usage
    await logAPIUsage({
      userId: auth.userId,
      endpoint: '/api/v1/posts',
      method: 'POST',
      statusCode: 201,
      responseTime,
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
