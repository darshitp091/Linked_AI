# Resend SMTP Setup for Supabase

## Why Use Resend with Supabase?

Instead of Supabase's default email service (limited to 4 emails/hour), you can configure Supabase to send ALL emails through Resend's SMTP, which gives you:

- ✅ 100 emails per day (FREE)
- ✅ 3,000 emails per month (FREE)
- ✅ Better email deliverability
- ✅ Professional email templates
- ✅ Less likely to go to spam

## Quick Setup Steps

### Step 1: Get Resend SMTP Credentials

Your Resend API Key is already in `.env.local`:
```
re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY
```

For SMTP, you'll use:
- **Host:** `smtp.resend.com`
- **Port:** `465` (or `587` for TLS)
- **Username:** `resend`
- **Password:** `re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY` (your API key)

### Step 2: Configure Supabase SMTP

1. **Go to Supabase Auth Settings:**
   ```
   https://zrexjqogbamkhtclboew.supabase.co/project/_/settings/auth
   ```

2. **Scroll down to "SMTP Settings"**

3. **Enable "Enable Custom SMTP"** (toggle it ON)

4. **Fill in the SMTP details:**
   ```
   Sender email: onboarding@resend.dev
   Sender name: LinkedAI
   Host: smtp.resend.com
   Port number: 465
   Username: resend
   Password: re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY
   ```

5. **Click "Save"**

### Step 3: Configure Redirect URLs (IMPORTANT!)

1. **Go to URL Configuration:**
   ```
   https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/url-configuration
   ```

2. **In "Redirect URLs" section, add:**
   ```
   https://www.linkedai.site/auth/callback**
   ```

   **IMPORTANT:** The `**` at the end is required!

3. **Verify Site URL is set to:**
   ```
   https://www.linkedai.site
   ```

4. **Click "Save"**

### Step 4: Test the Setup

1. Go to: https://www.linkedai.site/forgot-password
2. Enter your email
3. Click "Send reset link"
4. Check your email inbox
5. Click the reset link
6. You should be redirected to the password reset page ✅

---

## Alternative: Use Resend Verified Domain (Better for Production)

### Why Verify a Domain?

Using `onboarding@resend.dev` works for testing but:
- ⚠️ May be flagged as spam
- ⚠️ Not professional looking
- ⚠️ Limited sending reputation

**With a verified domain:**
- ✅ Professional email (e.g., `noreply@yourdomain.com`)
- ✅ Better deliverability
- ✅ Higher trust from email providers

### How to Verify Your Domain

1. **Go to Resend Dashboard:**
   https://resend.com/domains

2. **Click "Add Domain"**

3. **Enter your domain** (e.g., `yourdomain.com`)

4. **Add DNS Records:**
   Resend will show you DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT)
   - MX record (optional)

5. **Wait for verification** (usually 5-15 minutes)

6. **Update Supabase SMTP Settings:**
   Change `Sender email` to: `noreply@yourdomain.com`

---

## Current Setup Summary

✅ Resend API key added to `.env.local`
✅ Resend package installed (`npm install resend`)
✅ Email service created at `/src/lib/email/resend.ts`
✅ Password reset pages created
✅ Auth callback route created

### What You Need to Do:

1. **Configure Supabase SMTP** (Step 2 above)
2. **Add redirect URL** (Step 3 above)
3. **Test password reset** (Step 4 above)

---

## Troubleshooting

### "SMTP connection failed"
- Double-check the SMTP credentials
- Make sure you're using Port 465 (SSL) or 587 (TLS)
- Verify API key is correct

### "Email not received"
- Check spam folder
- Verify SMTP is enabled in Supabase
- Check Resend dashboard for delivery status: https://resend.com/emails

### "Still redirecting to login page"
- Make sure `http://localhost:3000/auth/callback**` is in Supabase redirect URLs
- Request a NEW reset link after configuration changes
- Clear browser cache

### "Invalid redirect URL error"
- Ensure redirect URL includes `**` at the end
- Wait 1-2 minutes after saving Supabase settings
- Try in incognito/private window

---

## Production Checklist

Before deploying:

- [ ] Verify your own domain in Resend
- [ ] Update `RESEND_FROM_EMAIL` to use your domain
- [ ] Update Supabase SMTP sender email
- [ ] Add production URLs to Supabase redirect URLs
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test email delivery in production
- [ ] Monitor Resend email quota

---

## Cost Breakdown

**Resend FREE Tier:**
- 100 emails per day
- 3,000 emails per month
- Unlimited domains
- Unlimited team members

**If you exceed:**
- $20/month for 50,000 emails
- Very generous free tier for most apps

---

## Support

- Resend Docs: https://resend.com/docs
- Supabase SMTP Docs: https://supabase.com/docs/guides/auth/auth-smtp
- Resend Status: https://resend.com/status
