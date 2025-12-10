/**
 * AI-Powered Best Time to Post Analysis
 * Analyzes historical post performance to recommend optimal posting times
 */

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface PostPerformance {
  id: string
  content: string
  published_at: string
  engagement_score: number
  views?: number
  likes?: number
  comments?: number
  shares?: number
}

export interface TimeSlot {
  day: string // 'Monday', 'Tuesday', etc.
  hour: number // 0-23
  score: number // 0-100
  avgEngagement: number
  postCount: number
}

export interface BestTimeRecommendation {
  recommendedSlots: TimeSlot[]
  insights: string
  confidence: number
  analysisDate: string
}

/**
 * Analyze user's historical post performance
 */
export async function analyzeUserPostingPatterns(
  userId: string
): Promise<{ patterns: TimeSlot[]; posts: PostPerformance[] }> {
  const supabase = await createClient()

  // Get all published posts with their performance metrics
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      published_at,
      linkedin_post_id
    `)
    .eq('user_id', userId)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(100)

  if (error || !posts || posts.length === 0) {
    return { patterns: [], posts: [] }
  }

  // Get analytics for these posts (if available)
  const postIds = posts.map((p) => p.id)
  const { data: analytics } = await supabase
    .from('post_analytics')
    .select('post_id, views, likes, comments, shares, engagement_rate')
    .in('post_id', postIds)

  // Calculate engagement scores
  const postsWithPerformance: PostPerformance[] = posts.map((post) => {
    const analytic = analytics?.find((a) => a.post_id === post.id)

    // Calculate engagement score (weighted)
    const views = analytic?.views || 0
    const likes = analytic?.likes || 0
    const comments = analytic?.comments || 0
    const shares = analytic?.shares || 0

    const engagementScore = (
      likes * 1 +
      comments * 3 +
      shares * 5 +
      (views / 100)
    )

    return {
      id: post.id,
      content: post.content.substring(0, 100),
      published_at: post.published_at!,
      engagement_score: engagementScore,
      views,
      likes,
      comments,
      shares,
    }
  })

  // Group by day and hour
  const patterns: Map<string, { total: number; count: number; day: string; hour: number }> = new Map()

  postsWithPerformance.forEach((post) => {
    const date = new Date(post.published_at)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = date.getHours()
    const key = `${day}-${hour}`

    if (!patterns.has(key)) {
      patterns.set(key, { total: 0, count: 0, day, hour })
    }

    const pattern = patterns.get(key)!
    pattern.total += post.engagement_score
    pattern.count += 1
  })

  // Convert to TimeSlot array with scores
  const timeSlots: TimeSlot[] = Array.from(patterns.entries()).map(([key, data]) => {
    const avgEngagement = data.count > 0 ? data.total / data.count : 0

    // Normalize score to 0-100
    const maxEngagement = Math.max(...Array.from(patterns.values()).map(p => p.total / p.count))
    const score = maxEngagement > 0 ? (avgEngagement / maxEngagement) * 100 : 0

    return {
      day: data.day,
      hour: data.hour,
      score: Math.round(score),
      avgEngagement: Math.round(avgEngagement),
      postCount: data.count,
    }
  })

  // Sort by score
  timeSlots.sort((a, b) => b.score - a.score)

  return { patterns: timeSlots, posts: postsWithPerformance }
}

/**
 * Generate AI-powered recommendations using Gemini
 */
export async function generateBestTimeRecommendations(
  userId: string
): Promise<BestTimeRecommendation> {
  const { patterns, posts } = await analyzeUserPostingPatterns(userId)

  // If not enough data, return default recommendations
  if (posts.length < 5) {
    return {
      recommendedSlots: getDefaultRecommendations(),
      insights: "Not enough historical data yet. We recommend posting during typical business hours (9 AM - 5 PM on weekdays) to maximize engagement. As you publish more posts, we'll provide personalized recommendations based on your audience's behavior.",
      confidence: 0,
      analysisDate: new Date().toISOString(),
    }
  }

  // Prepare data for AI analysis
  const topSlots = patterns.slice(0, 10)
  const analyticsData = {
    totalPosts: posts.length,
    avgEngagement: posts.reduce((sum, p) => sum + p.engagement_score, 0) / posts.length,
    topPerformingTimes: topSlots,
    dateRange: {
      start: posts[posts.length - 1]?.published_at,
      end: posts[0]?.published_at,
    },
  }

  // Generate AI insights
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a LinkedIn content strategist analyzing posting patterns. Based on the following data, provide insights about the best times to post:

Historical Data:
- Total posts analyzed: ${analyticsData.totalPosts}
- Average engagement score: ${analyticsData.avgEngagement.toFixed(2)}
- Date range: ${new Date(analyticsData.dateRange.start || '').toLocaleDateString()} to ${new Date(analyticsData.dateRange.end || '').toLocaleDateString()}

Top Performing Time Slots:
${topSlots.map((slot, i) => `${i + 1}. ${slot.day} at ${formatHour(slot.hour)} - Score: ${slot.score}/100 (${slot.postCount} posts, avg engagement: ${slot.avgEngagement})`).join('\n')}

Provide:
1. Key insights about when this user's audience is most engaged (2-3 sentences)
2. Specific recommendations for days and times to post
3. Any patterns you notice (e.g., weekday vs weekend performance, morning vs evening)
4. One actionable tip to improve engagement

Keep the response concise and actionable (max 200 words).`

  const result = await model.generateContent(prompt)
  const insights = result.response.text()

  // Calculate confidence based on data quality
  const confidence = Math.min(100, Math.round((posts.length / 20) * 100))

  return {
    recommendedSlots: topSlots.slice(0, 5),
    insights,
    confidence,
    analysisDate: new Date().toISOString(),
  }
}

