"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { qualigensProducts } from "@/lib/qualigens-products"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  description?: string
  image?: string
}

// Mock data for other brands
const mockProducts: Product[] = [
  ...qualigensProducts.map((p) => ({ ...p, brand: "Qualigens" })),
  {
    id: "borosil-001",
    name: "Borosilicate Glass Beaker Set",
    brand: "Borosil",
    category: "Glassware",
    price: 2500,
    description: "High-quality borosilicate glass beakers",
    image: "/images/offer-borosil-glassware.png",
  },
  {
    id: "whatman-001",
    name: "Whatman Filter Papers Grade 1",
    brand: "Whatman",
    category: "Filtration",
    price: 1200,
    description: "Standard grade qualitative filter papers",
    image: "/images/offer-whatman-filters.png",
  },
  {
    id: "rankem-001",
    name: "Analytical Grade Sodium Chloride",
    brand: "Rankem",
    category: "Chemicals",
    price: 450,
    description: "High purity analytical grade NaCl",
  },
  {
    id: "jtbaker-001",
    name: "HPLC Grade Acetonitrile",
    brand: "J.T. Baker",
    category: "Solvents",
    price: 3200,
    description: "Ultra-pure HPLC grade acetonitrile",
  },
]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const { addItem, isLoaded } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (query) {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(query.toLowerCase())),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
  }, [query])

  const handleAddToCart = (product: Product) => {
    if (mounted && isLoaded) {
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {query && (
            <div className="mb-6">
              <p className="text-gray-600">
                Search results for: <strong>"{query}"</strong>
              </p>
              <p className="text-sm text-gray-500">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {!query ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Search for Products</h2>
            <p className="text-gray-600">Enter a search term to find products from our catalog</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No products found</h2>
            <p className="text-gray-600">Try adjusting your search terms or browse our categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {product.image && (
                    <div className="relative h-32 mb-3 bg-gray-100 rounded">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <Badge variant="secondary" className="w-fit mb-2">
                    {product.brand}
                  </Badge>
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{product.category}</p>
                    {product.description && <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
