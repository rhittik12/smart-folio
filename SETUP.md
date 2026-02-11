# Smartfolio - Setup Complete! 🚀

This project includes:
- **Next.js 16** with App Router
- **tRPC** for type-safe APIs
- **Prisma** ORM with PostgreSQL
- **Better Auth** for authentication
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Project Structure

```
smartfolio/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth API routes
│   │   └── trpc/[trpc]/       # tRPC API routes
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Home page
├── server/                     # Backend (tRPC)
│   ├── routers/               # tRPC routers
│   │   ├── _app.ts           # Root router
│   │   └── user.ts           # User router
│   ├── trpc.ts               # tRPC initialization
│   └── caller.ts             # Server-side caller
├── lib/                        # Utilities
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── prisma.ts             # Prisma client
│   └── trpc-provider.tsx     # tRPC React provider
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                      # Environment variables (git-ignored)
└── .env.example              # Environment template
```

## Getting Started

### 1. Configure Database

Update `.env` with your PostgreSQL connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartfolio?schema=public"
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
```

### 2. Run Database Migrations

```bash
npx prisma generate
npx prisma db push
```

### 3. Start Development Server

```bash
npm run dev
```

## Usage Examples

### Client Components (React Hooks)

```tsx
'use client'
import { trpc } from '@/lib/trpc-provider'

export function UserProfile() {
  const { data, isLoading } = trpc.user.getProfile.useQuery()
  const updateProfile = trpc.user.updateProfile.useMutation()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <button onClick={() => updateProfile.mutate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  )
}
```

### Server Components

```tsx
import { createCaller } from '@/server/caller'
import { createTRPCContext } from '@/server/trpc'

export default async function UsersPage() {
  const context = await createTRPCContext({ req: new Request('http://localhost') })
  const caller = createCaller(context)
  
  const users = await caller.user.list({ limit: 10 })
  
  return (
    <div>
      {users.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Authentication

```tsx
'use client'
import { signIn, signOut, useSession } from '@/lib/auth-client'

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return <button onClick={() => signOut()}>Sign Out</button>
  }
  
  return (
    <button onClick={() => signIn.email({ 
      email: 'user@example.com', 
      password: 'password' 
    })}>
      Sign In
    </button>
  )
}
```

## Adding New Features

### Create a New Router

1. Create a new file in `server/routers/`, e.g., `posts.ts`:
```typescript
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany()
  }),
  
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
        },
      })
    }),
})
```

2. Add it to the root router in `server/routers/_app.ts`:
```typescript
import { postRouter } from './post'

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter, // Add this
})
```

### Add Database Models

1. Update `prisma/schema.prisma`:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
}
```

2. Update User model to include the relation:
```prisma
model User {
  // ... existing fields
  posts     Post[]
}
```

3. Run migrations:
```bash
npx prisma generate
npx prisma db push
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Secret for auth (min 32 chars) | ✅ |
| `BETTER_AUTH_URL` | Base URL of your app | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ❌ |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ❌ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | ❌ |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema to database
- `npx prisma migrate dev` - Create and apply migrations

## Key Features

✅ **Type Safety**: End-to-end type safety from database to frontend  
✅ **Authentication**: Email/password + OAuth providers ready  
✅ **Database ORM**: Prisma with PostgreSQL  
✅ **API Layer**: tRPC for type-safe APIs  
✅ **Modular Structure**: Easy to extend and maintain  
✅ **Server & Client**: Works in both Server and Client Components  

## Next Steps

1. Set up your PostgreSQL database
2. Run `npx prisma db push` to create tables
3. Start the dev server with `npm run dev`
4. Begin building your features!

For more information:
- [tRPC Docs](https://trpc.io)
- [Prisma Docs](https://prisma.io)
- [Better Auth Docs](https://better-auth.com)
- [Next.js Docs](https://nextjs.org)
