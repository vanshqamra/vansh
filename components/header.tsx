import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./header-client"
import type { User } from "@supabase/supabase-js"

export async function Header() {
  let user: User | null = null

  try {
    // This will attempt to create a Supabase client.
    // If the environment variables are missing, it will throw an error
    // which is caught by the catch block below.
    const supabase = createClient()
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser()
    user = fetchedUser
  } catch (error) {
    // This block gracefully handles the case where Supabase credentials are not set.
    // The UI will render in a logged-out state without crashing the application.
    console.error("Could not fetch user. Supabase credentials might be missing.", error)
  }

  return <HeaderClient user={user} />
}
