"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, MinusCircle, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"

export interface QualigensProduct {
  id: string
  name: string
  packSize: string
  casNumber: string
  price: number
  image: string
  brand: string
  category: string
}

interface QualigensProductListProps {
  products: QualigensProduct[]
}

export function QualigensProductList({ products }: QualigensProductListProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {}),
  )
  const { toast } = useToast()
  const { addItemToCart } = useCart()
  const { addItemToQuote } = useQuote()

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(1, (prev[id] || 0) + delta)
      return { ...prev, [id]: newQuantity }
    })
  }

  const handleManualQuantityChange = (id: string, value: string) => {
    setQuantities((prev) => {
      const numValue = Number.parseInt(value)
      const newQuantity = isNaN(numValue) || numValue < 1 ? 1 : numValue
      return { ...prev, [id]: newQuantity }
    })
  }

  const handleAddToCart = (product: QualigensProduct) => {
    const quantity = quantities[product.id]
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      packSize: product.packSize,
      brand: product.brand,
      casNumber: product.casNumber,
      category: product.category,
    })
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} (${product.packSize}) added to your cart.`,
      variant: "default",
    })
  }

  const handleAddToQuote = (product: QualigensProduct) => {
    const quantity = quantities[product.id]
    addItemToQuote({
      id: product.id,
      name: product.name,
      quantity: quantity,
      image: product.image,
      brand: product.brand,
      packSize: product.packSize,
      casNumber: product.casNumber,
      category: product.category,
      price: product.price, // Price is included for quote context, though not displayed in quote cart
    })
    toast({
      title: "Added to Quote Cart",
      description: `${quantity} x ${product.name} (${product.packSize}) added to your quote cart.`,
      variant: "default",
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4">
            <CardTitle className="text-xl font-bold mb-2">{product.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Pack Size: {product.packSize}
            </CardDescription>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">CAS No: {product.casNumber}</div>
            <div className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Price: ₹{product.price.toLocaleString()}
            </div>

            <div className="flex items-center justify-center gap-2 mt-auto mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(product.id, -1)}
                disabled={quantities[product.id] <= 1}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantities[product.id]}
                onChange={(e) => handleManualQuantityChange(product.id, e.target.value)}
                className="w-16 text-center"
                min="1"
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(product.id, 1)}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(product)}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => handleAddToQuote(product)}>
              Add to Quote
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
