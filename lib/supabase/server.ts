import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations that require elevated privileges
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can throw an error when called from a Server Component
            // that is rendered on the client with a Suspense boundary.
            // https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `cookies().set()` method can throw an error when called from a Server Component
            // that is rendered on the client with a Suspense boundary.
            // https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
          }
        },
      },
    },
  )
}
