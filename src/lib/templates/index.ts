export interface PostTemplate {
  id: string
  name: string
  category: 'thought-leadership' | 'announcement' | 'educational' | 'engagement' | 'storytelling' | 'tips'
  description: string
  template: string
  tone: 'professional' | 'casual' | 'inspirational' | 'informative'
  hashtags: string[]
  variables?: string[]
}

export const postTemplates: PostTemplate[] = [
  // Thought Leadership
  {
    id: 'tl-insight',
    name: 'Industry Insight',
    category: 'thought-leadership',
    description: 'Share your perspective on industry trends',
    tone: 'professional',
    template: `I've been thinking a lot about {topic} lately.

Here's what I've learned:

{insight_1}

{insight_2}

{insight_3}

What's your take on this? I'd love to hear your perspective.`,
    hashtags: ['#Leadership', '#Innovation', '#BusinessStrategy'],
    variables: ['topic', 'insight_1', 'insight_2', 'insight_3']
  },
  {
    id: 'tl-prediction',
    name: 'Future Prediction',
    category: 'thought-leadership',
    description: 'Share predictions about industry future',
    tone: 'professional',
    template: `🔮 My prediction for {industry} in {year}:

{prediction}

Why I believe this:
• {reason_1}
• {reason_2}
• {reason_3}

Agree or disagree? Let's discuss in the comments.`,
    hashtags: ['#FutureTrends', '#Innovation'],
    variables: ['industry', 'year', 'prediction', 'reason_1', 'reason_2', 'reason_3']
  },

  // Announcements
  {
    id: 'ann-milestone',
    name: 'Milestone Announcement',
    category: 'announcement',
    description: 'Celebrate achievements and milestones',
    tone: 'professional',
    template: `🎉 Exciting news!

{announcement}

This wouldn't have been possible without:
{acknowledgment}

Grateful for this journey and excited for what's next!

{call_to_action}`,
    hashtags: ['#Milestone', '#Growth', '#Success'],
    variables: ['announcement', 'acknowledgment', 'call_to_action']
  },
  {
    id: 'ann-launch',
    name: 'Product Launch',
    category: 'announcement',
    description: 'Announce new product or feature',
    tone: 'professional',
    template: `🚀 Launching {product_name}!

We built this to solve {problem}

Key features:
✅ {feature_1}
✅ {feature_2}
✅ {feature_3}

{cta}`,
    hashtags: ['#ProductLaunch', '#Innovation'],
    variables: ['product_name', 'problem', 'feature_1', 'feature_2', 'feature_3', 'cta']
  },

  // Educational
  {
    id: 'edu-howto',
    name: 'How-To Guide',
    category: 'educational',
    description: 'Step-by-step guide or tutorial',
    tone: 'informative',
    template: `📚 How to {goal}:

Step 1: {step_1}
Step 2: {step_2}
Step 3: {step_3}
Step 4: {step_4}

Pro tip: {pro_tip}

Have you tried this approach? What worked for you?`,
    hashtags: ['#Tutorial', '#Learning', '#Tips'],
    variables: ['goal', 'step_1', 'step_2', 'step_3', 'step_4', 'pro_tip']
  },
  {
    id: 'edu-mistakes',
    name: 'Common Mistakes',
    category: 'educational',
    description: 'Highlight mistakes and solutions',
    tone: 'informative',
    template: `❌ {number} mistakes I see in {domain}:

1. {mistake_1}
   ✅ Instead: {solution_1}

2. {mistake_2}
   ✅ Instead: {solution_2}

3. {mistake_3}
   ✅ Instead: {solution_3}

Have you made any of these? You're not alone!`,
    hashtags: ['#Learning', '#BestPractices'],
    variables: ['number', 'domain', 'mistake_1', 'solution_1', 'mistake_2', 'solution_2', 'mistake_3', 'solution_3']
  },

  // Engagement
  {
    id: 'eng-question',
    name: 'Engagement Question',
    category: 'engagement',
    description: 'Ask thought-provoking questions',
    tone: 'casual',
    template: `💭 Quick question for my network:

{question}

I'm curious because {context}

What do you think? Drop your thoughts in the comments!`,
    hashtags: ['#Discussion', '#Community'],
    variables: ['question', 'context']
  },
  {
    id: 'eng-poll',
    name: 'Opinion Poll',
    category: 'engagement',
    description: 'Get opinions from your network',
    tone: 'casual',
    template: `📊 I need your input on {topic}:

Option A: {option_a}
Option B: {option_b}
Option C: {option_c}

Vote in the comments and tell me why!

Context: {context}`,
    hashtags: ['#Poll', '#YourOpinion'],
    variables: ['topic', 'option_a', 'option_b', 'option_c', 'context']
  },

  // Storytelling
  {
    id: 'story-lesson',
    name: 'Story with Lesson',
    category: 'storytelling',
    description: 'Share personal story with takeaway',
    tone: 'inspirational',
    template: `{timeframe} ago, {situation}

I learned {lesson}

Here's what happened:

{story}

The takeaway?
{takeaway}

Have you experienced something similar?`,
    hashtags: ['#Lessons', '#Growth', '#Story'],
    variables: ['timeframe', 'situation', 'lesson', 'story', 'takeaway']
  },
  {
    id: 'story-journey',
    name: 'Journey Story',
    category: 'storytelling',
    description: 'Share your professional journey',
    tone: 'inspirational',
    template: `My journey from {start} to {end}:

Where I started:
{beginning}

The turning point:
{turning_point}

Where I am now:
{current}

Key lesson: {lesson}

To anyone on a similar path: {advice}`,
    hashtags: ['#Journey', '#CareerGrowth', '#Inspiration'],
    variables: ['start', 'end', 'beginning', 'turning_point', 'current', 'lesson', 'advice']
  },

  // Tips & Lists
  {
    id: 'tips-quick',
    name: 'Quick Tips',
    category: 'tips',
    description: 'Share actionable tips',
    tone: 'informative',
    template: `💡 {number} quick tips for {topic}:

1️⃣ {tip_1}

2️⃣ {tip_2}

3️⃣ {tip_3}

4️⃣ {tip_4}

5️⃣ {tip_5}

Which one resonates with you most?`,
    hashtags: ['#Tips', '#Productivity'],
    variables: ['number', 'topic', 'tip_1', 'tip_2', 'tip_3', 'tip_4', 'tip_5']
  },
  {
    id: 'tips-resources',
    name: 'Resource List',
    category: 'tips',
    description: 'Curated list of resources',
    tone: 'informative',
    template: `📚 Top {number} resources for {topic}:

1. {resource_1} - {description_1}

2. {resource_2} - {description_2}

3. {resource_3} - {description_3}

All are {qualifier} and helped me {benefit}

Bookmark this for later! 🔖`,
    hashtags: ['#Resources', '#Learning'],
    variables: ['number', 'topic', 'resource_1', 'description_1', 'resource_2', 'description_2', 'resource_3', 'description_3', 'qualifier', 'benefit']
  }
]

export function getTemplatesByCategory(category: PostTemplate['category']) {
  return postTemplates.filter(t => t.category === category)
}

export function getTemplateById(id: string) {
  return postTemplates.find(t => t.id === id)
}

export function getAllCategories() {
  return Array.from(new Set(postTemplates.map(t => t.category)))
}
