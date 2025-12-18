/**
 * Mock for @supabase/ssr in tests
 */

import { vi } from "vitest"

export const createBrowserClient = vi.fn(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: [],
      error: null,
    })),
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: null },
    })),
  },
}))

export const createServerClient = vi.fn(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: [],
      error: null,
    })),
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: null },
    })),
  },
}))
