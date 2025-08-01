"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Search, ShoppingCart, User, Menu, X } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { SignOutButton } from "./sign-out-button"
import { useRouter } from "next/navigation"

const brands = [
  { name: "Borosil", slug: "borosil", logo: "/images/logo-borosil.png" },
  { name: "Whatman", slug: "whatman", logo: "/images/logo-whatman.png" },
  { name: "Qualigens", slug: "qualigens", logo: "/images/logo-qualigens.png" },
  { name: "Avarice", slug: "avarice", logo: "/images/logo-avarice.png" },
  { name: "Rankem", slug: "rankem", logo: "/images/logo-rankem.png" },
]

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { state } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-xl text-slate-900">ChemCorp</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-blue-600 p-6 no-underline outline-none focus:shadow-md"
                          href="/products"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">All Products</div>
                          <p className="text-sm leading-tight text-blue-100">
                            Browse our complete catalog of laboratory supplies and chemicals.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/bulk-chemicals"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100"
                      >
                        <div className="text-sm font-medium leading-none">Bulk Chemicals</div>
                        <p className="line-clamp-2 text-sm leading-snug text-slate-600">
                          Industrial grade chemicals in bulk quantities.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/laboratory-supplies"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100"
                      >
                        <div className="text-sm font-medium leading-none">Laboratory Supplies</div>
                        <p className="line-clamp-2 text-sm leading-snug text-slate-600">
                          Essential lab equipment and consumables.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/scientific-instruments"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100"
                      >
                        <div className="text-sm font-medium leading-none">Scientific Instruments</div>
                        <p className="line-clamp-2 text-sm leading-snug text-slate-600">
                          Precision instruments for research and analysis.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Brands</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[600px] grid-cols-2">
                    {brands.map((brand) => (
                      <NavigationMenuLink key={brand.slug} asChild>
                        <Link
                          href={`/brand/${brand.slug}`}
                          className="flex items-center space-x-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100"
                        >
                          <Image
                            src={brand.logo || "/placeholder.svg"}
                            alt={`${brand.name} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                          <div>
                            <div className="text-sm font-medium leading-none">{brand.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-600">
                              Premium laboratory products
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/about"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  About
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/contact"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-sm mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/history">Order History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 px-4">
                <Link href="/products" className="block py-2 text-sm font-medium">
                  Products
                </Link>
                <div className="pl-4 space-y-1">
                  <Link href="/products/bulk-chemicals" className="block py-1 text-sm text-slate-600">
                    Bulk Chemicals
                  </Link>
                  <Link href="/products/laboratory-supplies" className="block py-1 text-sm text-slate-600">
                    Laboratory Supplies
                  </Link>
                  <Link href="/products/scientific-instruments" className="block py-1 text-sm text-slate-600">
                    Scientific Instruments
                  </Link>
                </div>

                <div className="py-2">
                  <div className="text-sm font-medium mb-2">Brands</div>
                  <div className="pl-4 space-y-1">
                    {brands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="flex items-center space-x-2 py-1 text-sm text-slate-600"
                      >
                        <Image
                          src={brand.logo || "/placeholder.svg"}
                          alt={`${brand.name} logo`}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                        <span>{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/about" className="block py-2 text-sm font-medium">
                  About
                </Link>
                <Link href="/contact" className="block py-2 text-sm font-medium">
                  Contact
                </Link>

                {!user && (
                  <div className="flex space-x-2 pt-4">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="flex-1">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="flex-1">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
