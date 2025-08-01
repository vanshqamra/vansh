"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isVendor: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      if (session?.user) {
        setIsAdmin(session.user.user_metadata?.role === "admin")
        setIsVendor(session.user.user_metadata?.role === "vendor")
      } else {
        setIsAdmin(false)
        setIsVendor(false)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        setIsAdmin(session.user.user_metadata?.role === "admin")
        setIsVendor(session.user.user_metadata?.role === "vendor")
      } else {
        setIsAdmin(false)
        setIsVendor(false)
      }
      setLoading(false)
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [supabase])

  return <AuthContext.Provider value={{ user, loading, isAdmin, isVendor }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
