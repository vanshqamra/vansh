"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Beaker } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  brand: string
  description?: string
  image?: string
}

const products: Product[] = [
  {
    id: "1",
    name: "Sulfuric Acid (H2SO4)",
    price: 2500,
    category: "Acids",
    brand: "Qualigens",
    description: "High purity sulfuric acid for laboratory use",
  },
  {
    id: "2",
    name: "Sodium Hydroxide (NaOH)",
    price: 1800,
    category: "Bases",
    brand: "Qualigens",
    description: "Analytical grade sodium hydroxide pellets",
  },
  {
    id: "3",
    name: "Hydrochloric Acid (HCl)",
    price: 2200,
    category: "Acids",
    brand: "Qualigens",
    description: "Concentrated hydrochloric acid solution",
  },
  {
    id: "4",
    name: "Acetone (C3H6O)",
    price: 3200,
    category: "Solvents",
    brand: "Qualigens",
    description: "HPLC grade acetone for analytical applications",
  },
  {
    id: "5",
    name: "Methanol (CH3OH)",
    price: 2800,
    category: "Solvents",
    brand: "Qualigens",
    description: "High purity methanol for laboratory use",
  },
  {
    id: "6",
    name: "Potassium Permanganate (KMnO4)",
    price: 1500,
    category: "Salts",
    brand: "Qualigens",
    description: "Analytical grade potassium permanganate crystals",
  },
]

export function ProductGrid() {
  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    if (!isLoaded) {
      toast({
        title: "Loading...",
        description: "Please wait while the cart loads",
        variant: "destructive",
      })
      return
    }

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        image: product.image,
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader>
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center mb-4">
              <Beaker className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.brand}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>
            <p className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleAddToCart(product)} className="w-full" disabled={!isLoaded}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isLoaded ? "Add to Cart" : "Loading..."}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
