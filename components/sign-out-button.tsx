import { signOut } from "@/app/(auth)/actions"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="destructive" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  )
}
