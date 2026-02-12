# MTD-Site - Mothers to Daughters Foundation Platform

**A comprehensive mentorship and learning platform built with Next.js 14**

---

## 🌟 Overview

The MTD-Site is a modern, full-stack platform designed to connect mentors with mentees, provide training materials, track progress, and facilitate meaningful relationships. Originally migrated from Wix, the platform now includes advanced role-based features, subscription management, and comprehensive admin tools.

### Key Features

✅ **Multi-Role System**
- Mentee, Mentor, Donor, and Admin roles
- Role-based dashboard access
- Customized features per role

✅ **Mentorship Platform**
- Mentor-mentee relationship management
- Session scheduling and tracking
- Progress monitoring
- Badge and achievement system

✅ **Learning Management**
- Training materials library
- Progress tracking
- Course completion tracking
- Personalized recommendations (planned)

✅ **Subscription & Payments**
- Subscription lifecycle management
- Payment tracking
- Multiple payment provider support (planned)
- Donation platform integration

✅ **Admin Panel**
- User management with role editing
- Real-time analytics with Server-Sent Events
- Subscription management
- Platform statistics

✅ **Events & Resources**
- Workshops, networking events, and digital business hours
- Downloadable resources (PDFs, videos, documents)
- Event registration and management

---

## 📚 Documentation

### Core Documentation
- **[SETUP.md](./SETUP.md)** - Local development setup instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Original Wix migration status

### Feature Documentation
- **[FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md)** - Complete feature documentation
- **[PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md)** - Payment integration details
- **[AI_INTEGRATION_PLAN.md](./AI_INTEGRATION_PLAN.md)** - AI features roadmap
- **[AUTHENTICATION_FEATURES.md](./AUTHENTICATION_FEATURES.md)** - Authentication system docs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mothers-to-Daughters-Foundation/mtd-site.git
cd mtd-site

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your environment variables
nano .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mtd-site
MONGODB_DB_NAME=mtd-site

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>

# Integrations
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_FORMSPREE_ID=xxxxx
NEXT_PUBLIC_ZEFFY_URL=https://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14.2.5 (App Router)
- React 18.3
- TypeScript 5.5
- CSS Modules
- Material-UI 7.3

**Backend:**
- Next.js API Routes
- MongoDB with native driver
- NextAuth.js for authentication

**Integrations:**
- Zeffy (donations)
- Formspree (forms)
- Google Analytics 4
- Microsoft Clarity

### Project Structure

```
mtd-site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (site)/            # Public pages
│   │   ├── dashboard/         # Protected dashboards
│   │   │   ├── mentee/       # Mentee dashboard
│   │   │   ├── mentor/       # Mentor dashboard
│   │   │   ├── donor/        # Donor dashboard
│   │   │   └── admin/        # Admin panel
│   │   └── api/              # API routes
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # UI primitives
│   │   └── forms/            # Form components
│   └── lib/                  # Utilities & models
│       ├── models/           # Database models
│       ├── auth.ts           # Auth configuration
│       └── db.ts             # Database connection
├── content/                   # MDX content files
├── docs/                      # Documentation
└── public/                    # Static assets
```

---

## 🎯 Features by Role

### Mentee Dashboard
- **Stats Overview**: Courses enrolled, sessions attended, progress %, badges earned
- **Featured Courses**: Grid with progress bars, instructor info, enrollment counts
- **Upcoming Events**: Workshops, networking events, digital business hours
- **Booked Sessions**: List with join/reschedule actions
- **Featured Resources**: Downloadable PDFs, videos, documents with ratings
- **My Progress**: Track learning journey and completion rates
- **Training Materials**: Access courses and resources
- **My Mentors**: Connect with assigned mentors
- **My Badges**: View earned achievements
- **Profile**: Manage personal information

### Mentor Dashboard
- **My Profile**: Manage mentor profile
- **My Mentees**: View and manage relationships
- **Resources**: Access mentoring guides
- **Activity**: View mentoring history

### Donor Dashboard
- **Donation History**: View past contributions
- **Impact**: See results of donations
- **Profile**: Manage account preferences

### Admin Panel
- **User Management**: Manage all users and roles
- **Real-Time Analytics**: Live metrics with Server-Sent Events
- **Subscriptions**: Monitor subscription status
- **Payments**: Track all transactions
- **Relationships**: Manage mentor-mentee pairings
- **Training Materials**: Create and manage content
- **Badges**: Create achievement badges
- **Events**: Manage workshops and networking events
- **Resources**: Upload and manage downloadable resources

