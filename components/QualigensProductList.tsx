"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { QualigensProduct } from "@/lib/qualigens-products"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"

interface QualigensProductListProps {
  products: QualigensProduct[]
}

export default function QualigensProductList({ products }: QualigensProductListProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: QualigensProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      packSize: product.packSize,
      casNumber: product.casNumber,
      quantity: 1, // Default quantity
    })
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualigens Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>CAS No.</TableHead>
              <TableHead>Pack Size</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.casNumber}</TableCell>
                <TableCell>{product.packSize}</TableCell>
                <TableCell className="text-right">₹{product.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleAddToCart(product)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
