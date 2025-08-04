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
import { useToast } from "@/hooks/use-toast"

import { qualigensProducts } from "@/lib/qualigens-products"
import { commercialChemicals } from "@/lib/data"
import rankemProducts from "@/lib/rankem_products.json"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSyncedFromParams, setHasSyncedFromParams] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!hasSyncedFromParams) {
      const query = searchParams.get("q") || ""
      setSearchQuery(query)
      setHasSyncedFromParams(true)
    }
  }, [searchParams, hasSyncedFromParams])

  const matchesSearchQuery = (product: any, query: string): boolean => {
    const q = query.trim().toLowerCase()
    if (!q) return false

    const fields = [
      product.name,
      product.code,
      product.cas,
      product.category,
      product.title,
      product.description
    ]

    const specsString = Array.isArray(product.specs)
      ? product.specs.flat().join(" ").toLowerCase()
      : ""

    return (
      fields.some(
        (field) => typeof field === "string" && field.toLowerCase().includes(q)
      ) || specsString.includes(q)
    )
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const qualigensResults = qualigensProducts
      .filter((product) => matchesSearchQuery(product, searchQuery))
      .map((product) => ({ ...product, source: "qualigens" }))

    const commercialResults = commercialChemicals
      .filter((product) => matchesSearchQuery(product, searchQuery))
      .map((product) => ({ ...product, source: "commercial" }))

    const rankemResults = rankemProducts
      .flatMap((group: any) =>
        group.variants
          .filter((variant: any) => {
            const enriched = {
              ...variant,
              specs: group.specs_headers?.map((header: string) => variant[header] || "") || [],
              category: group.category,
              title: group.title,
              description: group.description,
              specs_headers: group.specs_headers,
              source: "rankem",
              name: variant.name || variant["Product Name"] || group.title || "",
              code: variant.code || variant["Product Code"] || variant["Cat No"] || "",
              price: variant.price || variant["Price"] || variant["List Price 2025(INR)"] || ""
            }
            return matchesSearchQuery(enriched, searchQuery)
          })
          .map((variant: any) => ({
            ...variant,
            specs: group.specs_headers?.map((header: string) => variant[header] || "") || [],
            category: group.category,
            title: group.title,
            description: group.description,
            specs_headers: group.specs_headers,
            source: "rankem",
            name: variant.name || variant["Product Name"] || group.title || "",
            code: variant.code || variant["Product Code"] || variant["Cat No"] || "",
            price: variant.price || variant["Price"] || variant["List Price 2025(INR)"] || ""
          }))
      )

    const borosilResults = borosilProducts
      .flatMap((group: any) =>
        group.variants.map((variant: any) => ({
          ...variant,
          category: group.category,
          title: group.title,
          description: group.description,
          specs_headers: group.specs_headers,
          specs: variant.specs,
          source: "borosil",
        }))
      )
      .filter((product) => matchesSearchQuery(product, searchQuery))

    setSearchResults([
      ...qualigensResults,
      ...commercialResults,
      ...rankemResults,
      ...borosilResults,
    ])
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleAddToCart = (product: any) => {
    if (!mounted || !isLoaded) {
      toast({
        title: "Loading...",
        description: "Please wait while the cart loads",
        variant: "destructive",
      })
      return
    }

    try {
      const price =
        typeof product.price === "number"
          ? product.price
          : Number.parseFloat(product.price?.replace(/[^\d.]/g, ""))

      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Unable to add item with invalid price.",
          variant: "destructive",
        })
        return
      }

      addItem({
        id: product.id || product.code,
        name: product.name || product.title,
        price: price,
        brand: product.source,
        category: product.category,
      })

      toast({
        title: "Added to Cart",
        description: `${product.name || product.title} has been added to your cart`,
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

  if (!mounted) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

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

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((product) => (
              <Card
                key={`${product.source}-${product.id || product.code || Math.random().toString(36).substring(2, 10)}`}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{product.name || product.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{product.source}</Badge>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {product.code && <p className="text-sm text-slate-600">Code: {product.code}</p>}
                    {product.cas && <p className="text-sm text-slate-600">CAS: {product.cas}</p>}
                    {product.purity && <p className="text-sm text-slate-600">Purity: {product.purity}</p>}
                    <p className="text-sm text-slate-600">
                      Pack Size: {product.packSize || product.pack_size || "—"}
                    </p>
                    {product.material && <p className="text-sm text-slate-600">Material: {product.material}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {typeof product.price === "number"
                        ? `₹${product.price.toLocaleString()}`
                        : product.price || "₹—"}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isLoaded}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isLoaded ? "Add to Cart" : "Loading..."}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
