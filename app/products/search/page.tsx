"use client"

import { Suspense, useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products"

type QualigensProduct = [
  string, // code
  string, // cas
  string, // name
  string, // packSize
  string, // material
  string, // price
  string | number, // hsn
]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const { addToCart, isLoaded } = useCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    return qualigensProducts.filter((product: QualigensProduct) => {
      const [code, cas, name] = product
      return (
        name.toLowerCase().includes(searchTerm) ||
        code.toLowerCase().includes(searchTerm) ||
        cas.toLowerCase().includes(searchTerm)
      )
    })
  }, [query])

  const handleAddToCart = (product: QualigensProduct) => {
    if (!mounted || !isLoaded) return

    const cartItem = {
      code: product[0],
      name: product[2],
      packSize: product[3],
      material: product[4],
      price: product[5] === "POR" ? "Price on Request" : `₹${product[5]}`,
    }
    addToCart(cartItem)
    toast({
      title: "Added to Cart",
      description: `${product[2]} has been added to your cart.`,
    })
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <p className="text-slate-600">
          {query ? `Showing ${searchResults.length} results for "${query}"` : "Enter a search term to find products"}
        </p>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((product, index) => {
            const [code, cas, name, packSize, material, price, hsn] = product
            return (
              <Card
                key={`${code}-${index}`}
                className="flex flex-col justify-between bg-white/80 backdrop-blur-sm glow-on-hover"
              >
                <CardHeader>
                  <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Code: {code}</p>
                    <p className="text-xs text-slate-500">CAS: {cas}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="font-medium">Pack:</span> {packSize} ({material})
                    </p>
                    <p>
                      <span className="font-medium">HSN:</span> {hsn}
                    </p>
                    <p className="font-semibold text-blue-600">{price === "POR" ? "Price on Request" : `₹${price}`}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    size="sm"
                    disabled={!mounted || !isLoaded}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No products found matching your search.</p>
          <p className="text-slate-400 mt-2">Try different keywords or check the spelling.</p>
        </div>
      ) : null}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded"></div>
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
