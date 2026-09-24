# System Architecture

Version 1.0

---

## Overview

Mothers to Daughters uses a modern server-first architecture built with Next.js and Supabase.

``` {
Browser
      │
      ▼
Next.js Application
      │
      ▼
Server Components
      │
      ▼
Supabase
      │
      ├── PostgreSQL
      ├── Authentication
      ├── Storage
      └── Row Level Security
      │
      ▼
Stripe / Zeffy
}
```

---

## Major Components

Frontend

- Next.js
- React
- TypeScript

Backend

- Supabase

Database

- PostgreSQL

Authentication

- Supabase Auth

Storage

- Supabase Storage

Payments

- Stripe
- Zeffy

Hosting

- Vercel

---

## Authentication Flow

User

↓

Login

↓

Supabase Auth

↓

JWT

↓

Server Component

↓

Dashboard

---

## Membership Flow

Pricing Page

↓

Checkout

↓

Stripe / Zeffy

↓

Webhook

↓

Subscription Table

↓

Dashboard Updates

---

## Mentorship Flow

User

↓

Mentor Request

↓

Admin Review

↓

Mentorship Record

↓

Sessions

↓

Feedback

---

## Messaging Flow

Conversation

↓

Messages

↓

Notifications

---

## Resource Flow

Admin Upload

↓

Supabase Storage

↓

Resources Table

↓

Dashboard

---

## Security

- Row Level Security
- Protected Server Components
- Role-based Authorization
- Secure API Routes
