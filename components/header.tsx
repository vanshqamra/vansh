"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCart } from "@/app/context/CartContext"
import { Menu, ShoppingCart, ChevronDown, Search, User } from "lucide-react"

const brands = [
  { name: "Borosil", href: "/brand/borosil" },
  { name: "Whatman", href: "/brand/whatman" },
  { name: "Qualigens", href: "/brand/qualigens" },
  { name: "Avarice", href: "/brand/avarice" },
  { name: "Rankem", href: "/brand/rankem" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { state } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ChemCorp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Products
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                Brands
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {brands.map((brand) => (
                  <DropdownMenuItem key={brand.name} asChild>
                    <Link href={brand.href}>{brand.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/products/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                {state.itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {state.itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/dashboard">
                <User className="h-4 w-4" />
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    Home
                  </Link>
                  <Link href="/products" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    Products
                  </Link>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Brands</p>
                    <div className="pl-4 space-y-2">
                      {brands.map((brand) => (
                        <Link
                          key={brand.name}
                          href={brand.href}
                          className="block text-gray-600 hover:text-blue-600"
                          onClick={() => setIsOpen(false)}
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link href="/about" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    About
                  </Link>
                  <Link href="/contact" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                  <Link href="/dashboard" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    Dashboard
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
