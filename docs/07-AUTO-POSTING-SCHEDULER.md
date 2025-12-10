# Auto-Posting Scheduler Guide

## How It Works

The scheduler automatically publishes posts at their scheduled time using:
1. **Cron Jobs** - Run every 15 minutes
2. **Schedule Queue** - Checks for posts ready to publish
3. **LinkedIn API** - Publishes to LinkedIn
4. **Database Updates** - Marks posts as published

---

## Setup Auto-Posting

### 1. Create Cron Secret

Add to `.env.local`:
```bash
CRON_SECRET=generate_random_secure_string_here
```

Generate random string:
```bash
openssl rand -hex 32
```

### 2. Verify Cron Endpoint Exists

File: `src/app/api/cron/auto-post/route.ts`

This endpoint:
- Validates CRON_SECRET
- Fetches posts scheduled for now
- Publishes to LinkedIn
- Updates database

### 3. Configure Cron Service (Production)

**⚠️ IMPORTANT**: Vercel Hobby (free) plan only allows daily cron jobs.

**Recommended**: Use external cron service (free, works perfectly)

👉 **See complete setup**: [docs/11-EXTERNAL-CRON-SETUP.md](./11-EXTERNAL-CRON-SETUP.md)

**Quick Setup** (5 minutes):
1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create cron job:
   - URL: `https://your-app.vercel.app/api/cron/publish-scheduled`
   - Schedule: Every 15 minutes
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
3. Done!

**Alternative for Vercel Pro users** ($20/month):

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-post",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Schedule**: Every 15 minutes

Push to GitHub and deploy to Vercel.

### 4. Test Locally (Development)

```bash
# Start scheduler
npm run scheduler
```

This runs the cron job every 15 minutes on your local machine.

---

## How to Schedule a Post

### Method 1: Via UI

1. Go to **Generate** or **Drafts**
2. Create or select post
3. Click **Schedule**
4. Choose date and time
5. Select LinkedIn account
6. Click **Schedule Post**

Post will auto-publish at scheduled time!

### Method 2: Via Calendar

1. Go to **Calendar**
2. Click on desired date/time
3. Create post
4. Save

### Method 3: Via API

```typescript
POST /api/posts
{
  "content": "My LinkedIn post",
  "scheduled_for": "2025-12-01T10:00:00Z",
  "linkedin_account_id": "account_id",
  "status": "scheduled"
}
```

---

## Scheduling Logic

### 1. Queue Check (Every 15 Minutes)

```typescript
// Get posts ready to publish
const now = new Date()
const posts = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'scheduled')
  .lte('scheduled_for', now.toISOString())
  .order('scheduled_for', { ascending: true })
```

### 2. LinkedIn Publishing

For each post:
```typescript
const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    author: `urn:li:person:${linkedinUserId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: post.content
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  })
})
```

### 3. Database Update

```typescript
// Mark as published
await supabase
  .from('posts')
  .update({
    status: 'published',
    published_at: new Date().toISOString(),
    linkedin_post_id: linkedinPostId
  })
  .eq('id', post.id)
```

---

## Timezone Support

### Set User Timezone

```typescript
// Update profile
await supabase
  .from('profiles')
  .update({ timezone: 'America/New_York' })
  .eq('id', userId)
```

### Schedule with Timezone

```typescript
import { zonedTimeToUtc } from 'date-fns-tz'

// Convert local time to UTC
const localTime = '2025-12-01 10:00:00'
const timezone = 'America/New_York'
const utcTime = zonedTimeToUtc(localTime, timezone)

// Save to database
scheduled_for: utcTime.toISOString()
```

---

## Monitoring & Logs

### View Scheduled Posts

```typescript
// Query scheduled posts
const { data: scheduled } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'scheduled')
  .order('scheduled_for', { ascending: true })
