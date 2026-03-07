# Smartfolio -- Implementation Summary

## Product Model

Smartfolio is an AI-native portfolio generator. The core product loop is:

```
Prompt --> Generate --> Refine --> Publish
```

There is no dashboard. The workspace IS the product. Users describe what they want in natural language, and a complete developer portfolio materializes in a live preview pane.

---

## Infrastructure Status

### Built and Operational

#### 1. Authentication (Better Auth)

- **Server config:** `lib/auth.ts`
- **Client hooks:** `lib/auth-client.ts`
- **API routes:** `app/api/auth/[...all]/route.ts`
- Google and GitHub OAuth
- Email/password authentication
- Session management with Prisma adapter
- Inline auth modal on landing page (triggers when user submits first prompt)

#### 2. tRPC Backend (Type-Safe API)

- **Initialization:** `server/trpc.ts`
- **Root router:** `server/routers/_app.ts`
- **Sub-routers:**
  - `user.ts` -- profile management
  - `portfolio.ts` -- portfolio CRUD, publish, and generation lifecycle
  - `ai.ts` -- AI generation endpoints
  - `builder.ts` -- template and block operations
  - `billing.ts` -- Stripe subscription management
- Public and protected procedures
- Server-side caller for RSC usage

#### 3. Database (Prisma + PostgreSQL)

- **Schema:** `prisma/schema.prisma`
- **Models:** User, Account, Session, Verification, Portfolio, PortfolioSection, PortfolioAnalytics, Template, Subscription, Payment, AIGeneration
- **Enums:** `PortfolioStatus` (GENERATING, READY, FAILED, DRAFT, PUBLISHED, ARCHIVED)
- Relations, indexes, and cascade deletes configured
- Role field on User (USER, ADMIN)

#### 4. AI Service

- **Service:** `server/services/ai.ts`
- OpenAI integration (GPT-3.5-turbo default, GPT-4 available)
- System prompts for: portfolio content, project descriptions, about sections, skills summaries, SEO metadata, image alt text
- Token usage tracking per generation
- Monthly usage limits by subscription plan
- Generation history stored in database

**Note:** The current AI service generates text snippets (headlines, bios, project descriptions). It does NOT yet produce full structured portfolio JSON. The `generateFullPortfolio()` method that outputs complete portfolio data with theme, sections, and layout metadata is part of the workspace re-architecture (see below).

#### 5. Stripe Billing

- **Service:** `server/services/stripe.ts`
- **Webhook handler:** `app/api/webhooks/stripe/route.ts`
- Three-tier pricing: FREE, PRO, ENTERPRISE
- Checkout session creation
- Billing portal sessions
- Subscription lifecycle (create, cancel, resume)
- Webhook processing (payment success/failure, subscription changes)
- Usage stats calculation

#### 6. Storage (AWS S3)

- **Service:** `server/services/storage.ts`
- File upload with type and size validation
- Portfolio image and user avatar management
- Signed URL generation
- Image types: JPEG, PNG, WebP, GIF (5MB default limit)

#### 7. Email (Nodemailer)

- **Service:** `server/services/email.ts`
- Welcome email, subscription confirmation, password reset
- SMTP configuration

#### 8. Rate Limiting (Upstash Redis)

- Configured in service container
- 10 requests per 10 seconds default

#### 9. Middleware

- **File:** `middleware.ts`
- Route protection for authenticated routes
- Session validation via Better Auth API
- Redirect unauthenticated users with callback URL
- Public routes: `/`, `/pricing`, auth pages

#### 10. Landing Page

- **File:** `app/page.tsx`
- Dark theme with gradient background
- Prominent AI prompt input box
- Voice input via Web Speech API
- File attachment support with visual display
- Word count (500-word limit)
- Inline auth modal (Google + GitHub OAuth)
- Plan indicator badge

#### 11. Workspace UI

The workspace is split into two routes:

- **Prompt page:** `app/workspace/page.tsx` -- Centered prompt input with editable portfolio title. On submit, creates a portfolio via `portfolio.create` (status = GENERATING), then redirects to the project route.
- **Project page:** `app/workspace/projects/[id]/page.tsx` -- DB-driven generation route. Fetches portfolio with 2-second polling. When `status = GENERATING`, renders the two-pane generation workspace (ReasoningPane + PreviewPane) with simulated reasoning steps. When `status = READY`, renders the portfolio editor placeholder UI.

Generation state is fully persisted in the database. Navigating away and returning, or refreshing the page, restores the correct UI based on `portfolio.status`.

#### 12. Workspace Components

- **Location:** `components/workspace/`
- **WorkspaceLayout** -- Split-pane layout (38% reasoning, rest preview) with mobile tab-based switching
- **ReasoningPane** -- Scrollable list of GenerationSteps with auto-scroll and PromptInput slot
- **PreviewPane** -- Viewport toggle (desktop/tablet/mobile), iframe-based preview, loading skeleton
- **GenerationStep** -- Status indicator (pending dot, active spinner, complete checkmark) with color coding
- **PromptInput** -- Auto-resizing textarea, word count, voice input (Web Speech API), file attachments

#### 13. Feature Modules

Each module in `modules/` provides hooks, types, utilities, and constants:

