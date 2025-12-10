# LinkedAI - AI-Powered LinkedIn Content Scheduler

Complete SaaS platform for LinkedIn content creation, scheduling, and analytics powered by AI.

**Status**: ✅ Production Ready
**Version**: 2.0.0
**Last Updated**: November 28, 2025

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/linkedin-scheduler.git
cd linkedin-scheduler

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev

# Open http://localhost:3000
```

📚 **Full Setup Guide**: [docs/01-ENVIRONMENT-SETUP.md](./docs/01-ENVIRONMENT-SETUP.md)

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [01 - Environment Setup](./docs/01-ENVIRONMENT-SETUP.md) | Configure environment variables and API keys |
| [02 - Database Setup](./docs/02-DATABASE-SETUP.md) | Setup Supabase database and migrations |
| [03 - LinkedIn OAuth](./docs/03-LINKEDIN-OAUTH-SETUP.md) | Configure LinkedIn Developer App |
| [04 - Features Guide](./docs/04-FEATURES-GUIDE.md) | Complete list of all features by plan |
| [05 - Pricing Configuration](./docs/05-PRICING-CONFIGURATION.md) | How to change plans and pricing |
| [06 - Vercel Deployment](./docs/06-VERCEL-DEPLOYMENT.md) | Deploy to production |
| [07 - Auto-Posting Scheduler](./docs/07-AUTO-POSTING-SCHEDULER.md) | Setup cron jobs for automation |
| [08 - API Reference](./docs/08-API-REFERENCE.md) | API documentation (Enterprise) |
| [09 - Email Notifications](./docs/09-EMAIL-NOTIFICATIONS.md) | Setup Resend for emails |
| [10 - Troubleshooting](./docs/10-TROUBLESHOOTING.md) | Common issues and solutions |
| [11 - External Cron Setup](./docs/11-EXTERNAL-CRON-SETUP.md) | Free cron service for auto-posting ⭐ |

---

## ✨ Features

### Free Plan
- ✅ AI Content Generation (Google Gemini)
- ✅ 12+ Template Library
- ✅ Draft Management
- ✅ Content Calendar
- ✅ Post Scheduling
- ✅ Notifications
- ✅ Support System

### Starter Plan ($29/mo)
- ✅ All Free features
- ✅ **Analytics Dashboard**
- ✅ 3 LinkedIn accounts
- ✅ 50 posts/month

### Pro Plan ($79/mo)
- ✅ All Starter features
- ✅ **Best Time to Post AI**
- ✅ **A/B Testing System**
- ✅ 10 LinkedIn accounts
- ✅ 200 posts/month

### Enterprise Plan ($199/mo)
- ✅ All Pro features
- ✅ **Team Workspaces**
- ✅ **API Access**
- ✅ Unlimited everything

📚 **Complete Feature List**: [docs/04-FEATURES-GUIDE.md](./docs/04-FEATURES-GUIDE.md)

---

## 🛠️ Tech Stack

**Frontend**:
- Next.js 16 (App Router + Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- Lucide Icons

**Backend**:
- Next.js API Routes
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)

**AI & APIs**:
- Google Gemini 1.5 Flash (Free!)
- LinkedIn OAuth 2.0
- LinkedIn Share API

**Payments**:
- Razorpay

**Email**:
- Resend

**Deployment**:
- Vercel
- Vercel Cron Jobs

---

## 📊 Database Schema

**Core Tables**:
- `profiles` - User accounts
- `subscriptions` - User plans (free/starter/pro/enterprise)
- `posts` - Published LinkedIn posts
- `drafts` - Unpublished content
- `templates` - Reusable templates
- `schedules` - Auto-posting schedules

**Analytics**:
- `post_analytics` - Performance metrics
- `user_analytics` - Aggregate stats

**Team Collaboration**:
- `workspaces` - Team workspaces
- `workspace_members` - Team members
- `workspace_invitations` - Pending invites

**Advanced**:
- `ab_tests` - A/B test experiments
- `ab_test_variants` - Test variations
- `api_keys` - API access tokens
- `support_tickets` - Help desk
- `notifications` - Activity feed

📚 **Full Schema**: `supabase/comprehensive-schema.sql`

---

## 🎯 Key Features Details

### AI Content Generation
- Powered by Google Gemini 1.5 Flash (Free tier!)
- Multiple content types (tips, stories, polls, etc.)
- Tone customization
- 50-1000 AI credits per month

### Auto-Posting Scheduler
- Schedule posts for future dates
- Cron job runs every 15 minutes
- Timezone support
- Automatic LinkedIn publishing

### Analytics Dashboard
- Real-time performance metrics
- Trend charts (7/14/30/90 days)
- Post performance table
- LinkedIn API integration

### Best Time to Post AI
- Analyzes historical performance
- Recommends optimal posting times
- Day-of-week insights
- Audience activity patterns

### A/B Testing
- Test 2-5 variants
- Statistical significance
- Winner determination
- Clone successful variants

### Team Workspaces
- Unlimited workspaces (Enterprise)
- Role-based permissions
- Shared content calendar
- Member management

### API Access
- RESTful API (Enterprise only)
- Create/read/update/delete posts
- Access analytics programmatically
- Rate limiting: 1000 req/hour

---

## 🔧 Environment Variables

Required:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI (Free)
GOOGLE_AI_API_KEY=

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

Optional:
```bash
# Razorpay (Payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Resend (Emails)
RESEND_API_KEY=

