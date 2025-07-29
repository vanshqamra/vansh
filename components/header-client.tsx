"use client"

import Link from "next/link"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { FlaskConical, Menu, Search, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuote } from "@/context/quote-context"
import { SignOutButton } from "./sign-out-button"

interface HeaderClientProps {
  user: User | null
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useQuote()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Chemical Corporation</span>
        </Link>

        <div className="hidden lg:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Input placeholder="Search by name, code, or brand..." className="pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/quote-cart" className="relative p-2">
            <ShoppingCart className="h-6 w-6 text-slate-600 hover:text-blue-600" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <SignOutButton />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
          <button className="ml-2 p-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Logic */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg">
          <nav className="container mx-auto flex flex-col items-center gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-slate-700 transition-colors hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col items-center gap-4 w-full">
              {user ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
