# Supabase Password Reset Setup Guide

## Overview
The password reset functionality is now implemented in the application. Here's how it works and what you need to configure in Supabase.

## How It Works

### Flow:
1. **User visits Forgot Password page** (`/forgot-password`)
   - User enters their email address
   - Clicks "Send reset link"

2. **Supabase sends password reset email**
   - Supabase automatically sends an email with a reset link
   - The link contains a secure token
   - Link redirects to: `http://localhost:3000/reset-password`

3. **User clicks the link in email**
   - Opens the Reset Password page
   - Token is validated automatically by Supabase
   - User enters new password

4. **Password is updated**
   - New password is saved
   - User is redirected to login page
   - User can now login with new password

## Supabase Configuration Required

### Step 1: Configure Email Templates
Go to your Supabase Dashboard: https://zrexjqogbamkhtclboew.supabase.co

1. Navigate to: **Authentication → Email Templates**
2. Find the **"Reset Password"** template
3. Update the redirect URL to match your application

### Step 2: Update Redirect URL

In the Reset Password email template, you need to ensure the redirect URL is set correctly:

**For Development:**
```
{{ .SiteURL }}/reset-password
```

**For Production (when you deploy):**
```
https://yourdomain.com/reset-password
```

### Step 3: Enable Email Confirmations (if not already enabled)

1. Go to **Authentication → Settings**
2. Under **Email Auth**, ensure:
   - ✅ Enable email confirmations: ON
   - ✅ Secure email change: ON (recommended)
   - ✅ Enable custom SMTP (optional - see below)

### Step 4: (Optional) Configure Custom SMTP

By default, Supabase uses their built-in email service which is:
- ✅ FREE
- ✅ Limited to 4 emails per hour (development)
- ❌ May go to spam folder

**For better email delivery, configure custom SMTP:**

#### Option 1: Gmail (FREE - Easy Setup)
1. Create an app-specific password in your Google account
2. In Supabase → Authentication → Settings → SMTP Settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-specific-password
   Sender email: your-email@gmail.com
   Sender name: LinkedAI
   ```

#### Option 2: Resend (FREE - 100 emails/day)
Already in your .env.local but not configured:
1. Get API key from: https://resend.com/api-keys
2. Configure in Supabase SMTP settings
3. Update .env.local with the key

#### Option 3: Brevo/Sendinblue (FREE - 300 emails/day)
1. Get API key from: https://app.brevo.com/settings/keys/api
2. Configure SMTP settings in Supabase

## Testing the Password Reset Flow

### Test Steps:
1. Start the development server (already running)
2. Go to: http://localhost:3000/login
3. Click "Forgot password?"
4. Enter your email address (must be registered in Supabase)
5. Click "Send reset link"
6. Check your email inbox (and spam folder)
7. Click the reset link in the email
8. Enter your new password
9. Try logging in with the new password

### Important Notes:

**Email Rate Limits:**
- Supabase built-in emails: 4 emails per hour (development)
- Custom SMTP: Depends on your provider
- If you don't receive the email, check:
  1. Spam folder
  2. Supabase logs (Authentication → Logs)
  3. SMTP configuration
  4. Rate limits

**Token Expiration:**
- Password reset tokens expire after 1 hour
- Users must complete the reset within this time
- Expired tokens will show "Invalid or expired reset link"

**Security:**
- Reset tokens are single-use only
- Tokens are invalidated after password change
- Tokens are validated server-side by Supabase
- All communication is over HTTPS (in production)

## Files Created

1. **`/src/app/(auth)/forgot-password/page.tsx`**
   - Forgot password form
   - Email input and validation
   - Success state with instructions

2. **`/src/app/(auth)/reset-password/page.tsx`**
   - Reset password form
   - Token validation
   - Password strength validation
   - Password confirmation matching
   - Success state with auto-redirect

## Code Implementation Details

### Forgot Password (`resetPasswordForEmail`)
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

This triggers Supabase to:
- Verify the email exists in auth.users table
- Generate a secure reset token
- Send an email with the reset link
- Include the token in the URL

### Reset Password (`updateUser`)
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

This:
- Validates the token from the URL
- Updates the user's password hash
- Invalidates the reset token
- Maintains the user's session

## Troubleshooting

### "Email not sent"
- Check Supabase email logs
- Verify email exists in database
- Check rate limits (4/hour for dev)
- Configure custom SMTP for production

### "Invalid or expired reset link"
- Token expired (1 hour limit)
- Token already used
- Link was modified/corrupted
- Request a new reset link

### "Redirecting to forgot-password"
- No valid session after clicking email link
- Token wasn't included in URL
- Check Supabase email template configuration

### Emails going to spam
- Configure custom SMTP
- Add SPF/DKIM records (for production)
- Use a verified domain email

## Production Checklist

Before deploying to production:

- [ ] Configure custom SMTP (recommended)
- [ ] Update redirect URLs in Supabase email templates
- [ ] Set production site URL in Supabase settings
- [ ] Test email delivery in production
- [ ] Add proper SPF/DKIM DNS records
- [ ] Monitor email delivery rates
- [ ] Set up error tracking (Sentry)

## Support Resources

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- SMTP Setup: https://supabase.com/docs/guides/auth/auth-smtp

## Next Steps

1. Test the password reset flow locally
2. Configure custom SMTP if needed
3. Verify email delivery
4. Test with a real email account
5. Check spam folder handling
6. Update for production deployment
