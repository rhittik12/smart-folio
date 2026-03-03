# Smartfolio -- Project Summary

## What Smartfolio Is

Smartfolio is an AI-native developer portfolio generator. It follows the interaction model pioneered by Lovable: the user describes what they want in natural language, and the system generates it live.

The core product loop:

```
Prompt --> Generate --> Refine --> Publish
```

There is no traditional SaaS dashboard. No sidebar navigation. No settings pages. The AI workspace IS the product.

---

## Product Philosophy

### AI-First, Not Feature-First

The user's primary interaction is typing a prompt. Everything else -- authentication, billing, settings -- is secondary and surfaced only when needed.

### Workspace-First, Not Dashboard-First

When the user opens Smartfolio, they see one thing: a prompt input. After generating, they see two things: the AI reasoning stream and a live preview of their portfolio. That's the entire product surface.

### Prompt-Driven, Not Form-Driven

Users don't fill out forms to create portfolios. They describe what they want:

- "Create a sleek dark frontend developer portfolio with React projects"
- "Make a creative portfolio for a UX designer with case studies"
- "Build a minimal portfolio with just my GitHub projects and a contact form"

The AI interprets the prompt and produces a complete portfolio.

### Iterative Refinement, Not One-Shot Generation

After the initial generation, users refine via follow-up prompts:

- "Make the hero section gradient blue to purple"
- "Add a testimonials section"
- "Change the font to something more modern"

Each refinement applies a differential update -- not a full regeneration.

---

## How It Works

### User Flow

1. User lands on `/` and sees the prompt input
2. User types a portfolio description
3. Auth modal triggers on first generation (Google/GitHub OAuth)
4. User is redirected to `/workspace` with their prompt
5. The workspace shows:
   - Left pane (~35-40%): AI reasoning stream with step-by-step generation progress
   - Right pane (~60-65%): Live portfolio preview rendering in real-time
6. Prompt input persists at the bottom of the left pane for refinements
7. User refines iteratively until satisfied
8. User clicks "Publish" in the top bar
9. Portfolio goes live at `/p/[slug]`

### Generation Pipeline

1. User prompt is sent to the backend
2. AI generates structured portfolio JSON (theme, sections, content, metadata)
3. Generation steps stream to the reasoning pane in real-time
4. The portfolio renderer takes the JSON and renders it in the preview iframe
5. Portfolio record is created/updated in the database automatically

### Route Model

| Route | Purpose |
|-------|---------|
| `/` | Landing page with prompt input |
| `/workspace` | AI workspace (reasoning + preview) |
| `/portfolio/[id]` | Deep link to specific portfolio workspace |
| `/p/[slug]` | Public published portfolio (standalone) |
| `/pricing` | Plan comparison and upgrade |

No additional routes. Settings and billing are modal-based within the workspace.

---

## Infrastructure Built

### Backend

| System | Technology | Status |
|--------|-----------|--------|
| API Layer | tRPC 11 (type-safe) | Operational |
| Database | Prisma 6 + PostgreSQL (Neon) | Operational |
| Authentication | Better Auth (Google, GitHub, email) | Operational |
| AI Generation | OpenAI (GPT-3.5/GPT-4) | Operational (snippet mode; full portfolio mode pending) |
| Billing | Stripe (3-tier subscriptions) | Operational |
| File Storage | AWS S3 | Operational |
| Rate Limiting | Upstash Redis | Operational |
| Email | Nodemailer SMTP | Operational |

### Frontend

| Component | Status |
|-----------|--------|
| Landing page with prompt input | Built |
| Voice input (Web Speech API) | Built |
| File attachments | Built |
| Inline auth modal | Built |
| UI component library (Button, Input, Card, Dialog, Dropdown) | Built |
| AI workspace (two-pane layout) | Not yet built |
| Portfolio renderer | Not yet built |
| Refinement prompt system | Not yet built |
| Inline visual editing | Not yet built |
| Publish flow | Not yet built |
| Upgrade trigger components | Not yet built |

### Feature Modules

Each module in `modules/` provides React hooks, TypeScript types, utility functions, and constants:

- **auth** -- session management, auth state
- **portfolio** -- CRUD operations, publish
- **ai** -- generation hooks, usage tracking
- **builder** -- template system, block management
- **billing** -- subscription state, checkout, payment history

### Database Models

User, Account, Session, Verification, Portfolio, PortfolioSection, PortfolioAnalytics, Template, Subscription, Payment, AIGeneration

---

## Usage Limits

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| Portfolios | 1 | 10 | 100 |
| AI Generations | 10/month | 100/month | 1,000/month |
| Tokens | 10,000 | 50,000 | 200,000 |
| Templates | Basic | Premium | All + Custom |
| Badge removal | No | Yes | Yes |

---

## What Comes Next

The infrastructure is built. The re-architecture focus is now on:

1. Building the workspace UI (two-pane layout)
2. Upgrading AI from snippet generation to full structured portfolio output
3. Building the portfolio renderer
4. Implementing the refinement system
5. Adding inline visual editing
6. Integrating the publish flow
7. Wiring upgrade triggers at natural friction points
8. Production hardening (error boundaries, auto-save, caching, monitoring)

---

## Documentation

- [Setup Guide](./SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Folder Structure](./docs/FOLDER-STRUCTURE.md)
- [Diagrams](./docs/DIAGRAMS.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
