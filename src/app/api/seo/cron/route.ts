import { NextRequest, NextResponse } from 'next/server'
import { generateTrendingKeywords } from '@/lib/seo/scraper'
import { generateSEOArticle } from '@/lib/seo/generator'
import { notifyGoogleIndexing } from '@/lib/google-indexing/client'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const action = searchParams.get('action') // brainstorm | generate

  // Verify secret
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    if (action === 'brainstorm') {
      const keywords = await generateTrendingKeywords()
      return NextResponse.json({ 
        message: 'Successfully brainstormed keywords', 
        count: keywords.length 
      })
    }

    if (action === 'generate') {
      // Pick one pending keyword
      const { data: keywordObj, error: fetchError } = await supabase
        .from('trending_keywords')
        .select('*')
        .eq('status', 'pending')
        .order('relevance_score', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !keywordObj) {
        return NextResponse.json({ message: 'No pending keywords found' })
      }

      // Mark as processing
      await supabase
        .from('trending_keywords')
        .update({ status: 'processing' })
        .eq('id', keywordObj.id)

      // Generate article
      const blogPost = await generateSEOArticle(keywordObj.keyword)

      // Notify Google Indexing
      if (blogPost && blogPost.slug) {
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${blogPost.slug}`
        await notifyGoogleIndexing(url)
      }

      return NextResponse.json({ 
        message: 'Successfully generated and indexed article', 
        title: blogPost.title,
        slug: blogPost.slug
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[SEO Cron] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
