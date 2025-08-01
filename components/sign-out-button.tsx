"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/(auth)/actions"

export function SignOutButton() {
  return (
    <form action={signOut} className="w-full">
      <Button type="submit" variant="ghost" className="w-full justify-start">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  )
}
