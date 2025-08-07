"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-white to-blue-50">
      <ShieldAlert className="w-16 h-16 text-blue-600 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        You need administrative privileges to view this page.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default AccessDenied
