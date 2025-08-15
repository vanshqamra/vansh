"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signup } from "@/app/(auth)/actions"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [state, formAction] = useActionState(signup, undefined)

  return (
    <div className="container mx-auto flex items-center justify-center py-16">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Client Registration</CardTitle>
          <CardDescription>
            Submit your details for approval to access the client portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.success ? (
            <div className="text-center p-4 bg-green-100 border border-green-200 rounded-md">
              <p className="font-semibold text-green-800">Registration Successful!</p>
              <p className="text-green-700">{state.success}</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can close this tab. An admin will review and approve your account.
              </p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="client@company.com" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" name="company" placeholder="ABC Chemicals Pvt. Ltd." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="gstin">GST No.</Label>
                  <Input id="gstin" name="gstin" placeholder="22AAAAA0000A1Z5" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Full Address (optional)</Label>
                <Input id="address" name="address" placeholder="123 Industrial Area, City" />
              </div>

              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
              <SubmitButton />

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </Button>
  )
}
