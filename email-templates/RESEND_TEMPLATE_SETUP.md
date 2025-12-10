# How to Set Up Email Templates in Resend

## Overview
I've created 3 professional email templates for your LinkedAI SaaS. These templates use your verified domain `linkedai.site` and match your brand colors.

## Templates Created:

1. **password-reset.html** - For password reset emails
2. **email-confirmation.html** - For new user email verification
3. **welcome-email.html** - Welcome email after signup

---

## Setup Instructions for Resend

### Option 1: Use Supabase Email Templates (Recommended for Password Reset)

For password reset, you should configure this in **Supabase**, not Resend, because Supabase handles the auth logic.

**Go to:** https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/templates

1. Click on **"Reset Password"** template
2. Copy the content from `email-templates/password-reset.html`
3. Paste it into the Supabase template editor
4. Click **"Save"**

**Important:** Supabase uses these template variables:
- `{{ .ConfirmationURL }}` - The reset password link
- `{{ .SiteURL }}` - Your site URL (https://www.linkedai.site)
- `{{ .Email }}` - User's email address

---

### Option 2: Create Templates in Resend (For Custom Emails)

If you want to send custom emails (welcome emails, notifications, etc.) using Resend:

**Go to:** https://resend.com/templates

1. Click **"Create template"**
2. Give it a name (e.g., "Welcome Email")
3. Copy the HTML from the template files
4. Paste into Resend template editor
5. **Save** the template

Then use it in your code like this:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'LinkedAI <noreply@linkedai.site>',
  to: 'user@example.com',
  subject: 'Welcome to LinkedAI!',
  html: welcomeEmailHTML, // Your template HTML
})
```

---

## Email Template Variables

All templates include these dynamic variables that you can replace:

### Password Reset Template:
- `{{ .ConfirmationURL }}` - Reset password link
- Replace with actual URL when sending

### Welcome Email:
- No variables needed, it's static content
- Links point to your dashboard and resources

### Email Confirmation:
- `{{ .ConfirmationURL }}` - Email confirmation link
- Replace with actual URL when sending

---

## Current Setup Summary

### What's Already Configured:

✅ **Sender Email:** `noreply@linkedai.site`
✅ **Domain Verified:** `linkedai.site` (all DNS records verified)
✅ **Supabase SMTP:** Configured with Resend
✅ **SMTP Settings:**
   - Host: smtp.resend.com
   - Port: 465
   - Username: resend
   - Password: Your Resend API key

### What You Need to Do:

1. **For Password Reset (Supabase):**
   - Go to Supabase Email Templates
   - Update "Reset Password" template with `password-reset.html`
   - Make sure sender email is `noreply@linkedai.site`

2. **Test Password Reset:**
   - Go to https://www.linkedai.site/forgot-password
   - Enter your email
   - Check inbox for email from `noreply@linkedai.site`
   - Click reset link
   - Should redirect to reset password page

---

## Template Customization

You can customize these templates by editing:

### Colors:
- **Primary Blue:** `#0a66c2` (LinkedIn blue)
- **Dark Blue:** `#004182`
- **Text Gray:** `#6b7280`
- **Background:** `#f3f4f6`

### Links to Update:
All templates include these links (update if needed):
- `https://www.linkedai.site` - Homepage
- `https://www.linkedai.site/dashboard` - Dashboard
- `https://www.linkedai.site/privacy` - Privacy Policy
- `https://www.linkedai.site/terms` - Terms of Service
- `support@linkedai.site` - Support email

---

## Testing Your Templates

### Test Password Reset:
1. Go to Supabase: https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/templates
2. Update the "Reset Password" template
3. Click "Send test email" to preview
4. Or test live at: https://www.linkedai.site/forgot-password

### Test in Resend Dashboard:
1. Go to: https://resend.com/emails
2. Check sent emails
3. View email preview and delivery status

---

## Next Steps

1. ✅ Update Supabase password reset template
2. ✅ Change sender email to `noreply@linkedai.site` in Supabase SMTP
3. ✅ Test password reset flow
4. ⏳ Create welcome email automation (optional)
5. ⏳ Create email confirmation flow (optional)

---

## Pro Tips

### Email Best Practices:
- ✅ Always use `noreply@linkedai.site` for automated emails
- ✅ Use `support@linkedai.site` for replies and support
- ✅ Keep subject lines under 50 characters
- ✅ Include unsubscribe link for marketing emails
- ✅ Test emails on mobile devices

### Resend Features:
- View email analytics and open rates
- Track link clicks
- Monitor bounce and spam rates
- Set up webhooks for email events

---

## Support

If you need help:
- Resend Docs: https://resend.com/docs
- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- Check email logs: https://resend.com/emails
