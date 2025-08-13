"use client"

import { useEffect, useState } from "react"
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
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
  ClipboardList,
  FileText,
  History,
} from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/app/context/search-context"

export function Header() {
  const { user, role, signOut } = useAuth()
  const { state } = useCart()
  const { searchQuery, setSearchQuery } = useSearch()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = mounted ? state?.itemCount || 0 : 0
  const dashboardHref = role === "admin" ? "/dashboard/admin" : "/dashboard"

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Top bar — compact on mobile, normal on md+ */}
        <div className="flex h-12 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 md:h-3 md:w-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
            </div>
            <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-none">
              Chemical Corporation
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
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
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Search Input */}
            <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full p-0 flex items-center justify-center text-[10px] bg-blue-600">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{user.email?.split("@")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[100]" align="end">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref} prefetch={false} className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {/* Hide My Orders for admins */}
                  {role !== "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/history" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/restock" className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Restock Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/quotation" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Quotation Builder
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/past-quotations" className="flex items-center">
                          <History className="mr-2 h-4 w-4" />
                          Past Quotations
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button + Sidebar */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 z-[70]">
                {/* Mobile search */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (searchQuery.trim()) {
                      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
                    }
                  }}
                  className="mt-2 flex items-center gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Mobile nav links */}
                <nav className="mt-4 grid gap-1">
                  <SheetClose asChild>
                    <Link href="/" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
                      Home
                    </Link>
                  </SheetClose>

                  <div className="px-3 pt-3 text-xs font-semibold uppercase text-gray-500">Products</div>
                  <SheetClose asChild>
                    <Link href="/products/bulk-chemicals" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <TestTube className="h-4 w-4" /> Bulk Chemicals
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/products/laboratory-supplies" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Microscope className="h-4 w-4" /> Laboratory Supplies
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/products/scientific-instruments" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" /> Scientific Instruments
                    </Link>
                  </SheetClose>

                  <div className="px-3 pt-3 text-xs font-semibold uppercase text-gray-500">Brands</div>
                  <SheetClose asChild>
                    <Link href="/brand/borosil" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-borosil.png" alt="Borosil" width={18} height={18} /> Borosil
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/brand/whatman" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-whatman.png" alt="Whatman" width={18} height={18} /> Whatman
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/brand/qualigens" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-qualigens.png" alt="Qualigens" width={18} height={18} /> Qualigens
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/brand/avarice" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-avarice.png" alt="Avarice" width={18} height={18} /> Avarice
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/brand/rankem" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-rankem.png" alt="Rankem" width={18} height={18} /> Rankem
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/brand/HiMedia" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Image src="/images/logo-himedia.png" alt="HiMedia" width={18} height={18} /> HiMedia
                    </Link>
                  </SheetClose>

                  <div className="px-3 pt-3 text-xs font-semibold uppercase text-gray-500">Company</div>
                  <SheetClose asChild>
                    <Link href="/about" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
                      About
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/contact" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
                      Contact
                    </Link>
                  </SheetClose>

                  <div className="px-3 pt-3 text-xs font-semibold uppercase text-gray-500">Account</div>
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href={dashboardHref} prefetch={false} className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                      </SheetClose>

                      {/* Hide My Orders for admins */}
                      {role !== "admin" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/quote-cart" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                            <Package className="h-4 w-4" /> My Orders
                          </Link>
                        </SheetClose>
                      )}

                      {role === "admin" && (
                        <>
                          <div className="px-3 pt-3 text-xs font-semibold uppercase text-gray-500">Admin</div>
                          <SheetClose asChild>
                            <Link href="/admin/restock" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                              <ClipboardList className="h-4 w-4" /> Restock Dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/admin/quotation" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Quotation Builder
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/admin/past-quotations" className="rounded px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                              <History className="h-4 w-4" /> Past Quotations
                            </Link>
                          </SheetClose>
                        </>
                      )}

                      <div className="px-3">
                        <SheetClose asChild>
                          <Button onClick={signOut} variant="ghost" className="mt-2 w-full justify-start text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </SheetClose>
                      </div>
                    </>
                  ) : (
                    <div className="px-3 grid gap-2">
                      <SheetClose asChild>
                        <Link href="/login" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/register" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
                          Register
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Slim mobile search row (separate from the top to keep header short) */}
        <div className="md:hidden pb-2">
          <form onSubmit={handleHeaderSearch} className="relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-600"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
