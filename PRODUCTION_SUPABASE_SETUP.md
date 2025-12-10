# 🚀 Production Supabase Configuration

## ✅ What I've Updated

I've updated all the URLs in your project from `http://localhost:3000` to your production domain `https://www.linkedai.site`

### Files Updated:
1. ✅ `.env.local` - Updated all URLs to production domain
2. ✅ `QUICK_SETUP_GUIDE.md` - Updated with production URLs
3. ✅ `RESEND_SMTP_SETUP.md` - Updated with production URLs
4. ✅ `SETUP_PASSWORD_RESET.md` - Updated with production URLs

---

## 🎯 What You Need to Configure in Supabase

### Step 1: Configure Resend SMTP

**Go to:** https://zrexjqogbamkhtclboew.supabase.co/project/_/settings/auth

**Scroll to "SMTP Settings" and configure:**

```
✅ Enable Custom SMTP: ON

Sender name:      LinkedAI
Sender email:     onboarding@resend.dev
Host:             smtp.resend.com
Port number:      465
Username:         resend
Password:         re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY
```

**Click "Save"**

---

### Step 2: Configure Redirect URLs

**Go to:** https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/url-configuration

**In the "Redirect URLs" section, add:**

```
https://www.linkedai.site/auth/callback**
```

⚠️ **IMPORTANT:** The `**` at the end is required!

---

### Step 3: Verify Site URL

**On the same page (URL Configuration), verify "Site URL" is:**

```
https://www.linkedai.site
```

**Click "Save"**

---

### Step 4: Update LinkedIn OAuth Settings

Since you changed the redirect URI in `.env.local`, you also need to update it in your LinkedIn Developer App:

**Go to:** https://www.linkedin.com/developers/apps

1. Select your app
2. Go to "Auth" tab
3. In "Authorized redirect URLs for your app", add:
   ```
   https://www.linkedai.site/api/auth/linkedin/callback
   ```
4. Click "Update"

---

## 🧪 Testing Password Reset

After configuring Supabase (Steps 1-3):

1. Go to: https://www.linkedai.site/forgot-password
2. Enter your email
3. Click "Send reset link"
4. Check your email (should arrive via Resend)
5. Click the reset link in email
6. Should redirect to: https://www.linkedai.site/reset-password
7. Enter new password
8. Login with new password ✅

---

## 📋 Environment Variables Updated

### `.env.local` Changes:

```diff
- NEXT_PUBLIC_APP_URL=http://localhost:3000
+ NEXT_PUBLIC_APP_URL=https://www.linkedai.site

- NEXTAUTH_URL=http://localhost:3000
+ NEXTAUTH_URL=https://www.linkedai.site

- LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
+ LINKEDIN_REDIRECT_URI=https://www.linkedai.site/api/auth/linkedin/callback

- NODE_ENV=development
+ NODE_ENV=production
```

---

## ⚠️ Important Notes

### Email Sending:
- Supabase will now send all emails via Resend SMTP
- 100 emails per day (FREE)
- 3,000 emails per month (FREE)
- Better deliverability than Supabase's default email

### Password Reset Flow:
- User requests reset at: `/forgot-password`
- Email sent via Resend with reset link
- Link goes to: `/auth/callback?type=recovery&code=xxx`
- Callback validates token and redirects to: `/reset-password`
- User sets new password

### Security:
- All URLs now use HTTPS (production)
- Reset tokens expire after 1 hour
- Tokens are single-use only
- Supabase handles token generation and validation

---

## ✅ Configuration Checklist

- [ ] Step 1: Configure Resend SMTP in Supabase
- [ ] Step 2: Add redirect URL in Supabase
- [ ] Step 3: Verify Site URL in Supabase
- [ ] Step 4: Update LinkedIn OAuth redirect URI
- [ ] Test password reset flow
- [ ] Test LinkedIn OAuth login
- [ ] Commit and push changes

---

## 🚀 Deployment

After testing, commit your changes:

```bash
git add .
git commit -m "Update to production URLs and configure password reset"
git push
```

Make sure your production deployment (Vercel/Netlify/etc.) picks up the new `.env.local` values.

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: https://zrexjqogbamkhtclboew.supabase.co/project/_/logs/explorer
2. Check Resend email logs: https://resend.com/emails
3. Verify all redirect URLs are saved in Supabase
4. Make sure `**` is at the end of callback URL
