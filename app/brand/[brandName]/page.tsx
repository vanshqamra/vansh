"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { Search, ShoppingCart, Package, FlaskConical, Tag } from "lucide-react"
import Image from "next/image"
import { getQualigensProducts } from "@/lib/qualigens-products"

interface Product {
  id: string
  code: string
  cas: string
  name: string
  packSize: string
  material: string
  price: string | number
  hsn: string
  category?: string
  image?: string
}

export default function BrandPage() {
  const searchParams = useSearchParams()
  const brandName = searchParams.get("brandName") || "Qualigens" // Default to Qualigens
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const { addItem } = useCart()
  const { toast } = useToast()

  const products: Product[] = getQualigensProducts().map((p) => ({
    id: p.code,
    code: p.code,
    cas: p.cas,
    name: p.name,
    packSize: p.packSize,
    material: p.material,
    price: p.price,
    hsn: p.hsn,
    category: p.category,
    image: p.image,
  }))

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.code.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.cas.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.packSize.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.material.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category?.toLowerCase().includes(lowerCaseSearchTerm),
    )
    setFilteredProducts(results)
  }, [searchTerm, products])

  const handleAddToCart = (product: Product) => {
    let numericPrice: number
    if (typeof product.price === "string") {
      const cleanedPrice = product.price.replace(/[^0-9.]/g, "")
      numericPrice = Number.parseFloat(cleanedPrice)
      if (isNaN(numericPrice)) {
        toast({
          title: "Price Error",
          description: `"${product.name}" is "Price on Request". Please contact us for pricing.`,
          variant: "destructive",
        })
        return
      }
    } else {
      numericPrice = product.price
    }

    addItem({
      id: product.id || product.code,
      name: product.name,
      price: numericPrice,
      brand: brandName,
      category: product.category || "Laboratory Chemical",
      packSize: product.packSize,
      casNumber: product.cas,
      image: product.image || "/placeholder.svg",
      quantity: 1, // Always add 1 when clicking "Add to Cart"
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 capitalize">{brandName} Products</h1>
        <Image
          src={`/images/logo-${brandName.toLowerCase()}.png`}
          alt={`${brandName} Logo`}
          width={150}
          height={50}
          className="object-contain"
        />
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${brandName} products...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found matching your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
              <p className="text-sm text-gray-500">Code: {product.code}</p>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-4 pt-0">
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FlaskConical className="h-4 w-4 mr-1 text-gray-400" />
                  <span>CAS: {product.cas || "N/A"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Pack Size: {product.packSize}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Category: {product.category || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-xl font-bold text-blue-600">
                  {typeof product.price === "string" && product.price.toLowerCase() === "por"
                    ? "Price on Request"
                    : `₹${Number(product.price).toLocaleString()}`}
                </p>
                <Button onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
