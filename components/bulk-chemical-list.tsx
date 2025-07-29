"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Product = {
  code: string
  name: string
  category: string
  pack_size: string
  price: string
}

interface BulkChemicalListProps {
  products: Product[]
  categories: string[]
}

export function BulkChemicalList({ products, categories }: BulkChemicalListProps) {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredProducts = activeFilter === "All" ? products : products.filter((p) => p.category === activeFilter)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? "default" : "outline"}
            onClick={() => setActiveFilter(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.code}
            className="flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="text-base font-semibold leading-snug">{product.name}</CardTitle>
              <p className="text-xs text-slate-500 pt-1">{product.code}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-600">Category:</span> {product.category}
                </p>
                <p>
                  <span className="font-medium text-slate-600">Pack Size:</span> {product.pack_size}
                </p>
                <p>
                  <span className="font-medium text-slate-600">Price:</span> {product.price}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Request Quote</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