---

## 💾 Database Schema

### Collections

- **users**: User accounts with roles and profiles
- **subscriptions**: Subscription lifecycle tracking
- **payments**: Payment transaction logs
- **mentor_mentee_relationships**: Mentor-mentee pairings
- **sessions**: Mentorship session records
- **training_materials**: Courses and learning content
- **badges**: Achievement definitions
- **user_badges**: User badge awards
- **progress**: Learning progress tracking
- **events**: Workshops, networking events, business hours
- **event_registrations**: Event registration tracking
- **resources**: Downloadable resources with ratings

See [FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md) for detailed schema documentation.

---

## 🔐 Authentication & Authorization

### Supported Roles
- **Mentee**: Students receiving mentorship
- **Mentor**: Experienced professionals providing guidance
- **Donor**: Financial supporters
- **Admin**: Platform administrators

### Authentication Features
- Email/password authentication via NextAuth.js
- JWT-based sessions
- Role-based access control
- Protected API routes
- Server-side session validation

---

## 🔌 API Routes

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users?action=stats` - User statistics
- `PATCH /api/admin/users` - Update user roles

### Real-Time Metrics
- `GET /api/admin/metrics/realtime` - Server-Sent Events stream for live metrics

### Subscriptions
- `GET /api/admin/subscriptions` - List subscriptions
- `GET /api/admin/subscriptions?action=stats` - Subscription stats
- `POST /api/admin/subscriptions` - Create subscription
- `PATCH /api/admin/subscriptions` - Update subscription

### Training Materials
- `GET /api/materials` - List published materials
- `POST /api/materials` - Create material (admin)
- `PATCH /api/materials` - Update material (admin)

### Sessions
- `GET /api/sessions` - List user's sessions
- `GET /api/sessions?filter=upcoming` - Upcoming sessions
- `POST /api/sessions` - Create session
- `PATCH /api/sessions` - Update session

### Events
- `GET /api/events?upcoming=true` - Fetch upcoming events
- `POST /api/events` - Create event (admin) or register for event
- `PATCH /api/events` - Update event (admin)

### Resources
- `GET /api/resources?featured=true` - Fetch featured resources
- `POST /api/resources` - Create resource (admin)
- `PATCH /api/resources` - Update resource (admin)

---

## 🧪 Development

### Running Tests
```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Next.js built-in optimizations

---

## 🚢 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Self-Hosted
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🗺️ Roadmap

### ✅ Completed Features
- [x] Wix to Next.js migration
- [x] Multi-role authentication system (Mentee, Mentor, Donor, Admin)
- [x] Database architecture with 11 MongoDB collections
- [x] Role-based dashboards for all user types
- [x] Enhanced mentee dashboard with courses, events, sessions, resources
- [x] Admin user management with role editing
- [x] Real-time analytics dashboard with Server-Sent Events
- [x] API routes for core features
- [x] Event management system (workshops, networking, business hours)
- [x] Resource management system (PDFs, videos, documents)
- [x] Session scheduling and tracking
- [x] Progress tracking system
- [x] Badge and achievement system
- [x] Subscription lifecycle management
- [x] Comprehensive documentation

### 🚧 In Progress
- [ ] Enhanced admin interface implementations
- [ ] Detailed dashboard feature views (course details, session history)
- [ ] Email verification system

---

## 📋 Future Features & Roadmap

### Payment Integration (Priority: High)
**Status:** Planned | **Documentation:** [PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md)

#### Features to Implement:
- [ ] **Stripe Integration**
  - Checkout session creation
  - Subscription management
  - Webhook handling for payment events
  - Payment history tracking
  - Support for monthly, yearly, and lifetime subscriptions
- [ ] **PayPal Integration**
  - PayPal order creation and capture
  - Subscription billing
  - Webhook handling
- [ ] **Apple Pay Support**
  - Integration via Stripe
  - Domain verification
  - Payment button implementation
- [ ] **Payment Dashboard**
  - Transaction history for users
  - Payment receipt generation
  - Failed payment retry logic
  - Subscription upgrade/downgrade flows
- [ ] **Revenue Analytics**
  - Monthly recurring revenue (MRR) tracking
  - Churn rate calculations
  - Revenue by subscription type
  - Payment success/failure metrics

