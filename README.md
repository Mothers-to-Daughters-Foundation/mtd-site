# Mothers to Daughters (M2D) Mentorship Platform

A modern mentorship platform that connects women seeking guidance with experienced mentors through a secure, subscription-based web application.

The Mothers to Daughters (M2D) platform provides a centralized environment for mentorship, communication, session management, learning resources, and subscription management while giving administrators complete control over the platform.

---

## Overview

M2D is designed to help women grow personally and professionally by connecting them with qualified mentors.

The platform allows administrators to manage users, mentorship assignments, subscriptions, resources, and mentoring sessions while providing mentors and mentees with dedicated dashboards tailored to their responsibilities.

---

## Features

### Authentication

- Supabase Authentication
- Secure user authentication
- Role-based access control
- Protected dashboard routes
- Session management

### User Roles

- Administrator
- Mentor
- Mentee

### Admin Dashboard

- User Management
- Subscription Management
- Mentorship Assignment
- Resource Management
- Platform Administration

### Mentor Dashboard

- Manage assigned mentees
- View mentorship information
- Update mentor profile
- Access shared resources

### Mentee Dashboard

- View assigned mentor
- Manage subscription
- Update profile
- Access learning resources

### Subscription System

- Multiple subscription plans
- Monthly pricing
- Stripe integration
- Zeffy integration
- Subscription tracking

### Database Features

- Row Level Security (RLS)
- Secure API access
- Automatic timestamps
- Optimized indexes
- Foreign key relationships

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS Modules

### Backend

- Supabase
- PostgreSQL

### Payments

- Stripe
- Zeffy

### Deployment

- Vercel
- Supabase Cloud

---

## Project Structure

```text
src/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   └── subscription/
│
├── components/
│
├── lib/
│   ├── supabase/
│   ├── services/
│   └── utils/
│
├── hooks/
│
├── styles/
│
└── types/

docs/
```

---

## Database

Primary database tables include:

- user_profiles
- plans
- subscriptions
- mentorships
- mentor_requests
- sessions
- resources
- notifications
- conversations
- messages

Complete documentation is available in:

- docs/DATABASE.md

---

## Documentation

Project documentation is located inside the **docs/** directory.

| Document | Description |
|----------|-------------|

| PROJECT_OVERVIEW.md | Project goals and vision |
| ARCHITECTURE.md | System architecture |
| DATABASE.md | Database schema |
| API.md | API documentation |
| AUTHENTICATION.md | Authentication flow |
| PAYMENTS.md | Payment integration |
| DEPLOYMENT.md | Deployment guide |
| SECURITY.md | Security practices |
| TESTING.md | Testing procedures |
| TROUBLESHOOTING.md | Common issues |

---

## Local Development

### Clone the repository

```bash
git clone <repository-url>
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### Run the application

```bash
npm run dev
```

Application runs on:

``` test url
http://localhost:3000
```

---

## Security

The application implements:

- Row Level Security (RLS)
- Protected API Routes
- Role-Based Authorization
- Secure Authentication
- Environment Variable Protection

---

## Roadmap

Current project status includes:

- Authentication
- User Profiles
- Admin Dashboard
- Mentor Dashboard
- Mentee Dashboard
- Subscription Management
- Database Architecture

Future enhancements include:

- Messaging
- Video Sessions
- Email Notifications
- Analytics Dashboard
- Mobile Optimization

---

## Contributing

This project is currently maintained by the M2D development team.

Future contribution guidelines will be documented in:

``` markdown
docs/CONTRIBUTING.md
```

---

## License

This project is proprietary and intended for the Mothers to Daughters (M2D) organization.

All rights reserved.

---

## Acknowledgements

Developed for the Mothers to Daughters (M2D) mentorship initiative.

Built with Next.js, Supabase, PostgreSQL, Stripe, and Zeffy.
