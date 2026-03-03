# Smartfolio -- Architecture

## System Overview

Smartfolio is an AI-native portfolio generator built on Next.js with a workspace-first UX model. The architecture supports:

- Real-time AI generation with streaming
- Live portfolio preview rendering
- Iterative prompt-based refinement
- One-click publish to public URLs
- Subscription-based billing with usage limits

---

## Frontend Architecture

### Route Structure

```
/                    Landing page (public prompt input + auth modal)
/workspace           AI workspace (protected, two-pane layout)
/portfolio/[id]      Deep link to specific portfolio workspace (protected)
/p/[slug]            Published portfolio (public, standalone)
/pricing             Plan comparison (public)
```

There are no dashboard, settings, analytics, builder, or billing routes. The workspace is the single product surface. Settings and billing are accessed via modals/dropdowns within the workspace.

### Workspace Layout

The workspace (`/workspace`) has three states:

**1. Initial State (no active generation)**
- Centered prompt input, same aesthetic as landing page
- Top bar with logo, user avatar dropdown, upgrade badge
- No panes visible

**2. Active Generation State**
- Two-pane layout:
  - Left pane (~35-40%): AI reasoning stream showing step-by-step progress
  - Right pane (~60-65%): Live portfolio preview in an iframe
- Prompt input fixed at bottom of left pane
- Top bar shows portfolio name (editable), Publish button

**3. Post-Generation State**
- Same two-pane layout
- Reasoning pane shows generation history
- Prompt input ready for refinements
- Preview is fully rendered and interactive

### Component Organization

```
components/
  ui/                  Base components (Button, Input, Card, Dialog, Dropdown)
  layouts/             Layout wrappers (workspace layout, marketing layout, auth layout)

modules/
  auth/                Auth hooks, types, utils
  portfolio/           Portfolio hooks, types, utils
  ai/                  AI generation hooks, types
  builder/             Template/block hooks, types
  billing/             Billing hooks, types
```

Modules are feature-scoped. Each module exports hooks, types, utilities, and constants via a barrel `index.ts`. Cross-module imports are minimized.

---

## Backend Architecture

### tRPC API Layer

All backend endpoints are type-safe tRPC procedures accessible at `/api/trpc/[trpc]`.

```
server/routers/_app.ts       Root router (merges all sub-routers)
server/routers/user.ts       Profile management
server/routers/portfolio.ts  Portfolio CRUD + publish
server/routers/ai.ts         AI generation endpoints
server/routers/builder.ts    Template and block operations
server/routers/billing.ts    Stripe subscription management
```

**Procedure types:**
- `publicProcedure` -- no auth required
- `protectedProcedure` -- requires authenticated session (enforced via tRPC middleware)

**Context:**
Each request context includes the Prisma client and (for protected procedures) the authenticated user session.

### Services Layer

Business logic is encapsulated in service classes managed by a singleton container (`server/services/index.ts`):

```
server/services/
  ai.ts         OpenAI API integration, prompt engineering, token tracking
  stripe.ts     Stripe customer, subscription, checkout, webhook handling
  email.ts      Nodemailer SMTP for transactional emails
  storage.ts    AWS S3 for file uploads, signed URLs
  index.ts      Service container (singleton instances)
```

### Server Middleware

```
server/middleware/index.ts   Rate limiting (Upstash), plan checks, admin checks
middleware.ts                Next.js route middleware (auth redirects)
```

---

## Database Architecture

### ORM

Prisma 6 with PostgreSQL (Neon recommended for serverless).

### Models

**Authentication:**
- `User` -- accounts with name, email, image, role (USER/ADMIN)
- `Account` -- OAuth provider connections (Google, GitHub)
- `Session` -- active sessions with expiry
- `Verification` -- email verification tokens

**Portfolio:**
- `Portfolio` -- user portfolios with theme, status (DRAFT/PUBLISHED/ARCHIVED), slug, SEO fields
- `PortfolioSection` -- individual sections within a portfolio (HERO, ABOUT, PROJECTS, EXPERIENCE, CONTACT, etc.)
- `PortfolioAnalytics` -- view counts, unique visitors, engagement metrics

**Builder:**
- `Template` -- predefined portfolio templates with block definitions and theme config

**Billing:**
- `Subscription` -- user subscription with plan (FREE/PRO/ENTERPRISE), Stripe IDs, status
- `Payment` -- transaction records linked to subscriptions

**AI:**
- `AIGeneration` -- tracks each AI generation (type, prompt, response, tokens used, model, provider)

### Relationships

```
User
  |-- Account (one-to-many, OAuth providers)
  |-- Session (one-to-many)
  |-- Portfolio (one-to-many)
  |     |-- PortfolioSection (one-to-many)
  |     |-- PortfolioAnalytics (one-to-one)
  |-- Subscription (one-to-many)
  |     |-- Payment (one-to-many)
  |-- AIGeneration (one-to-many)

Template (standalone, no user relation)
```

---

## AI Pipeline Architecture

### Current State (Operational)

The AI service generates text snippets:
- Portfolio headlines and about sections
- Project descriptions from tech stack input
- SEO metadata (title, description, keywords)
- Skills summaries, image alt text