# Cron (Auto-posting)
CRON_SECRET=
```

📚 **Complete List**: [docs/01-ENVIRONMENT-SETUP.md](./docs/01-ENVIRONMENT-SETUP.md)

---

## 🚀 Deployment

### Quick Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy! (takes 2-3 minutes)

📚 **Full Guide**: [docs/06-VERCEL-DEPLOYMENT.md](./docs/06-VERCEL-DEPLOYMENT.md)

### Post-Deployment

1. Update `NEXTAUTH_URL` with Vercel URL
2. Update LinkedIn OAuth redirect URL
3. **Configure cron jobs** (Important!)
   - **Vercel Hobby (Free)**: Use external cron service → [Setup Guide](./docs/11-EXTERNAL-CRON-SETUP.md) ⭐
   - **Vercel Pro ($20/mo)**: Built-in cron jobs work
4. Test end-to-end

**⚠️ Note**: Vercel free tier only allows daily cron jobs. For auto-posting every 15 minutes, use free external cron service (Cron-job.org) - takes 5 minutes to set up!

---

## 🎨 Plan-Based Access Control

Navigation automatically shows/hides features based on user's subscription plan:

**Free users** see:
- 9 basic features only

**Pro users** see:
- All Free features
- Analytics, Best Time, A/B Tests

**Enterprise users** see:
- All 14 features including Workspaces and API Access

Premium routes are protected - direct URL access redirects to pricing page.

📚 **Configuration Guide**: [docs/05-PRICING-CONFIGURATION.md](./docs/05-PRICING-CONFIGURATION.md)

---

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ API key SHA-256 hashing
- ✅ OAuth 2.0 for LinkedIn
- ✅ NextAuth.js session management
- ✅ Encrypted LinkedIn tokens
- ✅ CRON_SECRET validation
- ✅ Rate limiting
- ✅ CORS configured

---

## 📈 Performance

- ✅ Next.js 16 with Turbopack (fast builds)
- ✅ Edge runtime for API routes
- ✅ Database indexes on common queries
- ✅ Image optimization
- ✅ Caching headers
- ✅ Pagination for large datasets

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test cron job locally
npm run scheduler

# Test specific feature
npm run test:analytics
```

---

## 📊 Monitoring

- **Vercel Analytics** - Traffic and performance
- **Supabase Dashboard** - Database health
- **Resend Dashboard** - Email delivery
- **LinkedIn Developer** - API usage

Recommended additions:
- Sentry (error tracking)
- LogRocket (session replay)
- UptimeRobot (uptime monitoring)

---

## 🤝 Support

**Free users**: Email support (48h response)
**Starter users**: Priority support (24h)
**Pro users**: Priority support (12h)
**Enterprise users**: Dedicated support (6h)

Create ticket: **Support** → **New Ticket** in app

---

## 🛣️ Roadmap

- [ ] Instagram integration
- [ ] Twitter/X integration
- [ ] Content recycling
- [ ] Image generation (AI)
- [ ] Video post support
- [ ] Mobile app (React Native)
- [ ] Chrome extension
- [ ] Slack integration

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

Built with:
- Next.js by Vercel
- Supabase
- Google Gemini AI
- LinkedIn API
- Razorpay
- Resend
- Tailwind CSS

---

## 🎉 Getting Started

1. **Setup Environment**: [docs/01-ENVIRONMENT-SETUP.md](./docs/01-ENVIRONMENT-SETUP.md)
2. **Setup Database**: [docs/02-DATABASE-SETUP.md](./docs/02-DATABASE-SETUP.md)
3. **Configure LinkedIn**: [docs/03-LINKEDIN-OAUTH-SETUP.md](./docs/03-LINKEDIN-OAUTH-SETUP.md)
4. **Deploy**: [docs/06-VERCEL-DEPLOYMENT.md](./docs/06-VERCEL-DEPLOYMENT.md)
5. **Launch** 🚀

---

**Built with ❤️ using Next.js, TypeScript, AI, and dedication**

**Questions?** Check the [documentation](./docs/) or create a support ticket in the app.

**Ready to launch?** Follow the [deployment guide](./docs/06-VERCEL-DEPLOYMENT.md)!
