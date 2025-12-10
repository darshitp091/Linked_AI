import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { inviteToWorkspace, checkWorkspacePermission } from '@/lib/workspaces'

/**
 * POST /api/workspaces/invitations - Send workspace invitation
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

    const body = await request.json()
    const { workspaceId, email, role } = body

    if (!workspaceId || !email || !role) {
      return NextResponse.json(
        { error: 'workspaceId, email, and role are required' },
        { status: 400 }
      )
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if user has permission to invite
    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('settings, max_members')
      .eq('id', workspaceId)
      .single()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Check workspace settings for invitation permissions
    const settings = workspace.settings as any
    if (settings?.requireApproval || !settings?.allowMemberInvites) {
      // Only admins and owners can invite if settings restrict it
      const hasAccess = await checkWorkspacePermission({
        workspaceId,
        userId: user.id,
        requiredRole: 'admin',
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'You do not have permission to invite members' },
          { status: 403 }
        )
      }
    } else {
      // At minimum, user must be a member
      const hasAccess = await checkWorkspacePermission({
        workspaceId,
        userId: user.id,
        requiredRole: 'viewer',
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'You are not a member of this workspace' },
          { status: 403 }
        )
      }
    }

    // Check workspace member limit
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

    // Check if user is already invited or a member
    const { data: existingInvitation } = await adminClient
      .from('workspace_invitations')
      .select('id, status')
      .eq('workspace_id', workspaceId)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Send invitation
    const result = await inviteToWorkspace({
      workspaceId,
      invitedBy: user.id,
      email: email.toLowerCase(),
      role,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // TODO: Send invitation email with token
    // For now, return the invitation with token (in production, send via email)
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/invitations?token=${result.invitation!.token}`

    return NextResponse.json(
      {
        invitation: result.invitation,
        invitationUrl,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
