"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/data"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/components/ui/use-toast"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    })
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <Link href={`/products/${product.id}`} className="relative h-48 w-full block">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </Link>
          <CardHeader className="p-4 pb-2 flex-grow">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
              <Link href={`/products/${product.id}`} className="hover:underline">
                {product.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-50">₹{product.price.toFixed(2)}</span>
              {product.unit && <span className="text-sm text-gray-500 dark:text-gray-400">/ {product.unit}</span>}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(product)}>
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="flex flex-col overflow-hidden shadow-lg">
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardHeader className="p-4 pb-2 flex-grow">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
