"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Plus } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { bulkChemicals, laboratorySupplies, scientificInstruments } from "@/lib/data"
import Image from "next/image"

const allProducts = [...bulkChemicals, ...laboratorySupplies, ...scientificInstruments]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const { addItem, isLoaded } = useCart()

  useEffect(() => {
    if (query) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          (product.cas && product.cas.includes(query)),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(allProducts)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.cas && product.cas.includes(searchQuery)),
      )
      setFilteredProducts(filtered)
    }
  }

  const handleAddToCart = (product: any) => {
    if (!isLoaded) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      image: product.image,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Search Products</h1>
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
            <Input
              placeholder="Search by name, brand, CAS number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {query && (
          <div className="mb-6">
            <p className="text-slate-600">
              Showing {filteredProducts.length} results for "{query}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="relative h-48 mb-4">
                  <Image
                    src={product.image || "/placeholder.svg?height=200&width=300"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{product.brand}</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {product.cas && <p className="text-sm text-slate-600">CAS: {product.cas}</p>}
                  {product.purity && <p className="text-sm text-slate-600">Purity: {product.purity}</p>}
                  {product.unit && <p className="text-sm text-slate-600">Unit: {product.unit}</p>}
                  {product.description && <p className="text-sm text-slate-600">{product.description}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600 mb-8">Try adjusting your search terms or browse our categories.</p>
            <Button asChild>
              <a href="/products">Browse All Products</a>
            </Button>
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
      }
    >
      <SearchResults />
    </Suspense>
  )
}
