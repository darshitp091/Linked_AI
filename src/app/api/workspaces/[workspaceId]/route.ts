import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getWorkspace, checkWorkspacePermission } from '@/lib/workspaces'

/**
 * GET /api/workspaces/[workspaceId] - Get workspace details
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
      requiredRole: 'viewer', // Minimum role to view workspace
    })

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const result = await getWorkspace(workspaceId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({ workspace: result.workspace })
  } catch (error: any) {
    console.error('Error fetching workspace:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workspaces/[workspaceId] - Update workspace
 */
export async function PATCH(
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
        { error: 'Only admins and owners can update workspace settings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, settings } = body

    const updates: any = {}

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Workspace name cannot be empty' },
          { status: 400 }
        )
      }
      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Workspace name must be 50 characters or less' },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null
    }

    if (settings !== undefined) {
      updates.settings = settings
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const adminClient = createAdminClient()
    const { data: workspace, error } = await adminClient
      .from('workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating workspace:', error)
      return NextResponse.json(
        { error: 'Failed to update workspace' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        ownerId: workspace.owner_id,
        plan: workspace.plan,
        maxMembers: workspace.max_members,
        settings: workspace.settings,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
      },
    })
  } catch (error: any) {
    console.error('Error updating workspace:', error)
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/[workspaceId] - Delete workspace
 */
export async function DELETE(
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

    // Only owner can delete workspace
    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    if (workspace.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the workspace owner can delete the workspace' },
        { status: 403 }
      )
    }

    // Delete workspace (cascade will handle members and invitations)
    const { error } = await adminClient
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)

    if (error) {
      console.error('Error deleting workspace:', error)
      return NextResponse.json(
        { error: 'Failed to delete workspace' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting workspace:', error)
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    )
  }
}
