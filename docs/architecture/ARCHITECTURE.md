# System Architecture

## Overview

The Mothers to Daughters (M2D) Mentorship Platform is a full-stack web application built using Next.js and Supabase.

The application follows a modern server-first architecture using the Next.js App Router, with Supabase providing authentication, database services, storage, and row-level security.

The system is designed around three primary user roles:

- Administrator
- Mentor
- Mentee

Each role has dedicated dashboards and permissions while sharing the same secure backend infrastructure.

---

## High-Level Architecture

```text
                     Users
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Admin          Mentor          Mentee
        │               │               │
        └───────────────┼───────────────┘
                        │
                Next.js Frontend
                        │
                App Router Pages
                        │
                API Route Handlers
                        │
        ┌───────────────┼────────────────┐
        │               │                │
 Authentication     Database        Storage
        │               │                │
        └───────────────┼────────────────┘
                        │
                  Supabase Backend
                        │
                  PostgreSQL Database
```

---

## Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- CSS Modules

---

## Backend

- Supabase
- PostgreSQL

---

## Authentication

- Supabase Authentication
- Role-based Authorization

---

## Payment Providers

- Stripe
- Zeffy

---

## Deployment

- Vercel
- Supabase Cloud

---

## Application Layers

The application is organized into several logical layers.

```text
Presentation Layer
        │
Business Logic Layer
        │
API Layer
        │
Database Layer
```

---

## Presentation Layer

Responsible for user interaction.

Major components include:

- Landing Pages
- Login
- Registration
- Admin Dashboard
- Mentor Dashboard
- Mentee Dashboard
- Profile Pages
- Subscription Pages

---

## Business Logic Layer

Contains application logic responsible for:

- User management
- Subscription management
- Mentor assignment
- Dashboard statistics
- Notifications
- Resource management

Business logic is implemented inside:

```text
src/lib/supabase/
```

---

## API Layer

The API layer handles communication between the frontend and backend.

Example endpoints include:

```text
/api/admin/
/api/subscriptions/
/api/resources/
/api/auth/
/api/mentor/
/api/mentee/
```

Responsibilities:

- Validate requests
- Verify authentication
- Check authorization
- Execute business logic
- Return JSON responses

---

## Database Layer

Supabase PostgreSQL stores all application data.

Primary tables include:

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

Detailed documentation is available in:

```text
DATABASE.md
DATABASE_ARCHITECTURE.md
```

---

## Authentication Flow

```text
User
 │
 ▼
Login/Register
 │
 ▼
Supabase Authentication
 │
 ▼
JWT Session
 │
 ▼
Fetch user profile
 │
 ▼
Determine role
 │
 ▼
Redirect to dashboard
```

---

## Authorization Model

The platform uses Role-Based Access Control (RBAC).

## Administrator

Can:

- Manage users
- Manage subscriptions
- Manage mentorships
- Manage resources
- View platform statistics

---

## Mentor

Can:

- View assigned mentees
- Update mentor profile
- Access resources
- View subscription

---

## Mentee

Can:

- Update profile
- View mentor
- Manage subscription
- Access resources

---

## Dashboard Architecture

## Admin Dashboard

Modules:

- Users
- Mentorships
- Subscription Plans
- Resources
- Notifications

---

## Mentor Dashboard

Modules:

- Profile
- My Mentees
- Resources
- Notifications

---

## Mentee Dashboard

Modules:

- Profile
- My Mentor
- Subscription
- Resources
- Notifications

---

## Subscription Architecture

```text
Plans
     │
     ▼
Subscriptions
     │
     ▼
User Profile
```

Payment providers:

- Stripe
- Zeffy

The platform stores subscription information in Supabase while payment processing is delegated to the configured provider.

---

## Mentorship Architecture

```text
Mentor
     │
     ▼
Mentorship Record
     ▲
     │
Mentee
```

Each mentorship record stores:

- Mentor ID
- Mentee ID
- Status
- Start Date
- End Date

---

## Storage Architecture

Supabase Storage is used for:

- User avatars
- Resource files
- Session documents
- Uploaded assets

Storage access is protected using Row Level Security policies.

---

## Security Architecture

The platform implements:

- Supabase Authentication
- Row Level Security (RLS)
- Protected API routes
- Server-side authorization
- Secure environment variables
- Input validation

---

## Error Handling

Application errors are handled through:

- API validation
- Supabase error handling
- Next.js error boundaries
- User-friendly error messages
- Logging

---

## Scalability Considerations

The architecture is designed to support:

- Additional subscription plans
- Increased user volume
- More dashboard modules
- Messaging
- Video mentoring
- Analytics
- Email notifications

---

## Future Architecture Enhancements

Planned improvements include:

- Real-time messaging
- Calendar integration
- Video conferencing
- Push notifications
- Reporting dashboard
- Audit logging
- Advanced analytics

---

## Related Documentation

- PROJECT_OVERVIEW.md
- DATABASE.md
- DATABASE_ARCHITECTURE.md
- API.md
- AUTHENTICATION.md
- DEPLOYMENT.md
