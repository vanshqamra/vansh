"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, ShoppingCart, Quote } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/app/context/CartContext"
import { useQuote } from "@/app/context/quote-context"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/data"

interface BulkChemicalListProps {
  products: Product[]
}

export function BulkChemicalList({ products }: BulkChemicalListProps) {
  const { addToCart } = useCart()
  const { addToQuote } = useQuote()
  const { toast } = useToast()
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {}),
  )

  const handleQuantityChange = (productId: string, amount: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 0) + amount),
    }))
  }

  const handleManualQuantityChange = (productId: string, value: string) => {
    const numValue = Number.parseInt(value)
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(numValue) || numValue < 1 ? 1 : numValue,
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
    })
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const handleAddToQuote = (product: Product) => {
    const quantity = quantities[product.id] || 1
    addToQuote({
      name: product.name,
      quantity: quantity,
      unit: product.unit || "unit",
      price: product.price, // Include price for quote if available
    })
    toast({
      title: "Added to Quote Cart",
      description: `${quantity} x ${product.name} added to your quote cart.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Chemicals Available</CardTitle>
        <CardDescription>
          Browse our selection of bulk chemicals. Add to cart for direct purchase or to quote for custom pricing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price / {products[0]?.unit || "Unit"}</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={quantities[product.id] <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleManualQuantityChange(product.id, e.target.value)}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(product.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddToQuote(product)}>
                        <Quote className="h-4 w-4 mr-2" /> Add to Quote
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
