"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { qualigensProducts } from "@/lib/qualigens-products"
import { commercialChemicals } from "@/lib/data"

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const { addItem, isLoaded } = useCart()

  useEffect(() => {
    setMounted(true)
    const query = searchParams.get("q") || ""
    setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchLower = searchQuery.toLowerCase()

    // Search in Qualigens products
    const qualigensResults = qualigensProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.code.toLowerCase().includes(searchLower) ||
          product.cas.includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower),
      )
      .map((product) => ({ ...product, source: "qualigens" }))

    // Search in commercial chemicals
    const commercialResults = commercialChemicals
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.code.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower),
      )
      .map((product) => ({ ...product, source: "commercial" }))

    setSearchResults([...qualigensResults, ...commercialResults])
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleAddToCart = (product: any) => {
    if (!mounted || !isLoaded) return

    addItem({
      id: product.id || product.code,
      name: product.name,
      price:
        typeof product.price === "number" ? product.price : Number.parseFloat(product.price.replace(/[^\d.]/g, "")),
      brand: product.source === "qualigens" ? "Qualigens" : "Commercial",
      category: product.category,
      packSize: product.packSize || product.pack_size,
      material: product.material,
    })
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-slate-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Search Results</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mb-6">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {searchQuery && (
            <p className="text-slate-600 mb-6">
              Showing {searchResults.length} results for "{searchQuery}"
            </p>
          )}
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((product) => (
              <Card
                key={`${product.source}-${product.id || product.code}`}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{product.source === "qualigens" ? "Qualigens" : "Commercial"}</Badge>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-600">Code: {product.code}</p>
                    {product.cas && <p className="text-sm text-slate-600">CAS: {product.cas}</p>}
                    {product.purity && <p className="text-sm text-slate-600">Purity: {product.purity}</p>}
                    <p className="text-sm text-slate-600">Pack Size: {product.packSize || product.pack_size}</p>
                    {product.material && <p className="text-sm text-slate-600">Material: {product.material}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {typeof product.price === "number" ? `₹${product.price.toLocaleString()}` : product.price}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isLoaded}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600 mb-8">Try different search terms or browse our categories.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Search Products</h2>
            <p className="text-slate-600">Enter a search term to find products from our catalog.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
