"use client"

import type React from "react"

import { Suspense } from "react"
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid"
import { getProducts, getBrands } from "@/lib/data"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  const allProducts = getProducts()
  const allBrands = getBrands().map((brand) => brand.name)
  const allCategories = Array.from(new Set(allProducts.map((p) => p.category)))
  const maxPossiblePrice = Math.max(...allProducts.map((p) => p.price))

  const searchParams = useSearchParams()
  const router = useRouter()

  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchParams.get("query") || "")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (currentSearchQuery.trim()) {
      params.set("query", currentSearchQuery.trim())
    } else {
      params.delete("query")
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleFilterChange = (filters: {
    minPrice: number
    maxPrice: number
    selectedCategories: string[]
    selectedBrands: string[]
  }) => {
    const params = new URLSearchParams()
    if (currentSearchQuery.trim()) {
      params.set("query", currentSearchQuery.trim())
    }
    if (filters.minPrice > 0) {
      params.set("minPrice", filters.minPrice.toString())
    }
    if (filters.maxPrice < maxPossiblePrice) {
      params.set("maxPrice", filters.maxPrice.toString())
    }
    if (filters.selectedCategories.length > 0) {
      params.set("categories", filters.selectedCategories.join(","))
    }
    if (filters.selectedBrands.length > 0) {
      params.set("brands", filters.selectedBrands.join(","))
    }
    router.push(`/products?${params.toString()}`)
  }

  const filteredProducts = allProducts.filter((product) => {
    const query = searchParams.get("query")?.toLowerCase() || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || maxPossiblePrice.toString())
    const categories = searchParams.get("categories")?.split(",") || []
    const brands = searchParams.get("brands")?.split(",") || []

    const matchesSearch = query
      ? product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      : true

    const matchesPrice = product.price >= minPrice && product.price <= maxPrice
    const matchesCategory = categories.length > 0 ? categories.includes(product.category) : true
    const matchesBrand = brands.length > 0 ? brands.includes(product.brand) : true

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand
  })

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Discover our extensive catalog of high-quality chemicals, laboratory supplies, and scientific instruments.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <FilterSidebar
            categories={allCategories}
            brands={allBrands}
            onFilterChange={handleFilterChange}
            initialMinPrice={Number.parseFloat(searchParams.get("minPrice") || "0")}
            initialMaxPrice={Number.parseFloat(searchParams.get("maxPrice") || maxPossiblePrice.toString())}
            maxPossiblePrice={maxPossiblePrice}
          />
        </div>
        <form onSubmit={handleSearchSubmit} className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search products by name, description, brand, or category..."
            className="w-full pr-10"
            value={currentSearchQuery}
            onChange={(e) => setCurrentSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No products found matching your criteria.</p>
            <Button variant="link" onClick={() => router.push("/products")} className="mt-4">
              Clear all filters
            </Button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </Suspense>
    </div>
  )
}
