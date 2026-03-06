# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [SETUP.md](file://SETUP.md)
- [QUICK-START.md](file://docs/QUICK-START.md)
- [package.json](file://package.json)
- [.env.example](file://.env.example)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [next.config.ts](file://next.config.ts)
- [middleware.ts](file://middleware.ts)
- [lib/prisma.ts](file://lib/prisma.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [app/layout.tsx](file://app/layout.tsx)
- [app/page.tsx](file://app/page.tsx)
- [lib/auth-client.ts](file://lib/auth-client.ts)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx)
- [server/trpc.ts](file://server/trpc.ts)
- [modules/auth/index.ts](file://modules/auth/index.ts)
- [modules/portfolio/index.ts](file://modules/portfolio/index.ts)
- [modules/ai/hooks.ts](file://modules/ai/hooks.ts)
- [modules/ai/types.ts](file://modules/ai/types.ts)
- [prisma/seed.ts](file://prisma/seed.ts)
</cite>

## Update Summary
**Changes Made**
- Updated quick start guide to emphasize the AI-native workflow starting from the landing page
- Enhanced first-run verification to focus on the AI prompt input and authentication flow
- Added detailed explanation of the workspace-centric setup process
- Updated architecture overview to highlight the AI-first user experience
- Revised troubleshooting section to address AI generation flow issues

## Table of Contents
1. [Introduction](#introduction)
2. [AI-Native Workflow Overview](#ai-native-workflow-overview)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Architecture Overview](#architecture-overview)
6. [Detailed Component Analysis](#detailed-component-analysis)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
Smartfolio is an AI-native portfolio generator that transforms natural language descriptions into complete, professional portfolio websites. The platform emphasizes an intuitive AI-first workflow where users describe their ideal portfolio in plain English, and Smartfolio handles the rest through intelligent content generation and design optimization.

Key capabilities include:
- **AI-Powered Generation**: Transform natural language descriptions into complete portfolios
- **Natural Language Interface**: Simple prompt-based workflow without forms or drag-and-drop
- **Iterative Refinement**: Live preview with follow-up prompts for continuous improvement
- **Secure Authentication**: Google, GitHub, and email/password login
- **Subscription Billing**: Stripe integration with FREE, PRO, and ENTERPRISE tiers
- **Type-Safe APIs**: End-to-end type safety with tRPC
- **Production Ready**: Scalable architecture with protected routes

**Section sources**
- [README.md](file://README.md#L1-L100)

## AI-Native Workflow Overview
Smartfolio's workspace-centric setup process begins with the landing page prompt input, creating an AI-native experience where the workspace IS the product. The user journey follows a streamlined flow designed for maximum efficiency and minimal friction.

```mermaid
flowchart TD
A[Landing Page with Prompt Input] --> B[User Types Portfolio Description]
B --> C[Authentication Required]
C --> D[Auth Modal Opens]
D --> E[User Signs In/Up]
E --> F[Redirect to Workspace]
F --> G[AI Generates Portfolio]
G --> H[Live Preview Available]
H --> I[Iterative Refinement]
I --> J[Publish to Public URL]
K[Workspace] --> L[AI Reasoning Panel]
K --> M[Live Preview Panel]
L --> N[Follow-up Prompts]
M --> O[Real-time Updates]
```

**Diagram sources**
- [SETUP.md](file://SETUP.md#L5-L16)
- [README.md](file://README.md#L63-L72)

**Section sources**
- [SETUP.md](file://SETUP.md#L5-L16)
- [README.md](file://README.md#L63-L72)

## Project Structure
Smartfolio follows a modular, feature-based structure optimized for the AI-native workflow, with clear separation of frontend, backend, and AI processing concerns:

- **app/**: Next.js App Router with landing page and workspace routes
- **server/**: tRPC routers, services, middleware, and AI processing
- **modules/**: Feature modules (auth, portfolio, AI, builder, billing)
- **components/**: Shared UI components and layouts optimized for AI workflows
- **lib/**: Core utilities (Prisma client, auth config, tRPC provider)
- **prisma/**: Database schema and seed data for AI generation history
- **public/**: Static assets and AI-generated content

```mermaid
graph TB
subgraph "Frontend (Next.js App)"
APP["app/"]
LANDING["app/page.tsx<br/>Landing with Prompt Input"]
LAYOUT["app/layout.tsx<br/>Root Layout with TRPCProvider"]
APP --> LANDING
APP --> LAYOUT
end
subgraph "Backend (tRPC & AI)"
SRV["server/"]
ROUTERS["server/routers/*<br/>AI, Portfolio, Auth"]
SERVICES["server/services/*<br/>AI Processing, Stripe"]
MWARE["server/middleware/<br/>Rate Limiting, Auth"]
SRV --> ROUTERS
SRV --> SERVICES
SRV --> MWARE
end
subgraph "AI Module"
AI_MOD["modules/ai/*<br/>Hooks, Types, Utils"]
AI_HOOKS["modules/ai/hooks.ts<br/>useAIGeneration, useAIHistory"]
AI_TYPES["modules/ai/types.ts<br/>AIGenerationRequest, AIProvider"]
AI_MOD --> AI_HOOKS
AI_MOD --> AI_TYPES
end
subgraph "Core Libraries"
LIB["lib/"]
PRISMA["lib/prisma.ts<br/>Database Client"]
AUTH["lib/auth.ts<br/>Better Auth Config"]
AUTH_CLIENT["lib/auth-client.ts<br/>Client-side Auth"]
TPROV["lib/trpc-provider.tsx<br/>tRPC React Provider"]
LIB --> PRISMA
LIB --> AUTH
LIB --> AUTH_CLIENT
LIB --> TPROV
end
subgraph "Database"
PRISMA_SCHEMA["prisma/schema.prisma<br/>AI History, Templates"]
end
subgraph "Protected Routes"
WORKSPACE["/workspace<br/>AI Workspace"]
PUBLIC_PORTFOLIO["/p/[slug]<br/>Published Portfolio"]
PRICING["/pricing<br/>Pricing Page"]
end
LANDING --> WORKSPACE
LANDING --> PUBLIC_PORTFOLIO
LANDING --> PRICING
```

**Diagram sources**
- [SETUP.md](file://SETUP.md#L37-L85)
- [app/page.tsx](file://app/page.tsx#L1-L683)
- [app/layout.tsx](file://app/layout.tsx#L1-L36)
- [modules/ai/hooks.ts](file://modules/ai/hooks.ts#L1-L76)
- [modules/ai/types.ts](file://modules/ai/types.ts#L1-L69)
- [lib/prisma.ts](file://lib/prisma.ts#L1-L14)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [lib/auth-client.ts](file://lib/auth-client.ts#L1-L8)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L230)

**Section sources**
- [SETUP.md](file://SETUP.md#L37-L85)
- [README.md](file://README.md#L1-L100)

## Core Components
This section outlines the essential components you will configure during setup and how they interact to create the AI-native workflow.

### Prisma Client and Database
- Prisma Client is initialized in lib/prisma.ts and connects to PostgreSQL via DATABASE_URL from environment variables
- The schema defines models for authentication, portfolios, AI generation history, templates, billing, and analytics
- AI generation history is stored for tracking user interactions and improving recommendations

### Authentication (Better Auth)
- Configured in lib/auth.ts using environment variables for secrets, base URL, and optional OAuth providers (Google, GitHub)
- Client-side authentication handled in lib/auth-client.ts with dynamic baseURL resolution
- Middleware in middleware.ts enforces authentication for protected routes and redirects unauthenticated users to sign-in

### tRPC Layer
- server/trpc.ts initializes tRPC with context injection for session and database access
- lib/trpc-provider.tsx sets up the client-side provider with automatic base URL detection for development and production
- AI-related tRPC procedures handle content generation, history retrieval, and usage statistics

### AI Module
- modules/ai/hooks.ts provides React hooks for AI generation including useAIGeneration, useAIHistory, and useAIUsageStats
- modules/ai/types.ts defines AI generation types, providers (OpenAI, Anthropic, Google), and request/response interfaces
- AI processing flows through server/services/ai.ts with OpenAI integration for content generation

### Middleware and Routing
- middleware.ts enforces authentication for protected routes and redirects unauthenticated users to sign-in with callbackUrl preserved
- Routes include / (landing with prompt input), /workspace (AI workspace), /portfolio/[id] (deep links), /p/[slug] (published portfolios), and /pricing

**Section sources**
- [lib/prisma.ts](file://lib/prisma.ts#L1-L14)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L230)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [lib/auth-client.ts](file://lib/auth-client.ts#L1-L8)
- [server/trpc.ts](file://server/trpc.ts#L1-L61)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [middleware.ts](file://middleware.ts#L1-L95)
- [modules/auth/index.ts](file://modules/auth/index.ts#L1-L14)
- [modules/portfolio/index.ts](file://modules/portfolio/index.ts#L1-L14)
- [modules/ai/hooks.ts](file://modules/ai/hooks.ts#L1-L76)
- [modules/ai/types.ts](file://modules/ai/types.ts#L1-L69)

## Architecture Overview
The system architecture combines a Next.js frontend with AI-first design, tRPC backend, secure authentication, and PostgreSQL via Prisma. The AI-native workflow emphasizes the landing page prompt input as the entry point to the workspace-centric experience.

```mermaid
graph TB
CLIENT["Browser"]
LANDING["Landing Page<br/>app/page.tsx<br/>Prompt Input + Voice + Files"]
NEXT["Next.js App Router<br/>app/layout.tsx"]
TRPC_CLIENT["tRPC Provider<br/>lib/trpc-provider.tsx"]
TRPC_SERVER["tRPC Server<br/>server/trpc.ts"]
AUTH["Better Auth<br/>lib/auth.ts + lib/auth-client.ts"]
AI_MODULE["AI Module<br/>modules/ai/*<br/>useAIGeneration, hooks"]
PRISMA["Prisma Client<br/>lib/prisma.ts"]
DB["PostgreSQL"]
STRIPE["Stripe (Billing)"]
OPENAI["OpenAI (AI Generation)"]
REDIS["Upstash Redis (Rate Limiting)"]
CLIENT --> LANDING
LANDING --> NEXT
NEXT --> TRPC_CLIENT
TRPC_CLIENT --> TRPC_SERVER
TRPC_SERVER --> AUTH
TRPC_SERVER --> AI_MODULE
TRPC_SERVER --> PRISMA
PRISMA --> DB
AUTH --> DB
TRPC_SERVER --> STRIPE
AI_MODULE --> OPENAI
TRPC_SERVER --> REDIS
```

**Diagram sources**
- [app/page.tsx](file://app/page.tsx#L1-L683)
- [app/layout.tsx](file://app/layout.tsx#L1-L36)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [server/trpc.ts](file://server/trpc.ts#L1-L61)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [lib/auth-client.ts](file://lib/auth-client.ts#L1-L8)
- [modules/ai/hooks.ts](file://modules/ai/hooks.ts#L1-L76)
- [lib/prisma.ts](file://lib/prisma.ts#L1-L14)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L230)

## Detailed Component Analysis

### Prerequisites
- **Node.js 18+** (required for Next.js 16)
- **PostgreSQL database** (required for user data, AI history, and portfolio storage)
- **npm or pnpm** (package manager)

Verification steps:
- Confirm Node.js version meets requirement (node --version ≥ 18)
- Ensure PostgreSQL is installed and accessible (psql --version)
- Verify database connectivity with DATABASE_URL

**Section sources**
- [README.md](file://README.md#L20-L23)

### Environment Configuration (.env and .env.example)
Copy the example environment file to .env and fill in values. Critical variables include:

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/smartfolio?schema=public`)
- `BETTER_AUTH_SECRET`: Secret key (min 32 characters) for Better Auth encryption
- `BETTER_AUTH_URL`: Base URL of the application (e.g., `http://localhost:3000`)
- `OPENAI_API_KEY`: OpenAI API key for AI generation
- `NEXT_PUBLIC_APP_URL`: Public-facing app URL for client-side routing

**Recommended OAuth Providers:**
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`: GitHub OAuth credentials

**Billing Integration:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- Price IDs for PRO and ENTERPRISE plans

**Optional Services:**
- AWS S3 credentials for file storage
- Upstash Redis for rate limiting
- SMTP configuration for email notifications
- Analytics keys (Google Analytics, PostHog)

Example reference:
- See .env.example for the complete list of variables and comments

**Section sources**
- [SETUP.md](file://SETUP.md#L97-L144)
- [.env.example](file://.env.example#L1-L84)

### Database Setup (Prisma)
Generate Prisma Client and push schema to the database. Optionally open Prisma Studio for inspection.

Commands:
```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

Seed data:
- Starter templates are seeded via prisma/seed.ts for AI generation examples

**Section sources**
- [SETUP.md](file://SETUP.md#L145-L150)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L230)
- [prisma/seed.ts](file://prisma/seed.ts#L1-L330)

### Development Server Startup
Start the development server on the default Next.js port. Access the application at http://localhost:3000.

Scripts:
```bash
npm run dev  # Start development server
npm run build  # Build for production
npm run start  # Start production server
```

Port configuration:
- The tRPC provider resolves the base URL for API calls automatically
- In development, it defaults to http://localhost:3000 unless PORT is set
- NEXT_PUBLIC_APP_URL should match your development base URL

**Section sources**
- [README.md](file://README.md#L55-L59)
- [package.json](file://package.json#L5-L14)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L12-L16)

### First-Run Verification
The AI-native workflow begins on the landing page with the prompt input. Follow these steps to verify the complete setup:

1. **Visit Landing Page**: Go to http://localhost:3000 to see the landing page with AI prompt input
2. **Test Prompt Input**: Type a portfolio description like "Create a dark minimalist portfolio for a React developer"
3. **Authentication Trigger**: Click send - the auth modal should appear since you're not logged in
4. **Sign In**: Use Google or GitHub OAuth to authenticate
5. **Workspace Access**: After authentication, you should be redirected to the workspace
6. **AI Generation**: The workspace should display AI reasoning on the left and live preview on the right
7. **Iterative Refinement**: Try follow-up prompts to adjust design, content, or layout
8. **Publish Flow**: Test the publish functionality to create a public URL at `/p/[your-slug]`

**Section sources**
- [SETUP.md](file://SETUP.md#L160-L167)
- [README.md](file://README.md#L63-L72)
- [app/page.tsx](file://app/page.tsx#L59-L683)

### Production Deployment Preparation
Build the application for production and start the production server. Ensure environment variables are configured for production.

Scripts:
```bash
npm run build
npm run start
```

Deployment considerations:
- Ensure BETTER_AUTH_URL matches your production domain
- Configure NEXT_PUBLIC_APP_URL for client-side routing
- Set proper BASE_URL for Better Auth redirect logic
- For Vercel deployments, refer to Next.js deployment documentation

**Section sources**
- [package.json](file://package.json#L5-L14)
- [middleware.ts](file://middleware.ts#L6-L24)
- [README.md](file://README.md#L95-L100)

## Dependency Analysis
Smartfolio's runtime dependencies include Next.js, tRPC, Prisma, Better Auth, OpenAI, Stripe, AWS SDK, and related libraries. Development dependencies include TypeScript, ESLint, Tailwind CSS, and related tooling.

```mermaid
graph TB
PKG["package.json"]
NEXT["next"]
TRPC["@trpc/*"]
PRISMA["@prisma/client, prisma"]
AUTH["better-auth"]
OPENAI["openai"]
STRIPE["stripe"]
AWS["@aws-sdk/*"]
RLC["@upstash/ratelimit"]
TAIL["tailwind-*"]
TYPES["@types/*, typescript"]
PKG --> NEXT
PKG --> TRPC
PKG --> PRISMA
PKG --> AUTH
PKG --> OPENAI
PKG --> STRIPE
PKG --> AWS
PKG --> RLC
PKG --> TAIL
PKG --> TYPES
```

**Diagram sources**
- [package.json](file://package.json#L1-L52)

**Section sources**
- [package.json](file://package.json#L1-L52)

## Performance Considerations
- Use Prisma Client logging only in development to avoid noisy logs in production
- Keep NODE_ENV set appropriately to reduce logging overhead in production
- Configure rate limiting with Upstash Redis for API endpoints to prevent abuse
- Optimize tRPC transformer usage and batch links for efficient network calls
- Implement proper caching strategies for AI generation responses
- Monitor OpenAI API usage and implement token budget controls

## Troubleshooting Guide
Common setup issues and resolutions for the AI-native workflow:

### Database Connectivity Errors
- Verify DATABASE_URL points to a reachable PostgreSQL instance
- Ensure the database exists and credentials are correct
- Confirm Prisma schema matches the database after pushing
- Check that the database user has proper permissions

### Authentication Failures
- Ensure BETTER_AUTH_SECRET is at least 32 characters long
- Set BETTER_AUTH_URL to your base URL (http://localhost:3000 for local)
- For OAuth, confirm GOOGLE_CLIENT_ID/SECRET and GITHUB_CLIENT_ID/SECRET are configured
- Verify callback URLs match your development/production domains

### tRPC Client URL Mismatch
- In development, ensure NEXT_PUBLIC_APP_URL matches the local host and port
- The tRPC provider resolves the base URL dynamically; confirm it aligns with your deployment
- Check that /api/trpc endpoint is accessible

### AI Generation Issues
- Verify OPENAI_API_KEY is valid and has sufficient quota
- Check that AI provider configuration matches your environment variables
- Ensure AI service endpoints are properly routed through tRPC
- Monitor OpenAI API status and rate limits

### Stripe Configuration
- Provide NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and price IDs
- Ensure webhook endpoint is configured in the Stripe dashboard
- Verify billing functionality works with test payments

### Port Conflicts
- If port 3000 is in use, set the PORT environment variable before starting the dev server
- Ensure all required ports are available for development

### Missing Environment Variables
- Copy .env.example to .env and fill in all required values
- Restart the development server after updating .env
- Verify all AI, authentication, and billing variables are properly configured

**Section sources**
- [SETUP.md](file://SETUP.md#L130-L160)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [lib/auth-client.ts](file://lib/auth-client.ts#L1-L8)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L12-L16)
- [middleware.ts](file://middleware.ts#L6-L24)

## Conclusion
You now have the essentials to install, configure, and run Smartfolio's AI-native workflow locally. The platform's workspace-centric design prioritizes the landing page prompt input as the entry point to an immersive AI generation experience. Proceed with installing dependencies, setting up environment variables, configuring the database, and starting the development server. Explore the AI module hooks and tRPC routers to understand the feature boundaries and integrate additional AI providers as needed for production.

The key to success with Smartfolio is understanding that the workspace IS the product - users begin their journey on the landing page with a simple prompt, and the entire application revolves around the AI generation and refinement process.

## Appendices

### A. Environment Variables Reference
**Required**
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key (min 32 characters)
- `BETTER_AUTH_URL`: Base URL of application
- `OPENAI_API_KEY`: OpenAI API key
- `NEXT_PUBLIC_APP_URL`: Public-facing app URL

**Recommended**
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`: GitHub OAuth credentials

**Billing**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- Price IDs for PRO and ENTERPRISE plans

**Optional Services**
- AWS credentials for S3 storage
- Upstash Redis for rate limiting
- SMTP configuration for email
- Analytics keys

**Section sources**
- [SETUP.md](file://SETUP.md#L170-L196)
- [.env.example](file://.env.example#L1-L84)

### B. Basic Project Structure Exploration
- **app/**: Entry points for pages and API routes (landing page with prompt input)
- **server/**: tRPC routers, services, middleware, and AI processing
- **modules/**: Feature modules for auth, portfolio, AI, builder, billing
- **components/**: Shared UI components optimized for AI workflows
- **lib/**: Core utilities (Prisma client, auth config, tRPC provider)
- **prisma/**: Schema and seed data for AI generation history

**Section sources**
- [SETUP.md](file://SETUP.md#L37-L85)

### C. Initial Setup Checklist
- [ ] Install Node.js 18+
- [ ] Install and start PostgreSQL
- [ ] Install dependencies (npm install)
- [ ] Copy .env.example to .env and configure variables
- [ ] Generate Prisma Client and push schema
- [ ] Seed templates (optional)
- [ ] Start development server (npm run dev)
- [ ] Verify landing page prompt input at http://localhost:3000
- [ ] Test AI generation workflow with authentication
- [ ] Confirm workspace loads with live preview

**Section sources**
- [README.md](file://README.md#L18-L61)
- [SETUP.md](file://SETUP.md#L89-L167)