import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LinkedAI <noreply@linkedai.site>'

// Helper function to load HTML template
function loadTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`)
  return fs.readFileSync(templatePath, 'utf-8')
}

// Helper function to replace variables in template
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })
  return result
}

// Email sending functions

export interface PaymentSuccessEmailParams {
  to: string
  name: string
  plan: string
  amount: string
  currency?: string
  invoiceUrl: string
  nextBillingDate: string
}

export async function sendPaymentSuccessEmail(params: PaymentSuccessEmailParams) {
  try {
    const template = loadTemplate('payment-success')
    const html = replaceVariables(template, {
      name: params.name,
      plan: params.plan,
      amount: params.amount,
      currency: params.currency || 'INR',
      invoiceUrl: params.invoiceUrl,
      nextBillingDate: params.nextBillingDate,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Payment Successful - LinkedAI ${params.plan}`,
      html,
    })

    if (error) {
      console.error('Failed to send payment success email:', error)
      return { success: false, error }
    }

    console.log('Payment success email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment success email:', error)
    return { success: false, error }
  }
}

export interface PaymentFailedEmailParams {
  to: string
  name: string
  plan: string
  amount: string
  retryUrl: string
}

export async function sendPaymentFailedEmail(params: PaymentFailedEmailParams) {
  try {
    const template = loadTemplate('payment-failed')
    const html = replaceVariables(template, {
      name: params.name,
      plan: params.plan,
      amount: params.amount,
      retryUrl: params.retryUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Payment Failed - LinkedAI Subscription',
      html,
    })

    if (error) {
      console.error('Failed to send payment failed email:', error)
      return { success: false, error }
    }

    console.log('Payment failed email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment failed email:', error)
    return { success: false, error }
  }
}

export interface WelcomeEmailParams {
  to: string
  name: string
  email: string
}

export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  try {
    const template = loadTemplate('welcome-email')
    const html = replaceVariables(template, {
      name: params.name,
      email: params.email,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Welcome to LinkedAI! 🎉',
      html,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export interface EmailConfirmationParams {
  to: string
  email: string
  confirmationLink: string
}

export async function sendEmailConfirmation(params: EmailConfirmationParams) {
  try {
    const template = loadTemplate('email-confirmation')
    const html = replaceVariables(template, {
      email: params.email,
      confirmationLink: params.confirmationLink,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Confirm your LinkedAI email address',
      html,
    })

    if (error) {
      console.error('Failed to send email confirmation:', error)
      return { success: false, error }
    }

    console.log('Email confirmation sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email confirmation:', error)
    return { success: false, error }
  }
}

export interface PostPublishedEmailParams {
  to: string
  name: string
  postContent: string
  postUrl: string
  scheduledDate: string
  dashboardUrl: string
}

export async function sendPostPublishedEmail(params: PostPublishedEmailParams) {
  try {
    const template = loadTemplate('post-published')
    const html = replaceVariables(template, {
      name: params.name,
      postContent: params.postContent.substring(0, 150), // Limit to 150 chars
      postUrl: params.postUrl,
      scheduledDate: params.scheduledDate,
      dashboardUrl: params.dashboardUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Your LinkedIn post is live! 📊',
      html,
    })

    if (error) {
      console.error('Failed to send post published email:', error)
      return { success: false, error }
    }

    console.log('Post published email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending post published email:', error)
    return { success: false, error }
  }
}

export interface UsageLimitWarningParams {
  to: string
  name: string
  currentPlan: string
  postsUsed: string
  postsLimit: string
  upgradeUrl: string
}

export async function sendUsageLimitWarning(params: UsageLimitWarningParams) {
  try {
    const template = loadTemplate('usage-limit-warning')
    const html = replaceVariables(template, {
      name: params.name,
      currentPlan: params.currentPlan,
      postsUsed: params.postsUsed,
      postsLimit: params.postsLimit,
      upgradeUrl: params.upgradeUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: "You're approaching your LinkedAI limits",
      html,
    })

    if (error) {
      console.error('Failed to send usage limit warning:', error)
      return { success: false, error }
    }

    console.log('Usage limit warning sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending usage limit warning:', error)
    return { success: false, error }
  }
}

// Export all email functions
export const emailTemplates = {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendWelcomeEmail,
  sendEmailConfirmation,
  sendPostPublishedEmail,
  sendUsageLimitWarning,
}
