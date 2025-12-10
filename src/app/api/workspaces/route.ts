import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceLimits,
} from '@/lib/workspaces'

/**
 * GET /api/workspaces - List user's workspaces
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getUserWorkspaces(user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ workspaces: result.workspaces })
  } catch (error: any) {
    console.error('Error fetching workspaces:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces - Create new workspace
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.subscription_plan || 'free'

    // Check plan allows workspaces
    const limits = getWorkspaceLimits(plan)
    if (!limits.hasWorkspaces) {
      return NextResponse.json(
        {
          error: 'Workspaces are available on Standard and Custom plans only',
          requiresUpgrade: true,
          currentPlan: plan,
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      )
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Workspace name must be 50 characters or less' },
        { status: 400 }
      )
    }

    const result = await createWorkspace({
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || undefined,
      plan,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Add owner as member with role='owner'
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: result.workspace!.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        invited_by: user.id,
        joined_at: new Date().toISOString(),
      })

    if (memberError) {
      console.error('Error adding owner as member:', memberError)
      // Rollback workspace creation
      await supabase.from('workspaces').delete().eq('id', result.workspace!.id)
      return NextResponse.json(
        { error: 'Failed to initialize workspace' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workspace: result.workspace }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating workspace:', error)
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    )
  }
}
