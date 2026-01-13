# LOVETRIP Project Base Rules

## Project Overview

LOVETRIP is a couple travel recommendation service built with Next.js full-stack application.

- Monorepo structure (pnpm workspace)
- Next.js 15.2.4 + TypeScript
- Supabase backend
- Naver Maps API

## Coding Style

### Prettier Configuration

- No semicolons (semi: false)
- Use double quotes instead of single quotes (singleQuote: false)
- Tab width: 2 spaces (tabWidth: 2)
- Line length: 100 characters (printWidth: 100)
- Arrow function parentheses: avoid for single parameter (arrowParens: "avoid")
- Line endings: LF (endOfLine: "lf")

### File Naming Conventions

- Component files: PascalCase (e.g., HomePageClient.tsx)
- Regular files: kebab-case (e.g., travel-service.ts)
- Hook files: camelCase with "use" prefix (e.g., use-travel-courses.ts)
- Type files: kebab-case (e.g., types.ts, database.ts)

### Code Writing Principles

- All responses should be in Korean
- Use clear and concise variable names
- Functions should follow single responsibility principle
- Comments explain "why", code explains "what"
- Avoid magic numbers/strings, define as constants

### Commit Messages

- Write in Korean
- Provide clear descriptions
- Format: "type: brief description" (e.g., "feat: add travel plan creation feature")

## Project Structure

### Monorepo Packages

- apps/web: Next.js web application
- packages/ui: UI component library
- packages/api: Supabase client
- packages/shared: Common types and utilities
- packages/\*: Domain-specific packages (user, couple, planner, expense, etc.)

### Architecture

- Feature-Sliced Design (FSD) structure
- Domain-Driven Design (DDD)
- Layer separation: Presentation → Domain → Data

## General Rules

1. Type safety first: Explicitly define TypeScript types
2. Error handling: Include error handling for all async operations
3. Accessibility: Follow web accessibility guidelines
4. Performance: Prevent unnecessary re-renders, utilize code splitting
5. Security: Validate user input, prevent SQL injection (automatically handled by Supabase)

## Related Rules

For detailed guidelines, refer to:
- `architecture.txt` - Feature-Sliced Design and Domain-Driven Design patterns
- `monorepo.txt` - Monorepo structure and package management
- `react-nextjs.txt` - React and Next.js best practices
- `typescript.txt` - TypeScript type safety and patterns
- `styling.txt` - Tailwind CSS and component styling
- `testing.txt` - Testing strategies and patterns
- `supabase.txt` - Supabase client usage and RLS policies
- `error-handling.txt` - Error handling patterns and best practices
- `security.txt` - Security guidelines and authentication patterns

For workflow guides, see `.cursor/commands/`:
- `commit-convention.md` - Git commit message conventions
- `pr-guidelines.md` - Pull request guidelines and templates