- **auth** -- `useAuth`, `useRequireAuth`
- **portfolio** -- `usePortfolios`, `useCreatePortfolio`, `usePublishPortfolio`, etc.
- **ai** -- `useAIGeneration`, `useGeneratePortfolioContent`, `useAIUsageStats`
- **builder** -- `useBuilder`, `useTemplates`, `useApplyTemplate`, `useSaveBlocks`
- **billing** -- `useSubscription`, `useCreateCheckoutSession`, `usePaymentHistory`

#### 14. UI Components

- **Location:** `components/ui/`
- Button (5 variants, 3 sizes, loading state)
- Input, Card, Dialog, Dropdown

---

### Re-Architecture In Progress

The following areas are being rebuilt to align with the Lovable-style workspace model. Items marked **Built** are now operational; the rest should NOT be considered complete.

#### Workspace UI (`/workspace`) -- Built

The core product surface is now operational:

- Two-pane layout: AI reasoning stream (left, ~38%) + live preview (right, ~62%)
- Persistent prompt input at bottom of reasoning pane
- Top bar: logo, portfolio name (editable on prompt page, read-only on project page), user avatar, Publish button, Upgrade badge
- Initial state: centered prompt input on `/workspace` (no panes until generation starts)
- Generation state driven by `portfolio.status` from the database (GENERATING / READY)
- Navigating away and returning restores the correct UI from DB state

#### Persisted Generation Flow -- Built

- `/workspace` creates a portfolio with `status = GENERATING` and redirects to `/workspace/projects/[id]`
- `/workspace/projects/[id]` polls portfolio status every 2 seconds
- Simulated reasoning steps progress over ~7.5 seconds, then `completeGeneration` mutation sets status to READY
- No reliance on React local state for generation persistence

#### Full Portfolio Generation Pipeline

The AI service must be upgraded from snippet generation to structured portfolio JSON output:

```
{
  theme: { colors, fonts, spacing },
  sections: [
    { type: "hero", content: { ... } },
    { type: "about", content: { ... } },
    { type: "projects", content: [ ... ] },
    ...
  ],
  metadata: { title, description }
}
```

Requires: streaming via tRPC subscriptions or SSE, step-by-step reasoning emission, differential updates for refinements.

#### Portfolio Renderer

Component that takes structured portfolio JSON and renders it as a live, interactive preview inside an iframe. Not yet built.

#### Refinement System

Session-based conversation context for iterative prompt-based improvements. Diff-based partial updates instead of full regeneration. Not yet built.

#### Inline Visual Editing

Click-to-select, inline text editing, image replacement, section reordering within the preview pane. Not yet built.

#### Publish Flow

One-click publish from workspace top bar. Generates `/p/[slug]` URL with standalone rendered portfolio. Publish modal with slug customization. Not yet built as a workspace-integrated flow.

#### Upgrade Triggers

Contextual, non-blocking upgrade nudges at limit boundaries (generation count, portfolio count, badge removal). Not yet built as workspace-integrated components.

---

## Route Model

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing page + entry prompt | Built |
| `/workspace` | Prompt input, creates portfolio and redirects | Built |
| `/workspace/projects/[id]` | DB-driven generation and editor UI | Built |
| `/p/[slug]` | Public published portfolio | Not yet built |
| `/pricing` | Pricing page | Not yet built |

No `/dashboard`, `/builder`, `/analytics`, `/settings`, `/portfolios`, or `/billing` routes. Settings and billing are modal-based inside the workspace.

---

## Usage Limits by Plan

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| Portfolios | 1 | 10 | 100 |
| AI Generations | 10/month | 100/month | 1,000/month |
| Tokens | 10,000 | 50,000 | 200,000 |
| Templates | Basic | Premium | All + Custom |
| "Built with Smartfolio" badge | Required | Removable | Removable |

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI Service
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

---

## API Endpoints (tRPC)

### AI
- `ai.generate` -- generic content generation
- `ai.generatePortfolio` -- portfolio content (to be upgraded to full structured output)
- `ai.generateProjectDescription` -- project descriptions
- `ai.generateSEO` -- SEO metadata
- `ai.getHistory` -- generation history
- `ai.getUsageStats` -- monthly usage stats

### Portfolio
- `portfolio.list` -- list user portfolios
- `portfolio.getById` -- get single portfolio (ownership verified)
- `portfolio.create` -- create portfolio (status = GENERATING, unique slug)
- `portfolio.completeGeneration` -- transition status from GENERATING to READY
- `portfolio.update` -- update portfolio
- `portfolio.delete` -- delete portfolio
- `portfolio.publish` -- publish portfolio

### Billing
- `billing.getSubscription` -- current subscription
- `billing.createCheckoutSession` -- Stripe checkout
- `billing.createPortalSession` -- billing portal
- `billing.cancelSubscription` -- cancel
- `billing.resumeSubscription` -- resume
- `billing.getPaymentHistory` -- payment records
- `billing.getUsageStats` -- usage stats

### Builder
- `builder.getTemplates` -- available templates
- `builder.applyTemplate` -- apply template to portfolio
- `builder.saveBlocks` -- save block configuration
- `builder.getBlocks` -- get portfolio blocks

### Webhooks
- `POST /api/webhooks/stripe` -- Stripe event processing
