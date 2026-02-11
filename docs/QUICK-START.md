# 🎯 Smartfolio - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL database URL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartfolio"
```

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Detailed Guides

### Creating Your First Portfolio

1. **Sign Up** - Navigate to `/sign-up`
2. **Create Portfolio** - Use the Dashboard
3. **Use Builder** - Drag & drop blocks
4. **Publish** - Make it live

### Using AI Generation

```typescript
import { useGeneratePortfolioContent } from '@/modules/ai'

const { generatePortfolio } = useGeneratePortfolioContent()

await generatePortfolio({
  name: 'Your Name',
  profession: 'Your Title',
  skills: ['Skill 1', 'Skill 2'],
})
```

### Adding New Features

1. Create module in `modules/feature-name/`
2. Add router in `server/routers/feature-name.ts`
3. Update `server/routers/_app.ts`
4. Add database models in `prisma/schema.prisma`

---

## 🔧 Common Tasks

### Update Database Schema
```bash
# Edit prisma/schema.prisma, then:
npm run db:generate
npm run db:push
```

### Add New API Endpoint
```typescript
// server/routers/my-feature.ts
export const myFeatureRouter = createTRPCRouter({
  myProcedure: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.myModel.findUnique({ where: { id: input.id } })
    }),
})
```

### Create New Component
```typescript
// components/ui/my-component.tsx
'use client'

export function MyComponent({ children }: { children: React.ReactNode }) {
  return <div className="...">{children}</div>
}
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials

### Prisma Client Error
```bash
npm run db:generate
```

### TypeScript Errors
```bash
npm run type-check
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

---

## 📚 Learn More

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Folder Structure](./docs/FOLDER-STRUCTURE.md)
- [Project Summary](./PROJECT-SUMMARY.md)
- [Setup Guide](./SETUP.md)

---

## 🆘 Need Help?

- 📖 Check the documentation
- 💬 Join our Discord
- 📧 Email support@smartfolio.com
- 🐛 Open a GitHub issue

Happy building! 🚀
