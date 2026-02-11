# 📋 Smartfolio - Complete Folder Structure

## Overview

This document provides a complete reference for the scalable, modular folder structure implemented in Smartfolio.

## 🏗️ Full Structure

```
smartfolio/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth layout group
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Dashboard layout group
│   │   ├── dashboard/
│   │   ├── portfolios/
│   │   ├── builder/
│   │   ├── analytics/
│   │   ├── billing/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (marketing)/                  # Marketing layout group
│   │   ├── pricing/
│   │   ├── about/
│   │   ├── contact/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Better Auth API
│   │   ├── trpc/[trpc]/route.ts     # tRPC API
│   │   └── webhooks/
│   │       └── stripe/route.ts       # Stripe webhooks
│   ├── p/[slug]/                     # Public portfolio pages
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
│
├── modules/                          # Feature modules
│   ├── auth/
│   │   ├── components/              # Auth-specific components
│   │   ├── hooks.ts                 # useAuth, useRequireAuth
│   │   ├── types.ts                 # Auth types
│   │   ├── utils.ts                 # Auth utilities
│   │   ├── constants.ts             # Routes, configs
│   │   └── index.ts                 # Barrel export
│   │
│   ├── portfolio/
│   │   ├── components/              # Portfolio components
│   │   ├── hooks.ts                 # usePortfolios, useCreatePortfolio
│   │   ├── types.ts                 # Portfolio types
│   │   ├── utils.ts                 # generateSlug, formatViewCount
│   │   ├── constants.ts             # Limits, themes
│   │   └── index.ts
│   │
│   ├── ai/
│   │   ├── components/              # AI generation UI
│   │   ├── hooks.ts                 # useAIGeneration, useGeneratePortfolio
│   │   ├── types.ts                 # AIGenerationRequest, etc.
│   │   ├── utils.ts                 # buildPrompts, formatTokens
│   │   ├── constants.ts             # Models, limits
│   │   └── index.ts
│   │
│   ├── builder/
│   │   ├── components/              # Builder UI, blocks
│   │   ├── hooks.ts                 # useBuilder, useTemplates
│   │   ├── types.ts                 # Block, Template types
│   │   ├── utils.ts                 # getBlockIcon, duplicateBlock
│   │   ├── constants.ts             # Block types, categories
│   │   └── index.ts
│   │
│   └── billing/
│       ├── components/              # Billing UI, pricing
│       ├── hooks.ts                 # useSubscription, useCreateCheckout
│       ├── types.ts                 # Subscription, Payment types
│       ├── utils.ts                 # formatCurrency, canAccessFeature
│       ├── constants.ts             # Plans, pricing
│       └── index.ts
│
├── components/                       # Shared UI components
│   ├── ui/
│   │   ├── button.tsx               # Base button component
│   │   ├── input.tsx                # Input component
│   │   ├── card.tsx                 # Card components
│   │   ├── dialog.tsx               # Modal dialog
│   │   ├── dropdown.tsx             # Dropdown menu
│   │   └── index.ts
│   │
│   ├── forms/                        # Form components
│   │   ├── text-field.tsx
│   │   ├── select-field.tsx
│   │   ├── checkbox.tsx
│   │   └── index.ts
│   │
│   └── layouts/                      # Layout components
│       ├── dashboard-layout.tsx      # Dashboard wrapper
│       ├── marketing-layout.tsx      # Marketing wrapper
│       ├── auth-layout.tsx           # Auth pages wrapper
│       └── index.ts
│
├── server/                           # Backend (tRPC & services)
│   ├── routers/
│   │   ├── _app.ts                  # Root router
│   │   ├── user.ts                  # User router
│   │   ├── portfolio.ts             # Portfolio router
│   │   ├── ai.ts                    # AI router
│   │   ├── builder.ts               # Builder router
│   │   └── billing.ts               # Billing router
│   │
│   ├── services/                     # Business logic services
│   │   ├── stripe.service.ts        # Stripe integration
│   │   ├── ai.service.ts            # AI provider integration
│   │   ├── email.service.ts         # Email sending
│   │   └── storage.service.ts       # File storage (S3)
│   │
│   ├── middleware/
│   │   └── index.ts                 # tRPC middleware (rate limit, etc.)
│   │
│   ├── trpc.ts                      # tRPC initialization
│   └── caller.ts                    # Server-side caller
│
├── lib/                              # Utilities & configs
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth client hooks
│   ├── prisma.ts                    # Prisma client singleton
│   ├── trpc-provider.tsx            # tRPC React provider
│   └── utils.ts                     # Helper functions (cn, etc.)
│
├── hooks/                            # Shared React hooks
│   ├── use-debounce.ts              # Debounce hook
│   ├── use-local-storage.ts         # Local storage hook
│   ├── use-media-query.ts           # Media query hook
│   ├── use-click-outside.ts         # Click outside hook
│   └── index.ts
│
├── types/                            # TypeScript types
│   ├── api.ts                       # API response types
│   ├── common.ts                    # Common utility types
│   └── index.ts
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Migration files
│
├── public/                           # Static assets
│   ├── images/
│   └── fonts/
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md              # Architecture overview
│   └── FOLDER-STRUCTURE.md          # This file
│
├── .env                              # Environment variables (git-ignored)
├── .env.example                     # Environment template
├── .gitignore
├── middleware.ts                    # Next.js middleware (route protection)
├── next.config.ts
├── package.json
├── prisma.config.ts                 # Prisma 7 config
├── README.md
└── tsconfig.json
```

