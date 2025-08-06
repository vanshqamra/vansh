"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  TestTube,
  Microscope,
  FlaskConical,
} from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function Header() {
  const { user, signOut } = useAuth()
  const { state } = useCart()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = mounted ? state?.itemCount || 0 : 0

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (data?.role === "admin") {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [supabase])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Chemical Corporation
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Home
            </Link>

            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors">
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-[100]">
                <DropdownMenuItem asChild>
                  <Link href="/products/bulk-chemicals" className="flex items-center">
                    <TestTube className="mr-2 h-4 w-4" />
                    Bulk Chemicals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/laboratory-supplies" className="flex items-center">
                    <Microscope className="mr-2 h-4 w-4" />
                    Laboratory Supplies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/scientific-instruments" className="flex items-center">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Scientific Instruments
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Brands Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors">
                Brands <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-[100]">
                <DropdownMenuItem asChild>
                  <Link href="/brand/borosil" className="flex items-center">
                    <Image src="/images/logo-borosil.png" alt="Borosil" width={20} height={20} className="mr-2" />
                    Borosil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brand/whatman" className="flex items-center">
                    <Image src="/images/logo-whatman.png" alt="Whatman" width={20} height={20} className="mr-2" />
                    Whatman
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brand/qualigens" className="flex items-center">
                    <Image src="/images/logo-qualigens.png" alt="Qualigens" width={20} height={20} className="mr-2" />
                    Qualigens
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brand/avarice" className="flex items-center">
                    <Image src="/images/logo-avarice.png" alt="Avarice" width={20} height={20} className="mr-2" />
                    Avarice
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brand/rankem" className="flex items-center">
                    <Image src="/images/logo-rankem.png" alt="Rankem" width={20} height={20} className="mr-2" />
                    Rankem
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brand/HiMedia" className="flex items-center">
                    <Image src="/images/logo-himedia.png" alt="HiMedia" width={20} height={20} className="mr-2" />
                    HiMedia
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/products/laboratory-supplies" className="text-blue-600 font-medium">
                    All Laboratory Supplies →
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Contact
            </Link>

            {/* 🧾 Admin Links */}
            {isAdmin && (
              <>
                <Link
                  href="/admin/restock"
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  🧾 Restock Dashboard
                </Link>
                <Link
                  href="/admin/quotation"
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  📄 Quotation Builder
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search Input */}
            <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 text-sm"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{user.email?.split("@")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[100]" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/quote-cart" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 z-[70]">
                {/* TODO: Add mobile version of admin links here if needed */}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