**Technical Requirements:**
- Stripe SDK integration
- PayPal SDK integration
- Secure webhook endpoints with signature verification
- PCI compliance considerations
- Automated invoice generation

---

### Email System (Priority: High)
**Status:** Planned

#### Features to Implement:
- [ ] **Email Verification**
  - Verification email on registration
  - Verification link with token
  - Resend verification email
  - Mentor-specific email domain validation (M2D email requirement)
- [ ] **Password Reset**
  - Password reset request flow
  - Secure reset tokens
  - Email notifications
- [ ] **Transactional Emails**
  - Welcome emails for new users
  - Session confirmation emails
  - Event registration confirmations
  - Badge achievement notifications
  - Payment receipts
  - Subscription renewal reminders
- [ ] **Notification System**
  - Email preferences management
  - Digest emails (daily/weekly summaries)
  - Mentor-mentee connection notifications
  - Session reminders (24hr, 1hr before)

**Technical Requirements:**
- SMTP service integration (SendGrid, AWS SES, or Postmark)
- Email template system
- Queue system for bulk emails
- Unsubscribe management
- Email analytics and tracking

---

### AI Integration (Priority: Medium)
**Status:** Planned | **Documentation:** [AI_INTEGRATION_PLAN.md](./AI_INTEGRATION_PLAN.md)

#### Features to Implement:
- [ ] **AI-Powered Onboarding**
  - Interactive chatbot for new users
  - Smart form filling suggestions
  - Goal articulation assistance
  - Personalized resource recommendations
  - Automated profile enhancement
- [ ] **Mentor-Mentee Matching Algorithm**
  - Skills and interests matching (40% weight)
  - Availability compatibility (15% weight)
  - Learning style matching (15% weight)
  - Historical success rate analysis (10% weight)
  - Interest alignment (20% weight)
  - Automated pairing suggestions
  - Manual override capability
- [ ] **Training Material Recommendations**
  - Goal-based recommendations
  - Progress-based suggestions
  - Collaborative filtering
  - Content vectorization and semantic search
  - Adaptive learning paths
  - Personalized course sequences
- [ ] **Predictive Analytics**
  - Success prediction for mentor-mentee pairs
  - Course completion likelihood
  - Dropout risk identification
  - Engagement score calculation

**Technical Requirements:**
- OpenAI GPT-4 API integration
- Vector database (Pinecone or Weaviate)
- LangChain for conversation management
- Training data collection and storage
- Privacy-compliant data handling
- Cost optimization strategies

**Estimated Costs:**
- OpenAI API: ~$550/month (1000 users)
- Vector database: ~$70/month
- Total: ~$620/month

---

### Enhanced Mentor Dashboard (Priority: Medium)
**Status:** Partially Complete

#### Features to Implement:
- [ ] **Advanced Mentee Management**
  - Detailed mentee profiles with progress history
  - Notes and feedback system
  - Goal tracking for each mentee
  - Communication history
- [ ] **Business Hours Management**
  - Set available time slots
  - Recurring availability patterns
  - Automatic session booking
  - Calendar integration (Google, Outlook)
- [ ] **Analytics for Mentors**
  - Total sessions conducted
  - Mentee progress metrics
  - Time investment tracking
  - Success stories and testimonials
- [ ] **Resource Sharing**
  - Upload private resources for mentees
  - Shared document workspace
  - Reading lists and recommendations
- [ ] **Communication Tools**
  - In-platform messaging
  - Video call integration (Zoom/Google Meet)
  - Screen sharing capabilities
  - Session recording (optional)

---

### Enhanced Mentee Dashboard (Priority: Low)
**Status:** Core Complete, Enhancements Needed

#### Features to Implement:
- [ ] **Detailed Course Views**
  - Individual course pages
  - Module breakdown
  - Quiz integration
  - Certificate generation on completion
- [ ] **Learning Path Visualization**
  - Progress timeline
  - Skill tree visualization
  - Next steps recommendations
- [ ] **Peer Interaction**
  - Study groups
  - Discussion forums
  - Peer mentorship opportunities
- [ ] **Career Tools**
  - Resume builder
  - Interview preparation resources
  - Job board integration
  - Networking opportunities

---

### Enhanced Admin Tools (Priority: Medium)
**Status:** Core Complete, Enhancements Needed

