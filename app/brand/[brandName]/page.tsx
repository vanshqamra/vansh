"use client"

import { useState } from "react"
import { qualigensProducts } from "@/lib/qualigens-products"
import { labSupplyBrands } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type Props = {
  params: { brandName: string }
}

export default function BrandPage({ params }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]
  const { addToCart } = useCart()
  const { toast } = useToast()

  if (!brand) {
    notFound()
  }

  // Get products based on brand
  const allProducts = brandKey === "qualigens" ? qualigensProducts : []

  // Filter products based on search term
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.cas.includes(searchTerm),
  )

  const handleAddToCart = (product: any) => {
    try {
      // Handle POR (Price on Request) items
      if (product.price === "POR") {
        toast({
          title: "Price on Request",
          description: "Please contact us for pricing on this item.",
          variant: "destructive",
        })
        return
      }

      // Convert price to number if it's a string
      let numericPrice = product.price
      if (typeof product.price === "string") {
        numericPrice = Number.parseFloat(product.price.replace(/[^\d.-]/g, ""))
      }

      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast({
          title: "Error",
          description: "Invalid price format. Please contact us for this item.",
          variant: "destructive",
        })
        return
      }

      const cartItem = {
        id: product.id || product.code,
        name: product.name,
        price: numericPrice,
        brand: brand.name,
        category: product.category || "Laboratory Chemical",
        packSize: product.packSize,
        material: product.material,
      }

      addToCart(cartItem)

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

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Image
            src={`/images/logo-${brandKey}.png`}
            alt={`${brand.name} logo`}
            width={120}
            height={60}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{brand.name}</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Authorized distributor of {brand.name} products.
        </p>
      </div>

      {allProducts.length > 0 && (
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <div className="text-center mt-4 text-slate-600">
            Showing {filteredProducts.length} of {allProducts.length} products
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id || product.code} className="shadow-sm bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700 line-clamp-2">{product.name}</CardTitle>
                <p className="text-sm text-slate-500">Code: {product.code}</p>
                <p className="text-sm text-slate-500">CAS: {product.cas}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Pack:</span> {product.packSize} ({product.material})
                  </p>
                  {product.purity && (
                    <p>
                      <span className="font-medium">Purity:</span> {product.purity}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">HSN:</span> {product.hsn}
                  </p>
                  <p className="text-lg font-bold mt-2 text-blue-600">
                    {product.price === "POR"
                      ? "Price on Request"
                      : `₹${typeof product.price === "number" ? product.price.toLocaleString() : product.price}`}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.price === "POR" ? "Request Quote" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : allProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No products available for this brand yet.</p>
            <p className="text-slate-400 mt-2">Please check back later or contact us for more information.</p>
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No products found matching "{searchTerm}"</p>
            <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
