# Code Review Guide

Use this command to review code for quality, best practices, and potential issues.

## Review Checklist

### Type Safety

- [ ] All types are explicitly defined
- [ ] No `any` types (or properly justified)
- [ ] Database types are used from @lovetrip/shared/types/database
- [ ] Function return types are specified
- [ ] Props interfaces are defined

### Architecture Compliance

- [ ] Follows Feature-Sliced Design structure
- [ ] Components are in correct directories (features/, layout/, shared/)
- [ ] Services are in packages/\*/services
- [ ] No circular dependencies
- [ ] Proper layer separation (Presentation → Domain → Data)

### Code Style

- [ ] Follows Prettier configuration (no semicolons, double quotes, 2-space tabs)
- [ ] File naming follows conventions (PascalCase for components, kebab-case for others)
- [ ] Consistent code formatting
- [ ] No commented-out code

### React/Next.js Best Practices

- [ ] "use client" only when necessary
- [ ] Server Components used by default
- [ ] Hooks called at top level only
- [ ] Proper error handling
- [ ] Loading states handled
- [ ] Images use next/image

### Performance

- [ ] No unnecessary re-renders
- [ ] Memoization used appropriately (React.memo, useMemo, useCallback)
- [ ] Code splitting for large components
- [ ] Efficient data fetching

### Security

- [ ] User input is validated
- [ ] Authentication checks in API routes
- [ ] No sensitive data in client code
- [ ] Proper error messages (don't expose internals)

### Testing

- [ ] Service functions have tests
- [ ] Complex logic is tested
- [ ] Test files follow naming convention (_.test.ts, _.test.tsx)

### Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation supported
- [ ] Color contrast meets WCAG AA

### Error Handling

- [ ] Try-catch blocks for async operations
- [ ] User-friendly error messages (in Korean)
- [ ] Proper HTTP status codes in API routes
- [ ] Error boundaries for React components

## Common Issues to Check

1. **Type Safety**: Look for `any` types, missing type definitions
2. **Performance**: Unnecessary re-renders, missing memoization
3. **Security**: Missing auth checks, exposed sensitive data
4. **Architecture**: Wrong file location, circular dependencies
5. **Code Quality**: Duplicated code, magic numbers, unclear variable names

## Review Process

1. Check type safety and TypeScript usage
2. Verify architecture compliance
3. Review code style and formatting
4. Check React/Next.js best practices
5. Assess performance considerations
6. Verify security measures
7. Check test coverage
8. Review accessibility
