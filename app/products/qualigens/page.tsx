"use client"

import { getQualigensProducts } from "@/lib/qualigens-products"
import { getBrandByName } from "@/lib/data"
import Image from "next/image"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import QualiProductGrid from "@/components/quali-product-grid"
import { Suspense } from "react"
import Loading from "./loading"

export default async function QualigensPage() {
  const qualiProducts = await getQualigensProducts()
  const brand = getBrandByName("Qualigens")
  const { addItem } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = qualiProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.cas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddToCart = (product: any) => {
    const priceString = product.price?.toString().replace(/[^\d.]/g, "")
    let numericPrice: number

    if (priceString === "POR" || !priceString) {
      toast({
        title: "Price on Request",
        description: `${product.name} is Price on Request. Please contact us for a quote.`,
        variant: "default",
      })
      return
    }

    try {
      numericPrice = Number.parseFloat(priceString)
      if (isNaN(numericPrice)) {
        throw new Error("Invalid price format")
      }
    } catch (error) {
      console.error("Error parsing price:", error)
      toast({
        title: "Error",
        description: `Could not add ${product.name} to cart due to invalid price.`,
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id || product.code,
      name: product.name,
      price: numericPrice,
      quantity: 1,
      brand: "Qualigens",
      category: product.category || "Laboratory Chemical",
      packSize: product.packSize,
      casNumber: product.cas,
      image: product.image || "/placeholder.svg",
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "success",
    })
  }

  if (!brand) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Brand not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center mb-8">
        {brand.logo && (
          <Image
            src={brand.logo || "/placeholder.svg"}
            alt={`${brand.name} Logo`}
            width={200}
            height={100}
            objectFit="contain"
            className="mb-4"
          />
        )}
        <h1 className="text-4xl font-bold text-center">Qualigens Products</h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Explore our comprehensive range of Qualigens brand chemicals and reagents, known for their quality and
          reliability.
        </p>
      </div>
      <div className="relative mb-8 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Search Qualigens products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full border focus:border-blue-500 focus:ring-blue-500 w-full"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      <Suspense fallback={<Loading />}>
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 text-xl">No products found matching your search.</div>
        ) : (
          <QualiProductGrid products={filteredProducts} handleAddToCart={handleAddToCart} />
        )}
      </Suspense>
    </div>
  )
}
