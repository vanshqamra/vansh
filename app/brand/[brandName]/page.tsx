"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { qualigensProducts } from "@/lib/qualigens-products"
import Image from "next/image"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function BrandQualigensPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const { addItem } = useCart() // Changed from addToCart to addItem
  const { toast } = useToast()

  // Sort products alphabetically by name
  const sortedProducts = useMemo(() => {
    return [...qualigensProducts].sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Filter products based on search and letter selection
  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.code.toLowerCase().includes(query) ||
          product.cas.toLowerCase().includes(query),
      )
    }

    // Filter by selected letter
    if (selectedLetter) {
      filtered = filtered.filter((product) => product.name.toUpperCase().startsWith(selectedLetter))
    }

    return filtered
  }, [sortedProducts, searchQuery, selectedLetter])

  const handleAddToCart = (product: any) => {
    try {
      // Handle POR (Price on Request) items
      if (product.price === "POR") {
        toast({
          title: "Price on Request",
          description: "Please contact us for pricing on this item.",
          variant: "destructive",
        })
        return
      }

      // Convert price to number if it's a string
      let numericPrice = product.price
      if (typeof product.price === "string") {
        numericPrice = Number.parseFloat(product.price.replace(/[^0-9.-]+/g, "")) // Remove currency symbols
      }

      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast({
          title: "Error",
          description: "Invalid price format. Please contact us for this item.",
          variant: "destructive",
        })
        return
      }

      addItem({
        // Changed from addToCart to addItem
        id: product.id || product.code,
        name: product.name,
        price: numericPrice,
        quantity: 1, // Always add 1 when clicking "Add to Cart"
        brand: "Qualigens",
        category: product.category || "Laboratory Chemical",
        packSize: product.packSize,
        cas: product.cas,
        image: product.image || "/placeholder.svg", // Ensure an image is provided
      })

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo-qualigens.png"
            alt="Qualigens Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Qualigens Products</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            High-quality laboratory chemicals and reagents from Qualigens. Browse our complete catalog of{" "}
            {qualigensProducts.length}+ products.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name, code, or CAS number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Alphabet Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Filter by first letter:</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedLetter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLetter(null)}
              className="min-w-[40px]"
            >
              All
            </Button>
            {alphabet.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLetter(letter)}
                className="min-w-[40px]"
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-slate-600">
            Showing {filteredProducts.length} of {qualigensProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id || product.code}
              className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{product.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Qualigens</Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.code}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">CAS:</span>
                    <span className="text-slate-800">{product.cas || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Pack:</span>
                    <span className="text-slate-800">{product.packSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Material:</span>
                    <span className="text-slate-800">{product.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">HSN:</span>
                    <span className="text-slate-800">{product.hsn}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {product.price === "POR" ? "Price on Request" : `₹${product.price}`}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.price === "POR" ? "Request Quote" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600 mb-8">Try adjusting your search terms or filter options.</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedLetter(null)
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
