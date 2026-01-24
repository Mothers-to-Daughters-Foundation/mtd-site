# Authentication & Dashboard Features

## ✅ Completed Features

### Authentication System
- ✅ NextAuth.js integration with credentials provider
- ✅ User registration with role selection (mentor/donor)
- ✅ Login/logout functionality
- ✅ JWT-based session management
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware

### User Management
- ✅ MongoDB user storage
- ✅ User model with roles (mentor, donor, admin)
- ✅ Profile management structure
- ✅ Secure password validation

### Mentor Dashboard
- ✅ Main mentor dashboard (`/dashboard/mentor`)
- ✅ Profile management page (`/dashboard/mentor/profile`)
- ✅ Mentees management page (`/dashboard/mentor/mentees`)
- ✅ Resources page (placeholder)
- ✅ Activity tracking page (placeholder)

### Donor Portal
- ✅ Main donor dashboard (`/dashboard/donor`)
- ✅ Donation history page (`/dashboard/donor/history`)
- ✅ Impact tracking page (`/dashboard/donor/impact`)
- ✅ Profile settings page (placeholder)
- ✅ Quick donate link

### Navigation
- ✅ "Sign In" link in header
- ✅ Logout button in dashboards
- ✅ Role-based redirects

## 🔧 Setup Required

### 1. Environment Variables
Add to `.env.local`:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/mtd-site
MONGODB_DB_NAME=mtd-site
```

### 2. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 3. MongoDB Setup
- Install MongoDB locally OR
- Use MongoDB Atlas (free tier available)
- Create database `mtd-site`
- Users collection will be created automatically

## 📁 New File Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx
        page.module.css
      register/
        page.tsx
        page.module.css
    dashboard/
      page.tsx (redirects based on role)
      mentor/
        page.tsx
        page.module.css
        profile/
        mentees/
      donor/
        page.tsx
        page.module.css
        history/
        impact/
    api/
      auth/
        [...nextauth]/route.ts
        register/route.ts
  lib/
    auth.ts (NextAuth configuration)
    db.ts (MongoDB connection)
    models/
      User.ts (User model & functions)
  components/
    LogoutButton.tsx
    providers/
      SessionProvider.tsx
  middleware.ts (Route protection)
  types/
    next-auth.d.ts (TypeScript types)
```

## 🚀 Usage

### Registration Flow
1. User visits `/register`
2. Selects role (Mentor or Donor)
3. Fills out form
4. Account created in MongoDB
5. Redirected to `/login`

### Login Flow
1. User visits `/login`
2. Enters credentials
3. NextAuth validates against MongoDB
4. Session created
5. Redirected to role-specific dashboard

### Dashboard Access
- **Mentors** → `/dashboard/mentor`
- **Donors** → `/dashboard/donor`
- **Admins** → `/dashboard/admin` (future)

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT sessions (no server-side session storage needed)
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Password minimum length (8 characters)
- ✅ Email validation

## 📝 Next Steps

### Immediate
1. Set up MongoDB (local or Atlas)
2. Add environment variables
3. Test registration and login
4. Customize dashboard content

### Future Enhancements
- Email verification
- Password reset functionality
- Profile image uploads
- Mentee-mentor matching system
- Donation tracking integration
- Admin panel
- Two-factor authentication
- Social login (Google, Facebook)

## 🧪 Testing

1. **Register a mentor account:**
   - Go to `/register`
   - Select "Mentor"
   - Fill form and submit
   - Should redirect to `/login`

2. **Login:**
   - Go to `/login`
   - Enter credentials
   - Should redirect to `/dashboard/mentor`

3. **Test protected routes:**
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`

4. **Test role-based access:**
   - Login as mentor
   - Try accessing `/dashboard/donor`
   - Should redirect to `/dashboard`
