"use client"

import { useState } from "react"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products"
import { labSupplyBrands } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

type Props = { params: { brandName: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = labSupplyBrands[params.brandName as keyof typeof labSupplyBrands]
  return brand
    ? { title: `${brand.name} Lab Supplies`, description: `Explore ${brand.name} products.` }
    : { title: "Brand Not Found" }
}

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]
  const { addItem } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  if (!brand) notFound()

  const products = brandKey === "qualigens" ? (qualigensProducts as any[]) : []
  const filtered = products.filter(([code, cas, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cas.includes(searchTerm)
  )

  const handleAdd = (prod: any) => {
    const [code, cas, name, packSize, material, price] = prod
    if (price === "POR") {
      toast({ title: "Price on Request", description: "Contact us for pricing.", variant: "destructive" })
      return
    }
    const numericPrice = typeof price === "string"
      ? parseFloat(price.replace(/[^\d.]/g, ""))
      : price
    addItem({ id: code, name, price: numericPrice, brand: brand.name, category: "Lab Chemical", packSize, material })
    toast({ title: "Added to Cart", description: `${name} added.` })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 mb-8 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => {
          const [code, cas, name, packSize, material, price, hsn] = prod
          return (
            <Card key={code}>
              <CardHeader><CardTitle>{name}</CardTitle><p>CAS: {cas}</p></CardHeader>
              <CardContent>
                <p>Pack: {packSize}</p>
                <p>HSN: {hsn}</p>
                <p className="font-bold">{price === "POR" ? "POR" : `₹${price}`}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAdd(prod)} className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
