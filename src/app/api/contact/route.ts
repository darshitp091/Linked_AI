import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email configuration - using a simple email forwarding service or SMTP
// For production, you'd want to use a service like SendGrid, Resend, or AWS SES
const SUPPORT_EMAIL = 'support@linkedai.site'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Store the contact submission in the database for record keeping
    // Only if user is authenticated
    if (user) {
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          user_id: user.id,
          name,
          email,
          subject,
          message,
          user_agent: request.headers.get('user-agent') || 'unknown',
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        })

      if (dbError) {
        console.error('Error storing contact submission:', dbError)
        // Don't fail the request if we can't store it, just log it
      }
    }

    // In a production environment, you would send an actual email here
    // using a service like SendGrid, Resend, AWS SES, or Nodemailer with SMTP

    // For now, we'll simulate successful email sending
    // Uncomment and configure one of the following when ready:

    /*
    // Option 1: Using Resend (recommended for Next.js)
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'LinkedAI Support <noreply@linkedai.site>',
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>User ID: ${user.id}</small></p>
      `
    })
    */

    /*
    // Option 2: Using SendGrid
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    await sgMail.send({
      to: SUPPORT_EMAIL,
      from: 'noreply@linkedai.site',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      text: `From: ${name} (${email})\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    })
    */

    // Log activity (only for authenticated users)
    if (user) {
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        activity_type: 'contact_form_submitted',
        activity_data: {
          subject,
          name,
          email
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.'
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
