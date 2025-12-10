/**
 * Notification System
 * Handles in-app, email, and browser push notifications
 */

import { createAdminClient } from '@/lib/supabase/server'

export type NotificationType =
  | 'post_published'
  | 'post_scheduled'
  | 'post_failed'
  | 'support_reply'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'linkedin_connected'
  | 'linkedin_disconnected'
  | 'team_invite'
  | 'team_member_joined'
  | 'api_key_created'
  | 'system_announcement'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  action_url?: string
  created_at: string
}

export interface NotificationPreferences {
  email_enabled: boolean
  browser_enabled: boolean
  post_published: boolean
  post_scheduled: boolean
  post_failed: boolean
  support_updates: boolean
  team_updates: boolean
  marketing: boolean
}

/**
 * Create a new notification
 */
export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  actionUrl?: string
}): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      action_url: params.actionUrl,
      read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error.message }
  }

  // TODO: Send email notification if enabled
  // TODO: Send browser push notification if enabled

  return { success: true, notification: data }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  unreadOnly = false
): Promise<Notification[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createAdminClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Helper functions for specific notification types
 */

export async function notifyPostPublished(userId: string, postId: string, content: string) {
  return createNotification({
    userId,
    type: 'post_published',
    title: 'Post Published Successfully',
    message: `Your post "${content.substring(0, 50)}..." has been published to LinkedIn.`,
    data: { postId },
    actionUrl: `/scheduled`,
  })
}

export async function notifyPostScheduled(userId: string, postId: string, scheduledFor: string) {
  return createNotification({
    userId,
    type: 'post_scheduled',
    title: 'Post Scheduled',
    message: `Your post has been scheduled for ${new Date(scheduledFor).toLocaleString()}.`,
    data: { postId, scheduledFor },
    actionUrl: `/scheduled`,
  })
}

export async function notifyPostFailed(userId: string, postId: string, error: string) {
  return createNotification({
    userId,
    type: 'post_failed',
    title: 'Post Failed to Publish',
    message: `We couldn't publish your post. Error: ${error}`,
    data: { postId, error },
    actionUrl: `/scheduled`,
  })
}

export async function notifySupportReply(userId: string, ticketId: string, subject: string) {
  return createNotification({
    userId,
    type: 'support_reply',
    title: 'New Support Reply',
    message: `You have a new reply on your support ticket: "${subject}"`,
    data: { ticketId },
    actionUrl: `/support/${ticketId}`,
  })
}

export async function notifyPlanUpgraded(userId: string, newPlan: string) {
  return createNotification({
    userId,
    type: 'plan_upgraded',
    title: 'Plan Upgraded',
    message: `Your plan has been upgraded to ${newPlan}. Enjoy your new features!`,
    data: { plan: newPlan },
    actionUrl: `/settings`,
  })
}

export async function notifyLinkedInConnected(userId: string, profileName?: string) {
  return createNotification({
    userId,
    type: 'linkedin_connected',
    title: 'LinkedIn Connected',
    message: profileName
      ? `LinkedIn account "${profileName}" connected successfully.`
      : 'LinkedIn account connected successfully.',
    data: { profileName },
    actionUrl: `/settings`,
  })
}

export async function notifyTeamInvite(userId: string, workspaceName: string, inviterName: string) {
  return createNotification({
    userId,
    type: 'team_invite',
    title: 'Team Invitation',
    message: `${inviterName} invited you to join "${workspaceName}".`,
    data: { workspaceName, inviterName },
    actionUrl: `/workspace/invites`,
  })
}

export async function notifyAPIKeyCreated(userId: string, keyName: string) {
  return createNotification({
    userId,
    type: 'api_key_created',
    title: 'API Key Created',
    message: `API key "${keyName}" has been created. Make sure to save it securely.`,
    data: { keyName },
    actionUrl: `/settings/api`,
  })
}
