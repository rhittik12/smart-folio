# 🚀 Smartfolio - AI-Native Portfolio Generator

An AI-powered portfolio generator for developers. Describe what you want in natural language, and Smartfolio creates a complete, polished portfolio website. Built with Next.js 16, tRPC, Prisma, and Better Auth.

## ✨ Features

- 🤖 **AI-Powered Generation** - Type a prompt, get a complete portfolio instantly
- 📝 **Natural Language Interface** - No forms, no drag-and-drop, just describe what you want
- 🔄 **Iterative Refinement** - Fine-tune your portfolio with follow-up prompts
- 👁️ **Live Preview** - See your portfolio render in real-time as AI generates it
- 🔐 **Secure Authentication** - Google, GitHub, and email/password login
- 💳 **Stripe Integration** - Subscription billing with FREE, PRO, and ENTERPRISE tiers
- 🎯 **Type-Safe APIs** - End-to-end type safety with tRPC
- 🗄️ **PostgreSQL Database** - Prisma ORM with migrations
- 📱 **Responsive Design** - Mobile-first Tailwind CSS
- 🚀 **Production Ready** - Scalable architecture, protected routes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Quick Start

First, install dependencies:

```bash
npm install
```

Then, configure environment variables:

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

Setup the database:

```bash
npx prisma generate
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 How It Works

1. **Land on the homepage** - See a simple prompt input
2. **Describe your portfolio** - "Create a dark minimalist portfolio for a React developer"
3. **Authenticate** - Sign in with Google or GitHub (inline modal)
4. **Enter the workspace** - AI generates your portfolio with live preview
5. **Refine** - Type follow-up prompts to adjust design, content, or layout
6. **Publish** - One-click publish to get a public URL at `/p/[your-slug]`

There is no dashboard. The workspace IS the product.

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Full setup instructions and environment variables
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture and design decisions
- [Folder Structure](./docs/FOLDER-STRUCTURE.md) - Complete file/folder reference
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - What's built and what's in progress

## Tech Stack

- **Next.js 16** - App Router
- **React 19** - UI
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **tRPC 11** - Type-safe API layer
- **Prisma 6** - ORM (PostgreSQL)
- **Better Auth** - Authentication
- **OpenAI** - AI content generation
- **Stripe** - Subscription billing
- **AWS S3** - File storage
- **Upstash Redis** - Rate limiting

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
