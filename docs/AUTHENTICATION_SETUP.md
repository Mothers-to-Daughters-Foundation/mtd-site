# Authentication & User Management Setup

## Overview

The site now includes:
- **User Authentication** - Login and registration
- **Mentor Dashboard** - For mentors to manage their profile and mentees
- **Donor Portal** - For donors to view donation history and impact
- **Role-Based Access Control** - Different dashboards based on user role

## Technology Stack

- **NextAuth.js** - Authentication library for Next.js
- **MongoDB** - Database for user storage
- **bcryptjs** - Password hashing
- **JWT** - Session management

## Environment Variables

Add these to your `.env.local`:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mtd-site
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mtd-site
MONGODB_DB_NAME=mtd-site
```

## Database Setup

### Local MongoDB

1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Create a database named `mtd-site`
3. The `users` collection will be created automatically

### MongoDB Atlas (Recommended for Production)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to `MONGODB_URI` in `.env.local`

## User Roles

- **mentor** - Access to mentor dashboard
- **donor** - Access to donor portal
- **admin** - Access to all dashboards (future admin panel)

## Routes

### Public Routes
- `/login` - Sign in page
- `/register` - Registration page

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard (redirects based on role)
- `/dashboard/mentor` - Mentor dashboard
- `/dashboard/mentor/profile` - Mentor profile management
- `/dashboard/mentor/mentees` - Mentee management
- `/dashboard/donor` - Donor portal
- `/dashboard/donor/history` - Donation history
- `/dashboard/donor/impact` - Impact tracking

## Registration Flow

1. User visits `/register`
2. Fills out form (name, email, password, role)
3. Account created in MongoDB
4. Redirected to `/login`
5. After login, redirected to role-specific dashboard

## Authentication Flow

1. User enters credentials on `/login`
2. NextAuth validates against MongoDB
3. JWT session created
4. User redirected to `/dashboard`
5. Middleware checks role and redirects to appropriate dashboard

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Secure password requirements (min 8 characters)

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set up MongoDB**: Local or Atlas
3. **Configure environment variables**: Add to `.env.local`
4. **Generate NEXTAUTH_SECRET**: `openssl rand -base64 32`
5. **Test registration**: Create test accounts
6. **Customize dashboards**: Add specific features for mentors/donors

## Future Enhancements

- Email verification
- Password reset functionality
- Profile image upload
- Mentee-mentor matching system
- Donation tracking integration
- Admin panel for user management
