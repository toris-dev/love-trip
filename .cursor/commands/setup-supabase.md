# Setup Supabase Guide

Use this command to set up Supabase tables, RLS policies, and functions following project patterns.

## Table Creation

### Basic Table Structure

```sql
-- Create table
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_table_name_user_id ON public.table_name(user_id);
CREATE INDEX idx_table_name_created_at ON public.table_name(created_at DESC);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### Common Column Types

```sql
-- UUID (primary keys, foreign keys)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Text
title TEXT NOT NULL
description TEXT

-- Boolean
is_public BOOLEAN NOT NULL DEFAULT false
is_active BOOLEAN NOT NULL DEFAULT true

-- Timestamps
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at TIMESTAMPTZ

-- JSON
metadata JSONB
settings JSONB DEFAULT '{}'::jsonb

-- Arrays
tags TEXT[]
```

### Foreign Keys

```sql
-- Reference auth.users
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE

-- Reference other tables
travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE

-- Optional foreign key
couple_id UUID REFERENCES public.couples(id) ON DELETE SET NULL
```

## Row Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### SELECT Policy (Read)

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
ON public.table_name
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can read public data
CREATE POLICY "Public data is readable"
ON public.table_name
FOR SELECT
TO authenticated
USING (is_public = true);
```

### INSERT Policy (Create)

```sql
-- Users can create their own records
CREATE POLICY "Users can create own records"
ON public.table_name
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### UPDATE Policy

```sql
-- Users can update their own data
CREATE POLICY "Users can update own data"
ON public.table_name
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### DELETE Policy

```sql
-- Users can delete their own data
CREATE POLICY "Users can delete own data"
ON public.table_name
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Complex Policies

```sql
-- Users can read data they own or is public
CREATE POLICY "Users can read accessible data"
ON public.table_name
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR is_public = true
  OR EXISTS (
    SELECT 1 FROM public.couples
    WHERE id = table_name.couple_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);
```

## Indexes

### Common Indexes

```sql
-- User ID index (most common)
CREATE INDEX idx_table_name_user_id ON public.table_name(user_id);

-- Created at index (for sorting)
CREATE INDEX idx_table_name_created_at ON public.table_name(created_at DESC);

-- Composite index
CREATE INDEX idx_table_name_user_created ON public.table_name(user_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_table_name_unique_field ON public.table_name(unique_field);

-- Partial index
CREATE INDEX idx_table_name_active ON public.table_name(user_id) WHERE is_active = true;
```

## Functions

### Update Updated At Timestamp

```sql
-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_table_name_updated_at
BEFORE UPDATE ON public.table_name
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Custom Functions

```sql
-- Example: Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_plans BIGINT,
  total_courses BIGINT,
  total_expenses NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.travel_plans WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM public.user_courses WHERE user_id = p_user_id),
    (SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migrations

### Migration File Structure

```
supabase/migrations/
└── YYYYMMDDHHMMSS_create_table_name.sql
```

### Migration Template

```sql
-- Migration: Create table_name table
-- Created: 2024-01-01

-- Create table
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_table_name_user_id ON public.table_name(user_id);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
ON public.table_name
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own records"
ON public.table_name
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON public.table_name
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
ON public.table_name
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Type Generation

### Generate TypeScript Types

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id {project-id} > packages/shared/types/database.ts
```

### Update Types After Schema Changes

1. Make schema changes in Supabase dashboard or migrations
2. Run type generation command
3. Commit updated types file

## Testing RLS Policies

### Test with Different Users

```sql
-- Test as user 1
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-1-id';

-- Test query
SELECT * FROM public.table_name;

-- Test as user 2
SET LOCAL request.jwt.claim.sub = 'user-2-id';
SELECT * FROM public.table_name;
```

## Best Practices

1. **Always enable RLS** on user tables
2. **Create indexes** on frequently queried columns
3. **Use foreign keys** with appropriate ON DELETE actions
4. **Document policies** in migration files
5. **Test policies** with different user roles
6. **Use migrations** for all schema changes
7. **Generate types** after schema changes
8. **Review policies** during security audits
9. **Use SECURITY DEFINER** carefully for functions
10. **Keep migrations** in version control

## Checklist

- [ ] Table created with appropriate columns
- [ ] Foreign keys defined
- [ ] Indexes created for query performance
- [ ] RLS enabled
- [ ] SELECT policy created
- [ ] INSERT policy created
- [ ] UPDATE policy created
- [ ] DELETE policy created
- [ ] Updated_at trigger created (if needed)
- [ ] Types generated and updated
- [ ] Policies tested with different users
- [ ] Migration file created and committed
