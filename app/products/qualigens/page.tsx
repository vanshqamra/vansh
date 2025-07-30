"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { qualigensProducts } from "@/lib/qualigens-products"
import Image from "next/image"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function QualigensPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [filteredProducts, setFilteredProducts] = useState(qualigensProducts)
  const [mounted, setMounted] = useState(false)
  const { addItem, isLoaded } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = qualigensProducts

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.cas.includes(searchQuery),
      )
    }

    // Filter by selected letter
    if (selectedLetter) {
      filtered = filtered.filter((product) => product.name.toUpperCase().startsWith(selectedLetter))
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedLetter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddToCart = (product: any) => {
    if (!mounted || !isLoaded) return

    addItem({
      id: product.code,
      name: product.name,
      price: product.price,
      brand: "Qualigens",
      category: product.category,
      image: "/images/product-qualigens.png",
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Qualigens Products</h1>
          <p className="text-slate-600 mb-6">High-quality laboratory chemicals and reagents from Qualigens</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mb-6">
            <Input
              placeholder="Search by name, code, or CAS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Alphabet Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by first letter:</span>
            </div>
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
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredProducts.length} of {qualigensProducts.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.code} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="relative h-48 mb-4">
                  <Image
                    src="/images/product-qualigens.png"
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Qualigens</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">Code: {product.code}</p>
                  <p className="text-sm text-slate-600">CAS: {product.cas}</p>
                  <p className="text-sm text-slate-600">Purity: {product.purity}</p>
                  <p className="text-sm text-slate-600">Pack Size: {product.packSize}</p>
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
