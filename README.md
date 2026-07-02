# youni

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **HeroUI** - Shared Web and Native component styling
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **Cloudflare D1** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses Cloudflare D1 with Drizzle ORM.

1. Configure Cloudflare credentials in `packages/infra/.env`.
2. Generate D1 migrations when the schema changes:

```bash
bun run db:generate
```

3. Run Alchemy dev or deploy to create the D1 database and apply migrations.
4. Seed demo data after `CLOUDFLARE_D1_DATABASE_ID` and a D1 token are configured:

```bash
bun run db:seed
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack use HeroUI and HeroUI Pro styles through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Use `@heroui/react` and `@heroui-pro/react` in `apps/web`
- Use `heroui-native` and `heroui-native-pro` in `apps/native`

## Deployment (Cloudflare via Alchemy)

- Target: web + server
- Dev: bun run dev
- Deploy: bun run deploy
- Destroy: bun run destroy

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
youni/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── native/      # Mobile application (React Native, Expo)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── ui/          # Shared HeroUI styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start the Cloudflare web/server stack and native app in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start the Cloudflare web/server stack
- `bun run check-types`: Check TypeScript types across all apps
- `bun run dev:native`: Start the React Native/Expo development server
- `bun run db:push`: Push schema changes to D1 over Cloudflare HTTP
- `bun run db:generate`: Generate D1 migration files
- `bun run db:migrate`: Run D1 migrations over Cloudflare HTTP
- `bun run db:studio`: Open database studio UI
- `bun run check`: Run Biome formatting and linting
