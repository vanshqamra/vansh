"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createSupabaseBrowserClient(), []) // create once

  // where to go after login (defaults to /dashboard)
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError("")
    setLoading(true)

    try {
      // 1) Sign in
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) throw loginError

      // 2) Ensure a fresh session (helps after coming from 404 / error routes)
      await supabase.auth.refreshSession()

      // 3) Pull session and user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.user) throw new Error("Failed to retrieve session.")

      const userId = session.user.id

      // 4) Get role (optional, but you had it)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      // 5) Decide destination
      const destination =
        redirectTo ||
        (profile && profile.role === "admin" ? "/dashboard/admin" : "/dashboard")

      // 6) Replace (not push) + refresh to sync RSC + client
      router.replace(destination)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
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
                autoComplete="email"
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
                autoComplete="current-password"
                className="bg-white/70 backdrop-blur-sm"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
