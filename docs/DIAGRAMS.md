# 🏛️ Smartfolio Architecture Diagrams

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router (app/)                                  │
│  ├── (marketing)/    - Public pages                         │
│  ├── (auth)/         - Sign in/up pages                     │
│  └── (dashboard)/    - Protected pages                      │
│                                                              │
│  React Components (components/)                              │
│  ├── ui/            - Base components                       │
│  ├── layouts/       - Page layouts                          │
│  └── forms/         - Form components                       │
│                                                              │
│  Feature Modules (modules/)                                  │
│  ├── auth/          - Authentication                        │
│  ├── portfolio/     - Portfolio management                  │
│  ├── ai/            - AI generation                         │
│  ├── builder/       - Portfolio builder                     │
│  └── billing/       - Subscriptions                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ tRPC (Type-Safe)
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (Next.js API)                     │
├─────────────────────────────────────────────────────────────┤
│  Middleware (middleware.ts)                                  │
│  └── Route Protection & Authentication                       │
│                                                              │
│  tRPC Routers (server/routers/)                             │
│  ├── user.ts        - User operations                       │
│  ├── portfolio.ts   - Portfolio CRUD                        │
│  ├── ai.ts          - AI generation                         │
│  ├── builder.ts     - Builder operations                    │
│  └── billing.ts     - Stripe integration                    │
│                                                              │
│  Services (server/services/)                                 │
│  ├── stripe.service - Payment processing                    │
│  ├── ai.service     - AI provider integration               │
│  └── email.service  - Email notifications                   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  ├── User                   - User accounts                  │
│  ├── Portfolio              - User portfolios                │
│  ├── PortfolioSection       - Portfolio content             │
│  ├── Subscription           - Billing plans                  │
│  ├── Payment                - Transaction history            │
│  ├── AIGeneration           - AI usage logs                  │
│  └── Template               - Portfolio templates            │
└─────────────────────────────────────────────────────────────┘

         ↕                    ↕                    ↕
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Stripe     │    │   OpenAI     │    │   Storage    │
│   (Billing)  │    │   (AI Gen)   │    │   (S3/etc)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 🔄 Request Flow

### Client Component Request
```
User Action (Click)
    ↓
React Component
    ↓
tRPC Hook (trpc.portfolio.list.useQuery)
    ↓
tRPC Client (HTTP Request)
    ↓
Next.js API Route (/api/trpc/[trpc])
    ↓
tRPC Router (portfolio.list)
    ↓
Protected Procedure (checks auth)
    ↓
Database Query (Prisma)
    ↓
PostgreSQL
    ↓
Response (typed data)
    ↓
React Component (render)
```

### Server Component Request
```
Server Component
    ↓
createCaller (server-side tRPC)
    ↓
Router Function (portfolio.list)
    ↓
Database Query (Prisma)
    ↓
PostgreSQL
    ↓
Response (render in RSC)
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User signs in
       ↓
┌─────────────┐
│  Sign In    │
│  Component  │
└──────┬──────┘
       │ 2. signIn.email()
       ↓
┌─────────────┐
│ Better Auth │
│   Client    │
└──────┬──────┘
       │ 3. POST /api/auth/sign-in
       ↓
┌─────────────┐
│ Better Auth │
│   Server    │
└──────┬──────┘
       │ 4. Verify credentials
       ↓
┌─────────────┐
│  PostgreSQL │
│  (User)     │
└──────┬──────┘
       │ 5. Create session
       ↓
┌─────────────┐
│  PostgreSQL │
│  (Session)  │
└──────┬──────┘
       │ 6. Return session cookie
       ↓
┌─────────────┐
│   Browser   │
│  (Logged In)│
└─────────────┘
```

## 🏗️ Module Architecture