## 📦 Module Structure Pattern

Each module in `modules/` follows this consistent pattern:

```
modules/[feature]/
├── components/          # Feature-specific UI components
│   ├── FeatureList.tsx
│   ├── FeatureCard.tsx
│   └── index.ts
├── hooks.ts            # React hooks (useFeature, useFeatureList, etc.)
├── types.ts            # TypeScript interfaces/types
├── utils.ts            # Helper functions
├── constants.ts        # Constants (limits, configs, etc.)
└── index.ts           # Barrel export (public API)
```

## 🎯 Key Principles

### 1. **Feature-Based Organization**
- Each feature is self-contained in its module
- Modules export a clean public API via `index.ts`
- Minimal dependencies between modules

### 2. **Clear Separation of Concerns**
- **Client**: `modules/*/components/`, `modules/*/hooks.ts`
- **Server**: `server/routers/`, `server/services/`
- **Database**: `prisma/schema.prisma`
- **Shared**: `lib/`, `types/`, `hooks/`

### 3. **Type Safety**
- All modules have `types.ts` with TypeScript interfaces
- Shared types in `types/` folder
- tRPC provides end-to-end type safety

### 4. **Scalability**
- Easy to add new modules (just copy structure)
- Easy to add new routers (import in `_app.ts`)
- Easy to add new components (consistent patterns)

## 🔗 Import Patterns

### Module Imports (Barrel Exports)
```typescript
// ✅ Good: Use barrel exports
import { useAuth, getUserDisplayName } from '@/modules/auth'
import { usePortfolios, generateSlug } from '@/modules/portfolio'

// ❌ Avoid: Direct deep imports
import { useAuth } from '@/modules/auth/hooks'
```

### Component Imports
```typescript
// ✅ Good: Import from ui barrel
import { Button, Input, Card } from '@/components/ui'

// ✅ Good: Import layouts
import { DashboardLayout } from '@/components/layouts'
```

### Server-Side Imports
```typescript
// ✅ Good: Import tRPC caller
import { createCaller } from '@/server/caller'
import { createTRPCContext } from '@/server/trpc'
```

## 🚀 Adding New Features

### 1. Create Module
```bash
mkdir -p modules/new-feature
touch modules/new-feature/{index,types,hooks,utils,constants}.ts
mkdir modules/new-feature/components
```

### 2. Create Router
```bash
touch server/routers/new-feature.ts
```

### 3. Add to Root Router
```typescript
// server/routers/_app.ts
import { newFeatureRouter } from './new-feature'

export const appRouter = createTRPCRouter({
  // ... existing routers
  newFeature: newFeatureRouter,
})
```

### 4. Add Prisma Models
```prisma
// prisma/schema.prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  // ... fields
  user      User     @relation(fields: [userId], references: [id])
}
```

### 5. Run Migrations
```bash
npm run db:generate
npm run db:push
```

## 📖 Best Practices

1. **Keep modules independent** - avoid importing from other modules
2. **Use barrel exports** - always export through `index.ts`
3. **Type everything** - no `any` types
4. **Server/client boundaries** - use `'use client'` explicitly
5. **Consistent naming** - follow existing patterns
6. **Document public APIs** - add JSDoc comments to exports

## 🔐 Protected Routes

Routes are protected at multiple levels:

1. **Middleware** (`middleware.ts`) - Next.js route protection
2. **tRPC** (`server/trpc.ts`) - `protectedProcedure`
3. **Components** - `useAuth()` hook checks

## 🎨 Styling

- **Tailwind CSS** for utility classes
- **Component variants** for reusable styles
- **Consistent spacing** using Tailwind scale

## 📚 Additional Resources

- [Architecture Overview](./ARCHITECTURE.md)
- [Setup Guide](../SETUP.md)
- [Project Summary](../PROJECT-SUMMARY.md)
