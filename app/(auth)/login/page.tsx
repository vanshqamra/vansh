"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 🔐 Sign in
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      return
    }

    // 🧠 Fetch updated session right after login
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      setError("Failed to retrieve session.")
      return
    }

    const userId = session.user.id

    // 🧾 Fetch user role from `profiles` table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      router.push("/dashboard")
    } else if (profile.role === "admin") {
      router.push("/admin/restock")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[url('/images/hero-background.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
      <Card className="relative w-full max-w-md p-6 shadow-xl bg-white/60 backdrop-blur-md border border-white/40">
        <CardHeader className="space-y-2 text-center">
          <Image src="/placeholder-logo.png" alt="Chemical Corporation" width={48} height={48} className="mx-auto" />
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Login to Chemical Corporation Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/70 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/70 backdrop-blur-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
