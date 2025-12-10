# How to Use Email Templates in Your Code

This guide shows you how to use the email templates in your LinkedAI application.

---

## 📁 Template Files Created

All templates are located in `email-templates/`:

1. ✅ `password-reset.html` - For password reset (embedded in API)
2. ✅ `welcome-email.html` - Welcome new users
3. ✅ `email-confirmation.html` - Email verification
4. ✅ `payment-success.html` - Payment confirmation
5. ✅ `payment-failed.html` - Payment failure notification
6. ✅ `post-published.html` - Post publishing notification
7. ✅ `usage-limit-warning.html` - Usage limit warnings

---

## 🚀 Quick Start - Using Email Templates

### Method 1: Using the Helper Functions (Recommended)

I've created a helper file at `src/lib/email/templates.ts` with ready-to-use functions.

#### Example: Send Payment Success Email

```typescript
import { sendPaymentSuccessEmail } from '@/lib/email/templates'

// After successful Razorpay payment
await sendPaymentSuccessEmail({
  to: user.email,
  name: user.name,
  plan: 'Pro',
  amount: '999',
  currency: 'INR',
  invoiceUrl: 'https://www.linkedai.site/invoices/123',
  nextBillingDate: '1st February 2025'
})
```

#### Example: Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email/templates'

// After user signup
await sendWelcomeEmail({
  to: newUser.email,
  name: newUser.name,
  email: newUser.email
})
```

#### Example: Send Post Published Notification

```typescript
import { sendPostPublishedEmail } from '@/lib/email/templates'

// After post is published to LinkedIn
await sendPostPublishedEmail({
  to: user.email,
  name: user.name,
  postContent: post.content,
  postUrl: linkedInPostUrl,
  scheduledDate: '30th November 2025, 10:00 AM',
  dashboardUrl: 'https://www.linkedai.site/dashboard/analytics'
})
```

#### Example: Send Usage Limit Warning

```typescript
import { sendUsageLimitWarning } from '@/lib/email/templates'

// When user reaches 80% of plan limit
await sendUsageLimitWarning({
  to: user.email,
  name: user.name,
  currentPlan: 'Starter',
  postsUsed: '24',
  postsLimit: '30',
  upgradeUrl: 'https://www.linkedai.site/pricing'
})
```

---

## 📧 All Available Functions

### 1. `sendPaymentSuccessEmail(params)`

**When to use:** After successful Razorpay payment

**Parameters:**
```typescript
{
  to: string          // User's email
  name: string        // User's name
  plan: string        // Plan name (Starter/Pro/Enterprise)
  amount: string      // Payment amount (e.g., "999")
  currency?: string   // Currency code (default: "INR")
  invoiceUrl: string  // Link to invoice/receipt
  nextBillingDate: string // Next billing date
}
```

**Example usage location:**
- `src/app/api/webhooks/razorpay/route.ts` - After payment success

---

### 2. `sendPaymentFailedEmail(params)`

**When to use:** When Razorpay payment fails

**Parameters:**
```typescript
{
  to: string      // User's email
  name: string    // User's name
  plan: string    // Plan name
  amount: string  // Payment amount
  retryUrl: string // URL to retry payment
}
```

**Example usage location:**
- `src/app/api/webhooks/razorpay/route.ts` - After payment failure

---

### 3. `sendWelcomeEmail(params)`

**When to use:** After successful signup and email verification

**Parameters:**
```typescript
{
  to: string    // User's email
  name: string  // User's name
  email: string // User's email (for confirmation)
}
```

**Example usage location:**
- `src/app/api/auth/signup/route.ts` - After email verification

---

### 4. `sendEmailConfirmation(params)`

**When to use:** During signup to verify email address

**Parameters:**
```typescript
{
  to: string              // User's email
  email: string           // User's email
  confirmationLink: string // Email confirmation URL
}
```

**Example usage location:**
- `src/app/api/auth/signup/route.ts` - During registration

---

### 5. `sendPostPublishedEmail(params)`

**When to use:** After scheduled post is published to LinkedIn

**Parameters:**
```typescript
{
  to: string           // User's email
  name: string         // User's name
  postContent: string  // Post text (first 150 chars)
  postUrl: string      // LinkedIn post URL
  scheduledDate: string // When it was scheduled
  dashboardUrl: string // Link to analytics
}
```

**Example usage location:**
- Cron job or LinkedIn API callback after publishing

---

### 6. `sendUsageLimitWarning(params)`

**When to use:** When user reaches 80% of plan limit

**Parameters:**
```typescript
{
  to: string         // User's email
  name: string       // User's name
  currentPlan: string // Plan name
  postsUsed: string  // Posts generated
  postsLimit: string // Total allowed
  upgradeUrl: string // URL to upgrade
}
```

**Example usage location:**
- After generating AI post, check usage and send warning if needed

---

## 🔧 Integration Examples

### Example 1: Razorpay Payment Webhook

```typescript
// src/app/api/webhooks/razorpay/route.ts
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email/templates'

