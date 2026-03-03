# Smartfolio -- Diagrams

## High-Level Architecture

```
+---------------------------------------------------------------+
|                     CLIENT (Browser)                          |
+---------------------------------------------------------------+
|  Next.js App Router                                           |
|                                                               |
|  /                   Landing page (prompt input + auth modal) |
|  /workspace          AI workspace (reasoning + preview panes) |
|  /portfolio/[id]     Portfolio workspace (deep link)          |
|  /p/[slug]           Published portfolio (standalone)         |
|  /pricing            Plan comparison                          |
|                                                               |
|  Components                                                   |
|    ui/               Base components (Button, Input, etc.)    |
|    layouts/          Workspace layout, marketing layout       |
|                                                               |
|  Feature Modules                                              |
|    auth/             Session hooks, auth state                |
|    portfolio/        Portfolio CRUD hooks                     |
|    ai/               Generation hooks, usage tracking         |
|    builder/          Template/block hooks                     |
|    billing/          Subscription hooks                       |
+---------------------------------------------------------------+
                         | tRPC (Type-Safe)
                         v
+---------------------------------------------------------------+
|                     SERVER (Next.js API)                       |
+---------------------------------------------------------------+
|  Middleware                                                    |
|    middleware.ts      Route protection + auth redirects        |
|    server/middleware  Rate limiting, plan checks               |
|                                                               |
|  tRPC Routers                                                 |
|    user.ts           Profile management                       |
|    portfolio.ts      Portfolio CRUD + publish                 |
|    ai.ts             AI generation endpoints                  |
|    builder.ts        Template/block operations                |
|    billing.ts        Stripe subscription management           |
|                                                               |
|  Services                                                     |
|    ai.ts             OpenAI integration                       |
|    stripe.ts         Payment processing                       |
|    email.ts          Transactional email                      |
|    storage.ts        S3 file storage                          |
+---------------------------------------------------------------+
                         | Prisma ORM
                         v
+---------------------------------------------------------------+
|                    DATABASE (PostgreSQL)                       |
+---------------------------------------------------------------+
|  User, Account, Session, Verification                         |
|  Portfolio, PortfolioSection, PortfolioAnalytics              |
|  Subscription, Payment                                        |
|  AIGeneration, Template                                       |
+---------------------------------------------------------------+

          |                  |                  |
          v                  v                  v
   +-----------+      +-----------+      +-----------+
   |  Stripe   |      |  OpenAI   |      |  AWS S3   |
   | (Billing) |      |   (AI)    |      | (Storage) |
   +-----------+      +-----------+      +-----------+
```

---

## User Flow -- First Visit

```
User visits /
    |
    v
Sees landing page with prompt input
    |
    v
Types portfolio description
    |
    v
Clicks "Generate"
    |
    v
Auth modal appears (Google / GitHub)
    |
    v
User authenticates
    |
    v
Prompt stored in sessionStorage
    |
    v
Redirect to /workspace
    |
    v
Stored prompt auto-submitted
    |
    v
Workspace transitions to two-pane layout
    |
    +-- Left pane: AI reasoning stream
    |     "Analyzing your requirements..."
    |     "Selecting layout structure..."
    |     "Generating hero section..."
    |     "Creating project cards..."
    |     "Applying theme..."
    |     "Done."
    |
    +-- Right pane: Live preview
          Portfolio renders progressively
          as each section completes
```

---

## User Flow -- Returning User

```
User visits / (authenticated)
    |
    v
Redirect to /workspace
    |
    v
Workspace loads with project picker
    |
    +-- Resume existing portfolio
    |     |
    |     v
    |   Two-pane layout with last state
    |
    +-- Start new portfolio
          |
          v
        Centered prompt input
```

---

## AI Generation Pipeline

```
User submits prompt in workspace
    |
    v
tRPC mutation: ai.generateFullPortfolio
    |
    v
Check usage limits (subscription plan)
    |
    +-- Limit exceeded --> Upgrade nudge in workspace
    |
    v
Open streaming connection (SSE / tRPC subscription)
    |
    v
Build system prompt + user prompt
    |
    v
Send to OpenAI API (GPT-4 for full generation)
    |
    v
Stream structured portfolio JSON
    |
    +-- Each step emits status to reasoning pane:
    |     Step 1: "Analyzing requirements..."
    |     Step 2: "Selecting layout..."
    |     Step 3: "Generating hero section..."
    |     Step 4: "Generating about section..."
    |     Step 5: "Creating project cards..."
    |     Step 6: "Applying theme..."
    |     Step 7: "Finalizing..."
    |
    +-- Portfolio JSON rendered progressively in preview iframe
    |
    v
Portfolio record created/updated in database
    |
    v
Generation logged in AIGeneration table (tokens, model, type)
    |
    v
Stream closes, prompt input ready for refinements
```

---

## Refinement Flow

