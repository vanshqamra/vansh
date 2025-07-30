"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products"

type QualigensProduct = [
  string, // code
  string, // cas
  string, // name
  string, // packSize
  string, // material
  string, // price
  string | number, // hsn
]

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function QualigensPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [mounted, setMounted] = useState(false)
  const productsPerPage = 24
  const { addToCart, isLoaded } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = qualigensProducts as QualigensProduct[]

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product[2]
            .toLowerCase()
            .includes(searchLower) || // name
          product[0].toLowerCase().includes(searchLower) || // code
          product[1].toLowerCase().includes(searchLower), // cas
      )
    }

    // Filter by selected letter
    if (selectedLetter) {
      filtered = filtered.filter((product) => product[2].toUpperCase().startsWith(selectedLetter))
    }

    return filtered
  }, [searchTerm, selectedLetter])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const handleAddToCart = (product: QualigensProduct) => {
    if (!mounted || !isLoaded) return

    const cartItem = {
      code: product[0],
      name: product[2],
      packSize: product[3],
      material: product[4],
      price: product[5] === "POR" ? "Price on Request" : `₹${product[5]}`,
    }
    addToCart(cartItem)
    toast({
      title: "Added to Cart",
      description: `${product[2]} has been added to your cart.`,
    })
  }

  const handleLetterFilter = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (value) {
      setSelectedLetter(null) // Clear letter filter when searching
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Qualigens Products</h1>
        <p className="text-slate-600 mb-6">High-quality laboratory chemicals and reagents from Qualigens</p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <Input
            placeholder="Search by product name, code, or CAS..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {/* A-Z Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? "default" : "outline"}
              size="sm"
              onClick={() => handleLetterFilter(letter)}
              className="w-10 h-10"
            >
              {letter}
            </Button>
          ))}
          {selectedLetter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLetter(null)
                setCurrentPage(1)
              }}
              className="ml-2"
            >
              Clear Filter
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-center text-slate-600 mb-6">
          Showing {displayedProducts.length} of {filteredProducts.length} products
          {selectedLetter && ` starting with "${selectedLetter}"`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {displayedProducts.map((product, index) => {
          const [code, cas, name, packSize, material, price, hsn] = product
          return (
            <Card
              key={`${code}-${index}`}
              className="flex flex-col justify-between bg-white/80 backdrop-blur-sm glow-on-hover"
            >
              <CardHeader>
                <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{name}</CardTitle>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Code: {code}</p>
                  <p className="text-xs text-slate-500">CAS: {cas}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="font-medium">Pack:</span> {packSize} ({material})
                  </p>
                  <p>
                    <span className="font-medium">HSN:</span> {hsn}
                  </p>
                  <p className="font-semibold text-blue-600">{price === "POR" ? "Price on Request" : `₹${price}`}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  disabled={!mounted || !isLoaded}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
