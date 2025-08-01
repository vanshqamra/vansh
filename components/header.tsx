"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Search, ShoppingCart, User, ChevronDown, LogOut, LayoutDashboard } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { signOut } from "@/app/(auth)/actions"

export default function Header() {
  const { state } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products/search?query=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const brands = [
    { name: "Borosil", logo: "/images/logo-borosil.png" },
    { name: "Whatman", logo: "/images/logo-whatman.png" },
    { name: "Qualigens", logo: "/images/logo-qualigens.png" },
    { name: "Avarice", logo: "/images/logo-avarice.png" },
    { name: "Rankem", logo: "/images/logo-rankem.png" },
  ]

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between animate-pulse">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-gray-200 rounded hidden md:block"></div>
            <div className="h-8 w-24 bg-gray-200 rounded hidden md:block"></div>
            <div className="h-8 w-24 bg-gray-200 rounded hidden md:block"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/placeholder-rzoeb.png" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800 hidden md:block">Chemical Corp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
            Products
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition-colors">
                Brands <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {brands.map((brand) => (
                <DropdownMenuItem key={brand.name} asChild>
                  <Link href={`/brand/${brand.name.toLowerCase()}`} className="flex items-center gap-2">
                    {brand.logo && (
                      <Image src={brand.logo || "/placeholder.svg"} alt={`${brand.name} Logo`} width={20} height={20} />
                    )}
                    {brand.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/offers" className="text-gray-600 hover:text-blue-600 transition-colors">
            Offers
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Search, Cart, and Auth */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-48"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {state.itemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 py-6">
                <form onSubmit={handleSearch} className="relative w-full mb-4">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
                <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Products
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 transition-colors justify-start pl-0"
                    >
                      Brands <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {brands.map((brand) => (
                      <DropdownMenuItem key={brand.name} asChild>
                        <Link href={`/brand/${brand.name.toLowerCase()}`} className="flex items-center gap-2">
                          {brand.logo && (
                            <Image
                              src={brand.logo || "/placeholder.svg"}
                              alt={`${brand.name} Logo`}
                              width={20}
                              height={20}
                            />
                          )}
                          {brand.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/offers" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Offers
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Dashboard
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 justify-start pl-0"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600 justify-start pl-0">
                      Sign In
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