Each generation is tracked in the `AIGeneration` table with token counts and enforced against monthly plan limits.

### Target State (Re-Architecture)

The AI service will produce structured portfolio JSON:

```json
{
  "theme": {
    "colors": { "primary": "#7c3aed", "background": "#0a0a0b", "text": "#f0f0f3" },
    "fonts": { "heading": "Inter", "body": "Inter" },
    "spacing": "relaxed"
  },
  "sections": [
    {
      "type": "hero",
      "content": {
        "headline": "Frontend Developer",
        "subtext": "Building interfaces that matter",
        "cta": { "label": "View Projects", "target": "#projects" }
      }
    },
    {
      "type": "about",
      "content": {
        "bio": "...",
        "skills": ["React", "TypeScript", "Node.js"]
      }
    },
    {
      "type": "projects",
      "content": [
        {
          "title": "Project Name",
          "description": "...",
          "tech": ["React", "Tailwind"],
          "links": { "demo": "...", "source": "..." }
        }
      ]
    }
  ],
  "metadata": {
    "title": "Jane Doe | Frontend Developer",
    "description": "..."
  }
}
```

**Streaming:** Generation steps will stream to the client via tRPC subscriptions or SSE. Each step emits a status update rendered in the reasoning pane.

**Refinement:** Follow-up prompts send the current portfolio JSON + prompt to the AI, which returns a partial update (not a full regeneration). The frontend applies the diff to the existing state.

---

## Publish Pipeline

```
User clicks Publish
  --> Publish modal opens (shows URL, custom slug option)
  --> User confirms
  --> Portfolio status set to PUBLISHED
  --> Static HTML/CSS generated from portfolio JSON
  --> Stored for fast serving
  --> /p/[slug] serves the standalone portfolio
  --> SEO meta tags, Open Graph tags, structured data included
  --> "Built with Smartfolio" badge in footer (removable on Pro)
```

---

## Billing Architecture

### Plans

| | FREE | PRO | ENTERPRISE |
|--|------|-----|------------|
| Portfolios | 1 | 10 | 100 |
| AI Generations | 10/month | 100/month | 1,000/month |
| Tokens | 10,000 | 50,000 | 200,000 |
| Badge removal | No | Yes | Yes |
| Templates | Basic | Premium | All + Custom |

### Stripe Integration

- Checkout sessions for new subscriptions
- Billing portal for subscription management
- Webhooks process: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
- Subscription status synced to database on every webhook event

### Upgrade Triggers

Upgrade prompts appear contextually within the workspace, not as separate pages:
- Generation limit reached
- Portfolio limit reached
- Badge removal attempted
- Premium template selected

---

## Security

### Layers

1. **Next.js Middleware** -- redirects unauthenticated users from protected routes
2. **tRPC Context** -- extracts session from request
3. **Protected Procedures** -- reject unauthenticated calls
4. **Authorization Checks** -- verify resource ownership (userId in queries)
5. **Rate Limiting** -- Upstash Redis (10 req/10s default)
6. **Input Validation** -- Zod schemas on all tRPC inputs
7. **Webhook Verification** -- Stripe signature validation
8. **Content Sanitization** -- AI-generated HTML sanitized before rendering in published portfolios

### Authentication

Better Auth handles:
- OAuth flow (Google, GitHub)
- Email/password registration and login
- Session tokens (cookie-based)
- CSRF protection

### Public Routes

`/`, `/pricing`, `/p/[slug]`, auth pages

### Protected Routes

`/workspace`, `/portfolio/[id]`

---

## Request Flow

### Client Component (tRPC Hook)

```
User action
  --> React component calls tRPC hook (e.g., trpc.portfolio.list.useQuery)
  --> tRPC client sends HTTP request to /api/trpc/[trpc]
  --> Next.js API route forwards to tRPC router
  --> Protected procedure validates session
  --> Router handler executes business logic (calls service/Prisma)
  --> Response returns typed data
  --> React Query caches result
  --> Component re-renders
```

### Server Component (Direct Caller)

```
Server component
  --> createCaller(context) creates server-side tRPC caller
  --> Calls router procedure directly (no HTTP)
  --> Returns typed data for RSC rendering
```

### AI Generation (Target Flow)

```
User submits prompt in workspace
  --> tRPC mutation (ai.generateFullPortfolio)
  --> Service checks usage limits
  --> Opens streaming connection (SSE/subscription)
  --> AI generates structured portfolio JSON
  --> Steps stream to client: "Analyzing prompt..." --> "Selecting layout..." --> "Generating hero..." --> etc.
  --> Portfolio JSON rendered progressively in preview iframe
  --> Portfolio record created/updated in database
  --> Generation logged in AIGeneration table
  --> Stream closes
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| API | tRPC | 11.x |
| Database ORM | Prisma | 6.x |
| Database | PostgreSQL | -- |
| Auth | Better Auth | 1.4.x |
| AI | OpenAI SDK | -- |
| Payments | Stripe | 20.x |
| Storage | AWS S3 SDK | -- |
| Rate Limiting | Upstash | -- |
| Email | Nodemailer | 8.x |
| Data Fetching | TanStack React Query | 5.x |
| Validation | Zod | 4.x |
| Serialization | SuperJSON | -- |
