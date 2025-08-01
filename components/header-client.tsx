"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShoppingCart, Package, History, Upload, Settings, MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import SignOutButton from "@/components/sign-out-button"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"
import Image from "next/image"

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()
  const { state: cartState } = useCart()
  const { quoteItems } = useQuote()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user && user.user_metadata?.role === "admin") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user?.user_metadata?.role === "admin") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [supabase])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Offers", href: "/offers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const dashboardNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Package },
    { name: "Order History", href: "/dashboard/history", icon: History },
    { name: "Upload Quote", href: "/dashboard/upload", icon: Upload },
    { name: "Quote Cart", href: "/dashboard/quote-cart", icon: MessageCircle, count: quoteItems.length },
  ]

  const adminNavItems = [{ name: "Admin Panel", href: "/dashboard/admin", icon: Settings }]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold" prefetch={false}>
          <Image src="/generic-brand-logo.png" alt="Chemical Corp Logo" width={40} height={40} />
          <span className="sr-only">Chemical Corp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-gray-600"
              }`}
              prefetch={false}
            >
              {item.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/dashboard") ? "text-primary" : "text-gray-600"
                }`}
                prefetch={false}
              >
                Dashboard
              </Link>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartState.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartState.itemCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 p-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                    prefetch={false}
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Dashboard</h3>
                      {dashboardNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-primary ${
                            pathname.startsWith(item.href) ? "bg-gray-100 text-primary" : ""
                          }`}
                          onClick={() => setIsOpen(false)}
                          prefetch={false}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                          {item.count !== undefined && item.count > 0 && (
                            <span className="ml-auto bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {item.count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Admin</h3>
                        {adminNavItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-primary ${
                              pathname.startsWith(item.href) ? "bg-gray-100 text-primary" : ""
                            }`}
                            onClick={() => setIsOpen(false)}
                            prefetch={false}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="border-t pt-4 mt-4">
                      <SignOutButton />
                    </div>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
