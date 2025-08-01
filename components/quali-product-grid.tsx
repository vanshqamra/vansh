"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { QualigensProduct } from "@/lib/qualigens-products"
import { useQuote } from "@/app/context/quote-context"
import { useToast } from "@/components/ui/use-toast"

interface QualiProductGridProps {
  products: QualigensProduct[]
}

export function QualiProductGrid({ products }: QualiProductGridProps) {
  const { addToQuote } = useQuote()
  const { toast } = useToast()

  const handleAddToQuote = (product: QualigensProduct) => {
    addToQuote({
      name: product["Product Name"],
      quantity: 1,
      unit: product["Pack Size"],
      price: product["Price (INR)"],
    })
    toast({
      title: "Added to Quote Cart",
      description: `${product["Product Name"]} (${product["Pack Size"]}) has been added to your quote cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product["Cat. No."]}
          className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-48 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            {/* Placeholder for product image, as Qualigens data doesn't have image URLs */}
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt={product["Product Name"]}
              width={150}
              height={150}
              objectFit="contain"
            />
          </div>
          <CardHeader className="p-4 pb-2 flex-grow">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
              {product["Product Name"]}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Cat. No.: {product["Cat. No."]} | HSN: {product["HSN Code"]}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
                ₹{product["Price (INR)"].toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ {product["Pack Size"]}</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToQuote(product)}>
              Add to Quote
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function QualiProductGridSkeleton() {
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