export async function POST(request: Request) {
  const event = await request.json()

  if (event.event === 'payment.captured') {
    // Payment successful
    const user = await getUserByPaymentId(event.payload.payment.entity.id)

    await sendPaymentSuccessEmail({
      to: user.email,
      name: user.name,
      plan: user.plan_name,
      amount: (event.payload.payment.entity.amount / 100).toString(),
      invoiceUrl: `https://www.linkedai.site/invoices/${event.payload.payment.entity.id}`,
      nextBillingDate: getNextBillingDate(user.billing_cycle)
    })
  }

  if (event.event === 'payment.failed') {
    // Payment failed
    const user = await getUserByPaymentId(event.payload.payment.entity.id)

    await sendPaymentFailedEmail({
      to: user.email,
      name: user.name,
      plan: user.plan_name,
      amount: (event.payload.payment.entity.amount / 100).toString(),
      retryUrl: `https://www.linkedai.site/billing/retry/${event.payload.payment.entity.id}`
    })
  }

  return NextResponse.json({ received: true })
}
```

---

### Example 2: Post Publishing Cron Job

```typescript
// src/app/api/cron/publish-posts/route.ts
import { sendPostPublishedEmail } from '@/lib/email/templates'

export async function GET(request: Request) {
  // Get scheduled posts for current time
  const posts = await getScheduledPosts()

  for (const post of posts) {
    // Publish to LinkedIn
    const linkedInPost = await publishToLinkedIn(post)

    // Send notification email
    await sendPostPublishedEmail({
      to: post.user.email,
      name: post.user.name,
      postContent: post.content,
      postUrl: linkedInPost.url,
      scheduledDate: new Date(post.scheduled_for).toLocaleString(),
      dashboardUrl: `https://www.linkedai.site/dashboard/analytics/${post.id}`
    })

    // Update post status
    await updatePostStatus(post.id, 'published')
  }

  return NextResponse.json({ success: true })
}
```

---

### Example 3: Usage Tracking

```typescript
// src/app/api/posts/generate/route.ts
import { sendUsageLimitWarning } from '@/lib/email/templates'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  const usage = await getUserUsage(user.id)

  // Generate post...
  const post = await generatePost(...)

  // Update usage
  await incrementUsage(user.id)

  // Check if approaching limit (80%)
  const usagePercentage = ((usage.posts_used + 1) / usage.posts_limit) * 100

  if (usagePercentage >= 80 && !usage.warning_sent) {
    await sendUsageLimitWarning({
      to: user.email,
      name: user.name,
      currentPlan: user.plan_name,
      postsUsed: (usage.posts_used + 1).toString(),
      postsLimit: usage.posts_limit.toString(),
      upgradeUrl: 'https://www.linkedai.site/pricing'
    })

    // Mark warning as sent
    await markWarningSent(user.id)
  }

  return NextResponse.json({ post })
}
```

---

## 🎨 Customizing Templates

### To modify a template:

1. Open the HTML file in `email-templates/`
2. Edit the HTML/CSS (all styles are inline)
3. Save the file
4. The changes will be reflected immediately

### Template Variables:

All variables use double curly braces: `{{variableName}}`

**Example:**
```html
<p>Hi {{name}},</p>
<p>Your payment of ₹{{amount}} was successful!</p>
```

The helper functions automatically replace these variables with actual values.

---

## 🧪 Testing Templates

### Test in development:

```typescript
// Create a test route: src/app/api/test/email/route.ts
import { sendPaymentSuccessEmail } from '@/lib/email/templates'

export async function GET() {
  await sendPaymentSuccessEmail({
    to: 'your-email@example.com',
    name: 'Test User',
    plan: 'Pro',
    amount: '999',
    invoiceUrl: 'https://example.com/invoice',
    nextBillingDate: '1st February 2025'
  })

  return new Response('Test email sent!')
}
```

Visit: `http://localhost:3000/api/test/email`

---

## 📊 Monitor Emails

Track all sent emails in Resend dashboard:

**Dashboard:** https://resend.com/emails

You can see:
- Delivery status
- Open rates
- Click rates
- Bounce rates
- Error logs

---

## ⚠️ Important Notes

1. **Email Limits:** Resend free tier = 100 emails/day, 3,000/month
2. **From Email:** Always use `noreply@linkedai.site` (verified domain)
3. **Error Handling:** All functions return `{success: boolean, data/error}`
4. **Template Loading:** Templates are loaded from filesystem (works in production)
5. **Variable Replacement:** Missing variables will show `{{variableName}}` in email

---

## 🚀 Production Checklist

Before going live:

- [ ] All templates tested with real data
- [ ] Resend domain verified (`linkedai.site`)
- [ ] FROM_EMAIL environment variable set
- [ ] RESEND_API_KEY configured
- [ ] Email notifications integrated in:
  - [ ] Payment webhooks
  - [ ] Post publishing
  - [ ] User signup
  - [ ] Usage tracking
- [ ] Error logging implemented
- [ ] Email delivery monitoring set up

---

## 📞 Support

**Email Templates Location:**
`email-templates/`

**Helper Functions:**
`src/lib/email/templates.ts`

**Resend Dashboard:**
https://resend.com/emails

**Need Help?**
Check logs in Resend dashboard or contact support@linkedai.site
