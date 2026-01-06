# Backend and Frontend Integration - Complete Implementation

## Overview
This document details the complete backend and frontend integration for billing, API usage tracking, analytics, and real-time data tracking across the referral platform.

## Implemented Features

### 1. API Usage Tracking & Monitoring

#### New Backend Endpoints
- **`/api/partner/usage-stats`** - Comprehensive API usage statistics
  - Real-time API call counts (30-day period)
  - Daily usage breakdown with time-series data
  - Endpoint breakdown by category (Referrals, Analytics, Webhooks, Other)
  - Recent API logs with pagination
  - Overage calculations and cost estimates

#### Frontend Integration
- **Usage Dashboard** (`/dashboard/v2/usage`)
  - Real-time API usage metrics
  - Interactive daily usage chart with actual data
  - Usage percentage with visual indicators
  - Endpoint breakdown by category
  - Recent API activity log
  - Automatic alerts for usage thresholds (80%+)

### 2. Analytics & Performance Tracking

#### Backend Enhancements
- **`/api/partner/analytics`** - Already existing, now fully integrated
  - Campaign-level performance metrics
  - App-level aggregated statistics
  - Click rates and conversion rates
  - Revenue attribution tracking

#### Frontend Integration
- **Analytics Dashboard** (`/dashboard/v2/analytics`)
  - Real-time referral statistics
  - Conversion rate tracking
  - Revenue attribution ($45 per conversion)
  - Reward cost tracking
  - Campaign performance bar chart
  - Referral status distribution pie chart
  - Dynamic data loading by selected app

### 3. Billing & Subscription Management

#### Backend
- **`/api/partner/billing`** - Already existing, fully utilized
  - Current subscription details
  - Monthly usage calculations
  - Overage tracking and cost estimates
  - Invoice history

#### Frontend Integration
- **Billing Dashboard** (`/dashboard/v2/billing`)
  - Current plan display with status badges
  - Real-time usage and overage tracking
  - Plan comparison and upgrade functionality
  - Invoice history table
  - Estimated monthly costs

### 4. Real-Time Dashboard Metrics

#### New Backend Endpoints
- **`/api/partner/metrics`** - Historical comparison metrics
  - Period-over-period comparisons (30d vs previous 30d)
  - Percentage changes for all key metrics
  - Referral growth tracking
  - Conversion trend analysis
  - Revenue growth metrics
  - API usage trends

- **`/api/partner/active-campaigns`** - Real campaign data
  - Active campaign list
  - Referral counts per campaign
  - Reward cost tracking
  - Campaign status monitoring

- **`/api/partner/webhook-deliveries`** - Webhook monitoring
  - Recent webhook delivery logs
  - Success/failure indicators
  - Status code tracking
  - Event type monitoring

#### Frontend Integration
- **Main Dashboard** (`/dashboard/v2/page`)
  - Real-time stat cards with period-over-period changes
  - API usage chart with 7-day trend
  - Active campaigns card with live data
  - Webhook deliveries monitoring
  - Recent activity feed
  - Smart alerts for fraud and usage limits

### 5. Data Flow & Tracking

#### API Usage Tracking
```
Client API Call → authenticateApiKey() → Business Logic → logApiUsage()
                                                          ↓
                                          ApiUsageLog table + App.currentUsage++
```

#### Usage Calculation Flow
```
Partner Dashboard → /api/partner/usage-stats
                    ↓
                    Query last 30 days of ApiUsageLog
                    ↓
                    Group by day → Daily chart data
                    Group by endpoint → Category breakdown
                    ↓
                    Return aggregated stats
```

#### Metrics Comparison Flow
```
Dashboard → /api/partner/metrics?period=30
            ↓
            Get current 30-day metrics
            Get previous 30-day metrics
            ↓
            Calculate % changes
            ↓
            Return comparison data → Display in badges
```

## Key Implementation Details

### 1. Real-Time Data Integration
- All dashboards now fetch real data from backend APIs
- Removed all hardcoded/mock data
- Implemented proper error handling and loading states
- Added automatic data refresh on app selection change

### 2. Badge & Metric Tracking
- **Dashboard Stats**: Show real-time counts with period-over-period changes
- **API Usage**: Track current usage vs limits with percentage indicators
- **Billing Status**: Display active/inactive states with proper badges
- **Campaign Status**: Show active campaign counts with real metrics
- **Webhook Status**: Track delivery success rates

### 3. Chart Data Integration
- **API Usage Chart**: 7-day trend from actual ApiUsageLog data
- **Daily Usage Chart**: 30-day breakdown with real call counts
- **Campaign Performance**: Bar chart with actual clicks/conversions
- **Status Distribution**: Pie chart with real referral status counts

