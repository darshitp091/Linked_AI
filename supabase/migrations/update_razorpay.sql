-- Update subscriptions table to use Razorpay instead of Stripe
ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_customer
  ON subscriptions(razorpay_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription
  ON subscriptions(razorpay_subscription_id);
