import nodemailer from 'nodemailer';
import { prisma } from './db';

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@referralsystem.com';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Create transporter - supports SMTP or test account
const createTransporter = () => {
  // If SMTP config is provided, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development/testing, use ethereal.email or log to console
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass',
      },
    });
  }

  // Fallback: console transport for development
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

const transporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}

async function sendEmail({ to, subject, html, metadata }: EmailOptions): Promise<boolean> {
  try {
    // In development without SMTP, just log the email
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('\n=== EMAIL (Development Mode) ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html.substring(0, 200) + '...');
      console.log('================================\n');

      await prisma.emailLog.create({
        data: {
          to,
          subject,
          template: metadata?.template || 'unknown',
          status: 'sent',
          sentAt: new Date(),
          metadata: JSON.stringify(metadata || {}),
        },
      });
      return true;
    }

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template: metadata?.template || 'unknown',
        status: 'sent',
        sentAt: new Date(),
        metadata: JSON.stringify(metadata || {}),
      },
    });

    console.log('[Email] Sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template: metadata?.template || 'unknown',
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        metadata: JSON.stringify(metadata || {}),
      },
    });
    return false;
  }
}

// Email Templates

export async function sendSignupEmail(email: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ReferralSystem!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up for ReferralSystem! We're excited to have you on board.</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Your account has been created successfully. You can now:</p>
          <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
            <li>Create your first app</li>
            <li>Set up referral campaigns</li>
            <li>Start tracking referrals and conversions</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/login" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to ReferralSystem!',
    html,
    metadata: { template: 'signup', name },
  });
}

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This link will expire in 24 hours.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
    metadata: { template: 'verification', token },
  });
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #ef4444; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    metadata: { template: 'password_reset', token },
  });
}

export async function sendBillingInvoiceEmail(
  email: string,
  invoice: { id: string; amount: number; currency: string; billingPeriodStart: Date; billingPeriodEnd: Date; apiUsage: number },
  name?: string
) {
  const invoiceUrl = `${APP_URL}/dashboard/v2/billing/invoices/${invoice.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Invoice Available</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Your monthly invoice is ready for review.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Billing Period:</span>
              <span style="font-weight: 600;">${new Date(invoice.billingPeriodStart).toLocaleDateString()} - ${new Date(invoice.billingPeriodEnd).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">API Usage:</span>
              <span style="font-weight: 600;">${invoice.apiUsage.toLocaleString()} calls</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
              <span style="font-size: 18px; font-weight: 700;">Total Amount:</span>
              <span style="font-size: 18px; font-weight: 700; color: #10b981;">${invoice.currency} ${invoice.amount.toFixed(2)}</span>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Invoice</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Invoice for ${new Date(invoice.billingPeriodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    html,
    metadata: { template: 'billing_invoice', invoiceId: invoice.id },
  });
}

export async function sendApiUsageWarningEmail(
  email: string,
  app: { name: string; currentUsage: number; monthlyLimit: number },
  percentage: number,
  name?: string
) {
  const usageUrl = `${APP_URL}/dashboard/v2/usage`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">API Usage Warning</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Your app <strong>${app.name}</strong> has reached <strong>${percentage}%</strong> of its monthly API limit.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #92400e; font-weight: 600;">Current Usage:</span>
              <span style="color: #92400e; font-weight: 600;">${app.currentUsage.toLocaleString()} / ${app.monthlyLimit.toLocaleString()}</span>
            </div>
            <div style="background: #fde68a; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px;">
              <div style="background: #f59e0b; height: 100%; width: ${percentage}%;"></div>
            </div>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Consider upgrading your plan to avoid service interruptions.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${usageUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Usage</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `API Usage Warning: ${app.name} at ${percentage}%`,
    html,
    metadata: { template: 'api_usage_warning', appName: app.name, percentage },
  });
}

export async function sendMonthlyReportEmail(
  email: string,
  report: {
    month: string;
    totalReferrals: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
    activeCampaigns: number;
  },
  name?: string
) {
  const dashboardUrl = `${APP_URL}/dashboard/v2`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Monthly Report - ${report.month}</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Here's your monthly performance summary:</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <div style="font-size: 24px; font-weight: 700; color: #667eea;">${report.totalReferrals.toLocaleString()}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Total Referrals</div>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${report.totalConversions.toLocaleString()}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Conversions</div>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${report.conversionRate.toFixed(1)}%</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Conversion Rate</div>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">$${report.totalRevenue.toFixed(2)}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Total Revenue</div>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Monthly Report - ${report.month}`,
    html,
    metadata: { template: 'monthly_report', month: report.month },
  });
}

export async function sendCustomEmail(
  email: string,
  subject: string,
  content: string,
  name?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ReferralSystem</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          ${name ? `<p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>` : ''}
          <div style="font-size: 16px; margin-bottom: 20px;">
            ${content.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ReferralSystem. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    metadata: { template: 'custom', custom: true },
  });
}
