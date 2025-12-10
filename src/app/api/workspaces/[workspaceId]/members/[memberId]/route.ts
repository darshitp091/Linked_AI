import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { updateMemberRole, removeMember, checkWorkspacePermission } from '@/lib/workspaces'

/**
 * PATCH /api/workspaces/[workspaceId]/members/[memberId] - Update member role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params
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
        { error: 'Only admins and owners can update member roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
        { status: 400 }
      )
    }

    // Get member details to check if they're the owner
    const adminClient = createAdminClient()
    const { data: member } = await adminClient
      .from('workspace_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change the role of the workspace owner' },
        { status: 403 }
      )
    }

    const result = await updateMemberRole({
      memberId,
      newRole: role,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/members/[memberId] - Remove member from workspace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member details
    const adminClient = createAdminClient()
    const { data: member } = await adminClient
      .from('workspace_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent removing the owner
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the workspace owner' },
        { status: 403 }
      )
    }

    // Check permissions: admins can remove editors/viewers, users can remove themselves
    const isSelfRemoval = member.user_id === user.id

    if (!isSelfRemoval) {
      const hasAccess = await checkWorkspacePermission({
        workspaceId,
        userId: user.id,
        requiredRole: 'admin',
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Only admins and owners can remove members' },
          { status: 403 }
        )
      }
    }

    const result = await removeMember(memberId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}
