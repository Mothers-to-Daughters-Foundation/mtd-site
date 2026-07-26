# Authentication & Authorization

## Overview

The Mothers to Daughters (M2D) Mentorship Platform uses **Supabase Authentication** for user identity management and **Role-Based Access Control (RBAC)** to authorize access to application features.

Authentication verifies who a user is, while authorization determines what that user is allowed to access.

The system is designed to provide secure, scalable, and server-side protected access to all application resources.

---

## Authentication Architecture

```text
               User
                 │
                 ▼
      Login / Register Page
                 │
                 ▼
        Supabase Authentication
                 │
                 ▼
         JWT Access Token
                 │
                 ▼
      Retrieve user_profiles Record
                 │
                 ▼
         Determine User Role
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
     Admin    Mentor   Mentee
        │        │        │
        ▼        ▼        ▼
 Appropriate Dashboard Access
```

---

## Authentication Provider

The platform uses:

- Supabase Authentication
- Email and Password Sign-In
- Secure JWT Sessions
- Server-side Session Validation

Authentication is fully managed by Supabase while user-specific information is stored separately inside the `user_profiles` table.

---

## Registration Flow

When a new user registers:

1. The user submits the registration form.
2. Supabase creates the authentication account.
3. A corresponding record is created in `user_profiles`.
4. Default values are assigned.
5. The user is redirected to the appropriate page.

Default profile values include:

- Role
- Account status
- Created timestamp
- Updated timestamp

---

## Login Flow

```text
User
 │
 ▼
Enter Email & Password
 │
 ▼
Supabase Auth
 │
 ▼
Credentials Valid?
 │
 ├── No
 │      │
 │      ▼
 │  Display Error
 │
 ▼
Retrieve Profile
 │
 ▼
Determine Role
 │
 ▼
Redirect to Dashboard
```

---

## Session Management

Sessions are managed entirely by Supabase.

Each authenticated request includes a valid JWT access token that is verified before protected content is returned.

Sessions are validated server-side before rendering protected pages.

---

## User Roles

The platform supports three roles.

## Administrator

Administrators have full platform access.

Permissions include:

- Manage users
- Manage subscriptions
- Manage mentorships
- Manage resources
- View administrative dashboards

---

## Mentor

Mentors can:

- View assigned mentees
- Update mentor profile
- Access resources
- Manage mentorship activities

---

## Mentee

Mentees can:

- Manage their profile
- View assigned mentor
- Manage subscriptions
- Access learning resources

---

## Role-Based Access Control (RBAC)

Role information is stored in:

```text
user_profiles.role
```

Supported roles:

```text
admin
mentor
mentee
```

Each protected page verifies the authenticated user's role before rendering.

Example flow:

```text
Authenticated User
        │
        ▼
Retrieve user_profiles.role
        │
        ▼
Role Allowed?
        │
    ┌───┴────┐
    │        │
   Yes       No
    │        │
    ▼        ▼
Render     Redirect
Page
```

---

## Route Protection

Protected pages validate authentication before rendering.

Example process:

1. Retrieve authenticated user.
2. Verify active session.
3. Retrieve user profile.
4. Verify role.
5. Render page.

If any validation fails, the user is redirected.

---

## Server-Side Authorization

Protected server components perform authorization before returning content.

Typical validation sequence:

```text
Check Session

↓

Retrieve User

↓

Retrieve Profile

↓

Verify Role

↓

Render Page
```

This prevents unauthorized users from accessing restricted pages.

---

## API Security

Protected API routes verify:

- Active authentication session
- Valid user profile
- Required user role

Requests that fail authorization return:

```text
401 Unauthorized
```

or

```text
403 Forbidden
```

---

## Row Level Security (RLS)

Supabase Row Level Security is enabled on application tables.

RLS ensures that users can only access data they are authorized to view or modify.

Typical policies include:

- Users can read their own profile.
- Users can update their own profile.
- Administrators can manage all profiles.
- Mentors can access assigned mentees where permitted.
- Mentees can access their own mentorship information.

---

## Profile Management

User identity and profile information are intentionally separated.

## Authentication Data

Managed by Supabase Auth.

Examples:

- Email
- Password
- Authentication session

---

## Profile Data

Stored in:

```text
user_profiles
```

Examples:

- Full name
- Role
- Bio
- Phone
- Country
- City
- Expertise
- Availability

---

## Logout Flow

```text
User

↓

Logout

↓

Supabase Sign Out

↓

Session Destroyed

↓

Redirect to Login
```

Once logged out, protected routes can no longer be accessed without authentication.

---

## Security Features

The authentication system includes:

- Supabase Authentication
- JWT session validation
- Protected server components
- Role-Based Access Control
- Row Level Security
- Secure API authorization
- Server-side redirects
- Environment variable protection

---

## Future Enhancements

Potential future improvements include:

- Email verification
- Password reset
- Multi-factor authentication (MFA)
- Social login providers
- Session expiration notifications
- Audit logging

---

## Related Documentation

- ARCHITECTURE.md
- DATABASE.md
- DATABASE_ARCHITECTURE.md
- API.md
- SECURITY.md
