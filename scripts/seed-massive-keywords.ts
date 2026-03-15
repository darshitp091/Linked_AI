import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const categories = [
  'Real Estate', 'SaaS', 'Human Resources', 'Sales', 'Digital Marketing',
  'Legal', 'Healthcare', 'E-commerce', 'Finance', 'Education',
  'Coaching', 'Consulting', 'Tech Recruiting', 'Product Management', 'Entrepreneurs',
  'Software Development', 'Customer Success', 'Project Management', 'Data Science', 'Graphic Design'
]

const modifiers = [
  'AI LinkedIn Automation',
  'LinkedIn Content Strategy',
  'Personal Branding Tool',
  'Lead Generation Automation',
  'Post Generator for',
  'LinkedIn Hook Generator',
  'Viral Content Tool for',
  'LinkedIn Networking for',
  'AI Ghostwriter for',
  'Social Selling for',
  'LinkedIn Profile Optimization for',
  'Engagement Growth Tool for',
  'Automated Outreaching for',
  'B2B Marketing for',
  'LinkedIn Training for'
]

import slugify from 'slugify'

async function seedKeywords() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🚀 Generating 1000+ industry keywords...')

  const keywords: any[] = []

  // Generate a massive matrix
  for (const category of categories) {
    for (const modifier of modifiers) {
      // Basic combination
      const k1 = `${modifier} ${category}`
      keywords.push({
        keyword: k1,
        slug: slugify(k1, { lower: true, strict: true }),
        category: category,
        status: 'pending',
        relevance_score: 0.9,
        source: 'Programmatic-Matrix'
      })

      // Variation 1
      const k2 = `Best ${modifier} for ${category}`
      keywords.push({
        keyword: k2,
        slug: slugify(k2, { lower: true, strict: true }),
        category: category,
        status: 'pending',
        relevance_score: 0.85,
        source: 'Programmatic-Matrix'
      })

      // Variation 2
      const k3 = `How to use ${modifier} in ${category}`
      keywords.push({
        keyword: k3,
        slug: slugify(k3, { lower: true, strict: true }),
        category: category,
        status: 'pending',
        relevance_score: 0.8,
        source: 'Programmatic-Matrix'
      })
      
      // Variation 3 (Niche specific)
      const k4 = `${category} ${modifier} Expert`
      keywords.push({
        keyword: k4,
        slug: slugify(k4, { lower: true, strict: true }),
        category: category,
        status: 'pending',
        relevance_score: 0.75,
        source: 'Programmatic-Matrix'
      })
    }
  }

  console.log(`Generated ${keywords.length} keywords. Seeding to database...`)

  // Batch insert to avoid timeouts
  const batchSize = 100
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize)
    const { error } = await supabase
      .from('trending_keywords')
      .upsert(batch, { onConflict: 'keyword' })

    if (error) {
      console.error(`Error seeding batch ${i / batchSize}:`, error.message)
    } else {
      console.log(`Seeded batch ${i / batchSize + 1}/${Math.ceil(keywords.length / batchSize)}`)
    }
  }

  console.log('✅ Massive keyword seeding complete!')
}

seedKeywords()
