# API Documentation

## Overview

The Mothers to Daughters (M2D) Mentorship Platform exposes server-side API routes that power dashboard functionality, authentication, subscription management, mentorship management, resources, notifications, and administrative operations.

All endpoints are implemented using **Next.js App Router Route Handlers** and communicate with **Supabase PostgreSQL**.

Most endpoints require an authenticated user. Access is enforced using Supabase Authentication and Role-Based Access Control (RBAC).

---

## API Architecture

```text
Browser

↓

Next.js Route Handler

↓

Authentication Check

↓

Role Authorization

↓

Business Logic

↓

Supabase

↓

PostgreSQL

↓

JSON Response
```

---

## Authentication

Protected endpoints verify:

- Active user session
- Valid JWT
- User profile
- User role

Unauthorized requests return:

```http
401 Unauthorized
```

Forbidden requests return:

```http
403 Forbidden
```

---

## Response Format

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "error": "Description of error"
}
```

---

## Authentication Routes

## Login

```text
POST /login
```

Authenticates a user through Supabase Authentication.

---

## Logout

```text
POST /logout
```

Ends the authenticated session.

---

## Register

```text
POST /register
```

Creates:

- Supabase Authentication account
- user_profiles record

---

## Admin API

Base Route

```text
/api/admin
```

---

## Users

```text
GET /api/admin/users
```

Returns all users.

Requires:

- Admin

---

```text
GET /api/admin/users/{id}
```

Returns a specific user.

---

```text
PATCH /api/admin/users/{id}
```

Updates user information.

---

## Subscription Plans

```text
GET /api/admin/plans
```

Returns all subscription plans.

---

```text
POST /api/admin/plans
```

Creates a new subscription plan.

---

```text
PATCH /api/admin/plans/{id}
```

Updates a plan.

---

```text
DELETE /api/admin/plans/{id}
```

Deactivates a plan.

---

## Mentorships

```text
GET /api/admin/mentorships
```

Returns mentorship assignments.

---

```text
POST /api/admin/mentorships
```

Creates a mentorship assignment.

---

## Resources

```text
GET /api/admin/resources
```

Returns all resources.

---

```text
POST /api/admin/resources
```

Uploads a new resource.

---

## Mentor API

Base Route

```text
/api/mentor
```

---

## My Profile

```text
GET /api/mentor/profile
```

Returns mentor profile.

---

```text
PATCH /api/mentor/profile
```

Updates mentor profile.

---

## My Mentees

```text
GET /api/mentor/mentees
```

Returns assigned mentees.

---

## Resources (Mentor)

```text
GET /api/mentor/resources
```

Returns mentor resources.

---

## Mentee API

Base Route

```text
/api/mentee
```

---

## My Profile (Mentee)

```text
GET /api/mentee/profile
```

Returns current profile.

---

```text
PATCH /api/mentee/profile
```

Updates profile.

---

## My Mentor

```text
GET /api/mentee/mentor
```

Returns assigned mentor.

---

## Subscription

```text
GET /api/subscriptions/me
```

Returns current subscription.

---

```text
POST /api/subscriptions/checkout
```

Starts subscription checkout.

Supports:

- Stripe
- Zeffy

---

```text
POST /api/subscriptions/cancel
```

Cancels current subscription.

---

## Resources API

```text
GET /api/resources
```

Returns available resources.

---

```text
GET /api/resources/{id}
```

Returns a single resource.

---

## Notifications API

```text
GET /api/notifications
```

Returns notifications for the authenticated user.

---

```text
PATCH /api/notifications/{id}
```

Marks a notification as read.

---

## HTTP Status Codes

| Code | Meaning |
| ------ | --------- |
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Security

Every protected endpoint verifies:

- Authentication
- Authorization
- Session validity
- Database permissions

Database access is additionally protected through:

- Row Level Security (RLS)
- Foreign key constraints
- Server-side validation

---

## Error Handling

The API returns structured JSON errors.

Example:

```json
{
  "error": "Subscription not found"
}
```

Unexpected errors are logged on the server while generic error messages are returned to clients.

---

## Future Endpoints

Planned API additions include:

- Messaging
- Session scheduling
- Calendar integration
- Email notifications
- Analytics
- Audit logs
- Reporting

---

## Related Documentation

- AUTHENTICATION.md
- DATABASE.md
- DATABASE_ARCHITECTURE.md
- SECURITY.md
- DEPLOYMENT.md
