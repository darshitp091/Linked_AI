const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const blogPosts = [
  {
    title: 'How to Write LinkedIn Posts That Get Engagement',
    excerpt: 'The first two lines of your LinkedIn post are the most critical. This is where users decide whether to click "see more." High-engagement hooks usually evoke curiosity, challenge a common belief, or offer immediate value.',
    category: 'Content Strategy',
    author: 'Patel Darshit',
    slug: 'linkedin-posts-engagement',
    image_url: '/blog/linkedin-automation-cover-1.png',
    content: `Building engagement on LinkedIn is an art and a science. The platform’s algorithm rewards posts that spark conversations and keep users on the site.

### 1. The Hook is Everything
The first 140 characters of your post are the most important. You need to grab attention immediately. Use questions, bold statements, or direct statistics.

### 2. Formatting for Scannability
People don't read on LinkedIn; they scan. Use short sentences, bullet points, and plenty of white space. Avoid large blocks of text.

### 3. The Call to Conversation
Don't just end with a period. End with a question. Ask for opinions, experiences, or advice. This triggers the algorithm to show your post to the networks of the people who comment.

### Conclusion
Consistency is key. Post daily, interact with your commenters, and keep your content focused on your niche authority.`,
    is_published: true,
    published_at: '2024-03-15T12:00:00Z'
  },
  {
    title: 'AI in Content Creation: A Complete Guide for Professionals',
    excerpt: 'Artificial Intelligence is no longer a futuristic concept; it\'s a present-day tool that is revolutionizing how we work. For LinkedIn creators, AI is the ultimate co-pilot for brainstorming, drafting, and optimizing content.',
    category: 'AI & Technology',
    author: 'Anshul Singh Baghel',
    slug: 'ai-content-creation-guide',
    image_url: '/blog/ai-content-creation-cover-2.png',
    content: `AI is transforming the way we create professional content. From brainstorming to final polish, tools like LinkedAI are making it easier than ever to maintain a consistent presence.

### 1. Brainstorming with AI
Never stare at a blank screen again. Use AI to generate 10 variations of a topic and pick the one that resonates most with your personal style.

### 2. Drafting and Refinement
AI is excellent at creating first drafts. Once you have a structure, add your personal stories, unique insights, and voice. AI provides the skeleton; you provide the soul.

### 3. Optimization
SEO and readability are critical. AI can help you identify keywords and simplify complex sentences to make your content more accessible.

### Conclusion
Embrace AI as your co-pilot. It handles the repetitive parts of content creation, allowing you to focus on strategy and high-level networking.`,
    is_published: true,
    published_at: '2024-03-12T12:00:00Z'
  },
  {
    title: 'Building Your Personal Brand on LinkedIn in 2024',
    excerpt: 'Your personal brand is what people say about you when you\'re not in the room. On LinkedIn, your brand is your digital reputation. It’s the difference between being a commodity and being an authority.',
    category: 'Personal Branding',
    author: 'Rishi Jain',
    slug: 'personal-brand-linkedin',
    image_url: '/blog/personal-branding-cover-3.png',
    content: `In 2024, your LinkedIn profile is your professional landing page. Building a personal brand is about clarity and consistency.

### 1. Define Your Niche
What do you want to be known for? Pick 2-3 core topics and stick to them. Authority comes from depth, not breadth.

### 2. Optimize Your Profile
Your headline shouldn't just be your job title. It should be the problem you solve for others. Use a professional headshot and a custom banner.

### 3. Content is the Engine
Content is how you stay top-of-mind. Share your wins, but also your lessons from failure. Vulnerability builds trust.

### Conclusion
Your brand is an investment. The more value you provide to others through your content and interactions, the faster your authority will grow.`,
    is_published: true,
    published_at: '2024-03-10T12:00:00Z'
  }
]

async function seed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Seeding initial blog posts...')

  for (const post of blogPosts) {
    const { error } = await supabase
      .from('blog_posts')
      .upsert(post, { onConflict: 'slug' })

    if (error) {
      console.error(`Error seeding post "${post.title}":`, error)
    } else {
      console.log(`Successfully seeded: ${post.title}`)
    }
  }

  // Also seed some initial keywords
  const initialKeywords = [
    { keyword: 'LinkedIn AI Automation', category: 'Automation', status: 'pending', relevance_score: 0.95 },
    { keyword: 'How to use Groq for LinkedIn', category: 'AI', status: 'pending', relevance_score: 0.9 },
    { keyword: 'LinkedIn Personal Branding Tips 2025', category: 'Branding', status: 'pending', relevance_score: 0.85 }
  ]

  console.log('Seeding initial trending keywords...')
  const { error: kwError } = await supabase
    .from('trending_keywords')
    .upsert(initialKeywords, { onConflict: 'keyword' })

  if (kwError) {
    console.error('Error seeding keywords:', kwError)
  }

  console.log('Seeding complete!')
}

seed()
