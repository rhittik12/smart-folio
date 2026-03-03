# Smartfolio -- Setup Guide

## Overview

Smartfolio is an AI-native developer portfolio generator. The user experience is:

1. Land on `/` -- see the prompt input
2. Type a portfolio description (e.g., "Create a dark minimalist portfolio for a React developer")
3. Auth modal triggers on first generation attempt
4. Authenticate via Google or GitHub
5. Redirect to `/workspace` with prompt carried over
6. AI generates a complete portfolio with live preview
7. Refine via follow-up prompts
8. Publish to `/p/[slug]`

There is no dashboard. The workspace is the product.

---

## Tech Stack

- **Next.js 16** -- App Router
- **React 19** -- UI
- **TypeScript 5** -- Type safety
- **Tailwind CSS 4** -- Styling
- **tRPC 11** -- Type-safe API layer
- **Prisma 6** -- ORM (PostgreSQL)
- **Better Auth** -- Authentication (Google, GitHub, email/password)
- **OpenAI** -- AI content generation
- **Stripe** -- Subscription billing
- **AWS S3** -- File storage
- **Upstash Redis** -- Rate limiting
- **Nodemailer** -- Transactional email

---

## Project Structure

```
smartfolio/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth API routes
│   │   ├── trpc/[trpc]/       # tRPC API routes
│   │   └── webhooks/stripe/   # Stripe webhook handler
│   ├── layout.tsx             # Root layout with TRPCProvider
│   └── page.tsx               # Landing page with prompt input
├── server/                     # Backend
│   ├── routers/               # tRPC routers
│   │   ├── _app.ts           # Root router
│   │   ├── user.ts           # User management
│   │   ├── portfolio.ts      # Portfolio operations
│   │   ├── ai.ts             # AI generation
│   │   ├── builder.ts        # Template/block operations
│   │   └── billing.ts        # Stripe billing
│   ├── services/              # Business logic
│   │   ├── ai.ts             # OpenAI integration
│   │   ├── stripe.ts         # Stripe integration
│   │   ├── email.ts          # Email sending
│   │   ├── storage.ts        # S3 file storage
│   │   └── index.ts          # Service container
│   ├── middleware/            # Rate limiting, plan checks
│   ├── trpc.ts               # tRPC initialization
│   └── caller.ts             # Server-side caller
├── modules/                    # Feature modules
│   ├── auth/                  # Auth hooks, types, utils
│   ├── portfolio/             # Portfolio hooks, types, utils
│   ├── ai/                    # AI generation hooks, types
│   ├── builder/               # Builder hooks, types
│   └── billing/               # Billing hooks, types
├── components/                 # Shared UI
│   ├── ui/                    # Button, Input, Card, Dialog, Dropdown
│   └── layouts/               # Layout components
├── lib/                        # Core utilities
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── prisma.ts             # Prisma client singleton
│   ├── trpc-provider.tsx     # tRPC React provider
│   └── utils.ts              # Shared helpers
├── prisma/
│   └── schema.prisma         # Database schema
├── middleware.ts              # Next.js route protection
├── .env                       # Environment variables (git-ignored)
└── .env.example               # Environment template
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/smartfolio?schema=public"
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (at least one recommended)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_ENTERPRISE="price_..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="smartfolio-uploads"
AWS_REGION="us-east-1"

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="..."
SMTP_PASS="..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000`. You should see the landing page with the AI prompt input.

### 5. Test the Flow

1. Type a prompt in the input box (e.g., "Create a portfolio for a fullstack developer")
2. Click the send button
3. The auth modal should appear (since you're not logged in)
4. Sign in with Google or GitHub
5. After auth, you'll continue into the generation flow

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) | Yes |
| `BETTER_AUTH_URL` | Base URL of application | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | No |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `STRIPE_PRICE_ID_PRO` | Stripe price ID for Pro plan | Yes |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe price ID for Enterprise plan | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | Yes |
| `AWS_REGION` | AWS region | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Yes |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | Yes |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create and apply migrations
```

---

## Routes

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/` | No | Landing page with prompt input and auth modal |
| `/workspace` | Yes | AI workspace (two-pane: reasoning + preview) |
| `/portfolio/[id]` | Yes | Deep link to a specific portfolio workspace |
| `/p/[slug]` | No | Public published portfolio |
| `/pricing` | No | Pricing and plan comparison |

Settings and billing management are accessed via modals/dropdowns inside the workspace, not as separate routes.

---

## Further Reading

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Folder Structure](./docs/FOLDER-STRUCTURE.md)
- [Diagrams](./docs/DIAGRAMS.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
