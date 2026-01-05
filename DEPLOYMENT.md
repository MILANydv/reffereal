# Deployment Guide

## Production Deployment

### Environment Variables

Create a `.env.production` file:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Generate a secure secret
4. Deploy

Note: Vercel automatically runs `npm run build` and `npm run start`

### Deploy to Other Platforms

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t referral-mvp .
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  referral-mvp
```

#### VPS/Ubuntu Server

1. Install Node.js 20+
2. Clone repository
3. Install dependencies: `npm ci`
4. Set up database: `npx prisma migrate deploy`
5. Generate Prisma client: `npx prisma generate`
6. Seed database: `npm run seed`
7. Build: `npm run build`
8. Start with PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "referral-mvp" -- start
   pm2 save
   pm2 startup
   ```

### Database in Production

For production, consider using:
- **PostgreSQL**: Better concurrency, ACID compliance
- **MySQL**: Good performance, wide support
- **Turso**: Serverless SQLite (edge-ready)

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then:
```bash
npx prisma migrate deploy
```

### Monitoring

Add error tracking:
- **Sentry**: Error monitoring
- **LogRocket**: Session replay
- **Datadog**: APM and logs

### Security Checklist

- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up rate limiting (consider Cloudflare)
- [ ] Configure CORS if needed
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Review and rotate API keys periodically
- [ ] Enable 2FA for admin accounts (future phase)

### Scaling Considerations

#### Database
- Move to PostgreSQL for better concurrency
- Set up read replicas
- Index frequently queried fields
- Consider connection pooling (PgBouncer)

#### Application
- Scale horizontally with load balancer
- Use Redis for session storage
- Implement caching layer
- CDN for static assets

#### API Rate Limiting
- Implement per-IP rate limiting
- Consider using API gateway (AWS API Gateway, Kong)
- Add request queuing for burst traffic

### Maintenance

#### Database Migrations
```bash
npx prisma migrate deploy
```

#### Backups
```bash
# SQLite
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

#### Reset Usage Counters (Monthly)
Create a cron job:
```bash
# Every 1st of month at 00:00
0 0 1 * * node scripts/reset-usage.js
```

Create `scripts/reset-usage.js`:
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetUsage() {
  await prisma.app.updateMany({
    data: { currentUsage: 0 }
  });
  console.log('Usage counters reset');
}

resetUsage();
```

### Health Check Endpoint

Add `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy' });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

### Load Testing

Use Apache Bench or k6:
```bash
# Test referral creation
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_API_KEY" \
  -p payload.json -T application/json \
  http://localhost:3000/api/v1/referrals
```

### Performance Optimization

1. Enable Next.js caching
2. Use database indexes
3. Implement pagination for large datasets
4. Cache stats API responses
5. Use CDN for static assets
6. Optimize images with Next.js Image component
7. Enable gzip/brotli compression

### Troubleshooting Production Issues

#### High Database Load
- Add indexes to frequently queried fields
- Implement connection pooling
- Cache frequently accessed data

#### Slow API Responses
- Profile with Next.js speed insights
- Check database query performance
- Add Redis caching layer
- Review N+1 query problems

#### Memory Leaks
- Monitor with PM2 or similar
- Set memory limits in PM2
- Review event listener cleanup
- Check for unreleased database connections

### Support

For production support:
- Check logs: `pm2 logs referral-mvp`
- Monitor: `pm2 monit`
- Restart: `pm2 restart referral-mvp`
