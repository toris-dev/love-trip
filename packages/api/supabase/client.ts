import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    console.error(
      `[Supabase] Missing environment variables: ${missing.join(", ")}\n` +
        "Please set these in your .env.local file in apps/web/.env.local"
    )

    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}. ` +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local"
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
