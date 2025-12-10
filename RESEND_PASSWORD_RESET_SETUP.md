# Resend Password Reset Setup Guide

## Overview

I've successfully implemented a custom password reset flow using **Resend** for email delivery and **Supabase** for authentication and token storage. This approach gives you complete control over the email templates and flow, while still securely updating passwords in Supabase.

---

## How It Works

### The Flow:

1. **User requests password reset** → Enters email on `/forgot-password` page
2. **System generates secure token** → Creates random token and stores in database
3. **Email sent via Resend** → Professional email with reset link sent to user
4. **User clicks link** → Redirected to `/reset-password?token=xxx`
5. **System validates token** → Checks if token is valid and not expired
6. **User enters new password** → Sets new password securely
7. **Password updated in Supabase** → Password changed in Supabase Auth system

---

## Setup Instructions

### Step 1: Create Database Table in Supabase

You need to run the SQL migration to create the `password_reset_tokens` table.

**Go to:** https://zrexjqogbamkhtclboew.supabase.co/project/_/sql/new

1. Click **"New query"** in the SQL Editor
2. Copy the SQL from `supabase/migrations/20250130_password_reset_tokens.sql`
3. Paste it into the SQL editor
4. Click **"Run"** to execute the migration

**What this creates:**
- `password_reset_tokens` table to store reset tokens
- Indexes for fast token lookups
- Row Level Security (RLS) policies
- Foreign key to `auth.users` table

---

### Step 2: Configure Supabase Service Role

The API needs access to update user passwords using the admin API. Make sure you have the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.

**Check your `.env.local` file has:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://zrexjqogbamkhtclboew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**To get your service role key:**
1. Go to: https://zrexjqogbamkhtclboew.supabase.co/project/_/settings/api
2. Copy the **"service_role" key** (under "Project API keys")
3. Add it to your `.env.local` file

⚠️ **IMPORTANT:** Never expose the service role key in client-side code!

---

### Step 3: Verify Resend Configuration

Make sure your Resend API key and sender email are configured:

```env
RESEND_API_KEY=re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY
RESEND_FROM_EMAIL=noreply@linkedai.site
NEXT_PUBLIC_APP_URL=https://www.linkedai.site
```

**Verify domain in Resend:**
- Domain: `linkedai.site` ✅ Verified
- Sender: `noreply@linkedai.site` ✅ Ready

---

## What Changed

### Files Created:

1. **`src/app/api/auth/request-password-reset/route.ts`**
   - Generates secure reset token
   - Stores token in database
   - Sends email via Resend with professional template

2. **`src/app/api/auth/reset-password/route.ts`**
   - Validates reset token
   - Updates password in Supabase
   - Marks token as used

3. **`supabase/migrations/20250130_password_reset_tokens.sql`**
   - Database schema for token storage

### Files Updated:

1. **`src/app/(auth)/forgot-password/page.tsx`**
   - Changed from `supabase.auth.resetPasswordForEmail()`
   - Now calls `/api/auth/request-password-reset`

2. **`src/app/(auth)/reset-password/page.tsx`**
   - Changed from session-based validation
   - Now validates token from URL query parameter
   - Calls `/api/auth/reset-password` to update password

### Files Removed:

1. **`src/app/auth/callback/route.ts`** ❌ Deleted
   - No longer needed with direct Resend approach

---

## Testing the Flow

### Test Password Reset:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Go to forgot password page:**
   - Visit: http://localhost:3000/forgot-password
   - Or: https://www.linkedai.site/forgot-password

3. **Enter your email address:**
   - Use an email that exists in your database
   - Click "Send reset link"

4. **Check your email:**
   - Look for email from `noreply@linkedai.site`
   - Subject: "Reset your LinkedAI password"
   - Should arrive within seconds

5. **Click the reset link:**
   - Link format: `https://www.linkedai.site/reset-password?token=xxx`
   - Should redirect to reset password page
   - Token is automatically validated

6. **Enter new password:**
   - Password must be at least 6 characters
   - Confirm password must match
   - Click "Change password"

7. **Login with new password:**
   - Should redirect to login page after 3 seconds
   - Try logging in with your new password
   - Should work! ✅

---

## Security Features

### Token Security:
✅ Tokens are 32-byte random strings (64 hex characters)
✅ Tokens expire after 1 hour
✅ Tokens can only be used once
✅ Tokens are stored securely in database
✅ Old/expired tokens are automatically invalid