/**
 * Get default recommendations for new users
 */
function getDefaultRecommendations(): TimeSlot[] {
  return [
    { day: 'Tuesday', hour: 10, score: 90, avgEngagement: 0, postCount: 0 },
    { day: 'Wednesday', hour: 14, score: 88, avgEngagement: 0, postCount: 0 },
    { day: 'Thursday', hour: 9, score: 85, avgEngagement: 0, postCount: 0 },
    { day: 'Tuesday', hour: 15, score: 82, avgEngagement: 0, postCount: 0 },
    { day: 'Friday', hour: 11, score: 80, avgEngagement: 0, postCount: 0 },
  ]
}

/**
 * Format hour to readable time
 */
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

/**
 * Get next recommended posting time
 */
export async function getNextBestTime(
  userId: string,
  afterDate?: Date
): Promise<{ date: Date; reason: string } | null> {
  const { recommendedSlots } = await generateBestTimeRecommendations(userId)

  if (recommendedSlots.length === 0) return null

  const now = afterDate || new Date()
  const currentDay = now.getDay() // 0-6 (Sunday-Saturday)
  const currentHour = now.getHours()

  // Map day names to numbers
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }

  // Find the next best time slot
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDay = (currentDay + daysAhead) % 7

    for (const slot of recommendedSlots) {
      const slotDay = dayMap[slot.day]

      if (slotDay === checkDay) {
        // If it's today, check if the hour hasn't passed
        if (daysAhead === 0 && slot.hour <= currentHour) continue

        // Calculate the exact date/time
        const nextDate = new Date(now)
        nextDate.setDate(nextDate.getDate() + daysAhead)
        nextDate.setHours(slot.hour, 0, 0, 0)

        return {
          date: nextDate,
          reason: `${slot.day} at ${formatHour(slot.hour)} typically gets ${slot.score}% engagement`,
        }
      }
    }
  }

  // Fallback to first recommendation
  const bestSlot = recommendedSlots[0]
  const daysUntil = (dayMap[bestSlot.day] - currentDay + 7) % 7
  const nextDate = new Date(now)
  nextDate.setDate(nextDate.getDate() + daysUntil)
  nextDate.setHours(bestSlot.hour, 0, 0, 0)

  return {
    date: nextDate,
    reason: `${bestSlot.day} at ${formatHour(bestSlot.hour)} is your best performing time`,
  }
}

/**
 * Check if plan has access to Best Time to Post feature
 */
export function hasBestTimeAccess(plan: string): boolean {
  return ['pro', 'standard', 'custom'].includes(plan.toLowerCase())
}
