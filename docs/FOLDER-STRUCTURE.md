# Smartfolio -- Folder Structure

## Overview

Smartfolio uses a workspace-first architecture. There are no dashboard route groups, no sidebar navigation layouts, and no traditional SaaS page structure. The workspace IS the product.

> **Note:** This document shows the **target folder structure** including both existing and planned files. Items marked with `[PLANNED]` or `[EXISTS]` indicate their current status. See [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md) for detailed build status.

---

## Full Structure

```
smartfolio/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Better Auth API handler
│   │   ├── trpc/[trpc]/route.ts     # tRPC API handler
│   │   └── webhooks/
│   │       └── stripe/route.ts       # Stripe webhook handler
│   ├── workspace/                    # AI workspace (protected) [PLANNED - not yet built]
│   │   └── page.tsx                  # Two-pane: reasoning + preview
│   ├── portfolio/[id]/               # Deep link to portfolio workspace (protected) [PLANNED - not yet built]
│   │   └── page.tsx
│   ├── p/[slug]/                     # Published portfolio (public) [PLANNED - not yet built]
│   │   └── page.tsx
│   ├── pricing/                      # Pricing page (public) [PLANNED - not yet built]
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx                    # Root layout with TRPCProvider
│   └── page.tsx                      # Landing page (prompt input + auth modal)
│
├── modules/                          # Feature modules
│   ├── auth/
│   │   ├── hooks.ts                 # useAuth, useRequireAuth
│   │   ├── types.ts                 # User, Session types
│   │   ├── utils.ts                 # Display name, initials, verification
│   │   ├── constants.ts             # Route constants
│   │   └── index.ts                 # Barrel export
│   │
│   ├── portfolio/
│   │   ├── hooks.ts                 # usePortfolios, useCreatePortfolio, usePublishPortfolio
│   │   ├── types.ts                 # Portfolio, Section, Analytics types
│   │   ├── utils.ts                 # Slug generation, URL helpers, validation
│   │   ├── constants.ts             # Themes, limits, section types
│   │   └── index.ts
│   │
│   ├── ai/
│   │   ├── hooks.ts                 # useAIGeneration, useGeneratePortfolioContent
│   │   ├── types.ts                 # Generation request/response types
│   │   ├── utils.ts                 # Prompt building, token estimation
│   │   ├── constants.ts             # Model configs, generation limits
│   │   └── index.ts
│   │
│   ├── builder/
│   │   ├── hooks.ts                 # useBuilder, useTemplates, useApplyTemplate
│   │   ├── types.ts                 # Block, Template types
│   │   ├── utils.ts                 # Block utilities, default content
│   │   ├── constants.ts             # Block types, categories
│   │   └── index.ts
│   │
│   └── billing/
│       ├── hooks.ts                 # useSubscription, useCreateCheckoutSession
│       ├── types.ts                 # Subscription, Payment types
│       ├── utils.ts                 # Currency formatting, feature access
│       ├── constants.ts             # Plans, pricing tiers
│       └── index.ts
│
├── components/                       # Shared UI components
│   ├── ui/
│   │   ├── button.tsx               # Button (5 variants, 3 sizes, loading)
│   │   ├── input.tsx                # Input with labels, errors, helper text
│   │   ├── card.tsx                 # Card with Header, Title, Content, Footer
│   │   ├── dialog.tsx               # Modal dialog
│   │   ├── dropdown.tsx             # Dropdown menu
│   │   └── index.ts
│   │
│   └── layouts/
│       ├── workspace-layout.tsx     # Workspace chrome (top bar, pane container) [PLANNED]
│       ├── marketing-layout.tsx     # Public page wrapper (nav, footer) [PLANNED]
│       ├── auth-layout.tsx          # Auth modal/page wrapper [EXISTS]
│       └── index.ts
│
├── server/                           # Backend
│   ├── routers/
│   │   ├── _app.ts                  # Root router (merges all sub-routers)
│   │   ├── user.ts                  # User profile management
│   │   ├── portfolio.ts             # Portfolio CRUD + publish
│   │   ├── ai.ts                    # AI generation endpoints
│   │   ├── builder.ts               # Template and block operations
│   │   └── billing.ts               # Stripe billing endpoints
│   │
│   ├── services/
│   │   ├── ai.ts                    # OpenAI integration, prompt engineering
│   │   ├── stripe.ts                # Stripe subscriptions, webhooks
│   │   ├── email.ts                 # Nodemailer SMTP
│   │   ├── storage.ts               # AWS S3 uploads, signed URLs
│   │   └── index.ts                 # Service container (singletons)
│   │
│   ├── middleware/
│   │   └── index.ts                 # Rate limiting, plan checks, admin checks
│   │
│   ├── trpc.ts                      # tRPC initialization, context, procedures
│   └── caller.ts                    # Server-side tRPC caller
│
├── lib/                              # Core utilities
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth client hooks
│   ├── prisma.ts                    # Prisma client singleton
│   ├── trpc-provider.tsx            # tRPC React provider
│   └── utils.ts                     # cn(), formatDate, etc.
│
├── hooks/                            # Shared React hooks
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   ├── use-media-query.ts
│   ├── use-click-outside.ts
│   └── index.ts
│
├── types/                            # Shared TypeScript types
│   ├── api.ts                       # API response types
│   ├── common.ts                    # Utility types
│   └── index.ts
│
├── prisma/
│   └── schema.prisma                # Database schema
│
├── public/                           # Static assets
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── DIAGRAMS.md
│   ├── FOLDER-STRUCTURE.md          # This file
│   ├── IMPLEMENTATION-COMPLETE.md
│   └── QUICK-START.md
│
├── .env                              # Environment variables (git-ignored)
├── .env.example                     # Environment template
├── middleware.ts                    # Next.js route protection middleware
├── next.config.ts
├── package.json
├── tsconfig.json
├── IMPLEMENTATION_SUMMARY.md
├── PROJECT-SUMMARY.md
└── SETUP.md
```

