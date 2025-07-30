"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, User } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"

export default function HeaderClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { getTotalItems, isLoaded: cartLoaded } = useCart()
  const { items: quoteItems, isLoaded: quoteLoaded } = useQuote()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const totalCartItems = mounted && cartLoaded ? getTotalItems() : 0
  const totalQuoteItems = mounted && quoteLoaded ? quoteItems.length : 0

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Chemical Corporation
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
            <Link href="/offers" className="text-gray-700 hover:text-blue-600 transition-colors">
              Offers
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                disabled={!mounted}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Cart and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Quote Cart */}
            <Link href="/dashboard/quote-cart" className="relative">
              <Button variant="ghost" size="icon" disabled={!mounted || !quoteLoaded}>
                <User className="h-5 w-5" />
                {mounted && quoteLoaded && totalQuoteItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalQuoteItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Shopping Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" disabled={!mounted || !cartLoaded}>
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartLoaded && totalCartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalCartItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={!mounted}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                    Products
                  </Link>
                  <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                    Contact
                  </Link>
                  <Link href="/offers" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                    Offers
                  </Link>
                  <Link
                    href="/dashboard/quote-cart"
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  >
                    Quote Cart ({mounted && quoteLoaded ? totalQuoteItems : 0})
                  </Link>
                  <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                    Shopping Cart ({mounted && cartLoaded ? totalCartItems : 0})
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
