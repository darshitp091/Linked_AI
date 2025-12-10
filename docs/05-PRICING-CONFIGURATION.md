# Pricing Configuration Guide

## Current Plans

### Free Plan
```typescript
{
  plan: 'free',
  price: 0,
  linkedinAccounts: 1,
  postsPerMonth: 10,
  aiCredits: 50,
  features: [
    'AI Content Generation',
    'Template Library',
    'Draft Management',
    'Content Calendar',
    'Post Scheduling',
    'Email Support (48h)'
  ]
}
```

### Starter Plan - $29/month
```typescript
{
  plan: 'starter',
  price: 29,
  linkedinAccounts: 3,
  postsPerMonth: 50,
  aiCredits: 200,
  features: [
    'All Free features',
    'Analytics Dashboard',
    'Priority Support (24h)'
  ]
}
```

### Pro Plan - $79/month
```typescript
{
  plan: 'pro',
  price: 79,
  linkedinAccounts: 10,
  postsPerMonth: 200,
  aiCredits: 1000,
  features: [
    'All Starter features',
    'Best Time to Post AI',
    'A/B Testing System',
    'Advanced Analytics',
    'Priority Support (12h)'
  ]
}
```

### Enterprise Plan - $199/month
```typescript
{
  plan: 'enterprise',
  price: 199,
  linkedinAccounts: -1, // unlimited
  postsPerMonth: -1, // unlimited
  aiCredits: -1, // unlimited
  features: [
    'All Pro features',
    'Team Workspaces',
    'API Access',
    'Unlimited Everything',
    'Dedicated Support (6h)'
  ]
}
```

---

## How to Change Pricing

### 1. Update Plan Configuration

Edit: `src/lib/plans/features.ts`

```typescript
export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    analytics: false,
    bestTime: false,
    abTests: false,
    workspaces: false,
    apiAccess: false,
    linkedinAccounts: 1,
    postsPerMonth: 10,
    aiCredits: 50,
    workspaceMembers: 0,
  },
  starter: {
    analytics: true, // ← Enable/disable features
    bestTime: false,
    abTests: false,
    workspaces: false,
    apiAccess: false,
    linkedinAccounts: 3, // ← Change limits
    postsPerMonth: 50,
    aiCredits: 200,
    workspaceMembers: 0,
  },
  // ... pro and enterprise
}
```

### 2. Update Database Schema

If changing plan names, update:

```sql
-- supabase/comprehensive-schema.sql
CREATE TABLE subscriptions (
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  -- ↑ Add/remove plan names here
)
```

### 3. Update Pricing Page

Edit: `src/app/pricing/page.tsx` (create if doesn't exist)

```typescript
const plans = [
  {
    name: 'Free',
    price: 0,
    features: [...],
    cta: 'Get Started'
  },
  {
    name: 'Starter',
    price: 29, // ← Change price
    features: [...],
    cta: 'Upgrade to Starter',
    popular: false
  },
  {
    name: 'Pro',
    price: 79, // ← Change price
    features: [...],
    cta: 'Upgrade to Pro',
    popular: true // ← Mark as popular
  },
  {
    name: 'Enterprise',
    price: 199, // ← Change price
    features: [...],
    cta: 'Upgrade to Enterprise'
  }
]
```

### 4. Update Razorpay Plans

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Products** → **Payment Links** or **Subscriptions**
3. Create plans matching your pricing:
   - **Starter Monthly**: ₹2,400/month (or your currency)
   - **Pro Monthly**: ₹6,500/month
   - **Enterprise Monthly**: ₹16,500/month

4. Copy Plan IDs and add to `.env.local`:
```bash
RAZORPAY_PLAN_STARTER_MONTHLY=plan_xxxxxx
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxxxx
RAZORPAY_PLAN_ENTERPRISE_MONTHLY=plan_xxxxxx
```

---

## Add New Plan Tier

### Step 1: Update Type Definition

`src/lib/plans/features.ts`:
```typescript
export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
//                                              ↑ Add new plan
```

### Step 2: Add Plan Configuration

```typescript
export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  // ... existing plans
  business: {
    analytics: true,
    bestTime: true,
    abTests: true,
    workspaces: true, // ← New: Enable workspaces but not API
    apiAccess: false,
    linkedinAccounts: 25,
    postsPerMonth: 500,
    aiCredits: 5000,
    workspaceMembers: 10,
  },
}
```

### Step 3: Update Database

```sql
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise'));
```

### Step 4: Update Navigation Badges

`src/app/(dashboard)/layout.tsx`:
```typescript
const navItems = [
  // ... existing items
  { href: '/workspaces', icon: Building2, label: 'Workspaces', badge: 'Business', requiresPlan: true },
  //                                                            ↑ Update badge
]
```

---

## Feature Gating Examples

### Check if user has access to feature:

```typescript
import { canAccessRoute } from '@/lib/plans/features'

const hasAnalytics = canAccessRoute(userPlan, '/analytics')
if (!hasAnalytics) {
  redirect('/pricing')
}
```

### Get feature limit:

```typescript
import { getFeatureLimit } from '@/lib/plans/features'

const accountLimit = getFeatureLimit(userPlan, 'linkedinAccounts')
// Returns: 1 for free, 3 for starter, 10 for pro, -1 for enterprise
```

### Enforce post limit:

```typescript
const postsThisMonth = await getPostCount(userId)
const limit = getFeatureLimit(userPlan, 'postsPerMonth')

if (limit !== -1 && postsThisMonth >= limit) {
  throw new Error('Post limit reached. Upgrade your plan.')
}
```

---

## Razorpay Integration

### Create Subscription

```typescript
// src/app/api/subscriptions/create/route.ts
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const subscription = await razorpay.subscriptions.create({
  plan_id: planId, // From Razorpay dashboard
  customer_notify: 1,
  total_count: 12, // 12 months
})
```

### Handle Webhook

```typescript
// src/app/api/webhooks/razorpay/route.ts
import crypto from 'crypto'

const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(JSON.stringify(body))
  .digest('hex')

if (expectedSignature === receivedSignature) {
  // Update subscription in database
  await supabase
    .from('subscriptions')
    .update({ plan: 'pro', status: 'active' })
    .eq('razorpay_subscription_id', subscriptionId)
}
```

---

## Testing Plans

### Test Free Plan
1. Create new account
2. Verify only free features visible
3. Try accessing `/analytics` → Should redirect to pricing

### Test Starter Plan
```sql
-- Manually set plan to starter
UPDATE subscriptions
SET plan = 'starter', status = 'active'
WHERE user_id = 'your_user_id';
```
1. Refresh page
2. Analytics should be visible
3. Best Time and Workspaces still hidden

### Test Pro Plan
```sql
UPDATE subscriptions
SET plan = 'pro', status = 'active'
WHERE user_id = 'your_user_id';
```
1. Refresh page
2. Analytics, Best Time, A/B Tests visible
3. Workspaces still hidden

### Test Enterprise Plan
```sql
UPDATE subscriptions
SET plan = 'enterprise', status = 'active'
WHERE user_id = 'your_user_id';
```
1. All 14 navigation items visible
2. No feature restrictions

---

## Annual Billing (Optional)

Add yearly plans with discounts:

```typescript
const plans = [
  {
    name: 'Pro',
    monthly: 79,
    yearly: 790, // ← 16% discount (2 months free)
    billingCycle: 'month'
  }
]
```

Update database:
```sql
ALTER TABLE subscriptions
  ADD COLUMN billing_cycle TEXT DEFAULT 'monthly'
  CHECK (billing_cycle IN ('monthly', 'yearly'));
```
