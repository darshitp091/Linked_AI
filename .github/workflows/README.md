# GitHub Actions Cron Jobs - Setup Guide

GitHub Actions provides FREE unlimited cron job scheduling for public and private repositories.

## Overview

**Benefits:**
- ✅ Completely FREE (unlimited for public repos, 2000 minutes/month for private)
- ✅ Unlimited workflows
- ✅ Native GitHub integration
- ✅ No external dependencies
- ✅ Email notifications on failure

**Limitations:**
- ⚠️ Minimum frequency: 5 minutes (not as granular as Cloudflare)
- ⚠️ May have 1-3 minute delay during high load

---

## Setup Instructions

### Step 1: Add CRON_SECRET to GitHub Secrets

1. Go to your GitHub repository
2. Click: **Settings** → **Secrets and variables** → **Actions**
3. Click: **New repository secret**
4. Name: `CRON_SECRET`
5. Value: (paste your CRON_SECRET from Vercel)
6. Click: **Add secret**

### Step 2: Enable GitHub Actions

GitHub Actions should be enabled by default. If not:

1. Go to: **Settings** → **Actions** → **General**
2. Under "Actions permissions", select: **Allow all actions and reusable workflows**
3. Click: **Save**

### Step 3: Commit and Push Workflow

The workflow file is already in `.github/workflows/cron-jobs.yml`. Just push it:

```bash
git add .github/workflows/cron-jobs.yml
git commit -m "Add GitHub Actions cron jobs"
git push
```

### Step 4: Verify Workflow

1. Go to: **Actions** tab in your GitHub repo
2. You should see: "Scheduled Cron Jobs" workflow
3. Wait for the next scheduled run (check the workflow for times)
4. Or click: **Run workflow** to test manually

---

## Scheduled Times

| Job | Schedule | Frequency |
|-----|----------|-----------|
| Publish Posts | `*/15 * * * *` | Every 15 minutes |
| Sync Analytics | `0 */6 * * *` | Every 6 hours (at :00) |

---

## Manual Triggers

You can manually trigger jobs from GitHub:

1. Go to: **Actions** tab
2. Click: **Scheduled Cron Jobs**
3. Click: **Run workflow**
4. Select which job to run:
   - `publish-scheduled-posts`
   - `sync-analytics`
   - `both`
5. Click: **Run workflow**

---

## Monitoring

### View Workflow Runs

1. Go to: **Actions** tab
2. Click: **Scheduled Cron Jobs**
3. See all runs with status (success/failure)
4. Click on any run to see detailed logs

### Email Notifications

GitHub automatically sends emails when workflows fail:

1. Go to: **Settings** → **Notifications**
2. Ensure "Actions" is enabled
3. You'll receive emails for failed workflow runs

---

## Troubleshooting

### Check Logs

1. Go to: **Actions** tab
2. Click on the failed workflow run
3. Click on the job name (e.g., "Publish Scheduled Posts")
4. Expand the step to see detailed logs

### Common Issues

**1. "Bad credentials" / 401 error**
- **Cause:** CRON_SECRET not set or incorrect
- **Fix:** Add/update `CRON_SECRET` in GitHub Secrets

**2. "Workflow not running"**
- **Cause:** Workflow file not in correct location
- **Fix:** Ensure file is at `.github/workflows/cron-jobs.yml`

**3. "Schedule delayed"**
- **Cause:** GitHub Actions can have 1-3 minute delays during high load
- **Fix:** This is normal, jobs will still run

---

## Disabling Cron Jobs

If you want to temporarily disable:

1. Go to: **Actions** tab
2. Click: **Scheduled Cron Jobs**
3. Click: **...** (three dots)
4. Click: **Disable workflow**

To re-enable: Follow same steps and click **Enable workflow**

---

## Advantages

| Feature | GitHub Actions | Cloudflare Workers |
|---------|----------------|-------------------|
| Cost | FREE | FREE |
| Setup | Very easy | Requires Wrangler CLI |
| Min Frequency | 5 minutes | 1 minute |
| Delay | 0-3 minutes | Instant |
| Reliability | 99.9% | 99.99% |
| Logs | GitHub UI | Cloudflare dashboard |

---

## Recommendation

**Use BOTH for redundancy:**

1. **Primary:** Cloudflare Workers (faster, more reliable)
2. **Backup:** GitHub Actions (automatic fallback if Cloudflare fails)

Both are FREE and run independently, giving you 99.99%+ uptime!

---

## Cost

**GitHub Actions (Private Repos):**
- ✅ 2,000 minutes/month FREE
- ✅ Additional minutes: $0.008/minute
- Your usage: ~30 seconds per run × 100 runs/day = 50 minutes/day = 1,500 minutes/month
- **Well within FREE tier!**

**GitHub Actions (Public Repos):**
- ✅ Unlimited minutes FREE

---

## Next Steps

1. ✅ Add CRON_SECRET to GitHub Secrets
2. ✅ Push workflow file
3. ✅ Check Actions tab to verify
4. ✅ Manually trigger a test run
5. ✅ Monitor for 24 hours to ensure reliability
