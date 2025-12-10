import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validateABTestConfig, suggestTrafficSplit } from '@/lib/ab-testing'
import { canCreateABTest, canCreateVariants, canCreateMoreTests } from '@/lib/ab-testing/plan-limits'

/**
 * GET /api/ab-tests - List all A/B tests for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(
          id,
          variant_name,
          variant_label,
          traffic_percentage,
          views,
          likes,
          comments,
          shares,
          clicks,
          engagement_rate,
          is_winner,
          post:posts(id, content, status, published_at)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: tests, error } = await query

    if (error) {
      console.error('Error fetching A/B tests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch A/B tests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching A/B tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ab-tests - Create a new A/B test
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.subscription_plan || 'free'

    // Check if user can create A/B tests
    if (!canCreateABTest(plan)) {
      return NextResponse.json(
        {
          error: 'A/B Testing is not available on your plan',
          requiresUpgrade: true,
          requiredPlan: 'standard'
        },
        { status: 403 }
      )
    }

    // Check active tests limit
    const { count: activeTestsCount } = await supabase
      .from('ab_tests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['draft', 'active'])

    const canCreate = canCreateMoreTests(plan, activeTestsCount || 0)
    if (!canCreate.allowed) {
      return NextResponse.json(
        { error: canCreate.message },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      test_type = 'content',
      variants,
      duration_hours,
      min_sample_size = 100,
      confidence_level = 0.95,
      auto_promote_winner = false,
    } = body

    if (!name || !variants || variants.length < 2) {
      return NextResponse.json(
        { error: 'Name and at least 2 variants are required' },
        { status: 400 }
      )
    }

    // Check variant count limit
    const variantCheck = canCreateVariants(plan, variants.length)
    if (!variantCheck.allowed) {
      return NextResponse.json(
        { error: variantCheck.message },
        { status: 403 }
      )
    }

    // Validate configuration
    const validation = validateABTestConfig({
      name,
      description,
      test_type,
      variants,
      duration_hours,
      min_sample_size,
      confidence_level,
      auto_promote_winner,
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      )
    }

    // Create the A/B test
    const { data: test, error: testError } = await adminClient
      .from('ab_tests')
      .insert({
        user_id: user.id,
        name,
        description,
        test_type,
        status: 'draft',
        duration_hours,
        min_sample_size,
        confidence_level,
        auto_promote_winner,
      })
      .select()
      .single()

    if (testError) {
      console.error('Error creating A/B test:', testError)
      return NextResponse.json(
        { error: 'Failed to create A/B test' },
        { status: 500 }
      )
    }

    // Create posts and variants for each variant
    const createdVariants = []
    for (const variant of variants) {
      // Create post for this variant
      const { data: post, error: postError } = await adminClient
        .from('posts')
        .insert({
          user_id: user.id,
          content: variant.content,
          topic: variant.topic,
          hashtags: variant.hashtags || [],
          media_urls: variant.media_urls || [],
          status: 'draft',
        })
        .select()
        .single()

      if (postError) {
        console.error('Error creating post for variant:', postError)
        // Cleanup: delete the test
        await adminClient.from('ab_tests').delete().eq('id', test.id)
        return NextResponse.json(
          { error: 'Failed to create variant posts' },
          { status: 500 }
        )
      }

      // Create variant record
      const { data: createdVariant, error: variantError } = await adminClient
        .from('ab_test_variants')
        .insert({
          ab_test_id: test.id,
          post_id: post.id,
          variant_name: variant.variant_name,
          variant_label: variant.variant_label,
          traffic_percentage: variant.traffic_percentage,
        })
        .select()
        .single()

      if (variantError) {
        console.error('Error creating variant:', variantError)
        // Cleanup: delete the test
        await adminClient.from('ab_tests').delete().eq('id', test.id)
        return NextResponse.json(
          { error: 'Failed to create variants' },
          { status: 500 }
        )
      }

      createdVariants.push({ ...createdVariant, post })
    }

    return NextResponse.json({
      success: true,
      test: {
        ...test,
        variants: createdVariants,
      },
    })
  } catch (error: any) {
    console.error('Error creating A/B test:', error)
    return NextResponse.json(
      { error: `Failed to create A/B test: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
