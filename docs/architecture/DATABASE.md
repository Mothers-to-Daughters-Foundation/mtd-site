# Database Overview

## Introduction

The Mothers to Daughters (M2D) Mentorship Platform uses **Supabase PostgreSQL** as its primary relational database.

The database is designed to support secure authentication, role-based access control, mentorship relationships, subscription management, educational resources, messaging, and notifications.

All application data is stored in PostgreSQL and protected using Supabase Row Level Security (RLS).

---

## Database Design Principles

The database follows several design principles:

- UUID primary keys
- Foreign key relationships
- Row Level Security (RLS)
- Automatic timestamps
- Normalized structure
- Scalable schema
- Secure access through Supabase

---

## Entity Relationship Overview

```text
user_profiles
      │
      ├────────────┐
      │            │
      ▼            ▼
subscriptions   mentorships
      │            │
      │            ├────────────┐
      │            │            │
      ▼            ▼            ▼
plans      mentor_requests   sessions

user_profiles
      │
      ▼
notifications

user_profiles
      │
      ▼
conversations
      │
      ▼
messages

resources
```

---

## Core Tables

---

## user_profiles

### Purpose - User Profiles

Stores every registered user on the platform.

### Used By

- Authentication
- Dashboards
- Mentorships
- Sessions
- Notifications
- Resources

### Main Fields (User Profiles)

| Column | Description |
| --------- | ------------- |
| id | User ID (UUID) |
| email | User email |
| full_name | Full name |
| role | admin, mentor, mentee |
| status | Account status |
| phone | Phone number |
| country | Country |
| city | City |
| bio | User biography |
| avatar_url | Profile picture |
| expertise | Mentor specialization |
| availability | Mentor availability |
| created_at | Creation timestamp |
| updated_at | Last update |

---

## plans

Defines the subscription plans available to users.

## Main Fields (Plans)

| Column | Description |
| --------- | ------------- |
| id | Plan ID |
| name | Plan name |
| slug | URL slug |
| description | Plan description |
| monthly_price | Monthly price |
| yearly_price | Annual price |
| mentor_limit | Maximum mentors |
| session_limit | Session limit |
| resource_access | Resource access |
| priority_support | Priority support |
| stripe_price_id | Stripe Price ID |
| zeffy_url | Zeffy payment URL |
| is_active | Active status |

---

## subscriptions

### Purpose (Subscription)

Tracks user subscriptions.

### Relationships

- user_profiles
- plans

### Main Fields (Subscription)

| Column | Description |
| --------- | ------------- |
| id | Subscription ID |
| user_id | Subscriber |
| plan_id | Selected plan |
| status | Subscription status |
| billing_cycle | Monthly or yearly |
| started_at | Start date |
| expires_at | Expiration date |
| cancelled_at | Cancellation date |
| auto_renew | Auto renewal |
| is_current | Current subscription |

---

## mentorships

### Purpose

Stores mentor and mentee relationships.

### Relationships (Mentorships)

- Mentor
- Mentee

### Main Fields (Mentorships)

| Column | Description |
| --------- | ------------- |
| id | Mentorship ID |
| mentor_id | Assigned mentor |
| mentee_id | Assigned mentee |
| status | Mentorship status |
| created_at | Assignment date |

---

## mentor_requests

### Purpose (Mentor Requests)

Stores mentorship requests submitted by mentees.

### Main Fields (Mentor Requests)

| Column | Description |
| --------- | ------------- |
| id | Request ID |
| mentee_id | Requesting mentee |
| mentor_id | Requested mentor |
| status | Request status |
| created_at | Request date |

---

## sessions

### Purpose (Sessions)

Stores mentoring sessions.

### Main Fields (Sessions)

| Column | Description |
| --------- | ------------- |
| id | Session ID |
| mentor_id | Mentor |
| mentee_id | Mentee |
| scheduled_at | Scheduled date |
| status | Session status |
| notes | Session notes |

---

## resources

### Purpose (Resources)

Stores educational materials shared with users.

### Main Fields (Resources)

| Column | Description |
| --------- | ------------- |
| id | Resource ID |
| title | Resource title |
| description | Description |
| file_url | File location |
| created_by | Uploaded by |
| created_at | Upload date |

---

## notifications

### Purpose (Notifications)

Stores notifications displayed to users.

### Main Fields (Notifications)

| Column | Description |
| --------- | ------------- |
| id | Notification ID |
| user_id | Recipient |
| title | Notification title |
| message | Notification message |
| read | Read status |
| created_at | Creation date |

---

## conversations

### Purpose (conversations)

Represents messaging conversations.

### Main Fields (conversations)

| Column | Description |
| --------- | ------------- |
| id | Conversation ID |
| created_at | Creation date |

---

## messages

### Purpose (messages)

Stores messages exchanged between users.

### Main Fields (messages)

| Column | Description |
| --------- | ------------- |
| id | Message ID |
| conversation_id | Conversation |
| sender_id | Sender |
| content | Message |
| created_at | Sent date |

---

## Security

The database uses:

- Row Level Security (RLS)
- Foreign Keys
- Constraints
- Secure authentication
- Protected Storage Buckets

---

## Storage Buckets

The application uses Supabase Storage for:

- User Avatars
- Resources
- Session Files
- Resumes

Each bucket has its own security policies.

---

## Relationships Summary

```text
user_profiles
      │
      ├────────► subscriptions
      │                │
      │                ▼
      │              plans
      │
      ├────────► mentorships
      │
      ├────────► mentor_requests
      │
      ├────────► sessions
      │
      ├────────► notifications
      │
      ├────────► conversations
      │
      └────────► messages
```

---

## Performance

The database is optimized through:

- UUID primary keys
- Foreign key indexes
- RLS policies
- Query optimization
- Automatic timestamps

---

## Related Documentation

- DATABASE_ARCHITECTURE.md
- ARCHITECTURE.md
- API.md