### 4. Analytics Integration
- **Revenue Attribution**: $45 per conversion (configurable)
- **Conversion Rates**: Calculated from actual click/conversion data
- **Click Rates**: Percentage of referrals that were clicked
- **Reward Costs**: Sum of actual reward amounts paid

## API Endpoints Summary

| Endpoint | Method | Purpose | Frontend Usage |
|----------|--------|---------|----------------|
| `/api/partner/dashboard-stats` | GET | Main dashboard metrics | Main dashboard |
| `/api/partner/usage-stats` | GET | Detailed API usage | Usage page |
| `/api/partner/analytics` | GET | Campaign analytics | Analytics page |
| `/api/partner/billing` | GET | Billing & subscription | Billing page |
| `/api/partner/metrics` | GET | Period comparisons | All dashboards (badges) |
| `/api/partner/active-campaigns` | GET | Active campaign list | Main dashboard |
| `/api/partner/webhook-deliveries` | GET | Webhook logs | Main dashboard |
| `/api/partner/pricing-plans` | GET | Available plans | Billing page |
| `/api/partner/subscription/upgrade` | POST | Plan upgrades | Billing page |

## Database Tracking

### Tables Utilized
1. **ApiUsageLog** - Every API call logged with timestamp, endpoint, IP
2. **Referral** - Tracks all referrals with status changes
3. **Conversion** - Records conversion events with amounts
4. **Subscription** - Active subscription and billing period
5. **Invoice** - Historical billing records
6. **Campaign** - Campaign configuration and status
7. **WebhookDelivery** - Webhook event delivery logs
8. **FraudFlag** - Fraud detection alerts

### Tracking Points
- ✅ API calls tracked in real-time via middleware
- ✅ Referral creation, clicks, conversions tracked
- ✅ Billing usage calculated monthly
- ✅ Webhook deliveries logged with status
- ✅ Fraud detection flagged and tracked
- ✅ Team member activities logged

## Performance Optimizations

1. **Efficient Queries**
   - Uses database indexes on timestamp, partnerId, appId
   - Aggregates calculated in database
   - Limited result sets with take/pagination

2. **Caching Strategy**
   - Dashboard stats cached for 5 minutes (could be implemented)
   - Metrics comparison cached per hour (could be implemented)
   - API usage logs queried efficiently with date ranges

3. **Data Grouping**
   - Daily/weekly/monthly aggregations calculated server-side
   - Category breakdowns pre-calculated
   - Reduces frontend processing load

## Frontend Components Enhanced

1. **StatCard** - Now accepts real percentage changes
2. **DashboardLayout** - Supports real-time data refresh
3. **Analytics Charts** - All charts use real data
4. **Usage Dashboard** - Complete real-time tracking
5. **Billing Dashboard** - Live subscription and invoice data

## Alert System

### Implemented Alerts
1. **API Usage Warning** - At 80% of limit
2. **API Usage Critical** - At 90% of limit  
3. **Fraud Detection** - Unresolved fraud flags
4. **Overage Warning** - When exceeding plan limits
5. **App Suspended** - When hard limit reached (120% of plan)

## Testing Recommendations

1. **Create test data**:
   ```bash
   npm run seed
   ```

2. **Test API endpoints manually**:
   - Use Postman/Insomnia with test API keys
   - Generate referrals, clicks, conversions
   - Monitor dashboard updates

3. **Test frontend flows**:
   - Create app → Create campaign → Generate referrals
   - Monitor usage dashboard
   - Check analytics updates
   - Verify billing calculations

4. **Test tracking**:
   - Make API calls and verify logs appear
   - Check daily usage chart updates
   - Verify webhook deliveries tracked
   - Confirm metrics update correctly

## Future Enhancements

1. **Real-time WebSocket updates** for live dashboard refresh
2. **Advanced filtering** by date range, campaign, etc.
3. **Export functionality** for reports and analytics
4. **Custom alerts** with email/webhook notifications
5. **More granular tracking** (hourly, by user, by geo)
6. **A/B testing metrics** for campaign optimization
7. **Forecasting** based on historical trends
8. **Custom dashboards** with widget configuration

## Conclusion

All backend and frontend integrations are now complete with:
- ✅ Real-time data tracking and display
- ✅ Proper API usage monitoring
- ✅ Comprehensive analytics
- ✅ Accurate billing calculations
- ✅ Period-over-period comparisons
- ✅ Live campaign and webhook tracking
- ✅ Smart alerts and notifications
- ✅ Clean, maintainable code structure

The platform now provides complete visibility into all aspects of the referral system with accurate, real-time data throughout.
