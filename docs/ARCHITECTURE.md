# 🚀 Smartfolio - Scalable SaaS Architecture

## 📁 Folder Structure Overview

```
smartfolio/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   ├── (dashboard)/              # Dashboard layout group
│   ├── (marketing)/              # Public marketing pages
│   └── api/                      # API routes
├── modules/                      # Feature modules (business logic)
│   ├── auth/                     # Authentication module
│   ├── portfolio/                # Portfolio management
│   ├── ai/                       # AI generation
│   ├── builder/                  # Portfolio builder/editor
│   └── billing/                  # Subscriptions & payments
├── components/                   # Shared UI components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   └── layouts/                  # Layout components
├── server/                       # Backend (tRPC & services)
│   ├── routers/                  # tRPC routers
│   ├── services/                 # Business logic services
│   └── middleware/               # Server middleware
├── lib/                          # Utilities & config
│   ├── auth.ts                   # Auth config
│   ├── prisma.ts                 # Database client
│   └── utils.ts                  # Helper functions
├── hooks/                        # Shared React hooks
├── types/                        # TypeScript types
└── prisma/                       # Database schema
```

## 🏗️ Architecture Principles

### 1. **Modular by Feature**
Each module (`modules/*`) contains:
- **Components**: UI specific to that feature
- **Hooks**: Feature-specific React hooks
- **Types**: TypeScript interfaces/types
- **Utils**: Helper functions
- **Constants**: Module constants

### 2. **Clear Server/Client Separation**
- `modules/*/components/` - Client components
- `modules/*/actions/` - Server actions
- `server/routers/` - tRPC endpoints
- `server/services/` - Pure business logic

### 3. **Protected Routes**
- Route groups: `(auth)`, `(dashboard)`
- Middleware checks authentication
- tRPC `protectedProcedure` for APIs

### 4. **Reusable Components**
- `components/ui/` - Base components (Button, Input, etc.)
- `components/forms/` - Form components
- `components/layouts/` - Layout wrappers

## 📦 Module Structure Example

Each module follows this pattern:

```
modules/[feature]/
├── components/          # Feature UI components
├── hooks/              # Feature React hooks
├── types/              # Feature TypeScript types
├── utils/              # Feature utilities
├── constants.ts        # Feature constants
└── index.ts           # Public API
```

## 🔐 Authentication Flow

1. User signs in → Better Auth
2. Session stored in database (Prisma)
3. Middleware checks auth on protected routes
4. tRPC context includes session
5. `protectedProcedure` validates user

## 🗄️ Database Models

- **User** - Authentication
- **Account** - OAuth providers
- **Session** - Session management
- **Portfolio** - User portfolios
- **Template** - Portfolio templates
- **Subscription** - Billing plans
- **Payment** - Transaction history
- **AIGeneration** - AI generation logs

## 🚦 Request Flow

```
Client → tRPC Client → API Route → tRPC Router → Service → Prisma → Database
```

## 📝 Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`usePortfolio.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase with 'Type' suffix (`PortfolioType.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PORTFOLIOS`)

## 🔧 Development Guidelines

1. **Keep modules independent** - minimal cross-module imports
2. **Use barrel exports** - `index.ts` in each module
3. **Type everything** - leverage TypeScript
4. **Server/client boundaries** - use 'use client' explicitly
5. **Centralize types** - share types between client/server

## 📚 Next Steps

1. Configure environment variables
2. Run database migrations
3. Set up Stripe webhooks (billing)
4. Configure AI provider (OpenAI, etc.)
5. Deploy to production

## 🔗 Key Files

- [Prisma Schema](../prisma/schema.prisma) - Database models
- [tRPC Router](../server/routers/_app.ts) - API endpoints
- [Auth Config](../lib/auth.ts) - Authentication setup
- [Middleware](../middleware.ts) - Route protection
