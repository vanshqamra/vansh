"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"

type QualigensProduct = {
  id: string
  code: string
  name: string
  cas: string
  category: string
  packSize: string
  material: string
  /** Price may be numeric or the literal string "POR" */
  price: number | string
  purity: string
  brand: string
  hsn: string
}

interface QualiProductGridProps {
  products: QualigensProduct[]
}

export function QualiProductGrid({ products }: QualiProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24
  const { addItem } = useCart()
  const { toast } = useToast()

  const isPOR = (v: any) => /^por$/i.test(String(v ?? "").trim())

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.cas?.includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [products, searchTerm])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const handleAddToCart = (product: QualigensProduct) => {
    if (isPOR(product.price) || Number(product.price) <= 0) {
      toast({ title: "Price on Request", description: "Price on Request • POR" })
      return
    }
    const priceNum = typeof product.price === "number" ? product.price : Number(String(product.price).replace(/[^\d.]/g, "")) || 0
    const cartItem = {
      id: product.id,
      name: product.name,
      price: priceNum,
      brand: "Qualigens",
      category: product.category,
      packSize: product.packSize,
      material: product.material,
    }
    addItem(cartItem)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Input
          placeholder="Search by product name or code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Results Count */}
      <div className="text-center text-slate-600">
        Showing {displayedProducts.length} of {filteredProducts.length} products
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <Card key={product.id} className="flex flex-col justify-between bg-white/80 backdrop-blur-sm glow-on-hover">
            <CardHeader>
              <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{product.name}</CardTitle>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Code: {product.code}</p>
                <p className="text-xs text-slate-500">CAS: {product.cas}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">Category:</span> {product.category}
                </p>
                <p>
                  <span className="font-medium">Pack:</span> {product.packSize} ({product.material})
                </p>
                <p>
                  <span className="font-medium">Purity:</span> {product.purity}
                </p>
                <p>
                  <span className="font-medium">HSN:</span> {product.hsn}
                </p>
                <p className="font-semibold text-blue-600">
                  {isPOR(product.price) ? "POR" : `₹${Number(product.price).toLocaleString()}`}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleAddToCart(product)} size="sm">
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
