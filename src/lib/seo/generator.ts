import { createAdminClient } from '../supabase/server'
import { ChatGroq } from '@langchain/groq'
import slugify from 'slugify'

export async function generateSEOArticle(keyword: string) {
  const supabase = createAdminClient()
  const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  })

  try {
    console.log(`[SEO Generator] Generating article for keyword: "${keyword}"...`)

    const prompt = `
      As a LinkedIn professional ghostwriter and SEO expert, write a high-quality, long-form blog post (800-1200 words) targeting the keyword: "${keyword}".
      
      The post must include:
      1. A catchy H1 title.
      2. An engaging introduction.
      3. Multiple H2 and H3 subsections.
      4. Practical, actionable tips for LinkedIn creators.
      5. A strong conclusion with a call to action.
      6. Strategic but natural keyword placement.
      
      Return the result as a raw JSON object with this structure:
      {
        "title": "Full H1 Title",
        "seo_title": "SEO Optimized Title (under 60 chars)",
        "seo_description": "Meta description (under 160 chars)",
        "excerpt": "A short 2-sentence teaser",
        "category": "One category from: Content Strategy, AI, Branding, Automation",
        "content": "Full article content in Markdown format"
      }
      
      Do not include any other text or markdown wrappers like \`\`\`json in your response.
    `

    const response = await groq.invoke(prompt)
    const contentStr = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
    
    // Clean potential markdown junk from AI response
    const cleanJson = contentStr.replace(/```json/g, '').replace(/```/g, '').trim()
    const article = JSON.parse(cleanJson)

    const slug = slugify(article.title, { lower: true, strict: true })

    console.log(`[SEO Generator] Successfully generated article: "${article.title}"`)

    // Save to DB
    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title: article.title,
        slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        seo_title: article.seo_title,
        seo_description: article.seo_description,
        keyword: keyword,
        is_published: true,
        is_programmatic: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Mark keyword as completed
    await supabase
      .from('trending_keywords')
      .update({ status: 'completed' })
      .eq('keyword', keyword)

    return blogPost
  } catch (error) {
    console.error(`[SEO Generator] Error for keyword "${keyword}":`, error)
    // Mark keyword as pending again so it can be retried or mark as error if we had an error status
    await supabase
      .from('trending_keywords')
      .update({ status: 'pending' })
      .eq('keyword', keyword)
    throw error
  }
}
