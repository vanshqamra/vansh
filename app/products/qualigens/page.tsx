"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products.json"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function QualigensPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const { addItem } = useCart()
  const { toast } = useToast()

  // Sort products alphabetically by name
  const sortedProducts = useMemo(() => {
    return [...qualigensProducts].sort((a, b) => a[2].localeCompare(b[2]))
  }, [])

  // Filter products based on search and letter selection
  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        ([code, cas, name]) =>
          name.toLowerCase().includes(query) || code.toLowerCase().includes(query) || cas.toLowerCase().includes(query),
      )
    }

    // Filter by selected letter
    if (selectedLetter) {
      filtered = filtered.filter(([, , name]) => name.toUpperCase().startsWith(selectedLetter))
    }

    return filtered
  }, [sortedProducts, searchQuery, selectedLetter])

  const handleAddToCart = (product: (typeof qualigensProducts)[0]) => {
    const [code, cas, name, packSize, material, price] = product

    addItem({
      id: code,
      name: name,
      price: price === "POR" ? "Price on Request" : price,
      brand: "Qualigens",
      category: "Laboratory Chemical",
      packSize: packSize,
      material: material,
    })

    toast({
      title: "Added to Cart",
      description: `${name} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
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
          {filteredProducts.map((product) => {
            const [code, cas, name, packSize, material, price, hsn] = product
            return (
              <Card key={code} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Qualigens</Badge>
                    <Badge variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">CAS:</span>
                      <span className="text-slate-800">{cas || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Pack:</span>
                      <span className="text-slate-800">{packSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Material:</span>
                      <span className="text-slate-800">{material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">HSN:</span>
                      <span className="text-slate-800">{hsn}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {price === "POR" ? "Price on Request" : `₹${price}`}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
