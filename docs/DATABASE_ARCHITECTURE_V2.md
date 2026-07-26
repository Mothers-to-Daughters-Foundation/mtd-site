
# Mothers to Daughters (M2D)

## Database Architecture v2.0

Version: 2.0

Author: Solomon Umoh

Project: Mothers to Daughters Mentor/Mentee Web App (M2D)

Platform:

- Next.js 15
- Supabase
- PostgreSQL
- Stripe
- Zeffy

---

## Purpose

This document defines the official database architecture for the Mothers to Daughters platform.

It serves as the single source of truth for:

- Database schema
- Relationships
- Business rules
- Security
- Future development

Every schema change should be reflected in this document before implementation.

---

## System Modules

The application consists of the following modules:

1. Authentication
2. User Management
3. Membership
4. Mentorship
5. Sessions
6. Resources
7. Messaging
8. Notifications
9. Content Management
10. Administration

---

## Authentication Module

Tables

- user_profiles

Views

- admin_users

Purpose

Stores every authenticated user's profile information.

Primary Key

id (UUID)

Relationships

user_profiles
    |
    |------< mentorships
    |
    |------< subscriptions
    |
    |------< notifications
    |
    |------< messages

---

## User Profile Fields

id

email

full_name

role

status

phone

country

city

bio

expertise

availability

avatar_url

created_at

updated_at

Future fields

linkedin_url

website

timezone

preferred_language

is_public

---

## Membership Module

Purpose

Manages subscription plans, payments and memberships.

Tables

plans

plan_benefits

plan_audiences

subscriptions

billing_history

Future

payment_providers

coupons

discounts

---

## Plans

One record represents one membership offering.

Examples

Builder

Mentor

Strategic Partner

Proximity Circle

Sponsored Mentee

Vibe Coding Cohort

Columns

id

name

slug

tagline

description

offering_type

monthly_price

yearly_price

button_text

stripe_price_id

zeffy_url

display_order

is_featured

is_active

created_at

updated_at

---

## Offering Types

membership

cohort

sponsorship

partnership

---

## Plan Benefits

Stores unlimited benefits for every plan.

Columns

id

plan_id

benefit

display_order

created_at

Relationship

Plan

↓

Many Benefits

---

## Plan Audiences

Stores "Best For" items.

Columns

id

plan_id

audience

display_order

created_at

Relationship

Plan

↓

Many Audiences

---

## Subscriptions

Tracks purchased memberships.

Columns

id

user_id

plan_id

status

billing_cycle

payment_provider

provider_subscription_id

provider_customer_id

started_at

expires_at

cancelled_at

auto_renew

is_current

created_at

updated_at

Relationship

User

↓

Subscription

↓

Plan

---

## Billing History

Stores every payment.

Columns

id

subscription_id

amount

currency

provider

provider_reference

status

paid_at

created_at

Relationship

Subscription

↓

Many Billing Records

---

## Mentorship Module

Tables

mentor_requests

mentorships

Purpose

Connect mentors with mentees.

Relationship

Mentor

↓

Mentorship

↓

Mentee

---

## Sessions Module

Tables

sessions

session_feedback

Purpose

Stores scheduled mentorship sessions.

Relationship

Mentorship

↓

Sessions

↓

Feedback

---

## Resources Module

Tables

resources

Future

resource_categories

downloads

favorites

---

## Messaging Module

Tables

conversations

conversation_members

messages

Purpose

Private messaging system.

---

## Notification Module

Tables

notifications

Purpose

In-app notifications.

---

## Content Management

Tables

testimonials

faqs

statistics

site_content

Purpose

Allows administrators to edit website content without code changes.

---

## Testimonials

Stores testimonials.

Columns

id

name

role

photo_url

quote

display_order

is_active

created_at

---

## FAQs

Columns

id

question

answer

display_order

is_active

created_at

---

## Statistics

Columns

id

title

value

display_order

is_active

---

## Site Content

Stores editable website content.

Columns

id

key

title

subtitle

body

button_text

button_link

updated_at

---

## Administration Module

Tables

audit_logs

Future

activity_logs

system_settings

---

## Security

All tables use Row Level Security (RLS).

Rules

Users

• Can read/update only their own profile.

Mentors

• Can access assigned mentees.

Mentees

• Can access assigned mentor.

Admins

• Full CRUD.

Public

• Read-only access to approved public content.

---

## Storage Buckets

avatars

resources

session-files

future

marketing-assets

---

## Payment Providers

Supported

Stripe

Zeffy

Future

Paystack

Flutterwave

---

## Future Enhancements

Coupons

Discount Campaigns

Referral Program

Gift Memberships

Sponsor Dashboard

Analytics Dashboard

Email Campaigns

Certificate Generation

AI Mentor Matching

Mobile App

---

## Development Rules

Never modify production tables without updating this document.

Every new table must include:

Primary Key

Foreign Keys

RLS Policies

Indexes

Timestamps

Documentation

---

End of Document
