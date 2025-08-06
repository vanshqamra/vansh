"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_role")
    }
    return null
  })
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user || null
        setUser(user)

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

          if (!error && data?.role) {
            setRole(data.role)
            localStorage.setItem("user_role", data.role)
          }
        }
      } catch (error) {
        console.error("Error getting session or role:", error)
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null
      setUser(user)
      setLoading(false)

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!error && data?.role) {
          setRole(data.role)
          localStorage.setItem("user_role", data.role)
        } else {
          setRole(null)
          localStorage.removeItem("user_role")
        }
      } else {
        setRole(null)
        localStorage.removeItem("user_role")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setRole(null)
      localStorage.removeItem("user_role")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, role, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
