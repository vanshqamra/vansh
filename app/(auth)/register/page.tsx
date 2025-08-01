"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/app/(auth)/actions"
import { useActionState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const initialState = {
  error: "",
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Registration Failed",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Register</CardTitle>
          <CardDescription>Create an account to access your dashboard and features.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline" prefetch={false}>
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
