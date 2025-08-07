import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and/or Anon Key are missing from environment variables.")
  }

  // Create a supabase client on the browser with project's credentials
  // and ensure the session is persisted across refreshes.
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}
