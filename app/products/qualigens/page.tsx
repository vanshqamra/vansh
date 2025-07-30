"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { qualigensProducts } from "@/lib/qualigens-products"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function QualigensPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { addItem, isLoaded } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredProducts = qualigensProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLetter = !selectedLetter || product.name.toUpperCase().startsWith(selectedLetter)
    return matchesSearch && matchesLetter
  })

  const handleAddToCart = (product: (typeof qualigensProducts)[0]) => {
    if (mounted && isLoaded) {
      addItem({
        id: product.id,
        name: product.name,
        brand: "Qualigens",
        price: product.price,
        image: product.image,
      })
    }
  }

  if (!mounted || !isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="flex flex-wrap gap-2">
              {alphabet.map((letter) => (
                <div key={letter} className="w-10 h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Qualigens Products</h1>
          <p className="text-gray-600 mb-6">High-quality laboratory chemicals and reagents from Qualigens</p>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search Qualigens products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* A-Z Filter */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Filter by first letter:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLetter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLetter(null)}
              >
                All
              </Button>
              {alphabet.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLetter(letter)}
                  className="w-10 h-10 p-0"
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {qualigensProducts.length} products
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No products found</h2>
            <p className="text-gray-600">Try adjusting your search terms or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Badge variant="secondary" className="w-fit mb-2">
                    Qualigens
                  </Badge>
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-green-600">₹{product.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!mounted || !isLoaded}
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
