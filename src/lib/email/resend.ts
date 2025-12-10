import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendPasswordResetEmailParams {
  to: string
  resetLink: string
}

export async function sendPasswordResetEmail({ to, resetLink }: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: 'Reset your LinkedAI password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #0a66c2;">LinkedAI</h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">Reset your password</h2>
                        <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #6b7280;">
                          We received a request to reset your password for your LinkedAI account. Click the button below to choose a new password.
                        </p>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 16px 0;">
                              <a href="${resetLink}" style="display: inline-block; background-color: #0a66c2; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 8px 0 0; font-size: 14px; word-break: break-all; color: #0a66c2;">
                          ${resetLink}
                        </p>

                        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            <strong>Important:</strong> This link will expire in 1 hour.
                          </p>
                          <p style="margin: 12px 0 0; font-size: 14px; color: #6b7280;">
                            If you didn't request a password reset, you can safely ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                          © ${new Date().getFullYear()} LinkedAI. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      return { success: false, error }
    }

    console.log('Password reset email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}
