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
import { useSearch } from "@/app/context/search-context"
import { useToast } from "@/hooks/use-toast"

import qualigensProducts from "@/lib/qualigens-products.json"
import { commercialChemicals } from "@/lib/data"
import rankemProducts from "@/lib/rankem_products.json"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import whatmanProducts from "@/lib/whatman_products.json"
import himediaData from "@/lib/himedia_products_grouped.json"

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  const { searchQuery, setSearchQuery } = useSearch()
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 50
  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()

  const matchesSearchQuery = (product: any, query: string): boolean => {
    const normalizedQuery = query.trim().toLowerCase().replace(/[^a-z0-9]/gi, "")
    if (!normalizedQuery) return false

    const searchFields: string[] = []

    const collectFields = (obj: any) => {
      if (typeof obj === "string") {
        searchFields.push(obj.toLowerCase().replace(/[^a-z0-9]/gi, ""))
      } else if (typeof obj === "number") {
        searchFields.push(obj.toString())
      } else if (Array.isArray(obj)) {
        obj.forEach(collectFields)
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach(collectFields)
      }
    }

    collectFields(product)
    return searchFields.some((field) => field.includes(normalizedQuery))
  }

  const triggerSearch = (query: string) => {
    router.replace(`/products/search?q=${encodeURIComponent(query)}`)

    const qualigensResults = (Array.isArray(qualigensProducts) ? qualigensProducts : qualigensProducts.data || [])
      .filter((product) => matchesSearchQuery(product, query))
      .map((product) => ({
        ...product,
        source: "qualigens",
        name: product["Product Name"],
        code: product["Product Code"],
        price: product["Price"]
      }))

    const commercialResults = commercialChemicals
      .filter((product) => matchesSearchQuery(product, query))
      .map((product) => ({ ...product, source: "commercial" }))

    const rankemResults = rankemProducts.flatMap((group: any) =>
      group.variants
        .map((variant: any) => {
          const isStandardFormat = variant["Cat No"] && variant["Description"]
          const isAlternateFormat = variant["Unnamed: 1"] && variant["Unnamed: 5"]

          if (isStandardFormat) {
            return {
              ...variant,
              specs: group.specs_headers?.map((header: string) => variant[header] || "") || [],
              category: group.category,
              title: group.title,
              description: group.description,
              specs_headers: group.specs_headers,
              source: "rankem",
              name: variant["Description"] || group.title || "—",
              code: variant["Cat No"] || "—",
              price: variant["List Price\n2025(INR)"] || variant["Price"] || "—",
              packSize: variant["Pack\nSize"] || variant["Packing"] || "—"
            }
          } else if (isAlternateFormat) {
            const code = variant["Baker Analyzed ACS\nReagent\n(PVC"]?.trim()
            const name = variant["Unnamed: 1"]?.trim()
            const packSize = variant["Unnamed: 3"]?.trim()
            const price = variant["Unnamed: 5"]

            if (!name || !code) return null

            return {
              ...variant,
              specs: [],
              category: group.category,
              title: group.title,
              description: group.description,
              specs_headers: group.specs_headers,
              source: "rankem",
              name,
              code,
              packSize: packSize || "—",
              price: price || "—"
            }
          }
          return null
        })
        .filter((product: any) => product && matchesSearchQuery(product, query))
    )

    const borosilResults = borosilProducts.flatMap((group: any) => {
      const groupMatch = (
        group.title?.toLowerCase().includes(query.toLowerCase()) ||
        group.category?.toLowerCase().includes(query.toLowerCase()) ||
        group.product?.toLowerCase().includes(query.toLowerCase()) ||
        group.description?.toLowerCase().includes(query.toLowerCase())
      )

      const matchedVariants = (group.variants || []).filter((variant: any) => matchesSearchQuery(variant, query))

      if (groupMatch || matchedVariants.length > 0) {
        const variantsToUse = groupMatch && matchedVariants.length === 0 ? group.variants : matchedVariants

        return variantsToUse.map((variant: any) => {
          const specs = group.specs_headers?.map((header: string) => `${header}: ${variant[header] || "—"}`) || []

          return {
            ...variant,
            category: "Borosil",
            title: group.title,
            description: group.description,
            product: group.product,
            specs_headers: group.specs_headers,
            specs,
            source: "borosil",
          }
        })
      }
      return []
    })

    const whatmanResults = (whatmanProducts?.variants || [])
      .filter((variant: any) => matchesSearchQuery(variant, query))
      .map((variant: any) => {
        const specs = whatmanProducts.specs_headers?.filter(h => h.toLowerCase() !== "price")
          .map((header: string) => `${header}: ${variant[header] ?? "—"}`) || []

        return {
          ...variant,
          source: "whatman",
          name: variant["name"] || variant["Name"] || variant["Code"] || "Whatman Product",
          code: variant["Code"] || variant["code"] || "",
          price: variant["Price"] || variant["price"] || "—",
          description: whatmanProducts.description || "",
          category: "Whatman",
          title: whatmanProducts.title || "",
          specs,
        }
      })

    const combinedResults = [
      ...qualigensResults,
      ...commercialResults,
      ...rankemResults,
      ...borosilResults,
      ...whatmanResults,
    ]

    setSearchResults(combinedResults)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery)
      triggerSearch(initialQuery)
    }
  }, [initialQuery, setSearchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    triggerSearch(searchQuery)
  }

  const handleAddToCart = (product: any) => {
    if (!isLoaded) {
      toast({ title: "Loading...", description: "Please wait while the cart loads", variant: "destructive" })
      return
    }

    try {
      const price = typeof product.price === "number"
        ? product.price
        : Number.parseFloat(product.price?.toString().replace(/[^\d.]/g, ""))

      if (isNaN(price) || price <= 0) {
        toast({ title: "Invalid Price", description: "Unable to add item with invalid price.", variant: "destructive" })
        return
      }

      addItem({
        id: product.id || product.code,
        name: product.name || product.product || product.title,
        price,
        brand: product.source,
        category: product.category,
      })

      toast({ title: "Added to Cart", description: `${product.name || product.title} has been added to your cart` })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({ title: "Error", description: "Failed to add item to cart. Please try again.", variant: "destructive" })
    }
  }

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  )

  const totalPages = Math.ceil(searchResults.length / resultsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Search Results</h1>
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

        {paginatedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResults.map((product) => (
                <Card
                  key={`${product.source}-${product.id || product.code || Math.random().toString(36).substring(2, 10)}`}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{product.name || product.product || product.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.source}</Badge>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {product.code && <p className="text-sm text-slate-600">Code: {product.code}</p>}
                      {product.description && <p className="text-sm text-slate-600">{product.description}</p>}
                      {product.specs?.map((spec: string, idx: number) => (
                        <p key={idx} className="text-sm text-slate-600">{spec}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {typeof product.price === "number" ? `₹${product.price.toLocaleString()}` : `₹${product.price}`}
                      </span>
                      <Button onClick={() => handleAddToCart(product)} disabled={!isLoaded} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {isLoaded ? "Add to Cart" : "Loading..."}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600">Try different search terms or browse our categories.</p>
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
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
