# Smartfolio -- Quick Start

## Setup (5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartfolio"
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

See [SETUP.md](../SETUP.md) for the full environment variable reference.

### 3. Initialize database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start development server

```bash
npm run dev
```

### 5. Open the app

Go to `http://localhost:3000`.

You should see the landing page with a large AI prompt input box, voice input toggle, and file attachment button.

---

## First Experience

1. Type a prompt: "Create a dark minimalist portfolio for a React developer"
2. Click the send button
3. The auth modal appears -- sign in with Google or GitHub
4. After authentication, you continue into the generation flow
5. (Once the workspace is built) You'll see the two-pane workspace with AI reasoning on the left and a live portfolio preview on the right
6. Type refinements in the prompt input to iterate on the design
7. Click "Publish" to make the portfolio live at `/p/[your-slug]`

**Current state:** The landing page and auth flow are functional. The workspace, generation preview, and publish flow are being built as part of the UX re-architecture.

---

## Common Tasks

### Update database schema

Edit `prisma/schema.prisma`, then:

```bash
npx prisma generate
npx prisma db push
```

### Open database GUI

```bash
npx prisma studio
```

### Add a new tRPC endpoint

1. Create or edit a router in `server/routers/`
2. Register new routers in `server/routers/_app.ts`
3. Use in client components via tRPC hooks:

```typescript
const { data } = trpc.routerName.procedureName.useQuery(input)
const mutation = trpc.routerName.procedureName.useMutation()
```

### Add a new feature module

```bash
mkdir modules/feature-name
touch modules/feature-name/{index,types,hooks,utils,constants}.ts
```

Follow the existing module pattern (see `modules/auth/` or `modules/portfolio/` for reference).

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Database GUI
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with prompt input |
| `/workspace` | AI workspace (protected) |
| `/portfolio/[id]` | Portfolio workspace deep link (protected) |
| `/p/[slug]` | Published portfolio (public) |
| `/pricing` | Pricing page (public) |

No dashboard, settings, analytics, or billing pages. Those are modal-based within the workspace.

---

## Troubleshooting

### Database connection error
- Verify `DATABASE_URL` in `.env`
- Confirm PostgreSQL is running

### Prisma client error
```bash
npx prisma generate
```

### TypeScript errors
```bash
npx tsc --noEmit
```

### Clear Next.js cache
```bash
rm -rf .next && npm run dev
```

---

## Further Reading

- [Setup Guide](../SETUP.md) -- Full setup instructions and environment variables
- [Architecture](./ARCHITECTURE.md) -- System architecture and design decisions
- [Folder Structure](./FOLDER-STRUCTURE.md) -- Complete file/folder reference
- [Diagrams](./DIAGRAMS.md) -- Flow diagrams and component hierarchy
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) -- What's built and what's in progress
