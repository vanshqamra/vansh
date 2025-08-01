"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Upload,
  History,
  FlaskRoundIcon as Flask,
  ChevronDown,
} from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"

export function Header() {
  const { totalItems } = useCart()
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <div className="animate-pulse flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Flask className="h-8 w-8 text-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Chemical Corporation
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link href="/" className="transition-colors hover:text-blue-600 text-foreground/60 hover:text-foreground/80">
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-1 transition-colors hover:text-blue-600 text-foreground/60 hover:text-foreground/80">
              <span>Products</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[100]">
              <DropdownMenuItem asChild>
                <Link href="/products/bulk-chemicals">Bulk Chemicals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products/laboratory-supplies">Laboratory Supplies</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products/scientific-instruments">Scientific Instruments</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/products/qualigens">Qualigens Products</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products">All Products</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-1 transition-colors hover:text-blue-600 text-foreground/60 hover:text-foreground/80">
              <span>Brands</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[100]">
              <DropdownMenuItem asChild>
                <Link href="/brand/qualigens">Qualigens</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/brand/fisher-scientific">Fisher Scientific</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/brand/thermo-scientific">Thermo Scientific</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="transition-colors hover:text-blue-600 text-foreground/60 hover:text-foreground/80"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-blue-600 text-foreground/60 hover:text-foreground/80"
          >
            Contact
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = (e.target as HTMLInputElement).value
                  if (query.trim()) {
                    router.push(`/products/search?q=${encodeURIComponent(query)}`)
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User Menu */}
          {loading ? (
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-[100]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/quote-cart" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Quote Cart
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/upload" className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Quote
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    Order History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
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

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[60]">
              <div className="flex flex-col space-y-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const query = (e.target as HTMLInputElement).value
                        if (query.trim()) {
                          router.push(`/products/search?q=${encodeURIComponent(query)}`)
                        }
                      }
                    }}
                  />
                </div>

                <nav className="flex flex-col space-y-2">
                  <Link href="/" className="text-lg font-medium">
                    Home
                  </Link>
                  <Link href="/products" className="text-lg font-medium">
                    Products
                  </Link>
                  <Link href="/about" className="text-lg font-medium">
                    About
                  </Link>
                  <Link href="/contact" className="text-lg font-medium">
                    Contact
                  </Link>

                  {user && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <Link href="/dashboard" className="text-lg font-medium flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </div>
                      <Link href="/dashboard/quote-cart" className="text-lg font-medium flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Quote Cart
                      </Link>
                      <Link href="/dashboard/upload" className="text-lg font-medium flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Quote
                      </Link>
                      <Link href="/dashboard/history" className="text-lg font-medium flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Order History
                      </Link>
                      <Button onClick={handleSignOut} variant="ghost" className="justify-start p-0 text-lg font-medium">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  )}

                  {!user && !loading && (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button size="sm" asChild className="w-full">
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