```
modules/[feature]/
│
├── components/              # UI Layer
│   ├── FeatureList.tsx     # List view
│   ├── FeatureCard.tsx     # Card component
│   └── FeatureForm.tsx     # Form component
│
├── hooks.ts                # React Hooks Layer
│   ├── useFeature()        # Get single item
│   ├── useFeatureList()    # Get list
│   ├── useCreateFeature()  # Create mutation
│   ├── useUpdateFeature()  # Update mutation
│   └── useDeleteFeature()  # Delete mutation
│       ↓
│   [tRPC Client Layer]
│       ↓
├── types.ts                # Type Definitions
│   ├── Feature             # Main entity
│   ├── CreateFeatureInput  # Input types
│   └── UpdateFeatureInput  # Update types
│
├── utils.ts                # Utility Functions
│   ├── formatFeature()     # Format data
│   ├── validateFeature()   # Validation
│   └── transformFeature()  # Transform data
│
├── constants.ts            # Constants
│   ├── FEATURE_LIMITS      # Limits
│   ├── FEATURE_TYPES       # Types enum
│   └── DEFAULT_VALUES      # Defaults
│
└── index.ts               # Public API
    └── Export all above
```

## 🗄️ Database Relationships

```
User
  ├──< Account (OAuth)
  ├──< Session
  ├──< Portfolio
  │     ├──< PortfolioSection
  │     └──< PortfolioAnalytics
  ├──< Subscription
  │     └── (relates to Stripe)
  ├──< Payment
  └──< AIGeneration

Template
  └── (no relations, standalone)

Legend:
  ├──< One-to-Many relationship
  └── One-to-One relationship
```

## 🔒 Security Layers

```
┌────────────────────────────────────────┐
│  1. Next.js Middleware                 │
│     - Route protection                 │
│     - Redirect unauthenticated users   │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  2. tRPC Context                       │
│     - Session extraction               │
│     - User data in context             │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  3. Protected Procedure                │
│     - Verify session exists            │
│     - Throw error if unauthorized      │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  4. Authorization Checks               │
│     - Verify ownership (userId)        │
│     - Check subscription/limits        │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  5. Database Query                     │
│     - Include userId in WHERE clause   │
│     - Row-level security               │
└────────────────────────────────────────┘
```

## 💳 Billing Flow

```
User clicks "Subscribe"
    ↓
Create Checkout Session (Stripe)
    ↓
Redirect to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe sends webhook
    ↓
/api/webhooks/stripe
    ↓
Verify webhook signature
    ↓
Update Subscription in DB
    ↓
Redirect user to Dashboard
    ↓
Access premium features
```

## 🤖 AI Generation Flow

```
User requests AI content
    ↓
Check usage limits (subscription)
    ↓
Build prompt (utils)
    ↓
Send to AI provider (OpenAI/Anthropic)
    ↓
Receive response
    ↓
Log usage (AIGeneration table)
    ↓
Return content to user
    ↓
Update UI
```

## 📊 Data Flow Patterns

### Optimistic Updates
```
User action → Update UI immediately → API call → Revert if error
```

### Pessimistic Updates
```
User action → API call → Wait for response → Update UI
```

### Infinite Scroll
```
Load page 1 → Scroll to bottom → Load page 2 → Append to list
```

### Real-time Updates (Future)
```
User action → WebSocket → Server → Broadcast → All clients update
```

## 🎨 Component Hierarchy

```
app/layout.tsx (Root)
  └── TRPCProvider
      └── QueryClientProvider
          └── app/(dashboard)/layout.tsx
              └── DashboardLayout
                  ├── Sidebar
                  ├── Header
                  └── app/(dashboard)/portfolios/page.tsx
                      └── PortfolioList (module component)
                          └── PortfolioCard (module component)
                              ├── Button (shared component)
                              ├── Card (shared component)
                              └── Dropdown (shared component)
```

---

## 📖 Legend

- `→` : Synchronous flow
- `↓` : Asynchronous flow
- `├──` : Has many
- `└──` : Has one
- `< >` : Generic/parameterized
