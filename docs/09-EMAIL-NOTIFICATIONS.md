# Email Notifications Setup (Resend)

## Why Resend?

- **Free tier**: 3,000 emails/month
- **Developer-friendly** API
- **Email templates** with React
- **High deliverability**
- **Detailed analytics**

---

## Setup Resend

### 1. Create Account

1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Verify email

### 2. Get API Key

1. Go to **API Keys**
2. Click **Create API Key**
3. Name: "LinkedAI Production"
4. Copy key → Add to `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
```

### 3. Verify Domain (Optional but Recommended)

**Without domain**: Emails sent from `onboarding@resend.dev` (looks spammy)
**With domain**: Emails sent from `noreply@yourdomain.com` (professional)

#### Add Domain

1. Go to **Domains**
2. Click **Add Domain**
3. Enter: `yourdomain.com`
4. Add DNS records:

```
Type: TXT
Name: @
Value: resend-verification-code-here

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

5. Wait for verification (5-10 minutes)

---

## Install Resend

```bash
npm install resend
```

---

## Email Templates

### Create Template Component

File: `src/emails/WelcomeEmail.tsx`

```typescript
import * as React from 'react'

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  loginUrl,
}) => {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ color: '#0a66c2' }}>Welcome to LinkedAI! 👋</h1>
          <p>Hi {userName},</p>
          <p>Thanks for signing up! Your account is ready.</p>

          <a
            href={loginUrl}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0a66c2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              marginTop: '20px'
            }}
          >
            Get Started
          </a>

          <p style={{ marginTop: '30px', color: '#666' }}>
            Questions? Reply to this email or visit our support center.
          </p>
        </div>
      </body>
    </html>
  )
}
```

### Post Published Template

File: `src/emails/PostPublishedEmail.tsx`

```typescript
export const PostPublishedEmail = ({ postContent, postUrl, views }) => {
  return (
    <html>
      <body>
        <h1>Your Post is Live! 🎉</h1>
        <p>Your LinkedIn post has been published:</p>

        <div style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          {postContent}
        </div>

        <p><strong>Current Stats:</strong></p>
        <ul>
          <li>Views: {views}</li>
        </ul>

        <a href={postUrl}>View on LinkedIn →</a>
      </body>
    </html>
  )
}
```

---

## Send Emails

### Email Service

File: `src/lib/email/resend.ts`

```typescript
import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { PostPublishedEmail } from '@/emails/PostPublishedEmail'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendWelcomeEmail(to: string, userName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'LinkedAI <noreply@yourdomain.com>', // Use your verified domain
      to: [to],
      subject: 'Welcome to LinkedAI! 🚀',
      react: WelcomeEmail({
        userName,
        loginUrl: `${process.env.NEXTAUTH_URL}/login`
      }),
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendPostPublishedEmail(
  to: string,
  postContent: string,
  postUrl: string,
  views: number
) {
  await resend.emails.send({
    from: 'LinkedAI <noreply@yourdomain.com>',
    to: [to],
    subject: '🎉 Your LinkedIn post is live!',
    react: PostPublishedEmail({ postContent, postUrl, views }),
  })
}

export async function sendPostFailedEmail(
  to: string,
  postContent: string,
  errorMessage: string
) {
  await resend.emails.send({
    from: 'LinkedAI <noreply@yourdomain.com>',
    to: [to],
    subject: '⚠️ Your LinkedIn post failed to publish',
    html: `
      <h2>Post Failed</h2>
      <p>Your scheduled post failed to publish:</p>
      <blockquote>${postContent}</blockquote>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p>Please try again or contact support.</p>
    `,
  })
}
```

---

## Trigger Emails

### On User Signup

File: `src/app/api/auth/signup/route.ts`

```typescript
import { sendWelcomeEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  // Create user...

  // Send welcome email
  await sendWelcomeEmail(email, name)

  return NextResponse.json({ success: true })
}
```

### On Post Published

File: `src/app/api/cron/auto-post/route.ts`

```typescript
import { sendPostPublishedEmail } from '@/lib/email/resend'

// After publishing post
await sendPostPublishedEmail(
  user.email,
  post.content,
  linkedinPostUrl,
  0 // initial views
)
```

### On Subscription Change

```typescript
import { sendSubscriptionUpgradedEmail } from '@/lib/email/resend'

await sendSubscriptionUpgradedEmail(
  user.email,
  newPlan,
  features
)
```

---

## Email Types

### 1. Transactional Emails
- Welcome email
- Password reset
- Email verification
- Post published
- Post failed
- Subscription updated

### 2. Notification Emails
- Daily digest
- Weekly report
- Engagement milestones
- Team invitations

### 3. Marketing Emails (Optional)
- Feature announcements
- Tips & tutorials
- Upgrade prompts

---

## Email Preferences

Let users control emails:

### Database Schema

```sql
CREATE TABLE email_preferences (
  user_id UUID REFERENCES profiles(id),
  post_published BOOLEAN DEFAULT true,
  post_failed BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Check Before Sending

```typescript
async function shouldSendEmail(userId: string, type: string) {
  const { data } = await supabase
    .from('email_preferences')
    .select(type)
    .eq('user_id', userId)
    .single()

  return data?.[type] ?? true
}

// Usage
if (await shouldSendEmail(userId, 'post_published')) {
  await sendPostPublishedEmail(...)
}
```

### Settings Page

```typescript
<label>
  <input
    type="checkbox"
    checked={preferences.post_published}
    onChange={(e) => updatePreference('post_published', e.target.checked)}
  />
  Post published notifications
</label>
```

---

## Testing Emails

### Development Mode

```bash
# Use test email
RESEND_API_KEY=re_test_key

# Emails won't actually send, but API returns success
```

### Send Test Email

```typescript
await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: ['your-email@example.com'],
  subject: 'Test Email',
  html: '<p>This is a test</p>',
})
```

---

## Monitor Email Delivery

### Resend Dashboard

1. Go to **Emails** tab
2. View sent emails
3. Check delivery status
4. See open/click rates

### Handle Bounces

```typescript
// Webhook endpoint
export async function POST(request: Request) {
  const event = await request.json()

  if (event.type === 'email.bounced') {
    // Mark email as invalid
    await supabase
      .from('profiles')
      .update({ email_bounced: true })
      .eq('email', event.data.email)
  }

  return NextResponse.json({ received: true })
}
```

---

## Best Practices

1. **Use verified domain** - Better deliverability
2. **Personalize emails** - Use user's name
3. **Clear CTAs** - Make action buttons obvious
4. **Mobile responsive** - Test on mobile
5. **Unsubscribe link** - Required for marketing emails
6. **Test before sending** - Check all variables
7. **Monitor metrics** - Track opens and clicks

---

## Troubleshooting

**Emails not sending:**
- Check `RESEND_API_KEY` is correct
- Verify domain if using custom domain
- Check Resend dashboard for errors

**Emails going to spam:**
- Verify domain (adds SPF, DKIM records)
- Don't use spam trigger words
- Maintain good sender reputation

**React templates not rendering:**
- Ensure `resend` package is installed
- Check for JSX errors
- Test template in isolation

---

## Cost

**Free Tier**: 3,000 emails/month
**Pro**: $20/month for 50,000 emails
**Enterprise**: Custom pricing

For most SaaS apps, free tier is sufficient!

---

## Alternative: SendGrid

If you prefer SendGrid:

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: user.email,
  from: 'noreply@yourdomain.com',
  subject: 'Welcome!',
  html: '<h1>Welcome</h1>',
})
```

Resend is recommended for better DX and pricing.
