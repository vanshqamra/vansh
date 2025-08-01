"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push("/login")
    } else {
      console.error("Error signing out:", error.message)
    }
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