### Password Security:
✅ Passwords updated using Supabase Admin API
✅ Passwords are hashed by Supabase
✅ Service role key never exposed to client
✅ Minimum 6 character password requirement

### Email Security:
✅ Doesn't reveal if email exists (security best practice)
✅ Sent from verified domain
✅ Professional branded template
✅ Clear expiration notice

---

## Email Template

The email template is embedded in the API route with:

### Design Features:
- LinkedAI branding with gradient header
- Professional layout with responsive design
- Clear call-to-action button
- Fallback text link
- 1-hour expiration notice
- Security notice
- Footer with links and support email

### Email Preview:

```
┌─────────────────────────────────┐
│         LinkedAI                │  ← Gradient header
│   AI-Powered Content Scheduler  │
├─────────────────────────────────┤
│                                 │
│  Reset your password            │  ← Main heading
│                                 │
│  We received a request to       │  ← Description
│  reset your password...         │
│                                 │
│  ┌───────────────────────┐     │
│  │   Reset Password      │     │  ← Big blue button
│  └───────────────────────┘     │
│                                 │
│  Or copy this link:             │
│  https://www.linkedai.site/...  │  ← Fallback link
│                                 │
│  ⏰ Expires in 1 hour           │  ← Warning box
│                                 │
│  Security notice...             │  ← Footer info
└─────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Email not arriving

**Check:**
1. Resend dashboard: https://resend.com/emails
2. Verify domain is active in Resend
3. Check spam folder
4. Check server logs for errors

**Solution:**
```bash
# Check dev server console for errors
npm run dev
```

### Issue: Token invalid or expired

**Check:**
1. Token expires after 1 hour
2. Token can only be used once
3. Database table exists

**Solution:**
- Request a new reset link
- Check database table was created:
  ```sql
  SELECT * FROM password_reset_tokens LIMIT 5;
  ```

### Issue: Password not updating

**Check:**
1. Service role key is configured
2. User exists in database
3. Password meets minimum requirements (6 chars)

**Solution:**
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Check API logs in dev server console

### Issue: Migration fails

**Error:** `relation "password_reset_tokens" already exists`

**Solution:**
- Table already exists, skip migration
- Or drop table first:
  ```sql
  DROP TABLE IF EXISTS password_reset_tokens CASCADE;
  ```

---

## Monitoring

### Check sent emails:
- Resend Dashboard: https://resend.com/emails
- View delivery status, opens, clicks

### Check reset tokens:
```sql
-- View all reset tokens
SELECT
  email,
  created_at,
  expires_at,
  used_at,
  CASE
    WHEN used_at IS NOT NULL THEN 'Used'
    WHEN expires_at < NOW() THEN 'Expired'
    ELSE 'Valid'
  END as status
FROM password_reset_tokens
ORDER BY created_at DESC
LIMIT 10;
```

### Clean up old tokens:
```sql
-- Delete expired/used tokens older than 7 days
DELETE FROM password_reset_tokens
WHERE created_at < NOW() - INTERVAL '7 days'
AND (used_at IS NOT NULL OR expires_at < NOW());
```

---

## Next Steps

### Optional Enhancements:

1. **Email Throttling:**
   - Limit reset requests per email (e.g., max 3 per hour)
   - Prevent spam and abuse

2. **Notification Email:**
   - Send confirmation email after password change
   - Alert user of password change

3. **Token Cleanup Job:**
   - Auto-delete old tokens with cron job
   - Keep database clean

4. **Analytics:**
   - Track reset request success rate
   - Monitor email delivery rates

---

## Summary

### What's Working Now:

✅ Custom password reset flow with Resend
✅ Professional branded email template
✅ Secure token generation and validation
✅ Password updates in Supabase Auth
✅ 1-hour token expiration
✅ Single-use tokens
✅ No more callback route issues!

### What's Removed:

❌ Supabase SMTP configuration
❌ Auth callback route complexity
❌ Token expiration confusion
❌ Redirect loop issues

---

## Support

**Need help?**
- Resend Docs: https://resend.com/docs
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Check email logs: https://resend.com/emails
- Check database: Supabase SQL Editor

**Common Links:**
- Resend Dashboard: https://resend.com
- Supabase Dashboard: https://zrexjqogbamkhtclboew.supabase.co
- Your Site: https://www.linkedai.site
