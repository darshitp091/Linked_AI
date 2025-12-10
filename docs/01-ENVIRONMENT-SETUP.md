# Environment Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Google AI API key (Gemini 1.5 Flash - free)
- LinkedIn Developer App

## 1. Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI (Free - Gemini 1.5 Flash)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# NextAuth
NEXTAUTH_SECRET=generate_random_32_char_string
NEXTAUTH_URL=http://localhost:3000

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# UploadThing (Optional - for file uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Cron Secret (for scheduled jobs)
CRON_SECRET=generate_random_string
```

## 2. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Get Google AI API Key (Free)

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click **Get API Key**
3. Create new API key
4. Copy → `GOOGLE_AI_API_KEY`

**Note**: Gemini 1.5 Flash is free with generous limits (1500 requests/day)

## 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output → `NEXTAUTH_SECRET`

## 5. Install Dependencies

```bash
npm install
```

## 6. Setup Database

See `02-DATABASE-SETUP.md`

## 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

**Issue**: "Supabase connection error"
- Check your Supabase URL and keys are correct
- Verify project is not paused (free tier pauses after inactivity)

**Issue**: "Google AI API error"
- Verify API key is correct
- Check you haven't exceeded free tier limits
- Ensure Gemini API is enabled in Google Cloud Console

**Issue**: "Port 3000 already in use"
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```
