import { createAdminClient } from '../supabase/server'
import { ChatGroq } from '@langchain/groq'

const SEO_CATEGORIES = [
  'LinkedIn Marketing',
  'AI for Content Creation',
  'Personal Branding',
  'Social Media Automation',
  'B2B Growth Strategies',
  'Professional Networking',
  'LinkedIn Ghostwriting',
  'Digital Transformation'
]

export async function generateTrendingKeywords() {
  const supabase = createAdminClient()
  const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  })

  try {
    console.log('[SEO Scraper] Brainstorming trending keywords with AI...')
    
    const prompt = `
      As a LinkedIn SEO expert, brainstorm 20 high-volume, trending keywords or long-tail topics for LinkedIn content creators in 2024-2025.
      Focus on these categories: ${SEO_CATEGORIES.join(', ')}.
      
      Return the result as a raw JSON array of objects with the following structure:
      {
        "keyword": "string",
        "category": "string",
        "relevance_score": number (0-1)
      }
      
      Do not include any other text in your response.
    `

    const response = await groq.invoke(prompt)
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
    const keywords = JSON.parse(content.trim())

    console.log(`[SEO Scraper] Successfully brainstormed ${keywords.length} keywords.`)

    // Insert into DB, ignoring duplicates
    const { data, error } = await supabase
      .from('trending_keywords')
      .upsert(
        keywords.map((k: any) => ({
          keyword: k.keyword,
          category: k.category,
          relevance_score: k.relevance_score,
          status: 'pending'
        })),
        { onConflict: 'keyword' }
      )

    if (error) throw error

    return keywords
  } catch (error) {
    console.error('[SEO Scraper] Error generating keywords:', error)
    throw error
  }
}
