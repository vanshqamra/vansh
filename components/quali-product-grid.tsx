"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"

type QualigensProduct = [
  string, // code
  string, // cas
  string, // name
  string, // packSize
  string, // material
  string, // price
  string | number, // hsn
]

interface QualiProductGridProps {
  products: QualigensProduct[]
}

export function QualiProductGrid({ products }: QualiProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24
  const { addToCart } = useCart()
  const { toast } = useToast()

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product[2].toLowerCase().includes(searchTerm.toLowerCase()) ||
        product[0].toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [products, searchTerm])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const handleAddToCart = (product: QualigensProduct) => {
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
        {displayedProducts.map((product, index) => {
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
                <Button className="w-full" onClick={() => handleAddToCart(product)} size="sm">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          )
        })}
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
