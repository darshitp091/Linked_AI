import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getWorkspaceMembers, checkWorkspacePermission } from '@/lib/workspaces'

/**
 * GET /api/workspaces/[workspaceId]/members - List workspace members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this workspace
    const hasAccess = await checkWorkspacePermission({
      workspaceId,
      userId: user.id,
      requiredRole: 'viewer',
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await getWorkspaceMembers(workspaceId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ members: result.members })
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members - Add member directly (for existing users)
 * Note: For inviting new users, use /api/workspaces/invitations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or owner
    const hasAccess = await checkWorkspacePermission({
      workspaceId,
      userId: user.id,
      requiredRole: 'admin',
    })

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Only admins and owners can add members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId: memberUserId, role } = body

    if (!memberUserId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
        { status: 400 }
      )
    }

    // Check workspace member limit
    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('max_members')
      .eq('id', workspaceId)
      .single()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Count current members
    const { count: memberCount } = await adminClient
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')

    if (memberCount && memberCount >= workspace.max_members) {
      return NextResponse.json(
        {
          error: 'Member limit reached for this workspace',
          limit: workspace.max_members,
          requiresUpgrade: true,
        },
        { status: 403 }
      )
    }

    // Check if user already exists in workspace
    const { data: existingMember } = await adminClient
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', memberUserId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 400 }
      )
    }

    // Add member
    const { data: member, error } = await adminClient
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: memberUserId,
        role,
        status: 'active',
        invited_by: user.id,
        joined_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        workspace_id,
        user_id,
        role,
        status,
        invited_by,
        invited_at,
        joined_at,
        user:profiles (
          email,
          full_name
        )
      `
      )
      .single()

    if (error) {
      console.error('Error adding member:', error)
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        member: {
          id: member.id,
          workspaceId: member.workspace_id,
          userId: member.user_id,
          role: member.role,
          status: member.status,
          invitedBy: member.invited_by,
          invitedAt: member.invited_at,
          joinedAt: member.joined_at,
          user: member.user,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    )
  }
}
