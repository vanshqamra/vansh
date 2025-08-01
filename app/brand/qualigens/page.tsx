"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import QualiProductGrid, { QualiProductGridSkeleton } from "@/components/quali-product-grid"
import { getQualigensProducts } from "@/lib/qualigens-products"
import { getBrandByName } from "@/lib/data"
import Image from "next/image"
import { Suspense } from "react"
import QualigensLoading from "./loading"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default async function QualigensPage() {
  const qualiProducts = await getQualigensProducts()
  const brand = getBrandByName("Qualigens")

  // Sort products alphabetically by name
  const sortedProducts = useMemo(() => {
    return [...qualiProducts].sort((a, b) => a.name.localeCompare(b.name))
  }, [qualiProducts])

  // Filter products based on search and letter selection
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.code.toLowerCase().includes(query) ||
          product.cas.toLowerCase().includes(query),
      )
    }

    // Filter by selected letter
    if (selectedLetter) {
      filtered = filtered.filter((product) => product.name.toUpperCase().startsWith(selectedLetter))
    }

    return filtered
  }, [sortedProducts, searchQuery, selectedLetter])

  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    try {
      // Convert price to number, handle "POR" case
      const numericPrice = product.price === "POR" ? 0 : Number.parseFloat(product.price.toString())

      addToCart({
        id: product.code,
        name: product.name,
        price: numericPrice,
        brand: brand.name,
        category: "Laboratory Chemical",
        packSize: product.packSize,
        casNumber: product.cas,
      })

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
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

  if (!brand) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Brand not found.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src="/images/logo-qualigens.png"
            alt="Qualigens Logo"
            width={200}
            height={100}
            objectFit="contain"
            className="mb-4"
          />
          <h1 className="text-4xl font-bold mb-4">Qualigens Products</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore our comprehensive range of Qualigens products, known for their quality and reliability in laboratory
            and industrial applications.
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
            Showing {filteredProducts.length} of {qualiProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<QualiProductGridSkeleton />}>
          <QualiProductGrid products={filteredProducts} handleAddToCart={handleAddToCart} />
        </Suspense>

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

        {/* Updated Product List */}
        <Suspense fallback={<QualigensLoading />}>
          <QualiProductList products={qualiProducts} />
        </Suspense>
      </div>
    </div>
  )
}
