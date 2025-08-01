"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Search, Menu, User, History, Upload, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/sign-out-button"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, loading } = useAuth()
  const { getCartTotalItems } = useCart()
  const { getQuoteTotalItems } = useQuote()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const totalCartItems = getCartTotalItems()
  const totalQuoteItems = getQuoteTotalItems()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/generic-brand-logo.png" alt="Chemical Corp Logo" width={40} height={40} className="h-8 w-auto" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50">Chemical Corp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Products
          </Link>
          <Link
            href="/offers"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Offers
          </Link>
          <Link
            href="/brands"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Brands
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-48 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="sr-only">Search</span>
            </Button>
          </form>

          {/* Cart Button */}
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {totalCartItems}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          {/* Quote Cart Button */}
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/dashboard/quote-cart">
              <Quote className="h-5 w-5" />
              {totalQuoteItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                  {totalQuoteItems}
                </span>
              )}
              <span className="sr-only">Quote Cart</span>
            </Link>
          </Button>

          {/* User Dropdown / Login Button */}
          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <History className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/history">
                      <History className="mr-2 h-4 w-4" />
                      Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Quote
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
            ))}

          {/* Mobile Navigation Toggle */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Image
                    src="/generic-brand-logo.png"
                    alt="Chemical Corp Logo"
                    width={40}
                    height={40}
                    className="h-8 w-auto"
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">Chemical Corp</span>
                </Link>
                <form onSubmit={handleSearch} className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Search</span>
                  </Button>
                </form>
                <Link
                  href="/products"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Products
                </Link>
                <Link
                  href="/offers"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Offers
                </Link>
                <Link
                  href="/brands"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Brands
                </Link>
                <Link
                  href="/about"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Contact
                </Link>
                <div className="mt-4 border-t pt-4">
                  {!loading &&
                    (user ? (
                      <>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Logged in as: {user.email}
                        </p>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 py-2"
                        >
                          <History className="h-5 w-5" /> Dashboard
                        </Link>
                        <Link
                          href="/dashboard/history"
                          className="flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 py-2"
                        >
                          <History className="h-5 w-5" /> Order History
                        </Link>
                        <Link
                          href="/dashboard/upload"
                          className="flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 py-2"
                        >
                          <Upload className="h-5 w-5" /> Upload Quote
                        </Link>
                        <div className="mt-4">
                          <SignOutButton />
                        </div>
                      </>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                    ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