#### Features to Implement:
- [ ] **Advanced Analytics Dashboard**
  - Custom date range selection
  - Exportable reports (PDF, CSV)
  - Funnel analysis (signup to paid conversion)
  - Cohort analysis
  - Retention metrics
  - Engagement heatmaps
- [ ] **Content Management System**
  - Rich text editor for training materials
  - Media library management
  - Version control for content
  - Content scheduling and publishing
- [ ] **Bulk Operations**
  - Bulk user import/export
  - Mass email campaigns
  - Batch role assignments
- [ ] **Audit Logs**
  - User action tracking
  - Admin activity logs
  - Security event monitoring
- [ ] **Advanced Permissions**
  - Granular permission system
  - Custom role creation
  - Department-based access control

---

### Donor Platform Enhancements (Priority: Low)
**Status:** Zeffy Integrated, Enhancements Planned

#### Features to Implement:
- [ ] **GiveLively Integration**
  - Secondary donation platform
  - Campaign management
  - Donor CRM features
  - Email marketing integration
- [ ] **Donation Impact Tracking**
  - Real-time impact metrics
  - Donation allocation visualization
  - Success stories linked to donations
  - Tax receipt automation
- [ ] **Donor Recognition**
  - Donor wall/leaderboard
  - Recognition tiers
  - Thank you video messages
  - Impact reports for major donors
- [ ] **Recurring Donation Management**
  - Subscription management for donors
  - Donation history and analytics
  - Pledge tracking
  - Memorial and tribute giving

---

### Real-Time Features (Priority: Medium)
**Status:** SSE Implemented for Admin, Expand to Other Areas

#### Features to Implement:
- [ ] **Real-Time Messaging**
  - Mentor-mentee chat
  - Group chat for cohorts
  - File sharing in chat
  - Typing indicators
  - Read receipts
- [ ] **Live Notifications**
  - Browser push notifications
  - In-app notification center
  - Notification preferences
  - Real-time activity feed
- [ ] **Collaborative Features**
  - Shared whiteboard
  - Co-editing documents
  - Live session participation
  - Screen sharing

**Technical Requirements:**
- WebSocket server or Socket.io
- Redis for real-time data
- Notification service (Firebase Cloud Messaging)
- Scalable infrastructure

---

### Mobile Application (Priority: Low)
**Status:** Not Started

#### Features to Implement:
- [ ] **React Native App**
  - Cross-platform (iOS & Android)
  - Native performance
  - Offline capability
- [ ] **Core Features**
  - Dashboard access
  - Session booking
  - Notifications
  - Resource downloads
  - Messaging
- [ ] **Push Notifications**
  - Session reminders
  - New messages
  - Badge achievements
- [ ] **Mobile-Specific Features**
  - Camera integration for profile photos
  - QR code scanning for events
  - Location-based features

---

### Additional Features (Priority: Low)
**Status:** Future Considerations

#### Features to Implement:
- [ ] **Multi-Language Support**
  - Internationalization (i18n)
  - Multiple language translations
  - RTL support
- [ ] **Accessibility Enhancements**
  - WCAG AAA compliance
  - Screen reader optimization
  - Keyboard navigation improvements
  - Voice command support
- [ ] **Gamification**
  - Points system
  - Leaderboards
  - Challenges and quests
  - Seasonal events
- [ ] **Integration Marketplace**
  - Calendar integrations
  - CRM integrations
  - Learning management systems
  - Social media integrations
- [ ] **White-Label Capability**
  - Custom branding options
  - Multi-tenant architecture
  - Subdomain support

---

## 🤝 Contributing

This is a private repository for the Mothers to Daughters Foundation. If you're part of the team:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Request review from maintainers

---

## 📄 License

Proprietary - © 2026 Mothers to Daughters Foundation

---

## 🆘 Support

**For Technical Issues:**
- GitHub Issues: [Create an issue](https://github.com/Mothers-to-Daughters-Foundation/mtd-site/issues)
- Technical Documentation: See `/docs` folder

**For Platform Support:**
- Email: admin@motherstodaughters.org
- Website: [motherstodaughters.org](https://motherstodaughters.org)

---

## 🙏 Acknowledgments

Built with ❤️ by the Mothers to Daughters Foundation team.

Special thanks to all contributors, mentors, and mentees who make this platform possible.

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** Active Development
