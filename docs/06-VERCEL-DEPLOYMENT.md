# Vercel Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- All environment variables ready
- Database setup complete

---

## Quick Deployment (5 Minutes)

### 1. Push to GitHub

```bash
cd linkedin-scheduler

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: LinkedAI - AI-Powered LinkedIn Content Scheduler

Complete SaaS platform with AI content generation, scheduling, and analytics.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/linkedin-scheduler.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Click **Import**

### 3. Configure Project

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (leave as default)
**Build Command**: `npm run build`
**Output Directory**: `.next`

### 4. Add Environment Variables

Click **Environment Variables** and add all from `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app  # ← Will be provided after deployment

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cron
CRON_SECRET=your_cron_secret
```

### 5. Deploy

Click **Deploy**

Wait 2-3 minutes for build to complete.

---

## Post-Deployment Setup

### 1. Update NEXTAUTH_URL

After deployment:
1. Copy your Vercel URL (e.g., `https://linkedin-scheduler.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL`
4. Set to your Vercel URL
5. **Redeploy** (Settings → Deployments → Redeploy)

### 2. Update LinkedIn OAuth Redirect

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **Auth** → **Redirect URLs**
4. Add:
```
https://your-app.vercel.app/api/auth/callback/linkedin
```

### 3. Configure Cron Jobs

**⚠️ IMPORTANT: Vercel Hobby Plan Limitation**

Vercel's **free Hobby plan** only allows **daily cron jobs**. Frequent cron jobs (every 15 minutes) require Vercel Pro ($20/month).

**Recommended for Free Tier**: Use external cron service (Cron-job.org)

See complete setup guide: [docs/11-EXTERNAL-CRON-SETUP.md](./11-EXTERNAL-CRON-SETUP.md)

**Quick Setup (5 minutes)**:
1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create cron job pointing to: `https://your-app.vercel.app/api/cron/publish-scheduled`
3. Schedule: Every 15 minutes (`*/15 * * * *`)
4. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
5. Done! Works perfectly on free tier

**vercel.json** (already configured):
```json
{
  "crons": []
}
```

The `vercel.json` file intentionally has empty crons array to avoid deployment errors on Hobby plan.

---

## Custom Domain (Optional)

### 1. Add Domain

1. Go to **Settings** → **Domains**
2. Enter your domain (e.g., `app.yoursite.com`)
3. Follow DNS instructions

### 2. Update DNS Records

Add these records to your DNS provider:

**For subdomain (app.yoursite.com)**:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**For root domain (yoursite.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 3. Update Environment Variables

After domain is active:
```bash
NEXTAUTH_URL=https://app.yoursite.com
```

Update LinkedIn OAuth redirect URL too!

---

## Environment-Specific Variables

### Production Only

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Enable Analytics

```bash
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Ensure all dependencies in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error**: "Environment variable missing"
- Check all env vars are added in Vercel dashboard
- Redeploy after adding vars

### OAuth Not Working

**Error**: "redirect_uri_mismatch"
- Verify LinkedIn redirect URL matches Vercel URL exactly
- Check NEXTAUTH_URL is correct
- Try redeploying

### Supabase Connection Error

**Error**: "Could not connect to database"
- Verify Supabase URL and keys
- Check Supabase project is not paused
- Whitelist Vercel IPs (usually not needed)

### Cron Jobs Not Running

1. Check `vercel.json` is in root directory
2. Verify cron paths match your API routes
3. Check function logs: **Deployments** → **Functions** → View logs
4. Ensure CRON_SECRET matches in API routes

---

## Performance Optimization

### Enable Edge Runtime

For specific routes:

```typescript
// src/app/api/some-route/route.ts
export const runtime = 'edge'
```

### Image Optimization

Using Next.js Image:

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={200}
  alt="Logo"
/>
```

### Enable Gzip Compression

Next.js enables this by default on Vercel!

---

## Monitoring

### View Logs

**Real-time Logs**:
1. Go to **Deployments**
2. Click latest deployment
3. Click **Functions** or **Edge Functions**
4. View logs in real-time

**Filter logs**:
```bash
vercel logs --follow
vercel logs --since 1h
```

### Analytics

Vercel Analytics (free tier):
1. Go to **Analytics** tab
2. View traffic, performance
3. Track Web Vitals

---

## Rollback Deployment

If something breaks:

1. Go to **Deployments**
2. Find last working deployment
3. Click **⋮** → **Promote to Production**

Or via CLI:
```bash
vercel rollback
```

---

## CI/CD Pipeline

Vercel auto-deploys on every push:

**Main Branch** → Production
**Other Branches** → Preview deployments

Disable auto-deploy:
1. Go to **Settings** → **Git**
2. Uncheck **Automatically deploy new commits**

---

## Cost Optimization

### Free Tier Limits

- **Bandwidth**: 100 GB/month
- **Functions**: 100 GB-hours/month
- **Serverless Functions**: 1000 hours/month

### If Exceeding Limits

1. Optimize images (use WebP)
2. Enable caching headers
3. Use CDN for static assets
4. Upgrade to Pro ($20/month)

---

## Security Checklist

- [ ] All env vars added to Vercel (not in code)
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Supabase RLS policies enabled
- [ ] LinkedIn OAuth redirect URLs updated
- [ ] CRON_SECRET is set and validated
- [ ] No API keys exposed in client code
- [ ] CORS configured correctly

---

## Production Checklist

- [ ] All features tested on production
- [ ] OAuth flow works end-to-end
- [ ] Database connection stable
- [ ] Cron jobs running
- [ ] Analytics tracking working
- [ ] Email notifications sending
- [ ] Payment flow complete (if using Razorpay)
- [ ] Error tracking set up (Sentry, LogRocket)
- [ ] Backup strategy in place

---

## Next Steps

1. Set up monitoring (Sentry, LogRocket)
2. Configure email service (Resend, SendGrid)
3. Add uptime monitoring (UptimeRobot)
4. Set up staging environment
5. Launch! 🚀
