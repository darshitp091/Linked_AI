# Database Setup Guide

## Quick Setup (Recommended)

### 1. Apply Comprehensive Schema

```bash
# Navigate to project
cd linkedin-scheduler

# Apply the complete schema
npx supabase db push --db-url "your_supabase_connection_string"
```

The `comprehensive-schema.sql` includes:
- All tables (profiles, posts, templates, subscriptions, etc.)
- Row Level Security (RLS) policies
- Triggers and functions
- Indexes for performance

### 2. Verify Tables Created

Go to Supabase Dashboard → **Database** → **Tables**

You should see:
- profiles
- posts
- templates
- drafts
- post_analytics
- schedules
- subscriptions
- payments
- notifications
- support_tickets
- ab_tests
- workspaces
- workspace_members
- api_keys
- and more...

## Manual Migration (Alternative)

If you need to apply migrations one by one:

```bash
# Apply all migrations in order
npx supabase db push
```

## Database Structure

### Core Tables

**profiles** - User accounts and settings
**subscriptions** - User plans (free/starter/pro/enterprise)
**posts** - Published LinkedIn posts
**drafts** - Unpublished content
**templates** - Reusable content templates
**schedules** - Auto-posting schedules

### Analytics Tables

**post_analytics** - Performance metrics per post
**user_analytics** - Aggregate user stats

### Team Collaboration

**workspaces** - Team workspaces
**workspace_members** - Team members and roles
**workspace_invitations** - Pending invites

### Advanced Features

**ab_tests** - A/B test experiments
**ab_test_variants** - Test variations
**api_keys** - API access tokens
**support_tickets** - Help desk system
**notifications** - Activity feed

## Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: Users can only see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
```

## Triggers

**Auto-update timestamps**
```sql
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Subscription reset** - Resets usage limits monthly
**Workspace limits** - Enforces team member limits

## Indexes

Performance indexes on:
- `posts(user_id, status)`
- `posts(scheduled_for)`
- `post_analytics(post_id)`
- `subscriptions(user_id)`
- `notifications(user_id, read)`

## Default Data

When a user signs up, triggers automatically create:
- Free subscription
- Default profile

## Troubleshooting

**Issue**: Migration fails with "relation already exists"
- Tables might exist from comprehensive schema
- Skip that migration or use `comprehensive-schema.sql`

**Issue**: RLS blocking queries
- Ensure user is authenticated
- Check policy matches query pattern

**Issue**: "permission denied for table"
- Verify service role key is correct
- Check RLS policies allow operation

## Reset Database (Development Only)

```bash
# WARNING: This deletes all data
npx supabase db reset
```

## Backup Database

```bash
# Download backup
npx supabase db dump -f backup.sql
```
