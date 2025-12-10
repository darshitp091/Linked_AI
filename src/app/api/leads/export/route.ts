import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lead_ids, format = 'csv' } = body

    // Fetch leads
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)

    if (lead_ids && lead_ids.length > 0) {
      query = query.in('id', lead_ids)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads to export' }, { status: 400 })
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Full Name',
        'Job Title',
        'Company',
        'Location',
        'LinkedIn URL',
        'Headline',
        'Lead Score',
        'Status',
        'Tags',
        'Engagement Count',
        'Last Engaged',
        'Notes',
        'Created At'
      ]

      const rows = leads.map(lead => [
        lead.full_name || '',
        lead.job_title || '',
        lead.company || '',
        lead.location || '',
        lead.linkedin_url,
        lead.headline || '',
        lead.lead_score,
        lead.status,
        (lead.tags || []).join('; '),
        lead.engagement_count,
        lead.last_engaged_at || '',
        lead.notes || '',
        lead.created_at
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-export-${Date.now()}.csv"`
        }
      })
    } else if (format === 'json') {
      return NextResponse.json({ leads })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
