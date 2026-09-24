# Database Architecture

Version 2.0

---

## Modules

Authentication

User Management

Membership

Mentorship

Sessions

Resources

Messaging

Notifications

Administration

Content Management

---

## Authentication Module

Table

user_profiles

Purpose

Stores all registered users.

Primary Key

id

Relationships

user_profiles

↓

subscriptions

↓

mentorships

↓

messages

↓

notifications

---

## Membership Module

Tables

plans

plan_benefits

plan_audiences

subscriptions

billing_history

Purpose

Handles all paid memberships and billing.

...

(continue exactly as we previously designed)
