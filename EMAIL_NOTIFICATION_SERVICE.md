# Email & Notification Service Implementation

## Overview

A comprehensive email and notification service has been implemented for the ReferralSystem platform, providing automated communications and in-app notifications for various events.

## Email Service

### Email Templates Implemented

1. **Signup Email** (`sendSignupEmail`)
   - Sent when a new user signs up
   - Welcome message with getting started instructions

2. **Email Verification** (`sendVerificationEmail`)
   - Sent during signup with verification token
   - 24-hour expiry link

3. **Password Reset** (`sendPasswordResetEmail`)
   - Sent when user requests password reset
   - 1-hour expiry link

4. **Billing Invoice** (`sendBillingInvoiceEmail`)
   - Sent when monthly invoice is generated
   - Includes billing period, API usage, and total amount

5. **API Usage Warning** (`sendApiUsageWarningEmail`)
   - Sent at 80%, 90%, and 95% usage thresholds
   - Prevents duplicate emails within 24 hours

6. **Monthly Report** (`sendMonthlyReportEmail`)
   - Summary of monthly performance
   - Includes referrals, conversions, revenue stats

7. **Custom Email** (`sendCustomEmail`)
   - Admin can send custom emails to users
   - Supports HTML content

### Email Service Configuration

- **Provider**: Nodemailer (supports any SMTP server)
- **Environment Variables**:
  - **SMTP Configuration** (for production):
    - `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com, smtp.sendgrid.net)
    - `SMTP_PORT`: SMTP port (default: 587)
    - `SMTP_USER`: SMTP username/email
    - `SMTP_PASS`: SMTP password
    - `SMTP_SECURE`: Use secure connection (true for 465, false for 587)
  - **Development**:
    - `ETHEREAL_USER`: Ethereal email username (optional, for testing)
    - `ETHEREAL_PASS`: Ethereal email password (optional, for testing)
  - **General**:
    - `FROM_EMAIL`: Sender email address (default: noreply@referralsystem.com)
    - `NEXTAUTH_URL`: Base URL for links in emails

**Note**: In development mode without SMTP config, emails are logged to console instead of being sent.

### Email Logging

All emails are logged in the `EmailLog` table with:
- Recipient email
- Subject
- Template name
- Status (sent, failed, pending)
- Error messages (if failed)
- Metadata

## Notification Service

### Notification Types

1. **REFERRAL_CONVERTED**
   - Triggered when a referral code is converted
   - Includes referral code, campaign name, and reward amount

2. **REFERRAL_CODE_GENERATED**
   - Triggered when a new referral code is created
   - Includes referral code and campaign name

3. **TEAM_INVITE_ACCEPTED**
   - Triggered when a team member accepts an invite
   - Includes team member name, email, and role

4. **CUSTOM_ADMIN**
   - Admin-created custom notifications
   - Supports custom title, message, and metadata

### Notification Features

- **Status Management**: UNREAD, READ, ARCHIVED
- **Read Tracking**: Timestamps when notifications are read
- **Metadata Support**: JSON metadata for additional context
- **Pagination**: Support for paginated notification lists
- **Unread Count**: Quick access to unread notification count

## Database Schema Updates

### New Models

1. **Notification**
   - Stores in-app notifications
   - Linked to users
   - Supports multiple notification types

2. **EmailLog**
   - Tracks all sent emails
   - Status tracking and error logging

### User Model Updates

- `emailVerified`: Boolean flag for email verification
- `emailVerifyToken`: Token for email verification
- `emailVerifyExpiry`: Expiry time for verification token
- `passwordResetToken`: Token for password reset
- `passwordResetExpiry`: Expiry time for reset token

## API Endpoints

### Authentication Endpoints

- `GET /api/auth/verify-email?token=...` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Notification Endpoints

- `GET /api/partner/notifications` - Get user notifications
  - Query params: `status`, `limit`, `offset`
- `PATCH /api/partner/notifications` - Update notification status
  - Actions: `read`, `read-all`, `archive`

### Admin Endpoints

- `POST /api/admin/send-email` - Send custom email
  - Body: `email`, `subject`, `content`, `userId?`, `partnerId?`
- `POST /api/admin/send-notification` - Send custom notification
  - Body: `userId`, `partnerId?`, `title`, `message`, `metadata?`

### Team Endpoints

- `POST /api/partner/team/accept` - Accept team invite
  - Body: `token`

## Integration Points

### Automatic Email Triggers

1. **Signup**: Sends welcome and verification emails
2. **Billing**: Sends invoice email when monthly invoice is generated
3. **API Usage**: Sends warning emails at 80%, 90%, 95% thresholds
4. **Password Reset**: Sends reset link when requested

### Automatic Notification Triggers

1. **Referral Conversion**: Notifies partner when referral converts
2. **Referral Code Generated**: Notifies partner when new code is created
3. **Team Invite Accepted**: Notifies partner when team member joins

## Usage Examples

### Sending Custom Email (Admin)

```typescript
POST /api/admin/send-email
{
  "email": "user@example.com",
  "subject": "Important Update",
  "content": "Your account has been upgraded!"
}
```

### Sending Custom Notification (Admin)

```typescript
POST /api/admin/send-notification
{
  "userId": "user_id",
  "title": "System Maintenance",
  "message": "Scheduled maintenance on Jan 15, 2024",
  "metadata": { "maintenanceDate": "2024-01-15" }
}
```

### Getting Notifications

```typescript
GET /api/partner/notifications?status=UNREAD&limit=20
```

### Marking Notification as Read

```typescript
PATCH /api/partner/notifications
{
  "notificationId": "notif_id",
  "action": "read"
}
```

## Environment Setup

Add to your `.env` file:

### Production (with SMTP):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
FROM_EMAIL=noreply@yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

### Development (console logging):
```env
FROM_EMAIL=noreply@referralsystem.com
NEXTAUTH_URL=http://localhost:3000
# Emails will be logged to console in development
```

### Using Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

### Using SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

## Database Migration

Run the migration to add the new tables:

```bash
npx prisma migrate dev --name add_email_notifications
npx prisma generate
```

## Future Enhancements

- Email template customization UI
- Notification preferences per user
- Email scheduling
- Bulk email sending
- Notification channels (email, SMS, push)
- Notification grouping and batching
