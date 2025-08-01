"use client"

import type React from "react"

import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input, Button } from "@/components/ui"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  ShoppingCart,
  FlaskConical,
  Tag,
  Info,
  Phone,
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Search,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"
import { createClient } from "@/lib/supabase/client"

export function HeaderClient() {
  const pathname = usePathname()
  const { totalItems: cartTotalItems } = useCart()
  const { quoteItems } = useQuote()
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: FlaskConical },
    { href: "/offers", label: "Offers", icon: Tag },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: Phone },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-950 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <FlaskConical className="h-6 w-6 text-primary" />
          <span className="sr-only">Chemical Corp</span>
          <span className="hidden sm:inline text-gray-900 dark:text-gray-50">Chemical Corp</span>
        </Link>
        <form onSubmit={handleSearch} className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {cartTotalItems}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </Link>
          <Link href="/dashboard/quote-cart">
            <Button variant="ghost" size="icon" className="relative">
              <Tag className="h-5 w-5" /> {/* Using Tag icon for quote cart */}
              {quoteItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {quoteItems.length}
                </span>
              )}
              <span className="sr-only">Quote Cart</span>
            </Button>
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <LogIn className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-5 w-5" />
                  <span className="sr-only">Register</span>
                </Button>
              </Link>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-80">
              <div className="flex flex-col gap-4 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      pathname === link.href
                        ? "bg-gray-100 text-primary dark:bg-gray-800"
                        : "text-gray-900 dark:text-gray-50"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      pathname === "/dashboard"
                        ? "bg-gray-100 text-primary dark:bg-gray-800"
                        : "text-gray-900 dark:text-gray-50"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        pathname === "/login"
                          ? "bg-gray-100 text-primary dark:bg-gray-800"
                          : "text-gray-900 dark:text-gray-50"
                      }`}
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        pathname === "/register"
                          ? "bg-gray-100 text-primary dark:bg-gray-800"
                          : "text-gray-900 dark:text-gray-50"
                      }`}
                    >
                      <UserPlus className="h-5 w-5" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
