/**
 * Workspace Management Library
 * Handles team collaboration features
 */

import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type MemberStatus = 'pending' | 'active' | 'suspended'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  plan: string
  maxMembers: number
  settings: {
    allowMemberInvites: boolean
    requireApproval: boolean
    defaultRole: string
  }
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  status: MemberStatus
  invitedBy: string | null
  invitedAt: string
  joinedAt: string | null
  user?: {
    email: string
    full_name: string | null
  }
}

export interface WorkspaceInvitation {
  id: string
  workspaceId: string
  invitedBy: string
  email: string
  role: WorkspaceRole
  token: string
  status: InvitationStatus
  expiresAt: string
  createdAt: string
}

/**
 * Get plan-based workspace limits
 */
export function getWorkspaceLimits(plan: string): {
  maxMembers: number
  hasWorkspaces: boolean
} {
  const limits: Record<string, { maxMembers: number; hasWorkspaces: boolean }> = {
    free: { maxMembers: 1, hasWorkspaces: false },
    pro: { maxMembers: 1, hasWorkspaces: false },
    standard: { maxMembers: 5, hasWorkspaces: true },
    custom: { maxMembers: 999, hasWorkspaces: true },
  }

  return limits[plan.toLowerCase()] || limits.free
}

/**
 * Generate unique workspace slug from name
 */
export async function generateWorkspaceSlug(name: string): Promise<string> {
  const supabase = createAdminClient()

  // Create base slug from name
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)

  // Check if slug exists
  const { data: existing } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', slug)
    .single()

  // If exists, append random string
  if (existing) {
    const randomSuffix = crypto.randomBytes(4).toString('hex')
    slug = `${slug}-${randomSuffix}`
  }

  return slug
}

/**
 * Create a new workspace
 */
export async function createWorkspace(params: {
  userId: string
  name: string
  description?: string
  plan: string
}): Promise<{ success: boolean; workspace?: Workspace; error?: string }> {
  const supabase = createAdminClient()
  const { userId, name, description, plan } = params

  try {
    // Check plan allows workspaces
    const limits = getWorkspaceLimits(plan)
    if (!limits.hasWorkspaces) {
      return {
        success: false,
        error: 'Workspaces are available on Standard and Custom plans only',
      }
    }

    // Generate unique slug
    const slug = await generateWorkspaceSlug(name)

    // Create workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        owner_id: userId,
        name,
        slug,
        description: description || null,
        plan,
        max_members: limits.maxMembers,
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
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
    }
  } catch (error: any) {
    console.error('Error creating workspace:', error)
    return {
      success: false,
      error: error.message || 'Failed to create workspace',
    }
  }
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(
  workspaceId: string
): Promise<{ success: boolean; workspace?: Workspace; error?: string }> {
  const supabase = createAdminClient()

  try {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (error) throw error

    return {
      success: true,
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
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get workspace',
    }
  }
}

/**
 * Get user's workspaces
 */
export async function getUserWorkspaces(
  userId: string
): Promise<{ success: boolean; workspaces?: Workspace[]; error?: string }> {
  const supabase = createAdminClient()

  try {
    const { data: memberships, error } = await supabase
      .from('workspace_members')
      .select(
        `
        workspace:workspaces (
          id,
          name,
          slug,
          description,
          owner_id,
          plan,
          max_members,
          settings,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error

    const workspaces = memberships
      .filter((m: any) => m.workspace)
      .map((m: any) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        description: m.workspace.description,
        ownerId: m.workspace.owner_id,
        plan: m.workspace.plan,
        maxMembers: m.workspace.max_members,
        settings: m.workspace.settings,
        createdAt: m.workspace.created_at,
        updatedAt: m.workspace.updated_at,
      }))

    return { success: true, workspaces }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get workspaces',
    }
  }
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<{ success: boolean; members?: WorkspaceMember[]; error?: string }> {
  const supabase = createAdminClient()

  try {
    const { data: members, error } = await supabase
      .from('workspace_members')
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
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const transformedMembers = members.map((m: any) => ({
      id: m.id,
      workspaceId: m.workspace_id,
      userId: m.user_id,
      role: m.role,
      status: m.status,
      invitedBy: m.invited_by,
      invitedAt: m.invited_at,
      joinedAt: m.joined_at,
      user: m.user ? {
        email: m.user.email,
        full_name: m.user.full_name,
      } : undefined,
    }))

    return { success: true, members: transformedMembers }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get members',
    }
  }
}

/**
 * Invite user to workspace
 */
export async function inviteToWorkspace(params: {
  workspaceId: string
  invitedBy: string
  email: string
  role: Exclude<WorkspaceRole, 'owner'>
}): Promise<{ success: boolean; invitation?: WorkspaceInvitation; error?: string }> {
  const supabase = createAdminClient()
  const { workspaceId, invitedBy, email, role } = params

  try {
    // Check if user already exists in workspace
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', email) // Will need to look up by email
      .single()

    if (existingMember) {
      return {
        success: false,
        error: 'User is already a member of this workspace',
      }
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiration (7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        invited_by: invitedBy,
        email: email.toLowerCase(),
        role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      invitation: {
        id: invitation.id,
        workspaceId: invitation.workspace_id,
        invitedBy: invitation.invited_by,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send invitation',
    }
  }
}

/**
 * Accept workspace invitation
 */
export async function acceptInvitation(params: {
  token: string
  userId: string
}): Promise<{ success: boolean; workspaceId?: string; error?: string }> {
  const supabase = createAdminClient()
  const { token, userId } = params

  try {
    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (invError || !invitation) {
      return {
        success: false,
        error: 'Invalid or expired invitation',
      }
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('workspace_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return {
        success: false,
        error: 'Invitation has expired',
      }
    }

    // Add user to workspace
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: userId,
        role: invitation.role,
        status: 'active',
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      })

    if (memberError) throw memberError

    // Update invitation status
    await supabase
      .from('workspace_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    return {
      success: true,
      workspaceId: invitation.workspace_id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to accept invitation',
    }
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(params: {
  memberId: string
  newRole: WorkspaceRole
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { memberId, newRole } = params

  try {
    if (newRole === 'owner') {
      return {
        success: false,
        error: 'Cannot change member role to owner',
      }
    }

    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .neq('role', 'owner') // Prevent changing owner role

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update member role',
    }
  }
}

/**
 * Remove member from workspace
 */
export async function removeMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to remove member',
    }
  }
}

/**
 * Check if user has required role in workspace
 */
export async function checkWorkspacePermission(params: {
  workspaceId: string
  userId: string
  requiredRole: WorkspaceRole
}): Promise<boolean> {
  const supabase = createAdminClient()
  const { workspaceId, userId, requiredRole } = params

  try {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!member) return false

    const roleHierarchy: Record<WorkspaceRole, number> = {
      viewer: 1,
      editor: 2,
      admin: 3,
      owner: 4,
    }

    return roleHierarchy[member.role as WorkspaceRole] >= roleHierarchy[requiredRole]
  } catch {
    return false
  }
}