```

### Check Cron Logs (Vercel)

1. Go to Vercel Dashboard
2. **Deployments** → Latest deployment
3. **Functions** → View logs
4. Filter by `/api/cron/auto-post`

### Error Handling

If publishing fails:
```typescript
try {
  await publishToLinkedIn(post)
} catch (error) {
  // Mark as failed
  await supabase
    .from('posts')
    .update({
      status: 'failed',
      error_message: error.message
    })
    .eq('id', post.id)

  // Create notification
  await createNotification({
    userId: post.user_id,
    type: 'post_failed',
    title: 'Post Failed to Publish',
    message: `Post scheduled for ${post.scheduled_for} failed: ${error.message}`
  })
}
```

---

## Rate Limiting

LinkedIn API Limits:
- **100 posts/day** per user
- **Exceeded limit** → 429 Too Many Requests

Our handling:
```typescript
if (response.status === 429) {
  // Reschedule for 1 hour later
  await supabase
    .from('posts')
    .update({
      scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    })
    .eq('id', post.id)
}
```

---

## Queue Management

### View Queue

UI: **Scheduled** page shows all queued posts

### Pause Scheduler

```typescript
// Temporarily set status to 'paused'
await supabase
  .from('posts')
  .update({ status: 'paused' })
  .eq('id', postId)
```

### Resume

```typescript
await supabase
  .from('posts')
  .update({ status: 'scheduled' })
  .eq('id', postId)
```

### Cancel

```typescript
await supabase
  .from('posts')
  .update({ status: 'draft' })
  .eq('id', postId)
```

---

## Advanced Scheduling

### Recurring Posts

```typescript
// Create recurring schedule
const schedule = await supabase
  .from('schedules')
  .insert({
    user_id: userId,
    template_id: templateId,
    frequency: 'weekly', // daily, weekly, monthly
    day_of_week: 1, // Monday
    time: '09:00',
    timezone: 'America/New_York',
    status: 'active'
  })
```

Cron job creates posts from schedules:
```typescript
// Every day at 00:00, check active schedules
const schedules = await getActiveSchedules()

for (const schedule of schedules) {
  if (shouldCreatePostToday(schedule)) {
    await createScheduledPost(schedule)
  }
}
```

### Best Time Auto-Schedule

```typescript
// Get AI recommendation
const bestTime = await getBestTimeRecommendation(userId)

// Schedule post at best time
await supabase
  .from('posts')
  .update({
    scheduled_for: bestTime.datetime
  })
  .eq('id', postId)
```

---

## Troubleshooting

### Posts Not Publishing

1. **Check Cron is Running**
   - Vercel: View function logs
   - Local: Ensure `npm run scheduler` is running

2. **Verify CRON_SECRET**
   ```bash
   curl -X POST https://your-app.vercel.app/api/cron/auto-post \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. **Check Post Status**
   ```sql
   SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_for < NOW();
   ```

4. **LinkedIn Token Expired**
   - User needs to reconnect LinkedIn account
   - Check `linkedin_token_expires_at` in profiles table

### Timezone Issues

**Problem**: Post publishes at wrong time

**Fix**:
1. Verify user's timezone in profile
2. Check server timezone (should be UTC)
3. Use `zonedTimeToUtc` for conversions

### Duplicate Posts

**Problem**: Same post published multiple times

**Fix**:
- Add unique constraint on `linkedin_post_id`
- Check for existing post before publishing

---

## Performance Tips

1. **Batch Processing** - Process up to 10 posts per cron run
2. **Parallel Publishing** - Use Promise.all for multiple accounts
3. **Cache Tokens** - Store LinkedIn tokens in memory
4. **Queue Limit** - Don't process more than 50 posts at once

---

## Security

1. **Validate CRON_SECRET** - Prevent unauthorized cron triggers
2. **Encrypt Tokens** - LinkedIn tokens encrypted in database
3. **Rate Limit API** - Prevent abuse
4. **Audit Logs** - Track all scheduled posts

---

## Testing

### Test Cron Locally

```bash
# Set CRON_SECRET in .env.local
CRON_SECRET=test_secret

# Call endpoint
curl -X POST http://localhost:3000/api/cron/auto-post \
  -H "Authorization: Bearer test_secret"
```

### Test Scheduling

1. Schedule post for 2 minutes from now
2. Wait for cron to run
3. Check post status changed to 'published'
4. Verify post appears on LinkedIn

---

## Monitoring Checklist

- [ ] Cron jobs running every 15 minutes
- [ ] No failed posts in queue
- [ ] LinkedIn tokens not expired
- [ ] No rate limit errors
- [ ] Notifications sent for failures
- [ ] Logs show successful publishes
