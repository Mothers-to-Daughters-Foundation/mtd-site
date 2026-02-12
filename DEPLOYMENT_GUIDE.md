# MTD-Site Feature Implementation - Deployment Guide

## Overview

This guide provides instructions for deploying the newly implemented features to the MTD-Site production environment.

## Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mtd-site
MONGODB_DB_NAME=mtd-site

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Integrations (Current)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_FORMSPREE_ID=xxxxx
NEXT_PUBLIC_ZEFFY_URL=https://...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Payment Integration (When Ready)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Donor Platform (When Ready)
GIVELIVELY_API_KEY=...
GIVELIVELY_ORG_ID=...
GIVELIVELY_WEBHOOK_SECRET=...

# AI Integration (When Ready)
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=mtd-content

# Email Service (When Ready)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

### 2. Database Setup

**MongoDB Collections Created:**
- users
- subscriptions
- payments
- mentor_mentee_relationships
- sessions
- training_materials
- badges
- user_badges
- progress

**Indexes to Create:**
```javascript
// users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// subscriptions collection
db.subscriptions.createIndex({ "userId": 1 })
db.subscriptions.createIndex({ "status": 1 })

// sessions collection
db.sessions.createIndex({ "mentorId": 1 })
db.sessions.createIndex({ "menteeId": 1 })
db.sessions.createIndex({ "scheduledDate": 1 })

// training_materials collection
db.training_materials.createIndex({ "isPublished": 1 })
db.training_materials.createIndex({ "category": 1 })

// progress collection
db.progress.createIndex({ "userId": 1 })
db.progress.createIndex({ "materialId": 1 })
db.progress.createIndex({ "userId": 1, "materialId": 1 }, { unique: true })
```

### 3. Create Initial Admin User

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  email: "admin@motherstodaughters.org",
  password: "<bcrypt-hashed-password>",
  name: "Admin User",
  role: "admin",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Use bcrypt to hash the password:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10))"
```

### 4. Build and Test

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build the project
npm run build

# Test locally
npm run start
```

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect Repository:**
   - Go to https://vercel.com
   - Import the GitHub repository
   - Select the `copilot/add-role-and-permission-management` branch

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from `.env.local`
   - Ensure `NEXTAUTH_URL` matches your production domain

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployment

4. **Configure Domain:**
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed
   - Wait for SSL certificate provisioning

### Option 2: Self-Hosted

1. **Server Requirements:**
   - Node.js 18+
   - MongoDB 6.0+
   - Nginx (for reverse proxy)
   - SSL certificate (Let's Encrypt)

2. **Setup Process:**
   ```bash
   # Clone repository
   git clone https://github.com/Mothers-to-Daughters-Foundation/mtd-site.git
   cd mtd-site
   
   # Checkout feature branch
   git checkout copilot/add-role-and-permission-management
   
   # Install dependencies
   npm install
   
   # Create .env.local with production values
   cp .env.example .env.local
   nano .env.local
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "mtd-site" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment Verification

### 1. Test User Registration
- [ ] Visit `/register`
- [ ] Create a mentee account
- [ ] Create a mentor account
- [ ] Create a donor account
- [ ] Verify role-based dashboard redirects

### 2. Test Admin Features
- [ ] Log in as admin
- [ ] Access `/dashboard/admin`
- [ ] Visit `/dashboard/admin/users`
- [ ] Change a user's role
- [ ] Visit `/dashboard/admin/analytics`
- [ ] Verify statistics display correctly

### 3. Test API Endpoints
```bash
# Test user stats API
curl -X GET "https://yourdomain.com/api/admin/users?action=stats" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Test subscription stats API
curl -X GET "https://yourdomain.com/api/admin/subscriptions?action=stats" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 4. Test Dashboards
- [ ] Mentee dashboard (`/dashboard/mentee`)
- [ ] Mentor dashboard (`/dashboard/mentor`)
- [ ] Donor dashboard (`/dashboard/donor`)
- [ ] Admin dashboard (`/dashboard/admin`)

### 5. Security Checks
- [ ] HTTPS enforced
- [ ] Admin routes require admin role
- [ ] Protected API routes require authentication
- [ ] Password hashing working
- [ ] Session management working

## Monitoring Setup

### 1. Application Monitoring

Add monitoring service (e.g., Sentry):
```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    org: "your-org",
    project: "mtd-site"
  }
);
```

### 2. Database Monitoring
- Set up MongoDB Atlas alerts
- Monitor connection pool usage
- Track slow queries
- Set up automated backups

### 3. API Monitoring
- Monitor response times
- Track error rates
- Set up alerts for failures
- Monitor rate limits

## Rollback Plan

If issues occur:

1. **Vercel:**
   - Go to Deployments
   - Find previous stable deployment
   - Click "Promote to Production"

2. **Self-Hosted:**
   ```bash
   # Revert to previous commit
   git checkout <previous-commit-hash>
   
   # Rebuild
   npm run build
   
   # Restart
   pm2 restart mtd-site
   ```

## Future Features Activation

### When Ready to Enable Payments:

1. **Set up Stripe:**
   - Create Stripe account
   - Create pricing products
   - Add environment variables
   - Deploy webhook endpoints
   - Test with test cards

2. **Documentation:**
   - Follow `PAYMENT_INTEGRATION_GUIDE.md`
   - Test thoroughly in sandbox
   - Conduct security audit

### When Ready to Enable AI:

1. **Set up OpenAI:**
   - Create OpenAI account
   - Get API keys
   - Set up vector database (Pinecone)
   - Deploy AI endpoints

2. **Documentation:**
   - Follow `AI_INTEGRATION_PLAN.md`
   - Start with Phase 1 (Foundation)
   - Gradually enable features

## Support Contacts

**Technical Issues:**
- Repository: https://github.com/Mothers-to-Daughters-Foundation/mtd-site
- Technical Lead: [Contact Info]

**Infrastructure:**
- Hosting Provider Support
- Database Provider Support

**Third-Party Services:**
- Stripe Support: https://support.stripe.com
- PayPal Support: https://developer.paypal.com/support
- OpenAI Support: https://help.openai.com

## Maintenance Schedule

**Weekly:**
- [ ] Review error logs
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Review user feedback

**Monthly:**
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Database maintenance
- [ ] Backup verification

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature usage analysis
- [ ] User satisfaction survey

## Success Metrics

Track these metrics post-deployment:

**User Engagement:**
- User registration rate
- Dashboard visit frequency
- Feature adoption rate
- Session completion rate

**Technical Performance:**
- Page load times
- API response times
- Error rates
- Uptime percentage

**Business Metrics:**
- Active users (by role)
- Subscription conversion rate (when enabled)
- Mentor-mentee relationships created
- Training materials completed

---

## Documentation Reference

- **Feature Guide:** `FEATURE_IMPLEMENTATION_GUIDE.md`
- **Payment Integration:** `PAYMENT_INTEGRATION_GUIDE.md`
- **AI Integration:** `AI_INTEGRATION_PLAN.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`

---

*Last Updated: February 12, 2026*
*Version: 1.0*
*Deployment Branch: copilot/add-role-and-permission-management*
