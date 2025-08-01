"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { ShoppingCart, Star, Award, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const featuredProducts = [
  {
    id: "1",
    name: "Sulfuric Acid 98% AR Grade",
    brand: "Fisher Chemical",
    price: "₹2,450",
    originalPrice: "₹2,800",
    image: "/placeholder.svg?height=200&width=200&text=H2SO4",
    casNumber: "7664-93-9",
    purity: "98%",
    grade: "AR Grade",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Sodium Hydroxide Pellets",
    brand: "Qualigens",
    price: "₹1,850",
    originalPrice: "₹2,100",
    image: "/placeholder.svg?height=200&width=200&text=NaOH",
    casNumber: "1310-73-2",
    purity: "99%",
    grade: "LR Grade",
    rating: 4.7,
    reviews: 89,
    inStock: true,
    featured: false,
  },
  {
    id: "3",
    name: "Hydrochloric Acid 37%",
    brand: "Merck",
    price: "₹1,650",
    originalPrice: "₹1,900",
    image: "/placeholder.svg?height=200&width=200&text=HCl",
    casNumber: "7647-01-0",
    purity: "37%",
    grade: "AR Grade",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Acetone HPLC Grade",
    brand: "Fisher Scientific",
    price: "₹3,200",
    originalPrice: "₹3,600",
    image: "/placeholder.svg?height=200&width=200&text=C3H6O",
    casNumber: "67-64-1",
    purity: "99.9%",
    grade: "HPLC Grade",
    rating: 4.8,
    reviews: 78,
    inStock: true,
    featured: false,
  },
  {
    id: "5",
    name: "Methanol AR Grade",
    brand: "Rankem",
    price: "₹2,100",
    originalPrice: "₹2,400",
    image: "/placeholder.svg?height=200&width=200&text=CH3OH",
    casNumber: "67-56-1",
    purity: "99.8%",
    grade: "AR Grade",
    rating: 4.6,
    reviews: 92,
    inStock: true,
    featured: true,
  },
  {
    id: "6",
    name: "Potassium Permanganate",
    brand: "Loba Chemie",
    price: "₹1,950",
    originalPrice: "₹2,200",
    image: "/placeholder.svg?height=200&width=200&text=KMnO4",
    casNumber: "7722-64-7",
    purity: "99%",
    grade: "AR Grade",
    rating: 4.7,
    reviews: 67,
    inStock: false,
    featured: false,
  },
]

export function ProductGrid() {
  const { addToCart } = useCart()

  const handleAddToCart = (product: (typeof featuredProducts)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      casNumber: product.casNumber,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProducts.map((product) => (
        <Card
          key={product.id}
          className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm"
        >
          <CardHeader className="pb-3">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-slate-600">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviews})</span>
                  </div>
                </div>

                <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {product.name}
                </CardTitle>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {product.grade}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {product.purity}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500">CAS: {product.casNumber}</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">{product.originalPrice}</span>
                )}
              </div>
              {product.originalPrice && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Save{" "}
                  {Math.round(
                    ((Number.parseFloat(product.originalPrice.replace(/[₹,]/g, "")) -
                      Number.parseFloat(product.price.replace(/[₹,]/g, ""))) /
                      Number.parseFloat(product.originalPrice.replace(/[₹,]/g, ""))) *
                      100,
                  )}
                  %
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleAddToCart(product)} disabled={!product.inStock}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${product.id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
