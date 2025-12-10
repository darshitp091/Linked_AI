/**
 * Example A/B Test Configurations
 * Use these examples for testing and development
 */

import { CreateTestRequest } from '@/types/ab-testing'

/**
 * Example 1: Simple Content Test (2 variants)
 */
export const contentTest: CreateTestRequest = {
  name: 'Product Launch - Headline Test',
  description: 'Testing short vs long headline for product launch announcement',
  test_type: 'content',
  duration_hours: 72,
  min_sample_size: 100,
  confidence_level: 0.95,
  auto_promote_winner: true,
  variants: [
    {
      variant_name: 'A',
      variant_label: 'Short & Punchy',
      traffic_percentage: 50,
      content: `🚀 Launching our new AI-powered tool!

Transform your LinkedIn strategy in minutes, not hours.

What you get:
✅ Automated post scheduling
✅ AI content generation
✅ Performance analytics
✅ Best time to post insights

Limited early bird pricing - 50% off first month!

Link in comments 👇`,
      hashtags: ['AI', 'LinkedIn', 'Productivity', 'MarTech'],
      topic: 'Product Launch',
    },
    {
      variant_name: 'B',
      variant_label: 'Long & Detailed',
      traffic_percentage: 50,
      content: `We're excited to announce the launch of our new AI-powered LinkedIn tool! 🎉

After months of development and testing with 500+ beta users, we're ready to help you transform your LinkedIn strategy.

Here's what makes us different:

📊 Smart Analytics
Our AI analyzes your post performance and gives actionable insights on what works and what doesn't.

⏰ Optimal Timing
We learn your audience's behavior and automatically schedule posts when they're most likely to engage.

✍️ AI Content Assistant
Stuck on what to write? Our AI helps you create engaging posts in your unique voice.

📅 Calendar Integration
Sync with Google Calendar and never miss a posting opportunity.

Special Launch Offer:
✨ 50% off your first month
✨ 30-day money-back guarantee
✨ Free migration from your current tool

Ready to level up your LinkedIn game? Check the link in comments!`,
      hashtags: ['LinkedIn', 'SocialMedia', 'Marketing', 'AI', 'ProductLaunch'],
      topic: 'Product Launch',
    },
  ],
}

/**
 * Example 2: Hashtag Optimization Test (3 variants)
 */
export const hashtagTest: CreateTestRequest = {
  name: 'Hashtag Strategy Test',
  description: 'Testing different hashtag combinations for reach',
  test_type: 'hashtags',
  duration_hours: 48,
  min_sample_size: 150,
  confidence_level: 0.95,
  auto_promote_winner: false,
  variants: [
    {
      variant_name: 'A',
      variant_label: 'Broad Reach',
      traffic_percentage: 34,
      content: `Here's what I learned after analyzing 10,000+ LinkedIn posts:

The best performing posts have 3 things in common:
1. They tell a story
2. They provide value
3. They end with a question

What's your take?`,
      hashtags: ['LinkedIn', 'Marketing', 'Business', 'SocialMedia', 'Growth'],
      topic: 'LinkedIn Tips',
    },
    {
      variant_name: 'B',
      variant_label: 'Niche Specific',
      traffic_percentage: 33,
      content: `Here's what I learned after analyzing 10,000+ LinkedIn posts:

The best performing posts have 3 things in common:
1. They tell a story
2. They provide value
3. They end with a question

What's your take?`,
      hashtags: ['LinkedInTips', 'ContentMarketing', 'B2BMarketing', 'SocialSelling'],
      topic: 'LinkedIn Tips',
    },
    {
      variant_name: 'C',
      variant_label: 'No Hashtags',
      traffic_percentage: 33,
      content: `Here's what I learned after analyzing 10,000+ LinkedIn posts:

The best performing posts have 3 things in common:
1. They tell a story
2. They provide value
3. They end with a question

What's your take?`,
      hashtags: [],
      topic: 'LinkedIn Tips',
    },
  ],
}

/**
 * Example 3: CTA Optimization Test (3 variants)
 */
export const ctaTest: CreateTestRequest = {
  name: 'CTA Effectiveness Test',
  description: 'Testing different calls-to-action for newsletter signups',
  test_type: 'cta',
  duration_hours: 96,
  min_sample_size: 200,
  confidence_level: 0.95,
  auto_promote_winner: true,
  variants: [
    {
      variant_name: 'A',
      variant_label: 'Direct CTA',
      traffic_percentage: 34,
      content: `Weekly LinkedIn Tips in Your Inbox 📧

I share my best LinkedIn strategies every Tuesday.
No fluff, just actionable advice you can implement today.

👉 Click the link in comments to subscribe now!`,
      hashtags: ['Newsletter', 'LinkedInTips', 'Marketing'],
      topic: 'Newsletter Promotion',
    },
    {
      variant_name: 'B',
      variant_label: 'Soft CTA',
      traffic_percentage: 33,
      content: `Weekly LinkedIn Tips in Your Inbox 📧

I share my best LinkedIn strategies every Tuesday.
No fluff, just actionable advice you can implement today.

Interested in staying updated? Link in comments 💌`,
      hashtags: ['Newsletter', 'LinkedInTips', 'Marketing'],
      topic: 'Newsletter Promotion',
    },
    {
      variant_name: 'C',
      variant_label: 'Benefit-Focused CTA',
      traffic_percentage: 33,
      content: `Weekly LinkedIn Tips in Your Inbox 📧

I share my best LinkedIn strategies every Tuesday.
No fluff, just actionable advice you can implement today.

Join 5,000+ professionals who are already growing their LinkedIn presence 🚀
Link in comments`,
      hashtags: ['Newsletter', 'LinkedInTips', 'Marketing'],
      topic: 'Newsletter Promotion',
    },
  ],
}

