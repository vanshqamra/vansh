"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { Beaker, ShoppingCart } from "lucide-react"

const qualigensProducts = [
  {
    id: "ql-001",
    name: "Sulfuric Acid 98% AR",
    brand: "Qualigens",
    category: "Acids",
    price: 850,
    casNumber: "7664-93-9",
    packSize: "500ml",
  },
  {
    id: "ql-002",
    name: "Sodium Hydroxide Pellets AR",
    brand: "Qualigens",
    category: "Bases",
    price: 420,
    casNumber: "1310-73-2",
    packSize: "500g",
  },
  {
    id: "ql-003",
    name: "Hydrochloric Acid 37% AR",
    brand: "Qualigens",
    category: "Acids",
    price: 380,
    casNumber: "7647-01-0",
    packSize: "500ml",
  },
  {
    id: "ql-004",
    name: "Acetone HPLC Grade",
    brand: "Qualigens",
    category: "Solvents",
    price: 1200,
    casNumber: "67-64-1",
    packSize: "1L",
  },
  {
    id: "ql-005",
    name: "Methanol AR Grade",
    brand: "Qualigens",
    category: "Solvents",
    price: 950,
    casNumber: "67-56-1",
    packSize: "1L",
  },
  {
    id: "ql-006",
    name: "Potassium Permanganate AR",
    brand: "Qualigens",
    category: "Salts",
    price: 680,
    casNumber: "7722-64-7",
    packSize: "250g",
  },
]

export function ProductGrid() {
  const { addToCart } = useCart()

  const handleAddToCart = (product: (typeof qualigensProducts)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      casNumber: product.casNumber,
      packSize: product.packSize,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {qualigensProducts.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg mb-3">
              <Beaker className="h-16 w-16 text-slate-400" />
            </div>
            <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{product.brand}</Badge>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <p className="text-sm text-slate-600">CAS: {product.casNumber}</p>
              <p className="text-sm text-slate-600">Pack Size: {product.packSize}</p>
              <p className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</p>
            </div>
            <Button onClick={() => handleAddToCart(product)} className="w-full" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
