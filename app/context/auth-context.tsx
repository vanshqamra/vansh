"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  role: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("user_role") : null
  )

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single()

          if (!error && data?.role) {
            setRole(data.role)
            localStorage.setItem("user_role", data.role)
          }
        }
      } catch (err) {
        console.error("Error getting session or role:", err)
        setUser(null)
        setRole(null)
        localStorage.removeItem("user_role")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data?.role) {
              setRole(data.role)
              localStorage.setItem("user_role", data.role)
            } else {
              setRole(null)
              localStorage.removeItem("user_role")
            }
          })
      } else {
        setRole(null)
        localStorage.removeItem("user_role")
      }

      // ⚠️ Don’t always refresh here — let components react naturally.
      // Optional: debounce refresh to avoid 404-loop issues
      setTimeout(() => router.refresh(), 50)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setRole(null)
      localStorage.removeItem("user_role")

      // 🔑 force navigation out of restricted pages
      router.replace("/login")
      router.refresh()
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