```
User types refinement prompt (e.g., "Make it darker")
    |
    v
tRPC mutation: ai.refinePortfolio
    |
    v
Send current portfolio JSON + refinement prompt to AI
    |
    v
AI returns partial update (diff, not full regeneration)
    |
    +-- Reasoning pane shows refinement steps:
    |     "Updating hero gradient..."
    |     "Adjusting text contrast..."
    |     "Applied changes."
    |
    +-- Preview pane updates affected sections only
    |
    v
Portfolio state updated, undo point created
```

---

## Publish Flow

```
User clicks "Publish" in workspace top bar
    |
    v
Publish modal opens
    |
    +-- Shows URL: smartfolio.dev/p/{slug}
    +-- Custom slug option
    +-- "Publish" confirmation button
    |
    v
User confirms
    |
    v
Portfolio status --> PUBLISHED
    |
    v
Static HTML/CSS generated from portfolio JSON
    |
    v
/p/[slug] serves standalone portfolio
    |
    +-- SEO meta tags
    +-- Open Graph tags
    +-- Structured data
    +-- "Built with Smartfolio" badge (removable on Pro)
    |
    v
Post-publish: share buttons (LinkedIn, Twitter, copy link)
```

---

## Authentication Flow

```
User triggers auth (via prompt submission on /)
    |
    v
Auth modal opens
    |
    +-- Google OAuth
    |     |
    |     v
    |   Better Auth Client: signIn.social({ provider: "google" })
    |     |
    |     v
    |   POST /api/auth/sign-in/social
    |     |
    |     v
    |   Google OAuth redirect --> callback
    |     |
    |     v
    |   Session created in database
    |     |
    |     v
    |   Session cookie set in browser
    |
    +-- GitHub OAuth (same flow, different provider)
    |
    v
Redirect to /workspace with callback URL
```

---

## Billing Flow

```
User hits upgrade trigger in workspace
    |
    v
Upgrade nudge shown (contextual, inline)
    |
    v
User clicks "Upgrade"
    |
    v
tRPC mutation: billing.createCheckoutSession
    |
    v
Stripe Checkout Session created
    |
    v
Redirect to Stripe Checkout
    |
    v
User completes payment
    |
    v
Stripe sends webhook --> POST /api/webhooks/stripe
    |
    v
Webhook signature verified
    |
    v
Subscription record created/updated in database
    |
    v
User returns to /workspace with upgraded plan
    |
    v
New limits applied (more generations, portfolios, etc.)
```

---

## Workspace Component Hierarchy

```
app/layout.tsx (Root)
  +-- TRPCProvider
      +-- QueryClientProvider
          +-- app/workspace/page.tsx
              +-- WorkspaceLayout
                  +-- TopBar
                  |     +-- Logo
                  |     +-- PortfolioName (editable)
                  |     +-- ProjectSwitcher (dropdown)
                  |     +-- PublishButton
                  |     +-- UpgradeBadge
                  |     +-- UserAvatarDropdown
                  |           +-- Settings (modal trigger)
                  |           +-- Billing (portal link)
                  |           +-- Sign Out
                  |
                  +-- WorkspaceContent
                        +-- [Initial State]
                        |     +-- CenteredPromptInput
                        |
                        +-- [Generation State]
                              +-- ReasoningPane (left, ~35-40%)
                              |     +-- ReasoningStream
                              |     |     +-- StepItem (spinner --> checkmark)
                              |     +-- GenerationHistory
                              |     +-- PromptInput (fixed bottom)
                              |
                              +-- PreviewPane (right, ~60-65%)
                                    +-- ViewportToggle (desktop/tablet/mobile)
                                    +-- PreviewIframe
                                          +-- PortfolioRenderer
                                                +-- SectionRenderers (Hero, About, Projects, etc.)
```

---

## Database Relationships

```
User
  |--< Account (OAuth providers)
  |--< Session (active sessions)
  |--< Portfolio
  |      |--< PortfolioSection
  |      +--- PortfolioAnalytics
  |--< Subscription
  |      |--< Payment
  +--< AIGeneration

Template (standalone)

Legend:
  |--<  One-to-many
  +---  One-to-one
```

---

## Security Layers

```
Request enters system
    |
    v
+-------------------------------------+
|  1. Next.js Middleware               |
|     Route protection                 |
|     Redirect unauthenticated users   |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  2. tRPC Context                    |
|     Session extraction from cookies  |
|     User data attached to context    |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  3. Protected Procedure             |
|     Verify session exists            |
|     Reject if unauthorized           |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  4. Rate Limiting                   |
|     Upstash Redis                    |
|     10 requests / 10 seconds         |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  5. Input Validation                |
|     Zod schemas on all inputs        |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  6. Authorization                   |
|     userId in WHERE clauses          |
|     Ownership verification           |
|     Subscription limit checks        |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|  7. Database Query (Prisma)         |
+-------------------------------------+
```

---

## Data Flow Patterns

### Optimistic Updates (text edits, saves)
```
User edits text in preview --> UI updates immediately --> API call in background --> Revert if error
```

### Streaming (AI generation)
```
User submits prompt --> Streaming connection opens --> Steps render progressively --> Stream closes
```

### Standard Queries (portfolio list, subscription status)
```
Component mounts --> tRPC hook fires --> React Query checks cache --> Fetch if stale --> Render
```
