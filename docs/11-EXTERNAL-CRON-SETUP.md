# External Cron Service Setup (Free Alternative)

## Why External Cron Service?

Vercel's **Hobby (free) plan** only allows daily cron jobs. To run scheduled tasks more frequently (every 15 minutes for auto-posting), we use a free external cron service.

**Benefits**:
- ✅ Completely free
- ✅ Run every 15 minutes (or any frequency)
- ✅ No Vercel plan upgrade needed
- ✅ More reliable than Vercel free tier
- ✅ Easy to set up (5 minutes)

---

## Recommended Service: Cron-job.org

**Why Cron-job.org?**
- Free forever
- Reliable (99.9% uptime)
- Multiple cron jobs allowed
- Email notifications on failures
- Simple setup

**Alternatives**:
- EasyCron (1 free job)
- GitHub Actions (free for public repos)
- Render Cron Jobs (free tier)

---

## Step-by-Step Setup

### 1. Create Cron-job.org Account

1. Go to [cron-job.org](https://cron-job.org)
2. Click **Sign Up** (free)
3. Verify your email
4. Log in

### 2. Get Your CRON_SECRET

From your `.env.local` or Vercel environment variables:

```bash
CRON_SECRET=your_secret_here
```

If you don't have one yet, generate it:

```bash
openssl rand -hex 32
```

Add to Vercel:
1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add `CRON_SECRET` with your generated value
4. **Redeploy** to apply

### 3. Create Auto-Post Cron Job

1. In Cron-job.org dashboard, click **Create Cronjob**

2. Fill in the form:

**Title**: LinkedAI - Auto Post Scheduler

**Address (URL)**:
```
https://your-app.vercel.app/api/cron/publish-scheduled
```
Replace `your-app.vercel.app` with your actual Vercel URL

**Schedule**:
- **Minutes**: Every 15 minutes
- Or use expression: `*/15 * * * *`

**Request Method**: GET

**Headers**:
Click "Add header" and add:
```
Authorization: Bearer YOUR_CRON_SECRET_HERE
```
Replace `YOUR_CRON_SECRET_HERE` with your actual secret

**Timeout**: 30 seconds

**Email notifications**: Enable (get alerts if it fails)

3. Click **Create**

### 4. Create Analytics Sync Cron Job

1. Click **Create Cronjob** again

2. Fill in:

**Title**: LinkedAI - Analytics Sync

**Address (URL)**:
```
https://your-app.vercel.app/api/cron/sync-analytics
```

**Schedule**:
- **Every 6 hours**
- Or use expression: `0 */6 * * *`

**Request Method**: GET

**Headers**:
```
Authorization: Bearer YOUR_CRON_SECRET_HERE
```

**Timeout**: 60 seconds

**Email notifications**: Enable

3. Click **Create**

---

## Verify It's Working

### Test Auto-Post Job

1. In Cron-job.org, find your "Auto Post Scheduler" job
2. Click **⋯** → **Execute now**
3. Check execution log (should see 200 OK status)
4. Go to your app's Vercel logs to confirm posts were checked

### Test Analytics Sync Job

1. Find "Analytics Sync" job
2. Click **⋯** → **Execute now**
3. Verify 200 OK response
4. Check app logs for sync activity

### Check Scheduled Posts

1. Create a test post in your app
2. Schedule it for 5 minutes from now
3. Wait for next cron execution (every 15 minutes)
4. Verify post was published to LinkedIn

---

## Cron Schedule Examples

| Frequency | Cron Expression | Description |
|-----------|----------------|-------------|
| Every 15 minutes | `*/15 * * * *` | Recommended for auto-posting |
| Every 30 minutes | `*/30 * * * *` | Less frequent checks |
| Every hour | `0 * * * *` | Hourly |
| Every 6 hours | `0 */6 * * *` | Recommended for analytics |
| Daily at midnight | `0 0 * * *` | Once per day |

---

## Troubleshooting

### Cron Job Returns 401 Unauthorized

**Problem**: CRON_SECRET not set or incorrect

**Fix**:
1. Check Vercel environment variables
2. Verify Authorization header in Cron-job.org matches exactly:
   ```
   Authorization: Bearer YOUR_ACTUAL_SECRET
   ```
3. Redeploy Vercel app after adding env var

### Cron Job Times Out

**Problem**: Request takes too long (>30 seconds)

**Fix**:
1. Increase timeout in Cron-job.org settings (max 300 seconds)
2. Check Vercel function logs for errors
3. Optimize your cron endpoint code

### Posts Not Publishing

**Problem**: Cron runs but posts don't publish

**Debug**:
1. Check Vercel function logs:
   - Go to Vercel Dashboard → Deployments
   - Click latest deployment → Functions
   - Look for `/api/cron/publish-scheduled` logs
2. Verify posts are actually scheduled (not draft status)
3. Check LinkedIn access tokens haven't expired
4. Manually test endpoint:
   ```bash
   curl -X GET https://your-app.vercel.app/api/cron/publish-scheduled \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### No Email Notifications

**Problem**: Not receiving failure alerts

**Fix**:
1. Check spam folder
2. Verify email in Cron-job.org settings
3. Enable "Email on failed executions only" option

---

## Alternative: GitHub Actions (Free)

If you prefer GitHub Actions:

Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Scheduled Cron Jobs

on:
  schedule:
    # Every 15 minutes
    - cron: '*/15 * * * *'
    # Every 6 hours for analytics
    - cron: '0 */6 * * *'

jobs:
  auto-post:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto Post
        run: |
          curl -X GET ${{ secrets.VERCEL_URL }}/api/cron/publish-scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  sync-analytics:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 */6 * * *'
    steps:
      - name: Trigger Analytics Sync
        run: |
          curl -X GET ${{ secrets.VERCEL_URL }}/api/cron/sync-analytics \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add secrets in GitHub repository settings:
- `VERCEL_URL`: Your Vercel app URL
- `CRON_SECRET`: Your cron secret

---

## Security Best Practices

1. **Never expose CRON_SECRET in code or URLs**
   - Always use Authorization header
   - Don't commit secrets to git

2. **Use strong CRON_SECRET**
   - Minimum 32 characters
   - Random generated string
   - Different from other secrets

3. **Monitor cron execution logs**
   - Check for unauthorized access attempts
   - Set up failure alerts

4. **Rate limit your cron endpoints**
   - Prevent abuse if secret is compromised
   - Implement IP whitelisting if possible

---

## Cost Comparison

| Solution | Cost | Frequency | Setup Time |
|----------|------|-----------|-----------|
| **Cron-job.org** | Free | Every minute | 5 minutes |
| **GitHub Actions** | Free | Every 5 minutes | 10 minutes |
| **Vercel Hobby** | Free | Daily only | 0 minutes |
| **Vercel Pro** | $20/month | Any frequency | 0 minutes |

**Recommendation**: Cron-job.org for best free option with flexible scheduling

---

## Monitoring

### View Execution History

1. Go to Cron-job.org dashboard
2. Click on your cron job
3. View **Execution history**:
   - Status codes
   - Response times
   - Error messages
   - Execution timestamps

### Set Up Alerts

1. In job settings, enable:
   - **Email on failed execution**
   - **Email on recovered execution**
2. Add multiple email recipients if needed
3. Configure alert frequency (immediate, daily digest)

### Track Success Rate

Cron-job.org shows:
- Success rate percentage
- Average response time
- Failed executions count
- Last 100 executions

---

## Migration from Vercel Cron

If you previously used Vercel cron jobs:

1. ✅ **Remove** from `vercel.json` (already done)
2. ✅ **Set up** external cron service (follow steps above)
3. ✅ **Test** both endpoints work
4. ✅ **Monitor** for 24 hours
5. ✅ **Redeploy** to Vercel (should succeed now)

No code changes needed - your API endpoints remain the same!

---

## Questions?

**Where are the cron endpoints?**
- `/api/cron/publish-scheduled` - Auto-posts scheduled content
- `/api/cron/sync-analytics` - Syncs LinkedIn analytics

**How do I know it's working?**
- Check Cron-job.org execution logs (should show 200 OK)
- Check Vercel function logs (should see API calls)
- Create a test scheduled post and verify it publishes

**Can I change the frequency later?**
- Yes! Edit the cron job in Cron-job.org anytime
- No redeployment needed

**Is this secure?**
- Yes, when using CRON_SECRET in Authorization header
- Your endpoints validate the secret before executing

---

## Next Steps

1. ✅ Set up Cron-job.org account
2. ✅ Create both cron jobs (auto-post + analytics)
3. ✅ Test execution
4. ✅ Deploy to Vercel (should work now!)
5. ✅ Monitor for 24 hours
6. 🎉 Launch!

**Setup time**: ~5 minutes
**Cost**: $0 forever
**Reliability**: 99.9% uptime
