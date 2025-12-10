# Troubleshooting Guide

## Common Issues & Solutions

### Environment & Setup

#### Issue: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Environment variables not loading
**Solution**:
1. Ensure `.env.local` exists in project root
2. Restart dev server after changing `.env`
3. Check for typos in variable names
4. Don't commit `.env.local` to git

---

### Database Issues

#### Issue: "Failed to connect to Supabase"
**Solutions**:
1. Check Supabase URL and keys are correct
2. Verify project isn't paused (free tier auto-pauses)
3. Check internet connection
4. Try service role key instead of anon key

#### Issue: "Row Level Security policy violation"
**Solutions**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- View existing policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Temporarily disable RLS (development only!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

#### Issue: Migration fails with "relation already exists"
**Solution**:
- Tables might exist from `comprehensive-schema.sql`
- Skip that specific migration
- Or reset database (dev only): `npx supabase db reset`

---

### Authentication Issues

#### Issue: LinkedIn OAuth "redirect_uri_mismatch"
**Solutions**:
1. Check redirect URL in LinkedIn app matches exactly
2. No trailing slashes
3. Correct protocol (http vs https)
4. Update both dev and production URLs

```
Development: http://localhost:3000/api/auth/callback/linkedin
Production: https://your-app.vercel.app/api/auth/callback/linkedin
```

#### Issue: "Invalid client" error
**Solutions**:
1. Verify `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`
2. No extra spaces in `.env` file
3. Restart server after changing credentials

#### Issue: NextAuth session expired
**Solution**:
```typescript
// Increase session max age
// src/app/api/auth/[...nextauth]/route.ts
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

---

### LinkedIn API Issues

#### Issue: "insufficient_permissions" error
**Solutions**:
1. Request required products in LinkedIn Developer Portal
2. Wait for approval (usually instant for basic products)
3. Check scopes are enabled in Auth settings
4. Required scopes:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social`

#### Issue: "Token expired"
**Solution**:
```typescript
// Check token expiration
const isExpired = new Date() > new Date(tokenExpiresAt)

if (isExpired) {
  // Prompt user to reconnect
  return redirect('/settings?reconnect=true')
}
```

#### Issue: Rate limit exceeded (429)
**Solution**:
- LinkedIn limits: 100 posts/day per user
- Implement queue system
- Spread posts throughout the day
- Cache API responses

---

### AI Generation Issues

#### Issue: "Google AI API error"
**Solutions**:
1. Verify API key is correct
2. Check you haven't exceeded free tier limits (1500/day)
3. Ensure Gemini API is enabled in Google Cloud
4. Check for profanity/sensitive content in prompts

#### Issue: AI responses are poor quality
**Solutions**:
1. Improve prompt engineering
2. Add more context to user input
3. Use temperature parameter (lower = more focused)
4. Add examples in prompt

```typescript
const prompt = `
Write a professional LinkedIn post about ${topic}.

Examples of good posts:
- "Today I learned..."
- "Here are 5 tips for..."

Tone: ${tone}
Length: 150-200 words
`
```

---

### Scheduling & Cron Issues

#### Issue: Scheduled posts not publishing
**Solutions**:
1. **Check cron is running**:
   - Vercel: View function logs
   - Local: Ensure `npm run scheduler` is running

2. **Verify CRON_SECRET**:
```bash
curl -X POST https://your-app.vercel.app/api/cron/auto-post \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

3. **Check post status**:
```sql
SELECT * FROM posts
WHERE status = 'scheduled'
  AND scheduled_for < NOW();
```

#### Issue: Posts publishing at wrong time
**Solutions**:
1. Check user timezone in profile
2. Server should be UTC
3. Use proper timezone conversion:
```typescript
import { zonedTimeToUtc } from 'date-fns-tz'
const utc = zonedTimeToUtc(localTime, timezone)
```

#### Issue: Duplicate posts
**Solution**:
Add unique constraint:
```sql
ALTER TABLE posts
ADD CONSTRAINT unique_linkedin_post_id
UNIQUE (linkedin_post_id);
```

---

### Analytics Issues

#### Issue: Analytics not syncing
**Solutions**:
1. Check LinkedIn token is valid
2. Verify `linkedin_post_id` exists
3. Check LinkedIn API limits (500 requests/day)
4. View sync logs:
```sql
SELECT * FROM post_analytics
WHERE post_id = 'your_post_id'
ORDER BY created_at DESC;
```

#### Issue: "Column engagement_rate does not exist"
**Solution**:
- This is calculated, not stored
- Check API calculates it from views, likes, comments, shares
- See: `src/app/api/analytics/posts/route.ts`

---

### Payment Issues (Razorpay)

#### Issue: Payment webhook not receiving events
**Solutions**:
1. Check webhook URL is correct in Razorpay dashboard
2. Verify webhook secret matches `.env`
3. Test webhook:
```bash
curl -X POST https://your-app.vercel.app/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -d '{"event": "subscription.activated"}'
```

#### Issue: Subscription not upgrading
**Solution**:
```typescript
// Check webhook is updating database
await supabase
  .from('subscriptions')
  .update({
    plan: 'pro',
    status: 'active',
    razorpay_subscription_id: subscriptionId
  })
  .eq('user_id', userId)
```

---

### Performance Issues

#### Issue: Slow page loads
**Solutions**:
1. Enable React Suspense:
```typescript
import { Suspense } from 'react'

<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

2. Add database indexes:
```sql
CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_for);
```

3. Use pagination:
```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 19) // First 20 only
```

#### Issue: High Vercel bandwidth usage
**Solutions**:
1. Optimize images (use WebP)
2. Enable caching:
```typescript
export const revalidate = 3600 // Cache for 1 hour
```

3. Use CDN for static assets
4. Compress responses

---

### Build & Deployment Issues

#### Issue: Vercel build fails
**Solutions**:
1. Check build logs for specific error
2. Ensure all dependencies in `package.json`
3. Verify environment variables set in Vercel
4. Check for TypeScript errors:
```bash
npm run build
```

#### Issue: "Function timeout" on Vercel
**Solution**:
```typescript
// Increase timeout (Pro plan)
export const maxDuration = 60 // seconds

// Or use edge runtime
export const runtime = 'edge'
```

#### Issue: Environment variables not available
**Solution**:
1. Add to Vercel dashboard: **Settings** → **Environment Variables**
2. Redeploy after adding variables
3. Check variable names match code exactly

---

### UI/UX Issues

#### Issue: Mobile navigation not working
**Solution**:
```typescript
// Check sidebar state
const [sidebarOpen, setSidebarOpen] = useState(false)

// Ensure close on navigation
onClick={() => setSidebarOpen(false)}
```

#### Issue: Forms not submitting
**Solutions**:
1. Check `e.preventDefault()` is called
2. Verify validation passes
3. Check network tab for API errors
4. Add loading states

---

### Plan-Based Access Issues

#### Issue: Premium features visible on free plan
**Solution**:
```typescript
// Check plan filtering
const visibleItems = navItems.filter((item) =>
  !item.requiresPlan || canAccessRoute(plan, item.href)
)
```

#### Issue: User stuck on loading screen
**Solution**:
```typescript
// Add timeout to plan fetch
useEffect(() => {
  const timeout = setTimeout(() => {
    if (loading) {
      setPlan('free') // Fallback to free
      setLoading(false)
    }
  }, 5000)

  return () => clearTimeout(timeout)
}, [loading])
```

---

### Data Loss Prevention

#### Issue: Lost data during migration
**Solution**:
```bash
# Always backup before major changes
npx supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore if needed
psql your_database < backup-20251128.sql
```

#### Issue: User accidentally deleted data
**Solution**:
```sql
-- Add soft delete
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;

-- Filter out deleted
WHERE deleted_at IS NULL

-- Restore within 30 days
UPDATE posts SET deleted_at = NULL WHERE id = 'xxx';
```

---

## Debug Mode

### Enable Verbose Logging

```typescript
// .env.local
DEBUG=true
LOG_LEVEL=debug
```

```typescript
// Use in code
if (process.env.DEBUG === 'true') {
  console.log('Detailed debug info:', data)
}
```

### Check All Systems

Create health check endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    linkedin: await checkLinkedInAPI(),
    ai: await checkGoogleAI(),
    email: await checkResend(),
  }

  return NextResponse.json(checks)
}
```

---

## Get Help

1. **Check documentation** - Read relevant guide
2. **Search issues** - Check GitHub issues
3. **Check logs** - Vercel/Supabase dashboards
4. **Test locally** - Reproduce in development
5. **Ask for help** - Create support ticket

---

## Emergency Rollback

If production is broken:

### Vercel
1. Go to **Deployments**
2. Find last working deployment
3. Click **⋮** → **Promote to Production**

### Database
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Environment Variables
1. Revert changes in Vercel dashboard
2. Redeploy

---

## Prevention Checklist

- [ ] Test locally before deploying
- [ ] Backup database before migrations
- [ ] Use staging environment
- [ ] Add error boundaries
- [ ] Monitor logs regularly
- [ ] Set up alerts (Sentry, LogRocket)
- [ ] Document all changes
- [ ] Keep dependencies updated
