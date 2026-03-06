# Portfolio Creation and Editing Workflow

<cite>
**Referenced Files in This Document**
- [modules/portfolio/index.ts](file://modules/portfolio/index.ts)
- [modules/portfolio/types.ts](file://modules/portfolio/types.ts)
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [modules/builder/index.ts](file://modules/builder/index.ts)
- [modules/builder/types.ts](file://modules/builder/types.ts)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts)
- [server/routers/builder.ts](file://server/routers/builder.ts)
- [modules/ai/index.ts](file://modules/ai/index.ts)
- [modules/ai/types.ts](file://modules/ai/types.ts)
- [server/routers/ai.ts](file://server/routers/ai.ts)
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx)
- [lib/auth.ts](file://lib/auth.ts)
- [app/page.tsx](file://app/page.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the portfolio creation and editing workflow in SmartFolio. It covers how users create new portfolios, choose themes and templates, customize content, preview changes, manage drafts, and publish. It also documents metadata management, branding options, content organization, CRUD operations, validation, error handling, user permissions, collaboration features, versioning, autosave, and recovery mechanisms.

## Project Structure
SmartFolio organizes portfolio functionality into modular TypeScript packages and tRPC routers backed by Prisma ORM. The key areas are:
- Portfolio domain: types, hooks, utilities, and constants
- Builder domain: drag-and-drop blocks, templates, and persistence
- AI domain: content generation for portfolios and sections
- Backend: tRPC routers for portfolio, builder, and AI operations
- Frontend: tRPC provider, authentication, and UI surfaces

```mermaid
graph TB
subgraph "Frontend"
TRPC["tRPC Provider<br/>lib/trpc-provider.tsx"]
UI["UI Components<br/>app/page.tsx"]
end
subgraph "Portfolio Domain"
PFHooks["Portfolio Hooks<br/>modules/portfolio/hooks.ts"]
PFTypes["Portfolio Types & Utils<br/>modules/portfolio/types.ts<br/>modules/portfolio/utils.ts"]
end
subgraph "Builder Domain"
BHooks["Builder Hooks<br/>modules/builder/hooks.ts"]
BTypes["Builder Types<br/>modules/builder/types.ts"]
end
subgraph "AI Domain"
AIHooks["AI Hooks<br/>modules/ai/index.ts"]
AIType["AI Types<br/>modules/ai/types.ts"]
end
subgraph "Backend"
PRouter["Portfolio Router<br/>server/routers/portfolio.ts"]
BRouter["Builder Router<br/>server/routers/builder.ts"]
ARouter["AI Router<br/>server/routers/ai.ts"]
Schema["Prisma Schema<br/>prisma/schema.prisma"]
end
UI --> TRPC
TRPC --> PFHooks
TRPC --> BHooks
TRPC --> AIHooks
PFHooks --> PRouter
BHooks --> BRouter
AIHooks --> ARouter
PRouter --> Schema
BRouter --> Schema
ARouter --> Schema
```

**Diagram sources**
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts#L1-L99)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L1-L117)
- [modules/ai/index.ts](file://modules/ai/index.ts#L1-L14)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L1-L115)
- [server/routers/builder.ts](file://server/routers/builder.ts#L1-L156)
- [server/routers/ai.ts](file://server/routers/ai.ts#L1-L105)
- [prisma/schema.prisma](file://prisma/schema.prisma#L89-L146)

**Section sources**
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [modules/portfolio/index.ts](file://modules/portfolio/index.ts#L1-L14)
- [modules/builder/index.ts](file://modules/builder/index.ts#L1-L14)
- [modules/ai/index.ts](file://modules/ai/index.ts#L1-L14)

## Core Components
- Portfolio types define the data model for portfolios, sections, and statuses.
- Portfolio hooks encapsulate tRPC queries/mutations for CRUD and publishing.
- Portfolio utilities provide URL generation, validation, and status helpers.
- Builder hooks manage the in-browser block editor state and template/application.
- AI hooks enable AI-driven content generation for portfolios and sections.
- tRPC routers implement protected procedures for portfolio, builder, and AI operations.
- Prisma schema defines the relational model for portfolios, sections, analytics, templates, and users.

Key capabilities:
- Create, list, get, update, delete, and publish portfolios
- Manage sections as blocks with ordering and visibility
- Apply templates to populate sections
- Save custom blocks to persist content
- Generate AI-assisted content and metadata
- Enforce per-user ownership and access control

**Section sources**
- [modules/portfolio/types.ts](file://modules/portfolio/types.ts#L1-L73)
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts#L1-L99)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L1-L55)
- [modules/builder/types.ts](file://modules/builder/types.ts#L1-L76)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L1-L117)
- [modules/ai/types.ts](file://modules/ai/types.ts#L1-L69)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L1-L115)
- [server/routers/builder.ts](file://server/routers/builder.ts#L1-L156)
- [server/routers/ai.ts](file://server/routers/ai.ts#L1-L105)
- [prisma/schema.prisma](file://prisma/schema.prisma#L89-L146)

## Architecture Overview
The workflow spans frontend hooks, tRPC routers, and Prisma models. Authentication is handled by Better Auth, and tRPC ensures type-safe client-server communication.

```mermaid
sequenceDiagram
participant User as "User"
participant UI as "UI Layer<br/>app/page.tsx"
participant Hooks as "tRPC Hooks<br/>modules/*/hooks.ts"
participant Router as "tRPC Router<br/>server/routers/*.ts"
participant DB as "Prisma Schema<br/>prisma/schema.prisma"
User->>UI : "Click Create Portfolio"
UI->>Hooks : "useCreatePortfolio()"
Hooks->>Router : "portfolio.create(input)"
Router->>DB : "Insert Portfolio record"
DB-->>Router : "Portfolio created"
Router-->>Hooks : "Portfolio data"
Hooks-->>UI : "Update list via invalidation"
UI-->>User : "Show new portfolio in list"
```

**Diagram sources**
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts#L33-L48)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L29-L54)
- [prisma/schema.prisma](file://prisma/schema.prisma#L89-L113)

## Detailed Component Analysis

### Portfolio CRUD Operations
- Create: Validates title length and optional slug/theme; defaults to DRAFT status.
- List: Returns user-scoped portfolios ordered by creation time.
- Get by ID: Enforces ownership before returning a portfolio.
- Update: Allows partial updates to metadata, theme, and status.
- Delete: Removes a user’s portfolio.
- Publish: Sets status to PUBLISHED and marks published flag with timestamp.

```mermaid
flowchart TD
Start(["Create Portfolio"]) --> Validate["Validate input<br/>title, slug, theme"]
Validate --> Valid{"Valid?"}
Valid --> |No| Error["Return validation error"]
Valid --> |Yes| Insert["Insert Portfolio<br/>status=DRAFT, theme=default"]
Insert --> Return["Return created portfolio"]
Error --> End(["Exit"])
Return --> End
```

**Diagram sources**
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L29-L54)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts#L5-L36)

**Section sources**
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L6-L114)
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts#L10-L48)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L21-L27)

### Template Selection and Application
- Templates are stored with blocks and applied to a portfolio by transforming template blocks into portfolio sections.
- Ownership is verified before applying templates or saving blocks.

```mermaid
sequenceDiagram
participant User as "User"
participant BUI as "Builder UI"
participant BH as "Builder Hooks<br/>modules/builder/hooks.ts"
participant BR as "Builder Router<br/>server/routers/builder.ts"
participant DB as "Prisma Schema<br/>prisma/schema.prisma"
User->>BUI : "Select Template"
BUI->>BH : "useApplyTemplate()"
BH->>BR : "applyTemplate({portfolioId, templateId})"
BR->>DB : "Delete existing sections"
BR->>DB : "Create sections from template blocks"
DB-->>BR : "Sections saved"
BR-->>BH : "{success : true}"
BH-->>BUI : "Refresh blocks"
```

**Diagram sources**
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L96-L105)
- [server/routers/builder.ts](file://server/routers/builder.ts#L17-L68)
- [prisma/schema.prisma](file://prisma/schema.prisma#L115-L130)

**Section sources**
- [server/routers/builder.ts](file://server/routers/builder.ts#L7-L155)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L87-L105)
- [modules/builder/types.ts](file://modules/builder/types.ts#L39-L49)

### Content Organization and Blocks
- Sections represent blocks within a portfolio and are persisted as JSON content with ordering and visibility.
- The builder manages block state locally and syncs with the backend via save operations.

```mermaid
classDiagram
class Portfolio {
+string id
+string userId
+string title
+string slug
+string? description
+string theme
+string status
+string? customDomain
+string? seoTitle
+string? seoDescription
+string? favicon
+boolean published
+Date? publishedAt
+Date createdAt
+Date updatedAt
}
class PortfolioSection {
+string id
+string portfolioId
+string type
+string title
+Json content
+number order
+boolean visible
+Date createdAt
+Date updatedAt
}
Portfolio "1" --> "many" PortfolioSection : "has sections"
```

**Diagram sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L89-L130)

**Section sources**
- [modules/builder/types.ts](file://modules/builder/types.ts#L20-L27)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L11-L85)
- [server/routers/builder.ts](file://server/routers/builder.ts#L70-L155)

### Real-time Preview and Autosave
- The builder maintains a local state with a preview mode toggle and supports block reordering and updates.
- Autosave is achieved by persisting blocks to the backend after each change, ensuring recovery from browser refresh or session interruptions.

```mermaid
sequenceDiagram
participant User as "User"
participant BH as "Builder Hooks<br/>modules/builder/hooks.ts"
participant BR as "Builder Router<br/>server/routers/builder.ts"
participant DB as "Prisma Schema<br/>prisma/schema.prisma"
User->>BH : "Edit block content"
BH->>BH : "updateBlock(...)"
BH->>BR : "saveBlocks({portfolioId, blocks})"
BR->>DB : "Delete old sections"
BR->>DB : "Insert new sections"
DB-->>BR : "Saved"
BR-->>BH : "{success : true}"
BH-->>User : "Preview updated"
```

**Diagram sources**
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L107-L117)
- [server/routers/builder.ts](file://server/routers/builder.ts#L70-L119)
- [prisma/schema.prisma](file://prisma/schema.prisma#L115-L130)

**Section sources**
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L11-L85)
- [server/routers/builder.ts](file://server/routers/builder.ts#L70-L155)

### Metadata Management and Branding
- Portfolio metadata includes title, slug, description, theme, SEO fields, favicon, and custom domain.
- Utilities provide slug generation, validation, and URL construction for portfolio pages.
- Themes are enumerated and mapped to display-friendly values.

```mermaid
flowchart TD
A["User sets metadata"] --> B["Generate slug if missing"]
B --> C["Validate slug length and pattern"]
C --> D{"Valid?"}
D --> |No| E["Show validation error"]
D --> |Yes| F["Update portfolio with theme and SEO"]
F --> G["Build portfolio URL"]
G --> H["Display preview"]
```

**Diagram sources**
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L7-L19)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L42-L44)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts#L11-L17)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L29-L54)

**Section sources**
- [modules/portfolio/types.ts](file://modules/portfolio/types.ts#L19-L63)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L14-L27)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts#L11-L36)

### Publishing Workflow
- Publishing requires the portfolio to be in DRAFT status and have a non-empty title.
- On publish, status becomes PUBLISHED, published flag is set, and publishedAt timestamp is recorded.

```mermaid
flowchart TD
Start(["Publish Request"]) --> Check["Check canPublish()"]
Check --> Can{"Can publish?"}
Can --> |No| Deny["Deny publish"]
Can --> |Yes| Update["Set status=PUBLISHED<br/>published=true<br/>publishedAt=now()"]
Update --> Done(["Published"])
Deny --> End(["Exit"])
Done --> End
```

**Diagram sources**
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L25-L27)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L96-L113)

**Section sources**
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L21-L27)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L96-L113)

### Collaboration and Permissions
- All portfolio operations are protected and scoped to the authenticated user’s ID.
- Ownership verification occurs in both list/get and mutation endpoints to prevent cross-user access.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "tRPC Router<br/>server/routers/portfolio.ts"
participant DB as "Prisma Schema<br/>prisma/schema.prisma"
Client->>Router : "portfolio.update({id, ...})"
Router->>DB : "Find portfolio by id AND userId"
DB-->>Router : "Portfolio or none"
Router-->>Client : "Success or error"
```

**Diagram sources**
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L56-L80)
- [prisma/schema.prisma](file://prisma/schema.prisma#L89-L113)

**Section sources**
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L6-L13)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L15-L27)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L56-L80)

### Versioning, Autosave, and Recovery
- Versioning: The schema includes a dedicated analytics model; versioning is not explicitly modeled in the current schema.
- Autosave: Saving blocks persists sections immediately, enabling recovery after reloads.
- Recovery: Users can re-open a portfolio and continue editing; sections are fetched on load.

**Section sources**
- [server/routers/builder.ts](file://server/routers/builder.ts#L121-L155)
- [prisma/schema.prisma](file://prisma/schema.prisma#L132-L146)

### Form Validation and Error Handling
- Frontend validation: Slug pattern and length checks; title length limits; word count for content prompts.
- Backend validation: Zod schemas enforce input constraints and enum values.
- Error propagation: tRPC mutations surface errors to hooks; UI displays feedback.

```mermaid
flowchart TD
Input["User Input"] --> FE["Frontend Validation<br/>slug pattern/length, title length"]
FE --> BE["Backend Validation<br/>Zod schemas"]
BE --> OK{"Valid?"}
OK --> |No| Err["Return error to client"]
OK --> |Yes| Persist["Persist to DB"]
Persist --> Done["Success"]
```

**Diagram sources**
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L42-L44)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts#L32-L36)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L30-L38)
- [app/page.tsx](file://app/page.tsx#L8-L30)

**Section sources**
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L42-L44)
- [modules/portfolio/constants.ts](file://modules/portfolio/constants.ts#L32-L36)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L30-L38)
- [app/page.tsx](file://app/page.tsx#L8-L30)

## Dependency Analysis
- Portfolio hooks depend on tRPC provider and portfolio router.
- Builder hooks depend on builder router and Prisma schema for sections.
- AI hooks depend on AI router and Prisma schema for generation history.
- Authentication integrates with Better Auth and Prisma user model.

```mermaid
graph LR
PFHooks["Portfolio Hooks"] --> PRouter["Portfolio Router"]
BHooks["Builder Hooks"] --> BRouter["Builder Router"]
AIHooks["AI Hooks"] --> ARouter["AI Router"]
PRouter --> Schema["Prisma Schema"]
BRouter --> Schema
ARouter --> Schema
Auth["Better Auth"] --> Schema
```

**Diagram sources**
- [modules/portfolio/hooks.ts](file://modules/portfolio/hooks.ts#L7-L8)
- [modules/builder/hooks.ts](file://modules/builder/hooks.ts#L7-L9)
- [modules/ai/index.ts](file://modules/ai/index.ts#L10-L13)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L1-L4)
- [server/routers/builder.ts](file://server/routers/builder.ts#L1-L4)
- [server/routers/ai.ts](file://server/routers/ai.ts#L1-L4)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [prisma/schema.prisma](file://prisma/schema.prisma#L17-L36)

**Section sources**
- [lib/trpc-provider.tsx](file://lib/trpc-provider.tsx#L1-L50)
- [lib/auth.ts](file://lib/auth.ts#L1-L25)
- [prisma/schema.prisma](file://prisma/schema.prisma#L17-L36)

## Performance Considerations
- tRPC batching reduces network overhead.
- Query caching with short staleness improves responsiveness.
- Template application and block saves operate in bulk to minimize round-trips.
- Consider pagination for large portfolio lists and analytics.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Access Denied: Ensure the portfolio belongs to the authenticated user before updating or deleting.
- Slug Validation: Confirm slug matches allowed pattern and length range.
- Publishing Constraints: Verify portfolio is in DRAFT status and has a non-empty title.
- Template Application: Confirm template exists and portfolio ownership before applying.
- AI Generation: Check prompt validity and provider availability.

**Section sources**
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L15-L27)
- [server/routers/portfolio.ts](file://server/routers/portfolio.ts#L82-L94)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L42-L44)
- [modules/portfolio/utils.ts](file://modules/portfolio/utils.ts#L25-L27)
- [server/routers/builder.ts](file://server/routers/builder.ts#L17-L68)
- [server/routers/ai.ts](file://server/routers/ai.ts#L7-L31)

## Conclusion
SmartFolio provides a robust, type-safe workflow for creating and editing portfolios. The combination of tRPC, Prisma, and modular domains enables clear separation of concerns, strong validation, and scalable operations. Users benefit from templates, real-time previews, autosave, and publishing controls, while strict ownership checks ensure data integrity.