"use client"

import { login } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined)

  return (
    <div className="container mx-auto flex items-center justify-center py-16">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Client Login</CardTitle>
          <CardDescription>Access your dashboard to manage quotes and orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="client@company.com" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
            <SubmitButton />
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  )
}
