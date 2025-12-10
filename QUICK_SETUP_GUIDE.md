# ⚡ Quick Setup Guide - Password Reset with Resend

## 🎯 Goal
Make password reset work by configuring Supabase to:
1. Use Resend for sending emails
2. Redirect to the password reset page (not login)

---

## 📋 Step-by-Step Instructions

### ✅ Step 1: Configure Resend SMTP in Supabase

1. **Open this link:**
   ```
   https://zrexjqogbamkhtclboew.supabase.co/project/_/settings/auth
   ```

2. **Scroll down to find "SMTP Settings"**

3. **Toggle ON "Enable Custom SMTP"**

4. **Fill in these exact values:**
   ```
   Sender name:      LinkedAI
   Sender email:     onboarding@resend.dev
   Host:             smtp.resend.com
   Port number:      465
   Username:         resend
   Password:         re_cSJPSXks_B3bHmeNpVqgeyBiei8wMV8gY
   ```

5. **Click "Save"** at the bottom

---

### ✅ Step 2: Configure Redirect URLs in Supabase

1. **Open this link:**
   ```
   https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/url-configuration
   ```

2. **Find the "Redirect URLs" text area**

3. **Add this line:**
   ```
   https://www.linkedai.site/auth/callback**
   ```

   ⚠️ **IMPORTANT:** Don't forget the `**` at the end!

4. **Verify "Site URL" is:**
   ```
   https://www.linkedai.site
   ```

5. **Click "Save"**

---

### ✅ Step 3: Test Password Reset

1. **Go to:** https://www.linkedai.site/forgot-password

2. **Enter your email** (must be registered in your app)

3. **Click "Send reset link"**

4. **Check your email inbox** (should arrive in ~5 seconds)

5. **Click the "Reset Password" button** in the email

6. **You should see the password reset page** (not login page!)

7. **Enter your new password** and confirm

8. **Click "Change password"**

9. **Test login** with your new password

---

## 🔍 What Changed?

### Files Created:
- ✅ `/src/app/(auth)/forgot-password/page.tsx` - Forgot password form
- ✅ `/src/app/(auth)/reset-password/page.tsx` - New password form
- ✅ `/src/app/auth/callback/route.ts` - Handles email link redirects
- ✅ `/src/lib/email/resend.ts` - Email service (for future custom emails)
- ✅ `.env.local` - Updated with Resend API key

### How It Works:
1. User enters email on forgot password page
2. Supabase generates a secure reset token
3. Supabase sends email via Resend SMTP
4. User clicks link in email
5. Link goes to `/auth/callback?type=recovery&code=xxx`
6. Callback validates token and redirects to `/reset-password`
7. User enters new password
8. Password updated ✅

---

## ⚠️ Common Issues

### Issue: Still redirecting to login
**Solution:**
- Make sure you added `https://www.linkedai.site/auth/callback**` to Supabase redirect URLs
- Wait 1-2 minutes after saving
- Request a NEW reset link (old links won't work)

### Issue: Email not received
**Solution:**
- Check spam folder
- Verify SMTP is configured correctly in Supabase
- Check Resend dashboard: https://resend.com/emails
- Make sure Resend API key is correct

### Issue: "Invalid redirect URL" error
**Solution:**
- Ensure `**` is at the end of the redirect URL
- Clear browser cache
- Try in incognito window

---

## 📊 What's Next?

After this works:
1. ✅ Password reset is working
2. Consider verifying your own domain in Resend (for production)
3. Update sender email to use your domain
4. Customize email templates

---

## 🎓 Summary

**You configured:**
1. ✅ Resend API key in `.env.local`
2. ✅ Production URL in `.env.local` (https://www.linkedai.site)
3. Supabase SMTP to use Resend (Step 1)
4. Supabase redirect URLs (Step 2)

**Now test it (Step 3)!**

Your website is deployed at: https://www.linkedai.site
