// app/brand/[brandName]/page.tsx
"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import qualigensProducts from "@/lib/qualigens-products"
import { labSupplyBrands } from "@/lib/data"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = { params: { brandName: string } }

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]
  if (!brand) notFound()

  // Normalize qualigensProducts into an array when brandKey === "qualigens"
  const rawData = brandKey === "qualigens" ? (qualigensProducts as any) : {}
  const productsArray: any[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(Object.values(rawData))
    ? Object.values(rawData)
    : []

  const [searchTerm, setSearchTerm] = useState("")
  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()

  // Filter by code, CAS, or name (adjust destructuring if needed)
  const filtered = productsArray.filter((prod) => {
    // prod may be an array [code, cas, name, ...] or an object
    let code: string, cas: string, name: string
    if (Array.isArray(prod)) {
      ;[code, cas, name] = prod
    } else {
      code = (prod as any).code
      cas = (prod as any).cas
      name = (prod as any).name
    }
    const term = searchTerm.toLowerCase()
    return (
      name.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term) ||
      cas.includes(searchTerm)
    )
  })

  const handleAdd = (prod: any) => {
    if (!isLoaded) {
      toast({ title: "Loading...", description: "Please wait", variant: "destructive" })
      return
    }

    // Destructure fields whether prod is array or object
    let code: string, cas: string, name: string, packSize: string, material: string, price: any
    if (Array.isArray(prod)) {
      ;[code, cas, name, packSize, material, price] = prod
    } else {
      ;({ code, cas, name, packSize, material, price } = prod)
    }

    if (price === "POR") {
      toast({ title: "Price on Request", description: "Contact us for pricing.", variant: "destructive" })
      return
    }

    const numericPrice =
      typeof price === "string" ? parseFloat(price.replace(/[^\d.]/g, "")) : price
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" })
      return
    }

    try {
      addItem({
        id: code,
        name,
        price: numericPrice,
        brand: brand.name,
        category: "Lab Chemical",
        packSize,
        material,
      })
      toast({ title: "Added to Cart", description: `${name} added successfully.` })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" })
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
          let code: string, name: string, cas: string, packSize: string, material: string, price: any, hsn: string
          if (Array.isArray(prod)) {
            ;[code, cas, name, packSize, material, price, hsn] = prod
          } else {
            ;({ code, cas, name, packSize, material, price, hsn } = prod as any)
          }
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
                <p className="font-bold text-lg mt-2">
                  {price === "POR" ? "Price on Request" : `₹${price}`}
                </p>
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