---

## Route Mapping

| Route | File | Auth | Purpose | Status |
|-------|------|------|---------|--------|
| `/` | `app/page.tsx` | No | Landing page + prompt input | **Built** |
| `/workspace` | `app/workspace/page.tsx` | Yes | AI workspace | **Planned** |
| `/portfolio/[id]` | `app/portfolio/[id]/page.tsx` | Yes | Portfolio workspace (deep link) | **Planned** |
| `/p/[slug]` | `app/p/[slug]/page.tsx` | No | Published portfolio | **Planned** |
| `/pricing` | `app/pricing/page.tsx` | No | Pricing page | **Planned** |

There are no `(dashboard)` or `(auth)` route groups. Authentication is handled via an inline modal on the landing page, not through dedicated auth pages.

---

## Module Pattern

Each module in `modules/` follows this structure:

```
modules/[feature]/
├── hooks.ts            # React hooks (tRPC wrappers)
├── types.ts            # TypeScript interfaces
├── utils.ts            # Helper functions
├── constants.ts        # Feature constants
└── index.ts            # Barrel export
```

**Import convention:**

```typescript
// Use barrel exports
import { useAuth, getUserDisplayName } from '@/modules/auth'
import { usePortfolios, generateSlug } from '@/modules/portfolio'
import { useAIGeneration } from '@/modules/ai'
import { useSubscription } from '@/modules/billing'
```

---

## Layout Components

| Component | Purpose | Used By | Status |
|-----------|---------|---------|--------|
| `workspace-layout.tsx` | Top bar + pane container for workspace | `/workspace`, `/portfolio/[id]` | **Planned** |
| `marketing-layout.tsx` | Nav + footer for public pages | `/`, `/pricing` | **Planned** |
| `auth-layout.tsx` | Centered auth modal wrapper | Auth modal on landing page | **Exists** |

There is no `dashboard-layout.tsx`. The dashboard layout concept has been removed. The workspace layout replaces it.

---

## Server Structure

```
server/
├── routers/          # tRPC endpoints (one file per domain)
├── services/         # Business logic (one class per external service)
├── middleware/        # Request middleware (rate limiting, plan checks)
├── trpc.ts           # tRPC init, context creation, procedure definitions
└── caller.ts         # Server-side caller for RSC
```

Services are accessed via the service container (`server/services/index.ts`), which provides singleton instances of AIService, StripeService, EmailService, and StorageService.

---

## Key Principles

1. **No dashboard route groups** -- The workspace is the product, not a page within a dashboard.
2. **Feature-scoped modules** -- Each module is self-contained with minimal cross-module imports.
3. **Barrel exports** -- Every module and component directory exports via `index.ts`.
4. **Clear server/client boundary** -- `modules/` contains client hooks; `server/` contains backend logic.
5. **Type safety** -- tRPC provides end-to-end types from database to UI. Zod validates all inputs.

---

## Adding New Features

### Add a module

```bash
mkdir modules/new-feature
touch modules/new-feature/{index,types,hooks,utils,constants}.ts
```

### Add a tRPC router

Create `server/routers/new-feature.ts`, then register it in `server/routers/_app.ts`:

```typescript
import { newFeatureRouter } from './new-feature'

export const appRouter = createTRPCRouter({
  // existing routers...
  newFeature: newFeatureRouter,
})
```

### Add a database model

Add the model to `prisma/schema.prisma`, then:

```bash
npx prisma generate
npx prisma db push
```
