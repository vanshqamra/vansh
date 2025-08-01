import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Create a single supabase client for the client-side for better performance and to avoid multiple instances
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
