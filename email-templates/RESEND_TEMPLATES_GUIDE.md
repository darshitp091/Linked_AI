# Resend Email Templates for LinkedAI

This guide contains all the email templates you need to set up in Resend for your LinkedAI SaaS platform.

---

## 📧 Email Templates Overview

You'll create these templates in Resend:

1. **Password Reset** - When user requests password reset
2. **Welcome Email** - When new user signs up
3. **Email Confirmation** - When user needs to verify email
4. **Payment Success** - When payment is successful
5. **Payment Failed** - When payment fails
6. **Post Published** - When scheduled post goes live
7. **Usage Limit Warning** - When approaching usage limits

---

## 🔧 How to Create Templates in Resend

### Option 1: Use React Email (Recommended)

Resend supports React Email components for better maintainability. I'll create both HTML and React versions.

### Option 2: Use HTML Templates

Copy the HTML templates directly into Resend's template editor.

---

## 📝 Template 1: Password Reset

**Template Name:** `password-reset`
**Subject:** `Reset your LinkedAI password`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{resetLink}}` - The password reset URL
- `{{email}}` - User's email address

This template is already embedded in your API route, so **you don't need to create it in Resend**.

---

## 📝 Template 2: Welcome Email

**Template Name:** `welcome-email`
**Subject:** `Welcome to LinkedAI! 🎉`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{name}}` - User's first name
- `{{email}}` - User's email address

**When to send:** After successful signup and email verification

**Template:** Already created in `email-templates/welcome-email.html`

---

## 📝 Template 3: Email Confirmation

**Template Name:** `email-confirmation`
**Subject:** `Confirm your LinkedAI email address`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{confirmationLink}}` - Email confirmation URL
- `{{email}}` - User's email address

**When to send:** During signup process

**Template:** Already created in `email-templates/email-confirmation.html`

---

## 📝 Template 4: Payment Success

**Template Name:** `payment-success`
**Subject:** `Payment Successful - LinkedAI {{plan}}`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{name}}` - User's name
- `{{plan}}` - Plan name (Starter/Pro/Enterprise)
- `{{amount}}` - Payment amount
- `{{currency}}` - Currency (INR)
- `{{invoiceUrl}}` - Link to invoice/receipt
- `{{nextBillingDate}}` - Next billing date

**When to send:** After successful Razorpay payment

---

## 📝 Template 5: Payment Failed

**Template Name:** `payment-failed`
**Subject:** `Payment Failed - LinkedAI Subscription`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{name}}` - User's name
- `{{plan}}` - Plan name
- `{{amount}}` - Payment amount
- `{{retryUrl}}` - URL to retry payment

**When to send:** When Razorpay payment fails

---

## 📝 Template 6: Post Published

**Template Name:** `post-published`
**Subject:** `Your LinkedIn post is live! 📊`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{name}}` - User's name
- `{{postContent}}` - First 150 characters of post
- `{{postUrl}}` - LinkedIn post URL
- `{{scheduledDate}}` - When it was scheduled
- `{{dashboardUrl}}` - Link to analytics

**When to send:** After scheduled post is published to LinkedIn

---

## 📝 Template 7: Usage Limit Warning

**Template Name:** `usage-limit-warning`
**Subject:** `You're approaching your LinkedAI limits`
**From:** `LinkedAI <noreply@linkedai.site>`

**Variables:**
- `{{name}}` - User's name
- `{{currentPlan}}` - Current plan name
- `{{postsUsed}}` - Posts generated this month
- `{{postsLimit}}` - Total posts allowed
- `{{upgradeUrl}}` - URL to upgrade page

**When to send:** When user reaches 80% of their plan limit

---

## 🎨 Template Color Scheme

All templates use LinkedAI brand colors:

- **Primary Blue:** `#0a66c2` (LinkedIn blue)
- **Dark Blue:** `#004182`
- **Success Green:** `#10b981`
- **Warning Orange:** `#f59e0b`
- **Error Red:** `#ef4444`
- **Text Gray:** `#6b7280`
- **Background:** `#f3f4f6`
- **White:** `#ffffff`

---

## 📋 Setup Instructions

### Step 1: Create Templates in Resend

You have **two options** for creating templates:

#### Option A: Upload HTML Files (Simple)

1. Go to Resend Templates: https://resend.com/templates
2. Click **"Create Template"**
3. Give it a name (e.g., "payment-success")
4. Copy the HTML from the template files I'll create
5. Paste into Resend editor
6. Save template

#### Option B: Use React Email (Advanced)

1. Install React Email in your project
2. Create `.tsx` template files
3. Preview and test locally
4. Deploy to Resend

**I recommend Option A for now** - it's simpler and faster.

---

## 📁 Template Files Location

All templates will be saved in:
```
email-templates/
├── password-reset.html          ✅ Already exists (embedded in API)
├── welcome-email.html           ✅ Already exists
├── email-confirmation.html      ✅ Already exists
├── payment-success.html         🆕 Creating now
├── payment-failed.html          🆕 Creating now
├── post-published.html          🆕 Creating now
├── usage-limit-warning.html     🆕 Creating now
└── RESEND_TEMPLATES_GUIDE.md    📖 This file
```

---

## 🔄 How to Use Templates in Code

### Example: Send Payment Success Email

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'LinkedAI <noreply@linkedai.site>',
  to: user.email,
  subject: 'Payment Successful - LinkedAI Pro',
  html: paymentSuccessHTML
    .replace('{{name}}', user.name)
    .replace('{{plan}}', 'Pro')
    .replace('{{amount}}', '₹999')
    .replace('{{currency}}', 'INR')
    .replace('{{invoiceUrl}}', invoiceUrl)
    .replace('{{nextBillingDate}}', nextBillingDate)
})
```

### Better: Use a Template Helper Function

I'll create a helper function to make this easier.

---

## 🚀 Next Steps

1. ✅ Run database migration (if not done yet)
2. 🔄 I'll create the remaining email templates
3. 📤 Copy templates to Resend (optional)
4. ✅ Test password reset flow
5. ⏳ Implement other email triggers

---

## 📊 Email Analytics

Track your emails in Resend dashboard:
- Open rates
- Click rates
- Bounce rates
- Delivery status

**Dashboard:** https://resend.com/emails

---

Would you like me to create all the email template HTML files now?
