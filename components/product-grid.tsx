"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/lib/data"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, MessageCircle } from "lucide-react"
import { useQuote } from "@/app/context/quote-context"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const { addItemToQuote } = useQuote()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    })
  }

  const handleAddToQuote = (product: Product) => {
    addItemToQuote({
      id: product.id,
      name: product.name,
      image: product.image,
      brand: product.brand,
      packSize: product.packSize,
      casNumber: product.casNumber,
      quantity: 1, // Default quantity for quote
    })
    toast({
      title: "Added to Quote Cart!",
      description: `${product.name} has been added to your quote cart.`,
      variant: "default",
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-48 w-full">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>
          <CardHeader className="flex-grow">
            <CardTitle className="text-lg font-semibold text-gray-800">{product.name}</CardTitle>
            <p className="text-sm text-gray-500">Brand: {product.brand}</p>
            <p className="text-sm text-gray-500">Pack: {product.packSize}</p>
            <p className="text-sm text-gray-500">CAS: {product.casNumber}</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => handleAddToCart(product)}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => handleAddToQuote(product)}>
              <MessageCircle className="h-4 w-4 mr-2" /> Add to Quote
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
