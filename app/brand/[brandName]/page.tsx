"use client"

import { useState } from "react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products"
import { labSupplyBrands } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = { params: { brandName: string } }

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]
  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  if (!brand) notFound()

  const products = brandKey === "qualigens" ? (qualigensProducts as any[]) : []
  const filtered = products.filter(
    ([code, cas, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cas.includes(searchTerm),
  )

  const handleAdd = (prod: any) => {
    if (!isLoaded) {
      toast({
        title: "Loading...",
        description: "Please wait while the cart loads",
        variant: "destructive",
      })
      return
    }

    const [code, cas, name, packSize, material, price] = prod

    if (price === "POR") {
      toast({
        title: "Price on Request",
        description: "Contact us for pricing.",
        variant: "destructive",
      })
      return
    }

    try {
      const numericPrice = typeof price === "string" ? Number.parseFloat(price.replace(/[^\d.]/g, "")) : price

      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast({
          title: "Invalid Price",
          description: "Unable to add item with invalid price.",
          variant: "destructive",
        })
        return
      }

      addItem({
        id: code,
        name,
        price: numericPrice,
        brand: brand.name,
        category: "Lab Chemical",
        packSize,
        material,
      })

      toast({
        title: "Added to Cart",
        description: `${name} added successfully.`,
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input
        type="text"
        placeholder="Search products..."
        className="mb-8 max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => {
          const [code, cas, name, packSize, material, price, hsn] = prod
          return (
            <Card key={code}>
              <CardHeader>
                <CardTitle className="text-lg">{name}</CardTitle>
                <p className="text-sm text-gray-600">CAS: {cas}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Pack: {packSize}</p>
                <p className="text-sm">Material: {material}</p>
                <p className="text-sm">HSN: {hsn}</p>
                <p className="font-bold text-lg mt-2">{price === "POR" ? "Price on Request" : `₹${price}`}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAdd(prod)} className="w-full" disabled={!isLoaded || price === "POR"}>
                  {!isLoaded ? "Loading..." : price === "POR" ? "Contact for Price" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  )
}
