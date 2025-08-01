"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Search, ShoppingCart, User, ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, signOut } = useAuth()
  const { state: cartState } = useCart()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get("searchQuery") as string
    if (query) {
      router.push(`/products/search?query=${encodeURIComponent(query)}`)
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

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/placeholder.svg?height=40&width=40" alt="Chemical Corp Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-900">Chemical Corp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
            Products
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
              Brands <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {brands.map((brand) => (
                <DropdownMenuItem key={brand.name} asChild>
                  <Link href={`/brand/${brand.name.toLowerCase()}`} className="flex items-center">
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={`${brand.name} Logo`}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    {brand.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/offers" className="text-gray-600 hover:text-gray-900 font-medium">
            Offers
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 rounded-full border focus:border-blue-500 focus:ring-blue-500"
              name="searchQuery"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </Link>
          )}

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-6">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 rounded-full border focus:border-blue-500 focus:ring-blue-500"
                    name="searchQuery"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </form>
                <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium">
                  Products
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between text-gray-700 hover:text-gray-900 font-medium w-full">
                    Brands <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {brands.map((brand) => (
                      <DropdownMenuItem key={brand.name} asChild>
                        <Link href={`/brand/${brand.name.toLowerCase()}`} className="flex items-center">
                          <Image
                            src={brand.logo || "/placeholder.svg"}
                            alt={`${brand.name} Logo`}
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                          {brand.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/offers" className="text-gray-700 hover:text-gray-900 font-medium">
                  Offers
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">
                  About Us
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">
                  Contact
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
                      Dashboard
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="justify-start pl-0">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                    Login
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