/**
 * Example 4: Mixed Test (Content + CTA + Hashtags - 4 variants)
 */
export const mixedTest: CreateTestRequest = {
  name: 'Complete Post Optimization',
  description: 'Testing everything - content style, CTA, and hashtags',
  test_type: 'mixed',
  duration_hours: 120,
  min_sample_size: 250,
  confidence_level: 0.95,
  auto_promote_winner: true,
  variants: [
    {
      variant_name: 'A',
      variant_label: 'Story + Soft CTA + Broad Tags',
      traffic_percentage: 25,
      content: `I made a mistake that cost me 6 months of growth.

I was posting every day, spending hours on content, but getting nowhere.

Then I realized: I was optimizing for the wrong metric.

I switched from daily posts to 3x weekly high-quality posts.
Result? 10x engagement, 3x followers.

Quality > Quantity. Every single time.

What's your experience?`,
      hashtags: ['LinkedIn', 'GrowthHacking', 'ContentMarketing'],
      topic: 'Growth Story',
    },
    {
      variant_name: 'B',
      variant_label: 'Story + Direct CTA + Niche Tags',
      traffic_percentage: 25,
      content: `I made a mistake that cost me 6 months of growth.

I was posting every day, spending hours on content, but getting nowhere.

Then I realized: I was optimizing for the wrong metric.

I switched from daily posts to 3x weekly high-quality posts.
Result? 10x engagement, 3x followers.

Quality > Quantity. Every single time.

Drop a comment if you agree 👇`,
      hashtags: ['LinkedInGrowth', 'PersonalBranding', 'ContentStrategy'],
      topic: 'Growth Story',
    },
    {
      variant_name: 'C',
      variant_label: 'List + Soft CTA + Broad Tags',
      traffic_percentage: 25,
      content: `5 lessons from growing my LinkedIn to 50K followers:

1. Consistency beats perfection
2. Engage before you expect engagement
3. Your network is your net worth
4. Video > Image > Text (in terms of reach)
5. Authenticity wins in the long run

Which resonates most with you?`,
      hashtags: ['LinkedIn', 'SocialMedia', 'PersonalBrand'],
      topic: 'Growth Story',
    },
    {
      variant_name: 'D',
      variant_label: 'List + Direct CTA + Niche Tags',
      traffic_percentage: 25,
      content: `5 lessons from growing my LinkedIn to 50K followers:

1. Consistency beats perfection
2. Engage before you expect engagement
3. Your network is your net worth
4. Video > Image > Text (in terms of reach)
5. Authenticity wins in the long run

Save this for later and share with someone who needs it! 🔖`,
      hashtags: ['LinkedInTips', 'DigitalMarketing', 'ThoughtLeadership'],
      topic: 'Growth Story',
    },
  ],
}

/**
 * Example 5: Emoji Test (2 variants)
 */
export const emojiTest: CreateTestRequest = {
  name: 'Emoji Impact Test',
  description: 'Testing posts with vs without emojis',
  test_type: 'content',
  duration_hours: 48,
  min_sample_size: 100,
  confidence_level: 0.95,
  auto_promote_winner: false,
  variants: [
    {
      variant_name: 'A',
      variant_label: 'With Emojis',
      traffic_percentage: 50,
      content: `🚀 Just launched our new feature!

After 6 months of development, we're excited to introduce:

✨ Smart Scheduling
📊 Advanced Analytics
🎯 Audience Insights
💬 Engagement Tracking

Try it free for 14 days! 🎁

Link in comments 👇`,
      hashtags: ['ProductLaunch', 'SaaS', 'Innovation'],
      topic: 'Feature Launch',
    },
    {
      variant_name: 'B',
      variant_label: 'No Emojis',
      traffic_percentage: 50,
      content: `Just launched our new feature!

After 6 months of development, we're excited to introduce:

• Smart Scheduling
• Advanced Analytics
• Audience Insights
• Engagement Tracking

Try it free for 14 days!

Link in comments.`,
      hashtags: ['ProductLaunch', 'SaaS', 'Innovation'],
      topic: 'Feature Launch',
    },
  ],
}

/**
 * Helper function to create test via API
 */
export async function createExampleTest(example: CreateTestRequest) {
  const response = await fetch('/api/ab-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(example),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create test')
  }

  return response.json()
}

/**
 * Create all example tests (for development/testing)
 */
export async function createAllExamples() {
  const examples = [
    contentTest,
    hashtagTest,
    ctaTest,
    mixedTest,
    emojiTest,
  ]

  const results = []
  for (const example of examples) {
    try {
      const result = await createExampleTest(example)
      results.push({ success: true, name: example.name, ...result })
      console.log(`✓ Created: ${example.name}`)
    } catch (error: any) {
      results.push({ success: false, name: example.name, error: error.message })
      console.error(`✗ Failed: ${example.name} - ${error.message}`)
    }
  }

  return results
}

/**
 * Export all examples
 */
export const examples = {
  contentTest,
  hashtagTest,
  ctaTest,
  mixedTest,
  emojiTest,
}
