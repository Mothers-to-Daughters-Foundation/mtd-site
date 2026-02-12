# MTD-Site Feature Implementation Guide

## Overview

This document describes the newly implemented features for the MTD-Site platform, including role and permission management, dashboard features, database schema, and API integrations.

## Table of Contents

1. [Role and Permission Management](#role-and-permission-management)
2. [Database Schema](#database-schema)
3. [Dashboards](#dashboards)
4. [API Routes](#api-routes)
5. [Authentication](#authentication)
6. [Payment Integration](#payment-integration)
7. [Future Enhancements](#future-enhancements)

## Role and Permission Management

### User Roles

The platform now supports four distinct user roles:

- **Mentee**: Students who receive mentorship and access training materials
- **Mentor**: Experienced professionals who guide mentees
- **Donor**: Supporters who contribute financially to the organization
- **Admin**: Platform administrators with full access to all features

### Role-Based Access Control

Each role has access to specific dashboard features:

#### Mentee Access
- Training materials and courses
- Session scheduling with mentors
- Progress tracking
- Badge achievements
- Mentor connections

#### Mentor Access
- Mentee management
- Session scheduling tools
- Progress tracking for mentees
- Collaboration space
- Resource library

#### Donor Access
- Donation history
- Impact reports
- Profile management
- Donation portal

#### Admin Access
- User management and role assignment
- Subscription management
- Payment tracking
- Mentor-mentee relationship management
- Training material management
- Badge creation and management
- Platform analytics

## Database Schema

### Collections

#### users
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (bcrypt hashed),
  name: string,
  role: 'mentor' | 'mentee' | 'donor' | 'admin',
  emailVerified: boolean,
  subscriptionStatus: 'active' | 'inactive' | 'pending',
  profile: {
    bio: string,
    phone: string,
    location: string,
    image: string,
    goals: string[],
    interests: string[]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### subscriptions
```typescript
{
  _id: ObjectId,
  userId: string,
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending',
  type: 'monthly' | 'yearly' | 'lifetime',
  startDate: Date,
  endDate: Date,
  amount: number,
  currency: string,
  paymentMethod: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### payments
```typescript
{
  _id: ObjectId,
  userId: string,
  subscriptionId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentMethod: 'stripe' | 'paypal' | 'apple_pay',
  transactionId: string,
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

#### mentor_mentee_relationships
```typescript
{
  _id: ObjectId,
  mentorId: string,
  menteeId: string,
  status: 'active' | 'inactive' | 'completed' | 'pending',
  startDate: Date,
  endDate: Date,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### sessions
```typescript
{
  _id: ObjectId,
  mentorId: string,
  menteeId: string,
  title: string,
  description: string,
  scheduledDate: Date,
  duration: number, // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
  location: string,
  meetingLink: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### training_materials
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  type: 'video' | 'document' | 'article' | 'course' | 'quiz',
  content: string,
  url: string,
  category: string,
  tags: string[],
  duration: number, // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  isPublished: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### badges
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  icon: string,
  criteria: string,
  points: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### user_badges
```typescript
{
  _id: ObjectId,
  userId: string,
  badgeId: string,
  earnedAt: Date,
  createdAt: Date
}
```

#### progress
```typescript
{
  _id: ObjectId,
  userId: string,
  materialId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  progressPercentage: number,
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: Date,
  timeSpent: number, // in minutes
  createdAt: Date,
  updatedAt: Date
}
```

## Dashboards

### Mentee Dashboard (`/dashboard/mentee`)
- **My Progress**: Track learning journey and completion rates
- **Training Materials**: Access courses, videos, and resources
- **My Mentors**: View and connect with assigned mentors
- **Sessions**: Schedule and manage mentorship sessions
- **My Badges**: View earned achievements
- **Profile Settings**: Manage personal information

### Mentor Dashboard (`/dashboard/mentor`)
- **My Profile**: Manage mentor profile
- **My Mentees**: View and manage mentee relationships
- **Resources**: Access mentoring guides and materials
- **Activity**: View mentoring history

### Donor Dashboard (`/dashboard/donor`)
- **Donation History**: View past contributions
- **Impact**: See the results of donations
- **Make a Donation**: Quick access to donation portal
- **Profile Settings**: Manage account preferences

### Admin Dashboard (`/dashboard/admin`)
- **User Management**: Manage all users and roles
- **Subscriptions**: Monitor subscription status
- **Payments**: Track all transactions
- **Mentor-Mentee Relationships**: Manage pairings
- **Training Materials**: Create and manage content
- **Badges**: Create achievement badges
- **Analytics**: View platform metrics
- **Settings**: Configure platform settings

## API Routes

### User Management
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/users?action=stats` - Get user statistics
- `PATCH /api/admin/users` - Update user role/status

### Subscriptions
- `GET /api/admin/subscriptions` - List all subscriptions (admin only)
- `GET /api/admin/subscriptions?action=stats` - Get subscription statistics
- `POST /api/admin/subscriptions` - Create new subscription
- `PATCH /api/admin/subscriptions` - Update subscription

### Training Materials
- `GET /api/materials` - List all published materials
- `GET /api/materials?id={id}` - Get specific material
- `POST /api/materials` - Create new material (admin only)
- `PATCH /api/materials` - Update material (admin only)

### Sessions
- `GET /api/sessions` - List user's sessions
- `GET /api/sessions?filter=upcoming` - Get upcoming sessions
- `POST /api/sessions` - Create new session
- `PATCH /api/sessions` - Update session

## Authentication

### User Registration
Users can now register with three role options:
- Mentee (default)
- Mentor
- Donor

### Email-Based Signup
The registration system supports email-based signup with:
- Password validation (minimum 8 characters)
- Confirmation password matching
- Role selection
- Automatic role-based dashboard allocation after login

### Session Management
- JWT-based sessions via NextAuth.js
- Role information stored in session
- Automatic redirection based on user role

## Payment Integration

### Supported Payment Methods
The platform is designed to support:
- Stripe
- PayPal
- Apple Pay

### Payment Tracking
- All payments are logged in the `payments` collection
- Payment status tracking (pending, completed, failed, refunded)
- Transaction IDs stored for reference
- Linked to user subscriptions

### Subscription Lifecycle
1. User signs up as mentee
2. Payment processed through chosen provider
3. Subscription created with active status
4. User gains access to platform materials
5. Subscription automatically tracked for renewal

## Donor Platform Integration

### Zeffy Integration
Currently integrated for donations via iframe on `/donate` page.

### Future Integration Planning
The platform is designed to support:
- **GiveLively**: For recurring donations and campaigns
- **Zeffy**: Enhanced features beyond current iframe

### Donation vs. Subscription
- **Donations**: One-time or recurring contributions (tracked separately)
- **Subscriptions**: Platform access payments for mentees

## Future Enhancements

### Phase 1: Admin UI Implementation
- Create user management interface
- Build subscription management UI
- Develop analytics dashboard
- Implement relationship management interface

### Phase 2: Enhanced Dashboards
- Real-time session notifications
- Progress visualization charts
- Badge showcase with achievements
- Mentor-mentee messaging system

### Phase 3: Payment Provider Integration
- Complete Stripe integration
- Add PayPal payment flow
- Implement Apple Pay
- Add payment webhook handlers

### Phase 4: AI Integration
- User onboarding assistant
- Mentor-mentee matching algorithm
- Training material recommendations
- Goal-based learning paths

### Phase 5: Email Integration
- Email verification system
- Password reset functionality
- Session reminders
- Progress reports
- Newsletter integration

### Phase 6: Advanced Features
- Video conferencing integration
- File sharing capabilities
- Discussion forums
- Mobile app support

## Environment Variables

Add these to your `.env.local` file:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mtd-site
MONGODB_DB_NAME=mtd-site

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Payment Providers (when implemented)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email Service (when implemented)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...

# External Integrations
NEXT_PUBLIC_ZEFFY_URL=https://...
NEXT_PUBLIC_FORMSPREE_ID=...
```

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   ```

2. **Database Setup**
   - Ensure MongoDB is running
   - Collections will be created automatically on first use

3. **Testing**
   - Test registration with different roles
   - Verify role-based dashboard access
   - Test API endpoints with appropriate permissions

4. **Deployment**
   - Set environment variables in production
   - Configure MongoDB connection
   - Deploy to Vercel or similar platform

## Security Considerations

- All passwords are hashed with bcrypt (10 rounds)
- JWT sessions with secure secret
- Role-based authorization on all protected routes
- Admin endpoints require admin role verification
- Payment data stored securely with transaction IDs only
- HTTPS required in production

## Support and Maintenance

For questions or issues:
1. Check this documentation
2. Review API route implementations
3. Consult database model files
4. Contact the development team

## License

Proprietary - Mothers to Daughters Foundation
