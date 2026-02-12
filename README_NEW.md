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
- Analytics and reporting
- Subscription management
- Platform statistics

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
- **My Progress**: Track learning journey and completion rates
- **Training Materials**: Access courses and resources
- **My Mentors**: Connect with assigned mentors
- **Sessions**: Schedule mentorship sessions
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
- **Analytics**: View platform metrics and statistics
- **Subscriptions**: Monitor subscription status
- **Payments**: Track all transactions
- **Relationships**: Manage mentor-mentee pairings
- **Training Materials**: Create and manage content
- **Badges**: Create achievement badges

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

### ✅ Completed
- [x] Wix to Next.js migration
- [x] Multi-role authentication system
- [x] Database architecture and models
- [x] Role-based dashboards
- [x] Admin user management
- [x] Analytics dashboard
- [x] API routes for core features
- [x] Documentation

### 🚧 In Progress
- [ ] Detailed admin interfaces
- [ ] Dashboard feature implementations
- [ ] Email verification system

### 📋 Planned
- [ ] Stripe payment integration
- [ ] PayPal payment integration
- [ ] Apple Pay support
- [ ] GiveLively donor integration
- [ ] AI-powered onboarding
- [ ] Mentor-mentee matching algorithm
- [ ] Training material recommendations
- [ ] Email notification system
- [ ] Real-time messaging
- [ ] Mobile app

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
