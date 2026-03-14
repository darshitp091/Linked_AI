import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const blogPosts = {
  'linkedin-posts-engagement': {
    title: 'How to Write LinkedIn Posts That Get Engagement',
    content: `
      <p>In today's digital landscape, LinkedIn has evolved from a simple job-seeking platform into a powerful professional network. However, with the increase in users comes an increase in "noise." To stand out, you need a strategy that goes beyond simple status updates.</p>
      
      <h2>1. The Art of the Hook</h2>
      <p>The first two lines of your LinkedIn post are the most critical. This is where users decide whether to click "see more." High-engagement hooks usually evoke curiosity, challenge a common belief, or offer immediate value. For example, instead of saying "I had a great meeting today," try "The biggest mistake I've seen in B2B sales cost a client $50k last month."</p>

      <h2>2. Visual Storytelling</h2>
      <p>Content with images gets 2x more engagement. But not just any image. Use authentic photos of yourself or your team, or high-quality infographics that simplify complex data. LinkedIn is a social network, and people connect with people, not logos.</p>

      <h2>3. Value Over Volume</h2>
      <p>Posting every day is great, but not at the expense of quality. Every post should offer one of three things: Education, Inspiration, or Entertainment (the Professional kind). If you're not helping your audience solve a problem or think differently, they won't engage. Ask yourself: "Would I stop scrolling for this?"</p>

      <h2>4. The Algorithm "Golden Hour"</h2>
      <p>The first 60 minutes after posting are crucial. Engage with every comment as soon as it comes in. This signals to the LinkedIn algorithm that your content is valuable and should be shown to a wider audience.</p>

      <h2>5. The Power of LinkedIn Automation</h2>
      <p>Consistency is key, and this is where tools like LinkedAI come in. By scheduling your posts during peak hours, you ensure maximum visibility. But don't just "set it and forget it." Use AI to help you draft different angles for the same topic to see what resonates. Automation should support your strategy, not replace your voice.</p>

      <h2>Conclusion</h2>
      <p>Engagement isn't just about likes; it's about starting conversations. End your posts with a genuine question that invites people to share their own experiences. The LinkedIn algorithm rewards comments more than any other interaction type. Start building your community today, one post at a time.</p>
    `,
    category: 'Content Strategy',
    author: 'Patel Darshit',
    date: 'March 15, 2024',
    readTime: '8 min read',
    image: '/blog/linkedin-automation-cover-1.png'
  },
  'ai-content-creation-guide': {
    title: 'AI in Content Creation: A Complete Guide for Professionals',
    content: `
      <p>Artificial Intelligence is no longer a futuristic concept; it's a present-day tool that is revolutionizing how we work. For LinkedIn creators, AI is the ultimate co-pilot for brainstorming, drafting, and optimizing content. But how do you use it effectively without losing your professional edge?</p>

      <h2>Why Use AI for LinkedIn?</h2>
      <p>Most professionals struggle with "blank page syndrome." AI helps bridge the gap between an idea and a finished post. With models like Groq, you can generate multiple drafts in seconds, allowing you to focus on the final 20% of personalization that makes the content truly yours. It's about efficiency, not replacement.</p>

      <h2>How to Prompt Effectively</h2>
      <p>The quality of AI output depends on the quality of your input. When using a tool like LinkedAI, provide context: Who is your audience? What is the goal of the post? What tone should it have? Instead of "Write a post about leadership," try "Write a post about leadership for junior developers, focusing on the importance of empathy, in a casual but professional tone."</p>

      <h2>The Groq Advantage</h2>
      <p>At LinkedAI, we use Groq's LPU technology to provide near-instant content generation. This allows you to iterate on your ideas in real-time. If you don't like a draft, simply tweak your description and get a fresh angle in milliseconds.</p>

      <h2>Ethics and Personalization</h2>
      <p>Never rely 100% on AI. Your audience follows you for YOUR perspective. Use AI to handle the heavy lifting—formatting, hashtag suggestions, and initial drafting—but always add your personal stories, unique case studies, and contrarian views to the mix. AI is the engine, but you are the driver.</p>

      <h2>Conclusion</h2>
      <p>The future of content creation is collaborative. By embracing AI tools today, you're not just saving time; you're scaling your professional influence. Start experimenting with different styles and see how your engagement grows.</p>
    `,
    category: 'AI & Technology',
    author: 'Anshul Singh Baghel',
    date: 'March 12, 2024',
    readTime: '10 min read',
    image: '/blog/ai-content-creation-cover-2.png'
  },
  'personal-brand-linkedin': {
    title: 'Building Your Personal Brand on LinkedIn in 2024',
    content: `
      <p>Your personal brand is what people say about you when you're not in the room. On LinkedIn, your brand is your digital reputation. It’s the difference between being a commodity and being an authority in your field.</p>

      <h2>Defining Your Niche</h2>
      <p>Stop trying to talk to everyone. The most successful personal brands on LinkedIn are built on a specific "content pillar." Whether it's SaaS growth, mental health for founders, or sustainable engineering, pick 2-3 topics and stay consistent with them. Become the go-to person for that specific knowledge.</p>

      <h2>Optimizing Your Profile</h2>
      <p>Before you start posting, your landing page (profile) must be ready. This includes a professional headshot, a headline that mentions the value you provide (not just your job title), and an "About" section that reads like a story of how you help others, not just a list of achievements.</p>

      <h2>The Art of Connection</h2>
      <p>Personal branding isn't just about broadcasting; it's about connecting. Comment on other people's posts as much as you post your own. Genuine engagement with your peers builds relationships that translate into real-world opportunities.</p>

      <h2>The Compound Effect of Content</h2>
      <p>Building a brand doesn't happen overnight. It’s the result of showing up week after week. By using automation tools like LinkedAI to keep your feed active even when you're busy, you build the "know, like, and trust" factor with your audience through consistent visibility.</p>

      <h2>Conclusion</h2>
      <p>Your brand is your most valuable asset in the modern economy. Start treating it like one today. Share your journey, document your learnings, and watch how the world opens up to you.</p>
    `,
    category: 'Personal Branding',
    author: 'Rishi Jain',
    date: 'March 10, 2024',
    readTime: '12 min read',
    image: '/blog/personal-branding-cover-3.png'
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug as keyof typeof blogPosts]

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link href="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <article className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <Link href="/blog" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0a66c2] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          <div className="space-y-4 mb-12">
            <span className="inline-block px-3 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-xs font-bold">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-gray-900">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-gray-100 shadow-2xl">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:mb-6
              prose-strong:text-gray-900
              prose-a:text-[#0a66c2] hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer / Share */}
          <div className="mt-16 pt-8 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">Share this post:</span>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full w-10 h-10 hover:text-[#0a66c2] p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Link href="/signup">
              <Button className="bg-[#0a66c2] hover:bg-[#004182]">
                Try LinkedAI for Free
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
