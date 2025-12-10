# Cloudflare Workers Cron Setup

This directory contains Cloudflare Workers configuration for running scheduled cron jobs.

## Overview

**Benefits:**
- ✅ FREE: 100,000 requests/day on Free plan
- ✅ Unlimited cron jobs
- ✅ No cold starts
- ✅ Global edge network
- ✅ Built-in monitoring

**Scheduled Jobs:**
1. **Publish Scheduled Posts** - Every 15 minutes (`*/15 * * * *`)
2. **Sync Analytics** - Every 6 hours (`0 */6 * * *`)

---

## Prerequisites

1. **Cloudflare Account**
   - Already set up (you have API tokens configured)
   - Workers & Pages plan (Free tier is fine)

2. **Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

3. **CRON_SECRET**
   - Same secret used in Vercel environment variables
   - Get from: Vercel Dashboard → Settings → Environment Variables → `CRON_SECRET`

---

## Installation

### Step 1: Install Wrangler Globally

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser to authenticate with Cloudflare.

### Step 3: Navigate to Workers Directory

```bash
cd cloudflare-workers
```

### Step 4: Set the CRON_SECRET

```bash
wrangler secret put CRON_SECRET
```

When prompted, paste your `CRON_SECRET` value (same as Vercel).

### Step 5: Deploy the Worker

```bash
wrangler deploy
```

The worker will be deployed to: `https://linkedin-scheduler-cron.<your-account>.workers.dev`

---

## Configuration

### wrangler.toml

The configuration file defines:

```toml
[triggers]
crons = [
  "*/15 * * * *"  # Every 15 minutes
]
```

**To add more cron schedules:**

```toml
[triggers]
crons = [
  "*/15 * * * *",  # Publish posts every 15 minutes
  "0 */6 * * *",   # Sync analytics every 6 hours
  "0 0 * * *"      # Daily cleanup at midnight
]
```

### Cron Expression Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Examples:**
- `*/15 * * * *` - Every 15 minutes
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 0 1 * *` - First day of every month

---

## Testing

### Test Endpoints

The worker exposes HTTP endpoints for manual testing:

#### Health Check
```bash
curl https://linkedin-scheduler-cron.<your-account>.workers.dev/health
```

#### Manual Trigger - Publish Posts
```bash
curl -X POST https://linkedin-scheduler-cron.<your-account>.workers.dev/trigger/publish
```

#### Manual Trigger - Sync Analytics
```bash
curl -X POST https://linkedin-scheduler-cron.<your-account>.workers.dev/trigger/analytics
```

---

## Monitoring

### View Logs

```bash
wrangler tail
```

This streams real-time logs from your worker.

### Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → linkedin-scheduler-cron
3. Click: **Logs** tab to see execution history
4. Check: **Metrics** tab for request stats

---

## Updating

### Update the Code

1. Edit `cron-worker.js`
2. Deploy changes:
   ```bash
   wrangler deploy
   ```

### Update the Schedule

1. Edit `wrangler.toml` crons array
2. Deploy changes:
   ```bash
   wrangler deploy
   ```

---

## Troubleshooting

### Check Worker Status
```bash
wrangler deployments list
```

### View Environment Variables
```bash
wrangler secret list
```

### Delete and Recreate Secret
```bash
wrangler secret delete CRON_SECRET
wrangler secret put CRON_SECRET
```

### Common Issues

**1. "Failed to fetch" errors**
- Check if CRON_SECRET is set correctly
- Verify Vercel app is deployed and running
- Check Vercel logs for authentication errors

**2. "Worker not triggering"**
- Check cron schedule in wrangler.toml
- Redeploy with `wrangler deploy`
- View logs with `wrangler tail`

**3. "Authentication failed"**
- Ensure CRON_SECRET matches Vercel environment variable
- Check Authorization header format

---

## Cost

**Cloudflare Workers Free Plan:**
- ✅ 100,000 requests/day FREE
- ✅ Unlimited workers
- ✅ First 10ms CPU time FREE
- ✅ No credit card required

**Your Usage (Estimated):**
- Publish posts: 96 requests/day (every 15 mins)
- Sync analytics: 4 requests/day (every 6 hours)
- **Total: ~100 requests/day** (well within free tier!)

---

## Advantages Over cron-job.org

| Feature | Cloudflare Workers | cron-job.org |
|---------|-------------------|--------------|
| Cost | FREE (100k/day) | FREE |
| Reliability | 99.99% SLA | 99.9% |
| Cold Starts | None | Possible |
| Monitoring | Built-in dashboard | Email alerts |
| Logs | Real-time streaming | Basic logs |
| Geographic | Global edge network | Single region |

---

## Next Steps

1. ✅ Deploy worker: `wrangler deploy`
2. ✅ Set secret: `wrangler secret put CRON_SECRET`
3. ✅ Test manually: `curl .../trigger/publish`
4. ✅ Monitor logs: `wrangler tail`
5. ✅ Check Cloudflare dashboard for metrics

---

## Support

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Cron Triggers:** https://developers.cloudflare.com/workers/configuration/cron-triggers/
